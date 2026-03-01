'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Experience } from '@/generated/prisma'

interface Props {
  experience?: Experience
  action: (formData: FormData) => Promise<void>
}

export function ExperienceForm({ experience, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState(experience?.description ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">회사명</Label>
          <Input
            id="company"
            name="company"
            defaultValue={experience?.company ?? ''}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">역할/직책</Label>
          <Input
            id="role"
            name="role"
            defaultValue={experience?.role ?? ''}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">시작일</Label>
          <Input
            id="startDate"
            name="startDate"
            defaultValue={experience?.startDate ?? ''}
            placeholder="2022년 1월"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">종료일 (비워두면 현재)</Label>
          <Input
            id="endDate"
            name="endDate"
            defaultValue={experience?.endDate ?? ''}
            placeholder="2024년 3월"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택 (쉼표로 구분)</Label>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={experience?.techStack ?? ''}
          placeholder="TypeScript, React, Node.js"
        />
      </div>

      <div className="space-y-2">
        <Label>설명 (마크다운)</Label>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={experience?.published ?? true}
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
