import { useState, useEffect } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'

/** DeskLink logo — inlined from FreeSample-Vectorizer-io-D.svg */
function DeskLinkLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      className={className}
      aria-label="DeskLink logo"
    >
      {/* Black paths */}
      <g fill="currentColor">
        <path d="M266 606 l0 -265 21.5 0 21.5 0 0 243 0 243 224.5 0 224.5 0 0 22 0 22 -246 0 -246 0 0 -265z" />
        <path d="M451.2 744.5 c-8.8 -4.1 -19.3 -11.4 -26.9 -18.8 -6.2 -5.9 -7.3 -7.6 -7.3 -10.3 0 -3.9 -1.8 -3.3 19.4 -6.4 139 -20.1 245.7 -142.3 245.6 -281 -0.1 -65 -21.9 -127.1 -62.9 -179 -16.3 -20.6 -41.5 -43.8 -64.6 -59.3 -36.8 -24.9 -82.5 -42.2 -123 -46.7 -15 -1.7 -14.5 -1.5 -14.5 -5.4 0 -2.9 1.1 -4.3 7.3 -10.2 12.1 -11.6 29 -21.4 36.7 -21.4 2.2 0 10.3 1.6 17.9 3.5 49.3 12.4 97.1 37.8 135.2 71.8 58.9 52.6 95.6 122.2 106.4 201.7 2.5 18.5 3.1 61.3 1.1 80 -4.6 42.7 -17.9 85 -38.3 122.4 -7.7 13.9 -24.6 38.6 -35.6 51.6 -43.2 51.6 -103.4 89.8 -167.3 106.1 -18 4.6 -22 4.8 -29.2 1.4z" />
      </g>
    </svg>
  )
}

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
        <DeskLinkLogo className="h-5 w-5 shrink-0 text-notion-text" />
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
