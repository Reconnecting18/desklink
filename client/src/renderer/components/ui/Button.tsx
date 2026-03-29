import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
          'whitespace-nowrap leading-normal',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-notion-accent text-white hover:bg-notion-accent-hover': variant === 'primary',
            'border border-notion-border bg-white text-notion-text hover:bg-notion-sidebar':
              variant === 'secondary',
            'text-notion-text hover:bg-notion-sidebar-hover': variant === 'ghost',
            'bg-notion-red text-white hover:bg-red-600': variant === 'danger'
          },
          {
            'min-h-9 px-4 py-2 text-xs': size === 'sm',
            'min-h-9 px-4 py-2 text-sm': size === 'md',
            'min-h-11 px-5 py-2.5 text-sm': size === 'lg'
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
