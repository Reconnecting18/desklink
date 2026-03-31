import { useCallback, useEffect, useRef, useState } from 'react'
import { Home, Inbox, FileText, PenTool, FolderOpen, Settings } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useUIStore, type AppId } from '@/stores/uiStore'

interface AppEntry {
  id: AppId
  label: string
  icon: React.ElementType
}

const APPS: AppEntry[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'whiteboard', label: 'Draw', icon: PenTool },
  { id: 'settings', label: 'Settings', icon: Settings }
]

/** Default visible rail width (icon column only) */
const RAIL_ICON_W = 36
const HIT_STRIP_W = 12

/** Must match `.desklink-rail-float-exit` duration + small buffer before unmount */
const EXIT_ANIM_MS = 380

/**
 * Icon-only app switcher.
 * - When expanded (`railHidden` false): full-height column in layout.
 * - When collapsed (`railHidden` true): nothing in flow; hover the left edge to open a floating,
 *   vertically inset rail (rounded, shadow) — icons only, no labels.
 */
export function AppSwitcherRail() {
  const navigate = useNavigate()
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>()
  const { activeApp, openOrFocusApp, activeWorkspaceId, railHidden } = useUIStore()
  const [peekOpen, setPeekOpen] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const exitCompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const workspaceId = routeWorkspaceId ?? activeWorkspaceId ?? ''

  const clearExitCompleteTimer = useCallback(() => {
    if (exitCompleteTimer.current) {
      clearTimeout(exitCompleteTimer.current)
      exitCompleteTimer.current = null
    }
  }, [])

  const finishClose = useCallback(() => {
    setPeekOpen(false)
    setIsExiting(false)
  }, [])

  const beginClose = useCallback(() => {
    if (!peekOpen || isExiting) return
    setIsExiting(true)
    clearExitCompleteTimer()
    exitCompleteTimer.current = setTimeout(() => {
      finishClose()
      exitCompleteTimer.current = null
    }, EXIT_ANIM_MS)
  }, [peekOpen, isExiting, clearExitCompleteTimer, finishClose])

  const cancelClose = useCallback(() => {
    clearExitCompleteTimer()
    setIsExiting(false)
  }, [clearExitCompleteTimer])

  useEffect(() => {
    if (!railHidden) {
      cancelClose()
      setPeekOpen(false)
    }
  }, [railHidden, cancelClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && peekOpen && !isExiting) beginClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [peekOpen, isExiting, beginClose])

  useEffect(() => () => clearExitCompleteTimer(), [clearExitCompleteTimer])

  const handleAppClick = (appId: AppId) => {
    openOrFocusApp(appId)
    if (!workspaceId) return
    switch (appId) {
      case 'home':
        navigate(`/w/${workspaceId}`)
        break
      case 'settings':
        navigate(`/w/${workspaceId}/settings`)
        break
      case 'inbox':
        navigate(`/w/${workspaceId}/inbox`)
        break
      case 'files':
        navigate(`/w/${workspaceId}/files`)
        break
      case 'whiteboard':
        navigate(`/w/${workspaceId}/whiteboard`)
        break
      default:
        break
    }
  }

  const renderIconButtons = () =>
    APPS.map((app) => {
      const isActive = activeApp === app.id
      const Icon = app.icon
      return (
        <div key={app.id} className="relative flex w-full items-center justify-center pl-0">
          {isActive && (
            <span
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-notion-accent"
              aria-hidden
            />
          )}
          <button
            type="button"
            title={app.label}
            aria-label={app.label}
            onClick={() => handleAppClick(app.id)}
            className={cn(
              'group flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-all',
              isActive
                ? 'bg-notion-sidebar-hover text-notion-text'
                : 'text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          </button>
        </div>
      )
    })

  if (railHidden) {
    const hoverW = peekOpen ? HIT_STRIP_W + RAIL_ICON_W + 4 : HIT_STRIP_W
    return (
      <div
        className="fixed left-0 top-11 z-[35] transition-[width] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: hoverW,
          height: 'calc(100vh - 2.75rem)'
        }}
        onMouseLeave={beginClose}
        onMouseEnter={cancelClose}
      >
        <div
          className="absolute inset-y-0 left-0 bg-transparent"
          style={{ width: HIT_STRIP_W }}
          onMouseEnter={() => {
            cancelClose()
            setPeekOpen(true)
          }}
          aria-hidden
        />
        {peekOpen && (
          <nav
            aria-label="Apps"
            className={cn(
              'absolute left-3 top-3 bottom-3 z-40 flex flex-col items-center gap-2 overflow-y-auto rounded-xl border border-notion-border/60 bg-notion-sidebar p-[5px] shadow-xl shadow-black/25',
              !isExiting && 'desklink-rail-float',
              isExiting && 'desklink-rail-float-exit'
            )}
            style={{ width: RAIL_ICON_W }}
          >
            {renderIconButtons()}
          </nav>
        )}
      </div>
    )
  }

  return (
    <nav
      className="flex h-full shrink-0 flex-col items-center gap-2 border-r border-notion-border/60 bg-notion-sidebar p-[5px]"
      style={{ width: RAIL_ICON_W }}
      aria-label="Apps"
    >
      {renderIconButtons()}
    </nav>
  )
}
