import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-notion-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-8 w-full rounded-md border bg-white px-3 text-sm text-notion-text',
            'placeholder:text-notion-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-notion-accent focus:border-transparent',
            'transition-colors',
            error ? 'border-notion-red' : 'border-notion-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-notion-red">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
