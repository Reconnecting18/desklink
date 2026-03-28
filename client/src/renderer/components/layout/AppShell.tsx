import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Titlebar } from './Titlebar'
import { Sidebar } from './Sidebar'
import { AppSwitcherRail } from './AppSwitcherRail'
import { PageTabBar } from './PageTabBar'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { listWorkspaces } from '@/api/workspaces'
import { getMe } from '@/api/auth'
import { InboxApp } from '@/pages/inbox/InboxApp'
import { WhiteboardApp } from '@/pages/whiteboard/WhiteboardApp'
import { FilesApp } from '@/pages/files/FilesApp'
import { DocumentApp } from '@/pages/documents/DocumentApp'

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeWorkspaceId, setActiveWorkspaceId, activeApp, setActiveApp } = useUIStore()
  const { setUser, accessToken } = useAuthStore()

  // Load user profile
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!accessToken,
    meta: {
      onSuccess: (data: any) => setUser(data)
    }
  })

  // Load workspaces and redirect to first if needed
  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces,
    enabled: !!accessToken
  })

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      const firstWorkspace = workspaces[0]
      setActiveWorkspaceId(firstWorkspace.id)
      navigate(`/w/${firstWorkspace.id}`, { replace: true })
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId, navigate])

  // Routes under the workspace (projects, settings, …) use the Home shell + sidebar.
  useEffect(() => {
    const path = location.pathname
    if (
      path.includes('/projects') ||
      path.includes('/settings') ||
      path.includes('/members')
    ) {
      setActiveApp('home')
    }
  }, [location.pathname, setActiveApp])

  return (
    // Root shell: full viewport, column layout, no overflow
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Window chrome */}
      <Titlebar />

      {/* Page tab bar — sits below titlebar, above content */}
      <PageTabBar />

      {/* Body row: app switcher rail + sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Narrow app-switcher icon rail */}
        <AppSwitcherRail />

        {/* Sidebar — only shown for the home/projects app */}
        {activeApp === 'home' && <Sidebar />}

        {/* Main content area — strictly contained, no overflow bleed */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {activeApp === 'home' && (
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Outlet />
            </div>
          )}
          {activeApp === 'inbox' && <InboxApp />}
          {activeApp === 'documents' && <DocumentApp />}
          {activeApp === 'whiteboard' && <WhiteboardApp />}
          {activeApp === 'files' && <FilesApp />}
        </main>
      </div>
    </div>
  )
}
