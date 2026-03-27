import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  PenTool,
  Layers,
  FolderOpen,
  Sparkles,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  ChevronsLeft,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { listWorkspaces, type Workspace } from '@/api/workspaces'
import { listProjects, type Project } from '@/api/projects'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  disabled?: boolean
}

export function Sidebar() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, setActiveWorkspaceId } = useUIStore()
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

  const navItems: NavItem[] = [
    { label: 'Documents', icon: FileText, to: `/w/${workspaceId}/documents`, disabled: true },
    { label: 'Whiteboards', icon: PenTool, to: `/w/${workspaceId}/whiteboards`, disabled: true },
    { label: 'Mockups', icon: Layers, to: `/w/${workspaceId}/mockups`, disabled: true },
    { label: 'Files', icon: FolderOpen, to: `/w/${workspaceId}/files`, disabled: true },
    { label: 'AI Assistant', icon: Sparkles, to: `/w/${workspaceId}/ai`, disabled: true }
  ]

  return (
    <div className="flex w-60 shrink-0 flex-col border-r border-notion-border bg-notion-sidebar">
      {/* Workspace switcher */}
      <div className="relative px-2 pt-2 pb-1">
        <button
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-notion-sidebar-hover transition-colors"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-notion-accent text-[10px] font-bold text-white">
            {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <span className="flex-1 truncate text-left text-sm font-medium text-notion-text">
            {currentWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-notion-text-secondary" />
        </button>

        {workspaceMenuOpen && (
          <div className="absolute left-2 right-2 top-full z-50 mt-1 rounded-md border border-notion-border bg-white py-1 shadow-lg">
            {workspaces.map((ws: Workspace) => (
              <button
                key={ws.id}
                onClick={() => handleWorkspaceSwitch(ws)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-notion-sidebar-hover',
                  ws.id === workspaceId && 'bg-notion-sidebar'
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-notion-accent text-[10px] font-bold text-white">
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
            <NavLink
              to={`/w/${workspaceId}/members`}
              onClick={() => setWorkspaceMenuOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-sidebar-hover"
            >
              <Users className="h-3.5 w-3.5" />
              Members
            </NavLink>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {/* Planner section */}
        <div className="mb-1">
          <button
            onClick={() => setPlannerOpen(!plannerOpen)}
            className="flex w-full items-center gap-1 rounded px-2 py-1 text-xs font-medium text-notion-text-secondary hover:bg-notion-sidebar-hover"
          >
            {plannerOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Planner
          </button>

          {plannerOpen && (
            <div className="ml-1 mt-0.5">
              <NavLink
                to={`/w/${workspaceId}/projects`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors',
                    isActive
                      ? 'bg-notion-sidebar-hover text-notion-text font-medium'
                      : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
                  )
                }
              >
                <FolderKanban className="h-4 w-4" />
                All Projects
              </NavLink>

              {projects.map((project: Project) => (
                <NavLink
                  key={project.id}
                  to={`/w/${workspaceId}/projects/${project.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors',
                      isActive
                        ? 'bg-notion-sidebar-hover text-notion-text font-medium'
                        : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
                    )
                  }
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Other sections (disabled for now) */}
        <div className="mt-2 border-t border-notion-border pt-2">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1 text-sm',
                'text-notion-text-tertiary cursor-not-allowed opacity-50'
              )}
              title="Coming soon"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom: user + collapse */}
      <div className="border-t border-notion-border px-2 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-1">
            {user && <Avatar name={user.name} src={user.avatarUrl} size="sm" />}
            <span className="truncate text-xs text-notion-text-secondary">{user?.name}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleLogout}
              className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button
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
