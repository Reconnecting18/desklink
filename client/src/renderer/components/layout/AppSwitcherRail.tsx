import { Home, Inbox, FileText, PenTool, FolderOpen } from 'lucide-react'
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
  { id: 'whiteboard', label: 'Draw', icon: PenTool }
]

export function AppSwitcherRail() {
  const { activeApp, openOrFocusApp } = useUIStore()

  const handleAppClick = (appId: AppId) => {
    openOrFocusApp(appId)
  }

  return (
    <div
      className={cn(
        'flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-notion-border bg-notion-sidebar py-2',
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
            aria-label={app.label}
            onClick={() => handleAppClick(app.id)}
            className={cn(
              'group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all',
              isActive
                ? 'bg-notion-sidebar-hover text-notion-text'
                : 'text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary'
            )}
          >
            {isActive && (
              <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-notion-accent" />
            )}
            <app.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
