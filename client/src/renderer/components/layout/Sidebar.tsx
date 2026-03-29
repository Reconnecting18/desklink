import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, ChevronDown, Search, Home, SquarePen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { listWorkspaces, type Workspace } from '@/api/workspaces'

export function Sidebar() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { setActiveWorkspaceId, openOrFocusApp, requestNewDocument } = useUIStore()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces
  })

  const currentWorkspace = workspaces.find((w: Workspace) => w.id === workspaceId)

  const handleWorkspaceSwitch = (ws: Workspace) => {
    setActiveWorkspaceId(ws.id)
    navigate(`/w/${ws.id}`)
    setWorkspaceMenuOpen(false)
  }

  const handleNewPage = () => {
    openOrFocusApp('documents')
    requestNewDocument()
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex items-center gap-2 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-notion-sidebar-hover"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-notion-text text-xs font-semibold text-notion-bg">
            {currentWorkspace?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium leading-snug text-notion-text">
            {currentWorkspace?.name || 'My desk'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-notion-text-secondary" />
        </button>
        <button
          type="button"
          title="New page"
          onClick={handleNewPage}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
        >
          <SquarePen className="h-4 w-4" />
        </button>

        {workspaceMenuOpen && (
          <div className="absolute left-4 right-4 top-full z-50 mt-2 rounded-lg border border-notion-border bg-notion-bg py-2 shadow-lg">
            {workspaces.map((ws: Workspace) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleWorkspaceSwitch(ws)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-notion-sidebar-hover',
                  ws.id === workspaceId && 'bg-notion-sidebar'
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-notion-text text-[10px] font-bold text-notion-bg">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-6 pt-2">
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-notion-text-secondary opacity-90"
          title="Coming soon"
        >
          <Search className="h-4 w-4 shrink-0 opacity-80" />
          <span>Search</span>
        </button>

        <NavLink
          to={`/w/${workspaceId}`}
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            )
          }
        >
          <Home className="h-4 w-4 shrink-0" />
          Home
        </NavLink>

        <NavLink
          to={`/w/${workspaceId}/projects`}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            )
          }
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" />
          Planner
        </NavLink>
      </nav>
    </div>
  )
}
