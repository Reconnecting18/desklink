import { useState, useEffect } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized)

    const cleanup = window.api.onMaximizeChange(setIsMaximized)
    return cleanup
  }, [])

  return (
    <div className="drag-region flex h-9 shrink-0 items-center justify-between border-b border-notion-border bg-notion-sidebar">
      <div className="flex items-center gap-2 pl-3">
        <span className="text-xs font-semibold text-notion-text-secondary tracking-wide">
          DeskLink
        </span>
      </div>

      <div className="no-drag flex h-full">
        <button
          onClick={() => window.api.minimize()}
          className={cn(
            'flex h-full w-11 items-center justify-center',
            'text-notion-text-secondary hover:bg-notion-sidebar-hover transition-colors'
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => window.api.maximize()}
          className={cn(
            'flex h-full w-11 items-center justify-center',
            'text-notion-text-secondary hover:bg-notion-sidebar-hover transition-colors'
          )}
        >
          {isMaximized ? (
            <Copy className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>
        <button
          onClick={() => window.api.close()}
          className={cn(
            'flex h-full w-11 items-center justify-center',
            'text-notion-text-secondary hover:bg-notion-red hover:text-white transition-colors'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
