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
  const [achievements, setAchievements] = useState(experience?.achievements ?? '')
  const [current, setCurrent] = useState(experience?.current ?? false)

  function handleSubmit(formData: FormData) {
    formData.set('description', description)
    formData.set('achievements', achievements)
    if (current) formData.set('endDate', '')
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

      <div className="space-y-2">
        <Label htmlFor="location">근무 위치</Label>
        <Input
          id="location"
          name="location"
          defaultValue={experience?.location ?? ''}
          placeholder="서울, 대한민국 / 수원, 대한민국"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
          <Label htmlFor="endDate">종료일</Label>
          <Input
            id="endDate"
            name="endDate"
            defaultValue={experience?.endDate ?? ''}
            placeholder="2024년 3월"
            disabled={current}
          />
        </div>
        <div className="space-y-2 flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="current"
              value="true"
              checked={current}
              onChange={(e) => setCurrent(e.target.checked)}
              className="rounded"
            />
            재직 중
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">한 줄 역할 요약 (이력서용)</Label>
        <p className="text-xs text-slate-400">
          이력서(/resume) 한 줄에 노출. 임팩트 한 문장으로.
        </p>
        <Input
          id="summary"
          name="summary"
          defaultValue={experience?.summary ?? ''}
          placeholder="안드로이드 시스템 성능·전력 최적화 및 IoT 신사업 개발 리드"
        />
      </div>

      <div className="space-y-2">
        <Label>주요 업무 / 프로젝트 (마크다운)</Label>
        <p className="text-xs text-slate-400">
          / 메인과 /cv 경력기술서에 노출. 시기별 또는 프로젝트별 구조 권장.
        </p>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="space-y-2">
        <Label>핵심 성과 / 임팩트 (마크다운, 정량 bullet 권장)</Label>
        <p className="text-xs text-slate-400">
          이력서(/resume)에 상위 2-3개 노출, 경력기술서(/cv)에 전체 노출. 가능한 한 수치 포함 (p99, MAU, 비용 절감 등).
        </p>
        <MarkdownEditor value={achievements} onChange={setAchievements} />
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
