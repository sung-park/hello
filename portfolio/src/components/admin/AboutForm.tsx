'use client'

import { useTransition, useState } from 'react'
import { updateAbout } from '@/lib/actions/about'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { About } from '@/generated/prisma'

interface Props {
  about: About | null
}

export function AboutForm({ about }: Props) {
  const [isPending, startTransition] = useTransition()
  const [bio, setBio] = useState(about?.bio ?? '')
  const [summary, setSummary] = useState(about?.summary ?? '')
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData: FormData) {
    formData.set('bio', bio)
    formData.set('summary', summary)
    startTransition(async () => {
      await updateAbout(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">이름 (KO)</Label>
          <Input
            id="name"
            name="name"
            defaultValue={about?.name ?? ''}
            placeholder="홍길동"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">이름 (EN)</Label>
          <Input
            id="nameEn"
            name="nameEn"
            defaultValue={about?.nameEn ?? ''}
            placeholder="Gildong Hong"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">직책/직업</Label>
          <Input
            id="title"
            name="title"
            defaultValue={about?.title ?? ''}
            placeholder="Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthYear">출생년도 (선택)</Label>
          <Input
            id="birthYear"
            name="birthYear"
            type="number"
            defaultValue={about?.birthYear ?? ''}
            placeholder="1980"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">한 줄 소개</Label>
        <Input
          id="tagline"
          name="tagline"
          defaultValue={about?.tagline ?? ''}
          placeholder="나를 한 문장으로 소개해 주세요"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={about?.email ?? ''}
            placeholder="name@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">전화번호</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={about?.phone ?? ''}
            placeholder="010-0000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">거주지 (KO)</Label>
          <Input
            id="location"
            name="location"
            defaultValue={about?.location ?? ''}
            placeholder="서울, 대한민국"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>이력서용 자기소개 (3-4줄, 마크다운)</Label>
        <p className="text-xs text-slate-400">
          이력서/경력기술서 헤더 바로 아래에 노출됩니다. 연차 + 핵심 도메인 + 강점을 압축.
        </p>
        <MarkdownEditor value={summary} onChange={setSummary} />
      </div>

      <div className="space-y-2">
        <Label>홈페이지 자기소개 (마크다운)</Label>
        <p className="text-xs text-slate-400">/ 메인 페이지의 About 섹션에 노출.</p>
        <MarkdownEditor value={bio} onChange={setBio} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">프로필 이미지 URL</Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            defaultValue={about?.avatarUrl ?? ''}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resumeUrl">이력서 URL (외부 링크, 선택)</Label>
          <Input
            id="resumeUrl"
            name="resumeUrl"
            defaultValue={about?.resumeUrl ?? ''}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-400">저장되었습니다!</span>
        )}
      </div>
    </form>
  )
}
