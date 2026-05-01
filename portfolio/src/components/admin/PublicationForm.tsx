'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Publication } from '@/generated/prisma'

interface Props {
  publication?: Publication
  action: (formData: FormData) => Promise<void>
}

export function PublicationForm({ publication, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState(publication?.description ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={publication?.title ?? ''} required />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="type">종류</Label>
          <select
            id="type"
            name="type"
            defaultValue={publication?.type ?? 'talk'}
            className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100"
          >
            <option value="talk">발표 (Talk)</option>
            <option value="article">기고 (Article)</option>
            <option value="paper">논문 (Paper)</option>
            <option value="interview">인터뷰</option>
            <option value="book">책</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue">행사명/매체명</Label>
          <Input
            id="venue"
            name="venue"
            defaultValue={publication?.venue ?? ''}
            placeholder="Samsung Developer Conference"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">일자</Label>
          <Input
            id="date"
            name="date"
            defaultValue={publication?.date ?? ''}
            placeholder="2017년 11월"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL (선택)</Label>
        <Input
          id="url"
          name="url"
          defaultValue={publication?.url ?? ''}
          placeholder="https://..."
        />
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
            defaultChecked={publication?.published ?? true}
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
