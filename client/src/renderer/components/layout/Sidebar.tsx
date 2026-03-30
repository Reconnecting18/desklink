import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, ChevronDown, Search, Home } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { listWorkspaces, type Workspace } from '@/api/workspaces'

export function Sidebar() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { setActiveWorkspaceId } = useUIStore()
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

  return (
    <div className="flex h-full w-full flex-col px-3">
      <div className="relative flex items-center gap-2 pb-4 pt-5">
        <button
          type="button"
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-notion-sidebar-hover"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-notion-text text-xs font-semibold text-notion-bg">
            {currentWorkspace?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium leading-snug text-notion-text">
            {currentWorkspace?.name || 'My desk'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-notion-text-secondary" />
        </button>

        {workspaceMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-md border border-notion-border/50 bg-notion-bg py-2 shadow-lg shadow-black/10">
            {workspaces.map((ws: Workspace) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleWorkspaceSwitch(ws)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-notion-sidebar-hover',
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

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pb-8 pt-3">
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-sm text-notion-text-secondary opacity-90"
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
              'flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm transition-colors',
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
              'flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm transition-colors',
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
