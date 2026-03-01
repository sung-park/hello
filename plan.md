# 포트폴리오 사이트 — 구현 계획서

**날짜:** 2026-03-01
**참고:** research.md
**범위:** Brittany Chiang 스타일 포트폴리오 + 어드민 CMS, SQLite, Docker/OCI 배포

---

## 1. 최종 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router, React 19) |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma 5.x + SQLite (내장 드라이버) |
| 인증 | NextAuth v5 (Auth.js) + Google OAuth |
| 마크다운 에디터 | @uiw/react-md-editor (dynamic import) |
| 마크다운 렌더러 | react-markdown + remark-gfm |
| 배포 | Docker (멀티스테이지) + OCI Ampere A1 |
| 리버스 프록시 | Caddy |

> **Prisma 버전 관련:** Prisma 7은 아직 pre-GA 상태이므로 현재 안정 버전인 Prisma 5.x를 사용. 표준 SQLite 프로바이더 사용 (별도 어댑터 불필요). 생성 경로: `../src/generated/prisma`.

---

## 2. 프로젝트 루트

모든 파일은 `/Users/sung-park/Dev/hello/portfolio/` 하위에 생성됩니다 (새 Next.js 앱).

---

## 3. 폴더 구조

```
portfolio/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── portfolio.db          # .gitignore 처리; Docker에서 볼륨 마운트
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # 루트 레이아웃 (폰트, ThemeProvider)
│   │   ├── globals.css                        # Tailwind v4 CSS + 테마 변수
│   │   ├── (public)/
│   │   │   ├── layout.tsx                    # 공개 2컬럼 레이아웃
│   │   │   └── page.tsx                      # 단일 페이지 포트폴리오
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                    # 어드민 쉘 레이아웃 (사이드바)
│   │   │   └── admin/
│   │   │       ├── login/page.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── about/page.tsx
│   │   │       ├── experience/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── projects/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       └── social/page.tsx
│   │   └── api/
│   │       └── auth/[...nextauth]/route.ts
│   ├── auth.ts                               # NextAuth 설정
│   ├── middleware.ts                          # 어드민 라우트 보호
│   ├── components/
│   │   ├── public/                           # 서버 컴포넌트
│   │   │   ├── Nav.tsx                       # 좌측 고정 네비게이션
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   └── SocialFooter.tsx
│   │   ├── admin/                            # 클라이언트 컴포넌트
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── AboutForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── SocialLinkForm.tsx
│   │   │   └── GoogleSignInButton.tsx  # "Google로 로그인" 버튼
│   │   └── ui/                               # shadcn/ui (CLI 자동 생성)
│   ├── lib/
│   │   ├── db.ts                             # Prisma 싱글톤
│   │   ├── utils.ts                          # cn() 헬퍼
│   │   └── actions/
│   │       ├── about.ts
│   │       ├── experience.ts
│   │       ├── project.ts
│   │       └── social.ts
│   ├── generated/
│   │   └── prisma/                           # prisma generate 자동 생성
│   └── types/
│       └── index.ts
├── .env
├── .env.example
├── .gitignore
├── next.config.ts
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
└── entrypoint.sh
```

---

## 4. 데이터베이스 스키마 (Prisma 5.x)

Google OAuth 사용으로 `AdminUser` 테이블 불필요. 허용 이메일은 환경 변수(`ALLOWED_EMAIL`)로 관리.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 자기소개 (싱글톤: id = "singleton")
model About {
  id        String   @id @default("singleton")
  name      String
  title     String
  tagline   String   @default("")
  bio       String   // 마크다운
  avatarUrl String?
  resumeUrl String?
  updatedAt DateTime @updatedAt
}

