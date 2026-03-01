'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SocialLink } from '@/generated/prisma'

const ICON_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'mail', label: 'Email' },
  { value: 'twitter', label: 'Twitter/X' },
]

interface Props {
  link?: SocialLink
  action: (formData: FormData) => Promise<void>
  onCancel?: () => void
}

export function SocialLinkForm({ link, action, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => action(formData))
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`platform-${link?.id ?? 'new'}`}>플랫폼</Label>
          <Input
            id={`platform-${link?.id ?? 'new'}`}
            name="platform"
            defaultValue={link?.platform ?? ''}
            placeholder="GitHub"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`icon-${link?.id ?? 'new'}`}>아이콘</Label>
          <select
            id={`icon-${link?.id ?? 'new'}`}
            name="icon"
            defaultValue={link?.icon ?? 'github'}
            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            {ICON_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`url-${link?.id ?? 'new'}`}>URL</Label>
          <Input
            id={`url-${link?.id ?? 'new'}`}
            name="url"
            defaultValue={link?.url ?? ''}
            placeholder="https://github.com/..."
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? '저장 중...' : link ? '수정' : '추가'}
        </Button>
        {onCancel && (
          <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
