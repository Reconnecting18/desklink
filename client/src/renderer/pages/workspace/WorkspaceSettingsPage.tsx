import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getWorkspace, updateWorkspace } from '@/api/workspaces'
import { useAuthStore } from '@/stores/authStore'

export function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId
  })

  useEffect(() => {
    if (!workspace) return
    setName(workspace.name)
    setDescription(workspace.description || '')
  }, [workspace])

  const updateMutation = useMutation({
    mutationFn: () => updateWorkspace(workspaceId!, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    }
  })

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-10 py-12 md:px-14">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-notion-sidebar">
          <Settings className="h-5 w-5 text-notion-text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-notion-text">Workspace settings</h1>
          <p className="mt-1 text-sm text-notion-text-secondary">Manage this workspace and your account.</p>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-6">
          <h2 className="text-sm font-semibold text-notion-text">Workspace</h2>
          <Input
            id="ws-name"
            label="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="ws-desc" className="text-xs font-medium text-notion-text-secondary">
              Description
            </label>
            <textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-notion-border bg-white px-4 py-3 text-sm leading-relaxed text-notion-text placeholder:text-notion-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-notion-accent"
              placeholder="What is this workspace for?"
            />
          </div>
          <div>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </section>

        <div className="border-t border-notion-border pt-10">
          <section className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-notion-text">Account</h2>
            <p className="text-sm leading-relaxed text-notion-text-secondary">
              Signed in as{' '}
              <span className="font-medium text-notion-text">{user?.displayName ?? '—'}</span>
              {user?.email ? (
                <>
                  {' '}
                  <span className="text-notion-text-tertiary">({user.email})</span>
                </>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
              <button
                type="button"
                className="text-sm font-medium text-notion-accent hover:underline"
                onClick={handleSignOut}
              >
                Switch account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
