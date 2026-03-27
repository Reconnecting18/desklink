import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getWorkspace, updateWorkspace } from '@/api/workspaces'

export function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [initialized, setInitialized] = useState(false)

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId
  })

  if (workspace && !initialized) {
    setName(workspace.name)
    setDescription(workspace.description || '')
    setInitialized(true)
  }

  const updateMutation = useMutation({
    mutationFn: () => updateWorkspace(workspaceId!, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    }
  })

  return (
    <div className="mx-auto max-w-2xl px-12 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Settings className="h-5 w-5 text-notion-text-secondary" />
        <h1 className="text-lg font-semibold text-notion-text">Workspace Settings</h1>
      </div>

      <div className="flex flex-col gap-6">
        <Input
          id="ws-name"
          label="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ws-desc" className="text-xs font-medium text-notion-text-secondary">
            Description
          </label>
          <textarea
            id="ws-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-notion-border bg-white px-3 py-2 text-sm text-notion-text placeholder:text-notion-text-tertiary focus:outline-none focus:ring-2 focus:ring-notion-accent focus:border-transparent"
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
      </div>
    </div>
  )
}
