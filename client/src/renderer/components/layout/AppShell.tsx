import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Titlebar } from './Titlebar'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { listWorkspaces } from '@/api/workspaces'
import { getMe } from '@/api/auth'

export function AppShell() {
  const navigate = useNavigate()
  const { activeWorkspaceId, setActiveWorkspaceId } = useUIStore()
  const { setUser, setAuth, accessToken, isLoading, setLoading } = useAuthStore()

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

  return (
    <div className="flex h-screen flex-col">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-notion-bg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
