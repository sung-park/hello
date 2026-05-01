'use client'

import { useTransition, useState } from 'react'
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
  const [showDetails, setShowDetails] = useState(
    !!(patent?.patentNumber || patent?.country || patent?.filingDate || patent?.grantDate || patent?.inventors || patent?.url),
  )
  const [summary, setSummary] = useState(patent?.summary ?? '')

  function handleSubmit(formData: FormData) {
    formData.set('summary', summary)
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-400">
        💡 그룹 요약으로 입력 시 (예: 시스템 SW 관련 특허 5건):
        <br />
        <span className="text-slate-300">제목</span>에 카테고리 (예: &quot;Android 시스템 최적화&quot;),
        <span className="text-slate-300"> 요약</span>에 한 줄 설명,
        <span className="text-slate-300"> 건수</span>에 N, <span className="text-slate-300">상태</span>에 출원/등록/혼합. 다른 필드는 비워도 됩니다.
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목 / 카테고리</Label>
        <Input
          id="title"
          name="title"
          defaultValue={patent?.title ?? ''}
          placeholder="Android 시스템 최적화"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">한 줄 요약</Label>
        <Input
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="성능 및 소모전류 개선 관련 특허(직무발명)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="count">건수</Label>
          <Input
            id="count"
            name="count"
            type="number"
            min={1}
            defaultValue={patent?.count ?? 1}
            required
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
            <option value="mixed">출원/등록 혼합</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          {showDetails ? '— 상세 정보 숨기기' : '+ 상세 정보 입력 (선택, 단일 특허일 때)'}
        </button>
      </div>

      {showDetails && (
        <div className="space-y-6 border-l-2 border-slate-700 pl-4">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="grantDate">등록일</Label>
              <Input
                id="grantDate"
                name="grantDate"
                defaultValue={patent?.grantDate ?? ''}
                placeholder="2020년 11월"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventors">공동 발명자</Label>
            <Input
              id="inventors"
              name="inventors"
              defaultValue={patent?.inventors ?? ''}
              placeholder="박성근, 홍길동"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">검증 URL</Label>
            <Input
              id="url"
              name="url"
              defaultValue={patent?.url ?? ''}
              placeholder="https://patents.google.com/patent/..."
            />
          </div>
        </div>
      )}

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
