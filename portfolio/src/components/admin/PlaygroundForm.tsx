'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { ThumbnailUploader } from './ThumbnailUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Playground } from '@/generated/prisma'

interface Props {
  playground?: Playground
  action: (formData: FormData) => Promise<void>
}

export function PlaygroundForm({ playground, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState(playground?.description ?? '')
  const [imageUrl, setImageUrl] = useState(playground?.imageUrl ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    formData.set('imageUrl', imageUrl)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={playground?.title ?? ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택 (쉼표로 구분)</Label>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={playground?.techStack ?? ''}
          placeholder="Next.js, TypeScript, Tailwind CSS"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub URL</Label>
          <Input
            id="repoUrl"
            name="repoUrl"
            defaultValue={playground?.repoUrl ?? ''}
            placeholder="https://github.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="liveUrl">라이브 URL</Label>
          <Input
            id="liveUrl"
            name="liveUrl"
            defaultValue={playground?.liveUrl ?? ''}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>썸네일 이미지</Label>
        <ThumbnailUploader currentUrl={imageUrl || undefined} onUpload={setImageUrl} />
      </div>

      <div className="space-y-2">
        <Label>설명 (마크다운)</Label>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={playground?.featured ?? false}
            className="rounded"
          />
          추천 (상단 노출)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={playground?.published ?? true}
            className="rounded"
          />
          공개
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
        <Button variant="outline" type="button" onClick={() => history.back()}>
          취소
        </Button>
      </div>
    </form>
  )
}
