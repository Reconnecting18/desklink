import { cn } from '@/lib/cn'

interface AvatarProps {
  /** Display name; falls back to "?" if missing (API often uses `displayName`). */
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const colors = [
  'bg-notion-blue',
  'bg-notion-purple',
  'bg-notion-pink',
  'bg-notion-red',
  'bg-notion-orange',
  'bg-notion-green'
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 text-[9px]',
    md: 'h-7 w-7 text-xs',
    lg: 'h-9 w-9 text-sm'
  }

  const label = (name ?? '').trim() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium text-white',
        sizeClasses[size],
        getColor(label),
        className
      )}
    >
      {getInitials(label)}
    </div>
  )
}