// 경력 항목
model Experience {
  id          String   @id @default(cuid())
  company     String
  role        String
  startDate   String   // 예: "2022년 1월"
  endDate     String?  // null → "현재"
  description String   // 마크다운
  techStack   String   // 쉼표 구분: "TypeScript,React,Node.js"
  order       Int      @default(0)
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 프로젝트 항목
model Project {
  id          String   @id @default(cuid())
  title       String
  description String   // 마크다운
  techStack   String   // 쉼표 구분
  repoUrl     String?
  liveUrl     String?
  imageUrl    String?
  featured    Boolean  @default(false)
  order       Int      @default(0)
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 소셜 링크 (푸터 아이콘)
model SocialLink {
  id        String   @id @default(cuid())
  platform  String   // "GitHub", "LinkedIn", "Email", "Twitter"
  url       String
  icon      String   // lucide 아이콘명: "github", "linkedin", "mail"
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 5. 핵심 코드 패턴

### 5.1 Prisma 싱글톤 (`src/lib/db.ts`)

```typescript
import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### 5.2 NextAuth 설정 (`src/auth.ts`)

Google OAuth + `ALLOWED_EMAIL` 환경 변수로 허용 계정 1개만 통과시키는 whitelist 처리.

```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  callbacks: {
    async signIn({ user }) {
      return user.email === process.env.ALLOWED_EMAIL
    },
  },
})
```

### 5.3 미들웨어 (`src/middleware.ts`)

```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  if (!isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
})

export const config = { matcher: ['/admin/:path*'] }
```

### 5.4 서버 액션 패턴

```typescript
// src/lib/actions/experience.ts
'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function deleteExperience(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')
  await db.experience.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/experience')
}
```

---

## 6. Docker 파일

### Dockerfile (멀티스테이지, standalone 출력)

```dockerfile
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:/app/data/portfolio.db"
ENV NEXTAUTH_SECRET="build-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"
RUN npx prisma generate
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/src/generated ./src/generated
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh && mkdir -p /app/data && chown nextjs:nodejs /app/data
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
ENTRYPOINT ["./entrypoint.sh"]
```

### entrypoint.sh

```bash
#!/bin/sh
set -e
echo "Prisma 마이그레이션 실행 중..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "Next.js 서버 시작..."
exec node server.js
```

---

## 7. 비주얼 디자인 기준

### 공개 포트폴리오
- 다크 배경: `#0f172a` (slate-900)
- 강조색(accent): `#64ffda` (청록색, Brittany Chiang 레퍼런스와 동일)
- 좌측 컬럼: `lg+` 화면에서 `300px` 고정(sticky), 모바일은 상단으로 전환
- 섹션 패딩: `py-24`, 섹션 ID: `#about`, `#experience`, `#projects`
- 기술 스택 태그: 소형 둥근 배지 (muted 테두리)
- 카드 호버: 미묘한 배경 하이라이트 효과

### 어드민 패널
- shadcn/ui 기본 다크 테마
- 사이드바: `240px` 너비, 고정
- 메인 콘텐츠: 스크롤 가능, 여백 적용
- 폼: 카드로 감싸고 레이블은 입력 위에 배치

---

## 8. 세부 할일 목록

