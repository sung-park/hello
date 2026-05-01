'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Certification } from '@/generated/prisma'

interface Props {
  certification?: Certification
  action: (formData: FormData) => Promise<void>
}

export function CertificationForm({ certification, action }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">자격증명</Label>
          <Input
            id="name"
            name="name"
            defaultValue={certification?.name ?? ''}
            placeholder="정보처리기사"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuer">발급 기관</Label>
          <Input
            id="issuer"
            name="issuer"
            defaultValue={certification?.issuer ?? ''}
            placeholder="한국산업인력공단"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="issueDate">발급일</Label>
          <Input
            id="issueDate"
            name="issueDate"
            defaultValue={certification?.issueDate ?? ''}
            placeholder="2010년 6월"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">만료일 (없으면 비움)</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            defaultValue={certification?.expiryDate ?? ''}
            placeholder="2025년 6월"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="credentialId">자격증 번호 (선택)</Label>
          <Input
            id="credentialId"
            name="credentialId"
            defaultValue={certification?.credentialId ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credentialUrl">검증 URL (선택)</Label>
          <Input
            id="credentialUrl"
            name="credentialUrl"
            defaultValue={certification?.credentialUrl ?? ''}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={certification?.published ?? true}
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
