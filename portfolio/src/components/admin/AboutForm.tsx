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
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData: FormData) {
    formData.set('bio', bio)
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
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            name="name"
            defaultValue={about?.name ?? ''}
            placeholder="홍길동"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">직책/직업</Label>
          <Input
            id="title"
            name="title"
            defaultValue={about?.title ?? ''}
            placeholder="Software Engineer"
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

      <div className="space-y-2">
        <Label>자기소개 (마크다운)</Label>
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
          <Label htmlFor="resumeUrl">이력서 URL</Label>
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
