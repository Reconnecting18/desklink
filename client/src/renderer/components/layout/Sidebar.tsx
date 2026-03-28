import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  PenTool,
  Layers,
  FolderOpen,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  LogOut,
  Search,
  Home,
  Inbox,
  Plus,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { listWorkspaces, type Workspace } from '@/api/workspaces'
import { listProjects, type Project } from '@/api/projects'

export function Sidebar() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, setActiveWorkspaceId, setActiveApp, addPage, pages, setActivePage } = useUIStore()
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

  /** Switch to an app via the sidebar nav item */
  const handleAppSwitch = (appId: 'inbox' | 'whiteboard' | 'files', path: string) => {
    const existing = pages.find((p) => p.appId === appId)
    if (existing) {
      setActivePage(existing.id)
    } else {
      addPage({ appId, path })
    }
    setActiveApp(appId)
    navigate(path)
  }

  if (!sidebarOpen) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-notion-border bg-notion-sidebar py-2">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded text-notion-text-secondary hover:bg-notion-sidebar-hover"
        >
          <ChevronsLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex w-[248px] shrink-0 flex-col border-r border-notion-border bg-notion-sidebar overflow-hidden">
      {/* Space switcher */}
      <div className="relative px-2 pt-2 pb-1">
        <button
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-notion-sidebar-hover"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-notion-text text-xs font-semibold text-notion-bg">
            {currentWorkspace?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-notion-text">
            {currentWorkspace?.name || 'My desk'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-notion-text-secondary" />
        </button>

        {workspaceMenuOpen && (
          <div className="absolute left-2 right-2 top-full z-50 mt-1 rounded-md border border-notion-border bg-notion-bg py-1 shadow-lg">
            {workspaces.map((ws: Workspace) => (
              <button
                key={ws.id}
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

      <nav className="flex flex-1 flex-col overflow-y-auto px-2 pb-2 pt-1">
        {/* Search (stub) */}
        <button
          type="button"
          disabled
          className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-notion-text-tertiary"
          title="Coming soon"
        >
          <Search className="h-4 w-4 shrink-0 opacity-70" />
          <span>Search</span>
        </button>

        {/* Home */}
        <NavLink
          to={`/w/${workspaceId}/projects`}
          end
          onClick={() => setActiveApp('home')}
          className={({ isActive }) =>
            cn(
              'mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            )
          }
        >
          <Home className="h-4 w-4 shrink-0" />
          Home
        </NavLink>

        {/* Inbox */}
        <button
          type="button"
          onClick={() => handleAppSwitch('inbox', `/w/${workspaceId}/inbox`)}
          className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover"
        >
          <Inbox className="h-4 w-4 shrink-0" />
          <span className="flex-1">Inbox</span>
          {/* Unread badge */}
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-notion-accent px-1 text-[10px] font-semibold text-white">
            3
          </span>
        </button>

        {/* Calendar */}
        <NavLink
          to={`/w/${workspaceId}/projects`}
          onClick={() => setActiveApp('home')}
          className={({ isActive }) =>
            cn(
              'mb-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            )
          }
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Calendar
        </NavLink>

        {/* Tasks section */}
        <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          Tasks
        </p>
        <div className="mb-1">
          <button
            type="button"
            onClick={() => setPlannerOpen(!plannerOpen)}
            className="flex w-full items-center gap-1 rounded px-2 py-1 text-xs font-medium text-notion-text-secondary hover:bg-notion-sidebar-hover"
          >
            {plannerOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Projects
          </button>

          {plannerOpen && (
            <div className="ml-0.5 mt-0.5 space-y-0.5 border-l border-notion-border/80 pl-2">
              {projects.map((project: Project) => (
                <NavLink
                  key={project.id}
                  to={`/w/${workspaceId}/projects/${project.id}`}
                  onClick={() => setActiveApp('home')}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors',
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

              {/* New project shortcut */}
              <NavLink
                to={`/w/${workspaceId}/projects`}
                onClick={() => setActiveApp('home')}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-notion-text-tertiary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>New project</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Library section */}
        <p className="mb-1 mt-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          Library
        </p>
        <div className="space-y-0.5">
          {/* Whiteboard — enabled */}
          <button
            type="button"
            onClick={() => handleAppSwitch('whiteboard', `/w/${workspaceId}/whiteboard`)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
          >
            <PenTool className="h-4 w-4 shrink-0" />
            Whiteboard
          </button>

          {/* Mockups — under Whiteboard app */}
          <button
            type="button"
            onClick={() => handleAppSwitch('whiteboard', `/w/${workspaceId}/whiteboard`)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
          >
            <Layers className="h-4 w-4 shrink-0" />
            Mockups
          </button>

          {/* Files — enabled */}
          <button
            type="button"
            onClick={() => handleAppSwitch('files', `/w/${workspaceId}/files`)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            Files
          </button>

          {/* AI assistant — coming soon */}
          <div
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-not-allowed text-notion-text-tertiary opacity-50"
            title="Coming soon"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            AI assistant
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-notion-border px-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            {user && (
              <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />
            )}
            <span className="truncate text-xs text-notion-text-secondary">{user?.displayName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
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
