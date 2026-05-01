'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Award } from '@/generated/prisma'

interface Props {
  award?: Award
  action: (formData: FormData) => Promise<void>
}

export function AwardForm({ award, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState(award?.description ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">수상명</Label>
        <Input
          id="title"
          name="title"
          defaultValue={award?.title ?? ''}
          placeholder="OOO 대상"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="issuer">발급 기관</Label>
          <Input
            id="issuer"
            name="issuer"
            defaultValue={award?.issuer ?? ''}
            placeholder="삼성전자"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">수상일</Label>
          <Input
            id="date"
            name="date"
            defaultValue={award?.date ?? ''}
            placeholder="2017년 12월"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>설명 (선택, 마크다운)</Label>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={award?.published ?? true}
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
