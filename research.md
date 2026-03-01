# 포트폴리오/블로그 사이트 아키텍처 리서치

**날짜:** 2026-03-01
**목적:** Brittany Chiang 스타일 개인 포트폴리오 + 자체 호스팅 어드민 패널 아키텍처 조사

---

## 1. 기술 결정 사항

### 1.1 Next.js 15 App Router — 채택 확정

**App Router가 이 프로젝트에 적합한 이유:**

- **React Server Components (RSC):** About, Experience, Projects 섹션이 순수 서버 렌더링 HTML로 출력됨. 브라우저에 JavaScript가 전송되지 않아 초기 로드 속도가 극히 빠름.
- **Server Actions:** 어드민 CRUD 작업을 별도 REST API 없이 서버 함수 직접 호출로 처리. API 레이어 불필요.
- **Route Groups:** `(public)`과 `(admin)` 라우트 그룹으로 완전히 다른 레이아웃 분리 — URL 구조에 영향 없음.
- **단일 프로세스:** Next.js 서버가 프론트엔드+백엔드를 하나의 프로세스로 실행 → SQLite 자체 포함 배포 모델과 완벽하게 맞음.
- **ISR (증분 정적 재생성):** `revalidate = 60` 설정으로 포트폴리오 페이지를 정적 캐시하면서, 어드민에서 `revalidatePath('/')` 호출 시 즉시 무효화.

**버전:** Next.js 15.x (App Router, React 19)

---

### 1.2 Tailwind CSS v4 + shadcn/ui — 채택 확정

**Tailwind CSS v4 주요 변경사항:**
- `tailwind.config.js` 제거 → CSS 파일 내 `@theme` 디렉티브로 테마 설정
- shadcn/ui CLI가 Tailwind v4 네이티브 지원 (2025년 초 이후)
- `tailwindcss-animate` → `tw-animate-css`로 교체
- `next-themes` + CSS 변수로 다크 모드 구현 → Brittany Chiang 디자인 목표에 직접 부합

**설치 방법:**
```bash
npx create-next-app@latest portfolio --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
```

shadcn/ui가 제공하는 것:
- 어드민 패널용 접근성 완비 컴포넌트 (Button, Card, Dialog, Form, Input, Textarea, Badge, Separator, Sheet)
- 컴포넌트가 프로젝트에 복사됨 (외부 의존성 아님) → 완전한 커스터마이징 가능

---

### 1.3 Prisma 5.x + SQLite — 채택 확정

**Prisma vs raw better-sqlite3 비교:**

| 기준 | Prisma 5.x | better-sqlite3 raw |
|---|---|---|
| 개발자 경험 | 우수 (타입 안전, 마이그레이션) | 수동 SQL, 마이그레이션 없음 |
| 성능 (INSERT) | ~1ms | ~0.01ms |
| 타입 안전성 | 완전 (자동 생성 타입) | 수동 |
| 스키마 마이그레이션 | 내장 (`prisma migrate`) | 수동 |

**결론:** 포트폴리오 DB는 총 1000행 미만. 성능 차이는 무의미. Prisma의 개발자 경험이 압도적으로 우수.

> **Prisma 7 주의:** Prisma 7은 아직 pre-GA 상태. 현재 안정 버전인 Prisma 5.x 사용. `output` 경로 지정은 선택 사항이나 명시적으로 설정 권장.

**필요 패키지:**
```
prisma (devDependencies)
@prisma/client
```

**Next.js 핫 리로드 대응 싱글톤 패턴:**
```typescript
// src/lib/db.ts
import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

### 1.4 NextAuth v5 (Auth.js) Credentials 프로바이더 — 채택 확정

**NextAuth v4 대비 v5의 차이점:**
- `auth()` 헬퍼가 서버 컴포넌트, 미들웨어에서 바로 사용 가능
- `getServerSession()` 불필요
- 미들웨어: `withAuth` 대신 `auth` 함수 래퍼 방식
- API 라우트: `app/api/auth/[...nextauth]/route.ts` (동일 URL, 새 export 문법)

**bcryptjs를 bcrypt 대신 사용하는 이유:**
- bcrypt는 네이티브 바이너리 (`node-pre-gyp`) 빌드 필요
- OCI Ampere A1은 ARM64 아키텍처 → 네이티브 바이너리 크로스 컴파일 문제 발생 가능
- bcryptjs는 순수 JavaScript → ARM 환경에서 완벽 호환

**핵심 설정 (`src/auth.ts`):**
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.adminUser.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        return valid ? { id: user.id, email: user.email } : null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
})
```

