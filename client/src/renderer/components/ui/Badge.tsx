import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low'
  color?: string
  className?: string
}

export function Badge({ children, variant = 'default', color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        {
          'bg-notion-sidebar text-notion-text-secondary': variant === 'default',
          'bg-red-100 text-red-700': variant === 'urgent',
          'bg-orange-100 text-orange-700': variant === 'high',
          'bg-yellow-100 text-yellow-700': variant === 'medium',
          'bg-green-100 text-green-700': variant === 'low'
        },
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  )
}
