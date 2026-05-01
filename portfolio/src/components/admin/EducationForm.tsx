'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Education } from '@/generated/prisma'

interface Props {
  education?: Education
  action: (formData: FormData) => Promise<void>
}

export function EducationForm({ education, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState(education?.description ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="school">학교명</Label>
        <Input id="school" name="school" defaultValue={education?.school ?? ''} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="degree">학위</Label>
          <Input
            id="degree"
            name="degree"
            defaultValue={education?.degree ?? ''}
            placeholder="학사 / 석사 / 박사"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="field">전공</Label>
          <Input
            id="field"
            name="field"
            defaultValue={education?.field ?? ''}
            placeholder="컴퓨터공학"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">입학</Label>
          <Input
            id="startDate"
            name="startDate"
            defaultValue={education?.startDate ?? ''}
            placeholder="2000년 3월"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">졸업 (재학중이면 비움)</Label>
          <Input
            id="endDate"
            name="endDate"
            defaultValue={education?.endDate ?? ''}
            placeholder="2004년 2월"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpa">학점 (선택)</Label>
          <Input
            id="gpa"
            name="gpa"
            defaultValue={education?.gpa ?? ''}
            placeholder="4.1 / 4.5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>비고 (선택, 마크다운)</Label>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={education?.published ?? true}
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
