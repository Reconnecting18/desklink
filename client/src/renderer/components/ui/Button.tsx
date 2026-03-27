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
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
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
            'h-7 px-2 text-xs': size === 'sm',
            'h-8 px-3 text-sm': size === 'md',
            'h-10 px-4 text-sm': size === 'lg'
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
