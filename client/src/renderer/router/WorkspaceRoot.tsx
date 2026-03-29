import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { listWorkspaces } from '@/api/workspaces'

/**
 * Protected `/` route: does not redirect to login. AppShell redirects to `/w/:id` when
 * workspaces load; this component handles loading/empty/error and redirects when the user
 * returns to `/` with an existing active workspace in memory.
 */
export function WorkspaceRoot() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const activeWorkspaceId = useUIStore((s) => s.activeWorkspaceId)

  const { data: workspaces, isPending, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces,
    enabled: !!accessToken
  })

  // User navigated back to `/` but already has a workspace selected (AppShell only auto-navigates when activeWorkspaceId is null).
  useEffect(() => {
    if (!workspaces?.length || !activeWorkspaceId) return
    if (!workspaces.some((w) => w.id === activeWorkspaceId)) return
    navigate(`/w/${activeWorkspaceId}`, { replace: true })
  }, [workspaces, activeWorkspaceId, navigate])

  if (!accessToken) {
    return null
  }

  if (isPending) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-notion-text-secondary">
        <p>Could not load workspaces.</p>
      </div>
    )
  }

  const ws = workspaces ?? []

  if (ws.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm text-notion-text">No workspaces yet</p>
        <p className="max-w-sm text-xs text-notion-text-secondary">
          Create a workspace from the API or run the database seed, then refresh.
        </p>
      </div>
    )
  }

  // Workspaces exist: AppShell redirects when !activeWorkspaceId; this branch covers timing before navigation.
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
    </div>
  )
}
