import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2.5">
        {label && (
          <label htmlFor={id} className="mb-1 block text-xs font-medium leading-snug text-notion-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'min-h-10 w-full rounded-md border bg-notion-bg px-4 py-2.5 text-sm leading-snug text-notion-text',
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
