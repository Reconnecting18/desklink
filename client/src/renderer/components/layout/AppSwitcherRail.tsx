import { Home, Inbox, PenTool, FolderOpen } from 'lucide-react'
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
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
  { id: 'files', label: 'Files', icon: FolderOpen }
]

export function AppSwitcherRail() {
  const { activeApp, setActiveApp, pages, addPage, setActivePage } = useUIStore()

  const handleAppClick = (appId: AppId) => {
    // If there's already a tab open for this app, switch to it
    const existingPage = pages.find((p) => p.appId === appId)
    if (existingPage) {
      setActivePage(existingPage.id)
    } else {
      // Open a new tab for this app
      addPage({ appId })
    }
    setActiveApp(appId)
  }

  return (
    <div
      className={cn(
        'flex w-12 shrink-0 flex-col items-center gap-1 border-r border-notion-border bg-notion-sidebar py-2',
        'relative z-10' // sit above main content, below dropdowns
      )}
    >
      {APPS.map((app) => {
        const isActive = activeApp === app.id
        return (
          <button
            key={app.id}
            type="button"
            title={app.label}
            onClick={() => handleAppClick(app.id)}
            className={cn(
              'group relative flex h-9 w-9 flex-col items-center justify-center rounded-lg transition-all',
              isActive
                ? 'bg-notion-sidebar-hover text-notion-text'
                : 'text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary'
            )}
          >
            {/* Active indicator — left accent bar */}
            {isActive && (
              <span className="absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-notion-accent" />
            )}
            <app.icon className="h-4 w-4 shrink-0" />
            <span
              className={cn(
                'mt-0.5 text-[9px] font-medium leading-none tracking-wide',
                isActive ? 'text-notion-text' : 'text-notion-text-tertiary'
              )}
            >
              {app.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