**어드민 라우트 보호 미들웨어 (`src/middleware.ts`):**
```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  if (!isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

### 1.5 마크다운 에디터 — @uiw/react-md-editor 채택 확정

**에디터 비교:**

| 에디터 | 번들 크기(gzip) | 방식 | Next.js 호환성 | 유지보수 |
|---|---|---|---|---|
| @uiw/react-md-editor | ~4.6 kB | 분할 패널 프리뷰 | `dynamic({ ssr: false })` 필요 | 활발 |
| TipTap | ~50-100 kB | WYSIWYG / ProseMirror | 양호 | 활발, 유료 티어 존재 |
| Milkdown | ~40 kB | WYSIWYG / ProseMirror | 기초적 | 활발, 복잡한 설정 |
| react-simplemde-editor | ~30 kB | CodeMirror 기반 | 양호 | 활발 |

**@uiw/react-md-editor 채택 이유:**
- 풀 기능 에디터 중 가장 작은 번들
- GFM(GitHub Flavored Markdown) 파싱 내장
- 단순한 `value`/`onChange` API
- 어드민 패널은 저트래픽 내부 도구 → SSR 불필요

**Next.js 사용 패턴 (반드시 Client Component + dynamic import):**
```typescript
// src/components/admin/MarkdownEditor.tsx
'use client'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Props {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: Props) {
  return (
    <MDEditor
      value={value}
      onChange={(v) => onChange(v ?? '')}
      height={400}
      data-color-mode="dark"
    />
  )
}
```

**공개 페이지 마크다운 렌더링:**
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
```

---

## 2. 데이터베이스 스키마

### 설계 원칙
- `AdminUser`: 어드민 계정 단일 행 운용
- `About`: 싱글톤 행 (고정 ID `"singleton"`, upsert로 관리)
- `Experience`, `Project`: `order` 필드로 수동 순서 지정
- 마크다운 지원 필드는 plain text(마크다운 문자열) 저장
- `techStack`: 쉼표 구분 문자열 저장 (별도 조인 테이블 불필요 — 프로젝트 수 적음)
- `endDate = null` → "현재" 의미

### 전체 스키마

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model About {
  id        String   @id @default("singleton")
  name      String
  title     String
  tagline   String   @default("")
  bio       String
  avatarUrl String?
  resumeUrl String?
  updatedAt DateTime @updatedAt
}

model Experience {
  id          String   @id @default(cuid())
  company     String
  role        String
  startDate   String
  endDate     String?
  description String
  techStack   String
  order       Int      @default(0)
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String
  techStack   String
  repoUrl     String?
  liveUrl     String?
  imageUrl    String?
  featured    Boolean  @default(false)
  order       Int      @default(0)
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SocialLink {
  id        String   @id @default(cuid())
  platform  String
  url       String
  icon      String
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 시드 스크립트 (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'changeme', 12)
  await db.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
      passwordHash: hash,
    },
  })

  await db.about.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      name: '이름을 입력하세요',
      title: 'Software Engineer',
      tagline: '한 줄 소개를 입력하세요',
      bio: '자기소개를 마크다운으로 작성하세요.',
    },
  })
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
```

---

## 3. Docker/OCI 배포 전략

### 3.1 SQLite 볼륨 마운트 패턴
1. SQLite 파일은 컨테이너 내 `/app/data/portfolio.db`에 위치
2. Docker 네임드 볼륨 (또는 OCI 블록 볼륨)을 `/app/data`에 마운트
3. 엔트리포인트 스크립트가 매 컨테이너 시작 시 `prisma migrate deploy` 실행

이 방식으로:
- 컨테이너 재시작/재배포 시 데이터 유지
- 스키마 마이그레이션 자동 적용
- 이미지에 DB 데이터 없음

### 3.2 `next.config.ts` 설정

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
```

`output: 'standalone'`: Docker 이미지 크기를 ~2 GB → ~200 MB로 축소.

### 3.3 OCI (Oracle Cloud Infrastructure) 배포

**대상: OCI Always Free Tier — Ampere A1 Flex VM**

무료 리소스:
- ARM OCPU 최대 4개, RAM 24 GB
- 블록 스토리지 200 GB

**배포 단계:**
1. OCI Compute 인스턴스 프로비저닝 (VM.Standard.A1.Flex, Ubuntu 22.04 ARM)
2. 블록 볼륨 연결 및 `/opt/portfolio-data`에 마운트
3. Docker + Docker Compose 설치
4. x86 개발 머신에서 ARM64 빌드: `docker buildx build --platform linux/arm64 -t portfolio:latest .` (또는 OCI 인스턴스에서 직접 빌드)
5. `.env` 파일로 환경 변수 설정 (이미지에 시크릿 절대 포함 금지)
6. `docker compose up -d` 실행
7. Caddy로 자동 HTTPS 설정:
   ```
   yourdomain.com {
     reverse_proxy localhost:3000
   }
   ```

### 3.4 DB 백업 전략

SQLite는 단일 파일이므로 백업이 매우 간단:
- **수동 백업:** `cp /opt/portfolio-data/portfolio.db /opt/backups/portfolio-$(date +%Y%m%d).db`
- **크론 백업:** OCI 인스턴스에서 일간 크론 잡 설정
- **Litestream (선택):** SQLite WAL을 OCI Object Storage에 연속 복제 — 높은 안정성 필요 시

---

## 4. 핵심 구현 패턴

### 4.1 공개 포트폴리오: 한 페이지 스크롤 + 좌측 고정 네비

