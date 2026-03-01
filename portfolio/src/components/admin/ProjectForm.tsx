'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Project } from '@/generated/prisma'

interface Props {
  project?: Project
  action: (formData: FormData) => Promise<void>
}

export function ProjectForm({ project, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState(project?.description ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">프로젝트 제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={project?.title ?? ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택 (쉼표로 구분)</Label>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={project?.techStack ?? ''}
          placeholder="Next.js, TypeScript, Tailwind CSS"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub URL</Label>
          <Input
            id="repoUrl"
            name="repoUrl"
            defaultValue={project?.repoUrl ?? ''}
            placeholder="https://github.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="liveUrl">라이브 URL</Label>
          <Input
            id="liveUrl"
            name="liveUrl"
            defaultValue={project?.liveUrl ?? ''}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">썸네일 이미지 URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={project?.imageUrl ?? ''}
          placeholder="https://..."
        />
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
            defaultChecked={project?.featured ?? false}
            className="rounded"
          />
          추천 프로젝트 (상단 노출)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={project?.published ?? true}
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
