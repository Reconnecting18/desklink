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

export function AppSwitcherRail() {
  const navigate = useNavigate()
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>()
  const { activeApp, openOrFocusApp, activeWorkspaceId } = useUIStore()

  const workspaceId = routeWorkspaceId ?? activeWorkspaceId ?? ''

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

  return (
    <div
      className={cn(
        'relative z-10 flex w-[52px] shrink-0 flex-col items-center gap-2 border-r border-notion-border/50 bg-notion-sidebar px-2 py-2'
      )}
    >
      {APPS.map((app) => {
        const isActive = activeApp === app.id
        return (
          <div
            key={app.id}
            className="relative flex w-full items-center justify-center pl-0"
          >
            {isActive && (
              <span
                className="pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-notion-accent"
                aria-hidden
              />
            )}
            <button
              type="button"
              title={app.label}
              aria-label={app.label}
              onClick={() => handleAppClick(app.id)}
              className={cn(
                'group flex size-9 shrink-0 items-center justify-center rounded-[6px] transition-all',
                isActive
                  ? 'bg-notion-sidebar-hover text-notion-text'
                  : 'text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary'
              )}
            >
              <app.icon className="h-[19px] w-[19px] shrink-0" strokeWidth={1.75} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
