'use client'

import { useTransition, useState } from 'react'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Patent } from '@/generated/prisma'

interface Props {
  patent?: Patent
  action: (formData: FormData) => Promise<void>
}

export function PatentForm({ patent, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [summary, setSummary] = useState(patent?.summary ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('summary', summary)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">발명의 명칭</Label>
        <Input id="title" name="title" defaultValue={patent?.title ?? ''} required />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="patentNumber">출원/등록번호</Label>
          <Input
            id="patentNumber"
            name="patentNumber"
            defaultValue={patent?.patentNumber ?? ''}
            placeholder="KR10-2020-0123456"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">국가</Label>
          <Input
            id="country"
            name="country"
            defaultValue={patent?.country ?? ''}
            placeholder="KR / US / CN / EP / JP / WIPO"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <select
            id="status"
            name="status"
            defaultValue={patent?.status ?? 'granted'}
            className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100"
          >
            <option value="granted">등록</option>
            <option value="filed">출원</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="filingDate">출원일</Label>
          <Input
            id="filingDate"
            name="filingDate"
            defaultValue={patent?.filingDate ?? ''}
            placeholder="2018년 6월"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grantDate">등록일 (등록건만)</Label>
          <Input
            id="grantDate"
            name="grantDate"
            defaultValue={patent?.grantDate ?? ''}
            placeholder="2020년 11월"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inventors">공동 발명자 (쉼표로 구분)</Label>
        <Input
          id="inventors"
          name="inventors"
          defaultValue={patent?.inventors ?? ''}
          placeholder="박성근, 홍길동"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">검증 URL (선택, Google Patents/KIPRIS 등)</Label>
        <Input
          id="url"
          name="url"
          defaultValue={patent?.url ?? ''}
          placeholder="https://patents.google.com/patent/..."
        />
      </div>

      <div className="space-y-2">
        <Label>요약 (선택, 마크다운)</Label>
        <MarkdownEditor value={summary} onChange={setSummary} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={patent?.published ?? true}
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