**Brittany Chiang 디자인 구조:**
- **좌측 컬럼 (고정):** 이름, 직책, 태그라인, 네비 링크 + 소셜 아이콘
- **우측 컬럼 (스크롤):** About → Experience → Projects 섹션 세로 나열

**구현 방식:**
- CSS Grid: `lg:grid-cols-[300px_1fr]` (대형 화면), 모바일은 단일 컬럼
- 좌측: `position: sticky; top: 0; height: 100vh`
- 활성 섹션 감지: Client Component에서 Intersection Observer API 사용
- 섹션 ID: `id="about"`, `id="experience"`, `id="projects"`

### 4.2 서버 액션 패턴 (어드민 CRUD)

API 라우트 불필요 — 모든 변경은 Server Action으로 처리:

```typescript
// src/lib/actions/about.ts
'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function updateAbout(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.about.upsert({
    where: { id: 'singleton' },
    update: {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      tagline: formData.get('tagline') as string,
      bio: formData.get('bio') as string,
      avatarUrl: (formData.get('avatarUrl') as string) || null,
      resumeUrl: (formData.get('resumeUrl') as string) || null,
    },
    create: {
      id: 'singleton',
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      tagline: formData.get('tagline') as string,
      bio: formData.get('bio') as string,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/about')
}
```

### 4.3 다크 모드 설정

```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`enableSystem={false}`: OS 설정 무관하게 다크 모드 고정 (Brittany Chiang 디자인 의도와 동일).

### 4.4 공개 페이지 데이터 페칭 패턴

```typescript
// src/app/(public)/page.tsx
import { db } from '@/lib/db'

export const revalidate = 60

export default async function PortfolioPage() {
  const [about, experiences, projects, socialLinks] = await Promise.all([
    db.about.findUnique({ where: { id: 'singleton' } }),
    db.experience.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.project.findMany({ where: { published: true }, orderBy: [{ featured: 'desc' }, { order: 'asc' }] }),
    db.socialLink.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div className="mx-auto max-w-screen-xl lg:flex">
      <Nav name={about?.name ?? ''} title={about?.title ?? ''} socialLinks={socialLinks} />
      <main>
        <AboutSection about={about} />
        <ExperienceSection experiences={experiences} />
        <ProjectsSection projects={projects} />
        <SocialFooter socialLinks={socialLinks} />
      </main>
    </div>
  )
}
```

---

## 5. 최종 기술 스택 요약

| 영역 | 선택 | 선택 근거 |
|---|---|---|
| 프레임워크 | Next.js 15 App Router | RSC로 공개 페이지 제로 JS, Server Action으로 어드민 CRUD, 라우트 그룹으로 레이아웃 분리 |
| 스타일링 | Tailwind CSS v4 + shadcn/ui | CSS 우선 설정, 접근성 컴포넌트, CSS 변수 다크 모드 |
| ORM | Prisma 5.x + SQLite | 타입 안전, 마이그레이션, Docker 친화적 |
| 데이터베이스 | SQLite | 단일 파일, Docker 볼륨 마운트, 별도 DB 서버 불필요 |
| 인증 | NextAuth v5 + Credentials | App Router 네이티브 지원, JWT 세션, OAuth 불필요 |
| 비밀번호 | bcryptjs | 순수 JS, 네이티브 바이너리 없음 (OCI Ampere ARM 안전) |
| 마크다운 에디터 | @uiw/react-md-editor | 최소 번들, GFM 지원, 단순 API |
| 마크다운 렌더러 | react-markdown + remark-gfm | 경량, 서버 렌더링 가능 |
| 배포 | Docker + OCI Ampere A1 Free Tier | 자체 호스팅, 무료, ARM64 호환 |
| 리버스 프록시 | Caddy | 자동 HTTPS, 단순 설정 |
| DB 백업 | 크론 cp + 선택적 Litestream | 파일 복사로 충분; Litestream은 연속 복제 필요 시 |

---

## 6. 리스크 & 주의사항

1. **better-sqlite3 네이티브 바이너리:** Prisma 5.x의 기본 SQLite 드라이버는 `better-sqlite3`를 사용. Alpine 기반 Docker에서 컴파일 도구(`python3 make g++`) 필요 → `node:22-slim` (Debian) 사용 권장.

2. **ARM64 크로스 컴파일:** x86 개발 머신 → OCI Ampere(ARM64) 배포 시 `docker buildx` 필요. OCI 인스턴스에서 직접 빌드하면 이 문제 회피 가능.

3. **Prisma Migrate in Production:** `prisma migrate deploy`는 마이그레이션만 적용, DB 파일 생성 안 함. `/app/data/` 디렉토리가 쓰기 가능해야 함 → 볼륨 마운트로 해결.

4. **NextAuth 시크릿 교체:** `NEXTAUTH_SECRET` 교체 시 모든 기존 세션 무효화. 단일 어드민 사이트에서는 허용 가능.

5. **이미지 업로드:** 현재 스키마는 URL만 저장. OCI Object Storage 또는 로컬 `/public/uploads/`로의 실제 이미지 업로드는 초기 구현 범위 밖. 추후 기능으로 추가 예정.
