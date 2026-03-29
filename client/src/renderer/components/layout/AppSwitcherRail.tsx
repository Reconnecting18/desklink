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
        navigate(`/w/${workspaceId}/projects`)
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
        'flex w-[56px] shrink-0 flex-col items-center gap-2 border-r border-notion-border bg-notion-sidebar px-2 py-3',
        'relative z-10'
      )}
    >
      {APPS.map((app) => {
        const isActive = activeApp === app.id
        return (
          <button
            key={app.id}
            type="button"
            title={app.label}
            aria-label={app.label}
            onClick={() => handleAppClick(app.id)}
            className={cn(
              'group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all',
              isActive
                ? 'bg-notion-sidebar-hover text-notion-text'
                : 'text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary'
            )}
          >
            {isActive && (
              <span className="absolute -left-2 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-notion-accent" />
            )}
            <app.icon className="h-[19px] w-[19px] shrink-0" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