### 단계 0: 프로젝트 초기화
- [ ] `cd /Users/sung-park/Dev/hello && npx create-next-app@latest portfolio --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] 핵심 의존성 설치: `next-auth@beta @uiw/react-md-editor react-markdown remark-gfm next-themes lucide-react`
- [ ] Prisma 설치: `npm install prisma @prisma/client && npx prisma init`
- [ ] `npx shadcn@latest init` (다크 테마, CSS 변수 선택)
- [ ] shadcn 컴포넌트 추가: `button card input label textarea badge separator sheet dialog`
- [ ] `.gitignore`에 추가: `portfolio.db`, `.env`, `src/generated/`

### 단계 1: 데이터베이스 & 인증 기반
- [ ] `prisma/schema.prisma` 작성 (4개 모델: About, Experience, Project, SocialLink)
- [ ] `npx prisma migrate dev --name init` — 최초 마이그레이션 생성
- [ ] `src/lib/db.ts` 작성 (Prisma 싱글톤)
- [ ] `src/auth.ts` 작성 (NextAuth v5 Google OAuth + `ALLOWED_EMAIL` whitelist)
- [ ] `src/app/api/auth/[...nextauth]/route.ts` 작성
- [ ] `src/middleware.ts` 작성 (`/admin/login` 제외 전체 `/admin/*` 보호)
- [ ] `.env` 및 `.env.example` 작성
- [ ] Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급 방법 문서화 (`README.md`)

### 단계 2: 공개 포트폴리오 — 레이아웃 & 컴포넌트
- [ ] `src/app/globals.css` — 다크 테마 CSS 변수, Tailwind v4 `@theme` 커스텀 색상
- [ ] `src/app/layout.tsx` — ThemeProvider (defaultTheme="dark"), Geist 폰트
- [ ] `src/app/(public)/layout.tsx` — 2컬럼 max-width 컨테이너
- [ ] `src/app/(public)/page.tsx` — 전체 데이터 fetch, 섹션 조합, `export const revalidate = 60`
- [ ] `src/components/public/Nav.tsx` — sticky 좌측 컬럼, Intersection Observer 활성 섹션 감지, 앵커 링크
- [ ] `src/components/public/AboutSection.tsx` — bio 마크다운 렌더링, 이름/직책/태그라인
- [ ] `src/components/public/ExperienceSection.tsx` — 날짜 범위, 회사명, 역할, 설명 마크다운, 기술 스택 배지
- [ ] `src/components/public/ProjectsSection.tsx` — 프로젝트 카드 (제목 링크, 설명, 레포/라이브 링크, 기술 배지, 이미지)
- [ ] `src/components/public/SocialFooter.tsx` — lucide-react 아이콘 링크 행
- [ ] `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge)

### 단계 3: 어드민 패널 — 레이아웃 & 로그인
- [ ] `src/app/(admin)/layout.tsx` — 사이드바 + 메인 콘텐츠 쉘
- [ ] `src/components/admin/AdminSidebar.tsx` — 메뉴: 대시보드, 자기소개, 경력, 프로젝트, 소셜 링크; 로그아웃 버튼
- [ ] `src/app/(admin)/admin/login/page.tsx` — 로그인 페이지 (서버 컴포넌트, GoogleSignInButton 포함)
- [ ] `src/components/admin/GoogleSignInButton.tsx` — `signIn('google')` 호출하는 버튼 (클라이언트 컴포넌트)
- [ ] `src/app/(admin)/admin/dashboard/page.tsx` — 경력/프로젝트/소셜 링크 수 표시 대시보드

### 단계 4: 어드민 — 자기소개 섹션
- [ ] `src/components/admin/MarkdownEditor.tsx` — @uiw/react-md-editor dynamic import 래퍼
- [ ] `src/app/(admin)/admin/about/page.tsx` — 싱글톤 fetch 후 AboutForm 전달
- [ ] `src/components/admin/AboutForm.tsx` — 필드: 이름, 직책, 태그라인, bio(마크다운 에디터), avatarUrl, resumeUrl
- [ ] `src/lib/actions/about.ts` — `updateAbout(formData: FormData)` 서버 액션

### 단계 5: 어드민 — 경력 섹션
- [ ] `src/app/(admin)/admin/experience/page.tsx` — 목록 (순서 변경 버튼, 수정/삭제)
- [ ] `src/app/(admin)/admin/experience/new/page.tsx` — 신규 경력 폼
- [ ] `src/app/(admin)/admin/experience/[id]/page.tsx` — 경력 수정 폼 (기존 값 채움)
- [ ] `src/components/admin/ExperienceForm.tsx` — 필드: 회사, 역할, 시작일, 종료일, 설명(마크다운), 기술스택, 공개 토글
- [ ] `src/lib/actions/experience.ts` — `createExperience`, `updateExperience`, `deleteExperience`, `reorderExperience`

### 단계 6: 어드민 — 프로젝트 섹션
- [ ] `src/app/(admin)/admin/projects/page.tsx` — 목록 (추천 토글, 수정/삭제)
- [ ] `src/app/(admin)/admin/projects/new/page.tsx`
- [ ] `src/app/(admin)/admin/projects/[id]/page.tsx`
- [ ] `src/components/admin/ProjectForm.tsx` — 필드: 제목, 설명(마크다운), 기술스택, repoUrl, liveUrl, imageUrl, 추천, 공개
- [ ] `src/lib/actions/project.ts` — `createProject`, `updateProject`, `deleteProject`

### 단계 7: 어드민 — 소셜 링크
- [ ] `src/app/(admin)/admin/social/page.tsx` — 목록 + 인라인 추가/수정/삭제 폼
- [ ] `src/components/admin/SocialLinkForm.tsx` — 필드: 플랫폼, URL, 아이콘(lucide 이름), 순서
- [ ] `src/lib/actions/social.ts` — `createSocialLink`, `updateSocialLink`, `deleteSocialLink`

### 단계 8: Docker & 배포
- [ ] `next.config.ts` — `output: 'standalone'` 추가
- [ ] `Dockerfile` 작성 (멀티스테이지: deps → builder → runner, node:22-slim 베이스)
- [ ] `entrypoint.sh` 작성 (`prisma migrate deploy` 후 `node server.js`)
- [ ] `docker-compose.yml` 작성 (portfolio 서비스 + `/app/data` 네임드 볼륨)
- [ ] `Caddyfile` 작성 (OCI 배포용 리버스 프록시 템플릿)
- [ ] 로컬 Docker 빌드 & 실행 검증: `docker build -t portfolio:latest . && docker run -p 3000:3000 portfolio:latest`

### 단계 9: 완성도 & 타입 안전성
- [ ] `src/types/index.ts` — Prisma 타입 재내보내기
- [ ] `npx tsc --noEmit` 실행 — 모든 타입 오류 수정 (`any` 타입 금지)
- [ ] 모바일 레이아웃 검증 (단일 컬럼, 네비 상단 전환)
- [ ] 어드민 폼 로딩 상태 추가 (useTransition pending)
- [ ] 서버 액션 에러 핸들링 (try/catch, 오류 메시지 반환)
- [ ] 루트 레이아웃 `<meta>` 태그 추가 (title, description, og:image)
- [ ] Docker healthcheck용 `/api/health` 엔드포인트 확인

---

## 9. 환경 변수 참고

```bash
# .env.example
DATABASE_URL="file:./prisma/portfolio.db"
NEXTAUTH_SECRET=""              # 생성: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Google Cloud Console에서 발급)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# 어드민 허용 이메일 (본인 Google 계정)
ALLOWED_EMAIL="your@gmail.com"
```

**Google Cloud Console OAuth 앱 설정:**
1. [console.cloud.google.com](https://console.cloud.google.com) → 새 프로젝트 생성
2. API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성
3. 애플리케이션 유형: 웹 애플리케이션
4. 승인된 리디렉션 URI:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://yourdomain.com/api/auth/callback/google`
5. 발급된 클라이언트 ID와 Secret을 `.env`에 입력

---

## 10. 구현 순서 근거

1. **기반 먼저:** Prisma 스키마 + 인증은 어떤 페이지보다 먼저 구성 필요.
2. **공개 포트폴리오 → 어드민:** 시각적 목표와 데이터 계약을 먼저 확립.
3. **어드민 섹션은 의존성 순서로:** About(가장 단순) → Experience → Projects → Social.
4. **Docker는 마지막:** 전체 시스템이 배포 환경에서 정상 동작하는지 검증.

---

**⏸️ 사용자 승인 대기 중 — 명시적으로 구현 요청이 있을 때까지 코드를 작성하지 않습니다.**
