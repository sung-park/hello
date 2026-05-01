'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Language } from '@/generated/prisma'

interface Props {
  language?: Language
  action: (formData: FormData) => Promise<void>
}

export function LanguageForm({ language, action }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">언어명</Label>
          <Input
            id="name"
            name="name"
            defaultValue={language?.name ?? ''}
            placeholder="한국어 / 영어 / 일본어"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proficiency">수준</Label>
          <select
            id="proficiency"
            name="proficiency"
            defaultValue={language?.proficiency ?? 'Business'}
            className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100"
            required
          >
            <option value="Native">Native (모국어)</option>
            <option value="Fluent">Fluent (유창)</option>
            <option value="Business">Business (실무 가능)</option>
            <option value="Intermediate">Intermediate (중급)</option>
            <option value="Limited">Limited (기본)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="testName">시험명 (선택)</Label>
          <Input
            id="testName"
            name="testName"
            defaultValue={language?.testName ?? ''}
            placeholder="TOEIC / OPIc / IELTS / JLPT"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="score">점수/등급 (선택)</Label>
          <Input
            id="score"
            name="score"
            defaultValue={language?.score ?? ''}
            placeholder="900 / IH / 7.0 / N1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={language?.published ?? true}
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
