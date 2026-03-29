import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  FileText,
  PenTool,
  Layers,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  LogOut,
  Search,
  Home,
  Inbox,
  FolderOpen,
  SquarePen
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore, type AppId } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { listWorkspaces, type Workspace } from '@/api/workspaces'
import { listProjects, type Project } from '@/api/projects'

interface AppShortcut {
  id: AppId
  label: string
  icon: React.ElementType
  /** Only these appear in the sidebar (home uses Home link). */
  show: boolean
}

const APP_SHORTCUTS: AppShortcut[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, show: true },
  { id: 'documents', label: 'Documents', icon: FileText, show: true },
  { id: 'files', label: 'Files', icon: FolderOpen, show: true },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool, show: true }
]

export function Sidebar() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, setActiveWorkspaceId, openOrFocusApp, requestNewDocument } =
    useUIStore()
  const { user, logout } = useAuthStore()
  const [plannerOpen, setPlannerOpen] = useState(true)
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => listProjects(workspaceId!),
    enabled: !!workspaceId
  })

  const currentWorkspace = workspaces.find((w: Workspace) => w.id === workspaceId)

  const handleWorkspaceSwitch = (ws: Workspace) => {
    setActiveWorkspaceId(ws.id)
    navigate(`/w/${ws.id}`)
    setWorkspaceMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNewPage = () => {
    openOrFocusApp('documents')
    requestNewDocument()
  }

  if (!sidebarOpen) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-notion-border bg-notion-sidebar px-1 py-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded text-notion-text-secondary hover:bg-notion-sidebar-hover"
        >
          <ChevronsLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-[248px] shrink-0 flex-col border-r border-notion-border bg-notion-sidebar">
      <div className="relative flex items-center gap-1 px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-2 transition-colors hover:bg-notion-sidebar-hover"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-notion-text text-xs font-semibold text-notion-bg">
            {currentWorkspace?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-notion-text">
            {currentWorkspace?.name || 'My desk'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-notion-text-secondary" />
        </button>
        <button
          type="button"
          title="New page"
          onClick={handleNewPage}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
        >
          <SquarePen className="h-4 w-4" />
        </button>

        {workspaceMenuOpen && (
          <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-md border border-notion-border bg-notion-bg py-1 shadow-lg">
            {workspaces.map((ws: Workspace) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleWorkspaceSwitch(ws)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-notion-sidebar-hover',
                  ws.id === workspaceId && 'bg-notion-sidebar'
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-notion-text text-[10px] font-bold text-notion-bg">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            <div className="my-1 border-t border-notion-border" />
            <NavLink
              to={`/w/${workspaceId}/settings`}
              onClick={() => setWorkspaceMenuOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-sidebar-hover"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </NavLink>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 pb-3 pt-1">
        <button
          type="button"
          disabled
          className="mb-1 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-notion-text-secondary opacity-90"
          title="Coming soon"
        >
          <Search className="h-4 w-4 shrink-0 opacity-80" />
          <span>Search</span>
        </button>

        <NavLink
          to={`/w/${workspaceId}/projects`}
          end
          className={({ isActive }) =>
            cn(
              'mb-2 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
              isActive
                ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            )
          }
        >
          <Home className="h-4 w-4 shrink-0" />
          Home
        </NavLink>

        <p className="mb-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          Apps
        </p>
        <div className="mb-3 space-y-0.5">
          {APP_SHORTCUTS.filter((a) => a.show).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => openOrFocusApp(app.id)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
            >
              <app.icon className="h-4 w-4 shrink-0 opacity-90" />
              {app.label}
            </button>
          ))}
        </div>

        <p className="mb-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          Tasks
        </p>
        <div className="mb-1">
          <button
            type="button"
            onClick={() => setPlannerOpen(!plannerOpen)}
            className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-notion-text-secondary hover:bg-notion-sidebar-hover"
          >
            {plannerOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Projects
          </button>

          {plannerOpen && (
            <div className="ml-0.5 mt-1 space-y-0.5 border-l border-notion-border/80 pl-3">
              {projects.map((project: Project) => (
                <NavLink
                  key={project.id}
                  to={`/w/${workspaceId}/projects/${project.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                        : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
                    )
                  }
                >
                  <LayoutDashboard className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <p className="mb-1.5 mt-3 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          More
        </p>
        <div className="space-y-0.5">
          <div
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-notion-text-secondary opacity-75"
            title="Coming soon"
          >
            <Layers className="h-4 w-4 shrink-0" />
            Mockups
          </div>
          <div
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-notion-text-secondary opacity-75"
            title="Coming soon"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            AI assistant
          </div>
        </div>
      </nav>

      <div className="border-t border-notion-border px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-0.5">
            {user && <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />}
            <span className="truncate text-xs leading-snug text-notion-text-secondary">{user?.displayName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-md text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-md text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
