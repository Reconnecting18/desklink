import { useState, useEffect, useRef } from 'react'
import {
  Minus,
  Square,
  X,
  Copy,
  Plus,
  Home,
  Inbox,
  FileText,
  PenTool,
  FolderOpen,
  Settings,
  PanelLeft,
  PanelRight
} from 'lucide-react'
import { cn } from '@/lib/cn'
import deskLinkLogoUrl from '@/assets/FreeSample-Vectorizer-io-D.svg'
import { useUIStore, type AppId, type PageTab } from '@/stores/uiStore'

const APP_ICONS: Record<AppId, React.ElementType> = {
  home: Home,
  inbox: Inbox,
  documents: FileText,
  whiteboard: PenTool,
  files: FolderOpen,
  settings: Settings
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
        'group relative flex h-full max-w-[220px] min-w-[112px] items-center gap-2 border-r border-notion-border px-4 py-2 text-xs transition-colors select-none',
        isActive
          ? 'bg-notion-bg text-notion-text'
          : 'bg-notion-sidebar text-notion-text-secondary hover:bg-notion-sidebar-hover hover:text-notion-text'
      )}
    >
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-notion-accent" />
      )}

      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />

      <span className="min-w-0 flex-1 truncate text-left leading-snug">{page.title}</span>

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
            'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors',
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

export interface TitlebarProps {
  /** When true, show page tabs and new-tab control after the brand row. */
  showTabs?: boolean
}

export function Titlebar({ showTabs = false }: TitlebarProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const { pages, activePageId, addPage, toggleSidebar, sidebarOpen } = useUIStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized)
    return window.api.onMaximizeChange(setIsMaximized)
  }, [])

  useEffect(() => {
    if (!scrollRef.current || !showTabs) return
    const activeEl = scrollRef.current.querySelector('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activePageId, showTabs])

  const brand = (
    <div className="flex items-center gap-2">
      <img
        src={deskLinkLogoUrl}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 object-contain"
        aria-hidden
      />
      {showTabs && (
        <button
          type="button"
          onClick={() => toggleSidebar()}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="no-drag flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
        >
          {sidebarOpen ? (
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <PanelRight className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      )}
    </div>
  )

  return (
    <div className="drag-region flex h-10 min-h-10 shrink-0 items-stretch border-b border-notion-border bg-notion-sidebar">
      {showTabs ? (
        <>
          <div className="flex shrink-0 items-center gap-1 border-r border-notion-border bg-notion-sidebar px-3 py-2">
            {brand}
          </div>

          <div
            ref={scrollRef}
            className="no-drag flex min-h-10 min-w-0 flex-1 items-stretch overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {pages.map((page) => (
              <div key={page.id} data-active={page.id === activePageId ? 'true' : undefined}>
                <Tab page={page} isActive={page.id === activePageId} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addPage()}
            title="New page"
            aria-label="New page"
            className="no-drag flex h-full min-w-[2.75rem] shrink-0 items-center justify-center border-l border-notion-border px-3 text-notion-text-tertiary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center px-3.5 py-2">{brand}</div>
          <div className="min-w-0 flex-1" />
        </>
      )}

      <div className="no-drag flex h-full shrink-0 border-l border-notion-border">
        <button
          type="button"
          onClick={() => window.api.minimize()}
          className={cn(
            'flex h-full w-11 items-center justify-center',
            'text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover'
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => window.api.maximize()}
          className={cn(
            'flex h-full w-11 items-center justify-center',
            'text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover'
          )}
        >
          {isMaximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => window.api.close()}
          className={cn(
            'flex h-full w-11 items-center justify-center',
            'text-notion-text-secondary transition-colors hover:bg-notion-red hover:text-white'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
