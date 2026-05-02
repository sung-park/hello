'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  action: (formData: FormData) => Promise<void>
  message?: string
}

export function DeleteButton({ action, message = '정말 삭제하시겠습니까?' }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault()
      }}
    >
      <Button variant="ghost" size="sm" type="submit" className="text-red-400 hover:text-red-300">
        <Trash2 size={14} />
      </Button>
    </form>
  )
}
