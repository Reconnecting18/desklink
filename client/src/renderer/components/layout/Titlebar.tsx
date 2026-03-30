import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

const APP_ROUTES: Partial<Record<AppId, (wsId: string) => string>> = {
  home: (wsId) => `/w/${wsId}`,
  settings: (wsId) => `/w/${wsId}/settings`,
  inbox: (wsId) => `/w/${wsId}/inbox`,
  files: (wsId) => `/w/${wsId}/files`,
  whiteboard: (wsId) => `/w/${wsId}/whiteboard`
}

function Tab({ page, isActive }: { page: PageTab; isActive: boolean }) {
  const { setActivePage, closePage, pages, activeWorkspaceId } = useUIStore()
  const navigate = useNavigate()
  const Icon = APP_ICONS[page.appId]
  const canClose = pages.length > 1

  const handleTabClick = () => {
    setActivePage(page.id)
    if (activeWorkspaceId) {
      const routeFn = APP_ROUTES[page.appId]
      if (routeFn) navigate(routeFn(activeWorkspaceId))
    }
  }

  return (
    <button
      type="button"
      onClick={handleTabClick}
      className={cn(
        'group relative flex h-full max-w-[220px] min-w-[100px] items-center gap-1.5 overflow-hidden border-r border-notion-border/50 px-4 py-2 text-xs transition-colors select-none',
        isActive
          ? 'bg-notion-bg text-notion-text'
          : 'bg-notion-sidebar text-notion-text-secondary hover:bg-notion-sidebar-hover hover:text-notion-text'
      )}
    >
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
            'ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors',
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

/** Preload exposes `window.api` (not `window.electron`). Undefined in a plain browser. */
function getElectronApi(): typeof window.api | undefined {
  return typeof window !== 'undefined' ? window.api : undefined
}

export function Titlebar({ showTabs = false }: TitlebarProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const { pages, activePageId, addPage, toggleRail, railHidden } = useUIStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const api = getElectronApi()
  const hasWindowControls = Boolean(api?.minimize && api?.maximize && api?.close)

  useEffect(() => {
    if (!api?.isMaximized || !api?.onMaximizeChange) return
    void api.isMaximized().then(setIsMaximized)
    return api.onMaximizeChange(setIsMaximized)
  }, [api])

  useEffect(() => {
    if (!scrollRef.current || !showTabs) return
    const activeEl = scrollRef.current.querySelector('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activePageId, showTabs])

  const brand = (
    <div className="flex items-center gap-2.5">
      <img
        src={deskLinkLogoUrl}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 object-contain opacity-90 dark:opacity-100"
        aria-hidden
      />
      {showTabs && (
        <button
          type="button"
          onClick={() => toggleRail()}
          title={railHidden ? 'Expand app rail' : 'Collapse app rail'}
          aria-label={railHidden ? 'Expand app rail' : 'Collapse app rail'}
          aria-pressed={!railHidden}
          className="no-drag flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
        >
          {railHidden ? (
            <PanelRight className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      )}
    </div>
  )

  return (
    <div className="drag-region flex h-11 min-h-11 shrink-0 items-stretch border-b border-notion-border/60 bg-notion-sidebar">
      {showTabs ? (
        <>
          <div className="flex shrink-0 items-center gap-1 border-r border-notion-border/50 bg-notion-sidebar px-3 py-2">
            {brand}
          </div>

          <div
            ref={scrollRef}
            className="no-drag flex min-h-10 min-w-0 flex-1 items-stretch overflow-x-auto overflow-y-hidden py-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {pages.map((page) => (
              <div key={page.id} data-active={page.id === activePageId ? 'true' : undefined}>
                <Tab page={page} isActive={page.id === activePageId} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPage()}
              title="New page"
              aria-label="New page"
              className="no-drag flex h-full min-w-10 shrink-0 items-center justify-center px-3 py-2 text-notion-text-tertiary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center px-3.5 py-2">{brand}</div>
          <div className="min-w-0 flex-1" />
        </>
      )}

      {hasWindowControls ? (
        <div className="no-drag flex h-full shrink-0 border-l border-notion-border/50">
          <button
            type="button"
            onClick={() => api?.minimize?.()}
            className={cn(
              'flex h-full w-11 items-center justify-center',
              'text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover'
            )}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => api?.maximize?.()}
            className={cn(
              'flex h-full w-11 items-center justify-center',
              'text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover'
            )}
          >
            {isMaximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => api?.close?.()}
            className={cn(
              'flex h-full w-11 items-center justify-center',
              'text-notion-text-secondary transition-colors hover:bg-notion-red hover:text-white'
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
