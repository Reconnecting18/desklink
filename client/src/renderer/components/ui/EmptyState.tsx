import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-notion-sidebar">
        <Icon className="h-7 w-7 text-notion-text-secondary" />
      </div>
      <h3 className="mb-2 text-sm font-medium leading-snug text-notion-text">{title}</h3>
      <p className="mb-6 max-w-sm px-2 text-sm leading-relaxed text-notion-text-secondary">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
