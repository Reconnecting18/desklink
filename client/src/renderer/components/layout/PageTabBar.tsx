import { useRef, useEffect } from 'react'
import { X, Plus, Home, Inbox, FileText, PenTool, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore, type AppId, type PageTab } from '@/stores/uiStore'

const APP_ICONS: Record<AppId, React.ElementType> = {
  home: Home,
  inbox: Inbox,
  documents: FileText,
  whiteboard: PenTool,
  files: FolderOpen
}

function Tab({ page, isActive }: { page: PageTab; isActive: boolean }) {
  const { setActivePage, closePage, pages } = useUIStore()
  const Icon = APP_ICONS[page.appId]
  const canClose = pages.length > 1

  return (
    <button
      type="button"
      onClick={() => setActivePage(page.id)}
      className={cn(
        'group relative flex h-full max-w-[200px] min-w-[104px] items-center gap-1.5 border-r border-notion-border px-3 py-1 text-xs transition-colors select-none',
        isActive
          ? 'bg-notion-bg text-notion-text'
          : 'bg-notion-sidebar text-notion-text-secondary hover:bg-notion-sidebar-hover hover:text-notion-text'
      )}
    >
      {/* Active underline indicator */}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-notion-accent" />
      )}

      <Icon className="h-3 w-3 shrink-0 opacity-70" />

      <span className="min-w-0 flex-1 truncate text-left leading-snug">
        {page.title}
      </span>

      {canClose && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            closePage(page.id)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              closePage(page.id)
            }
          }}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors',
            isActive
              ? 'opacity-60 hover:bg-notion-sidebar-hover hover:opacity-100'
              : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-notion-sidebar-hover'
          )}
        >
          <X className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  )
}

export function PageTabBar() {
  const { pages, activePageId, addPage } = useUIStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the active tab when it changes
  useEffect(() => {
    if (!scrollRef.current) return
    const activeEl = scrollRef.current.querySelector('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activePageId])

  return (
    <div className="flex h-9 min-h-9 shrink-0 items-stretch border-b border-notion-border bg-notion-sidebar">
      {/* Scrollable tab list */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-stretch overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {pages.map((page) => (
          <div key={page.id} data-active={page.id === activePageId ? 'true' : undefined}>
            <Tab page={page} isActive={page.id === activePageId} />
          </div>
        ))}
      </div>

      {/* New tab button */}
      <button
        type="button"
        onClick={() => addPage()}
        title="New page"
        className="flex h-full w-8 shrink-0 items-center justify-center border-l border-notion-border text-notion-text-tertiary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
