import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { listMembers, addMember, removeMember, type WorkspaceMember } from '@/api/workspaces'

export function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [inviteError, setInviteError] = useState('')

  const { data: members = [] } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => listMembers(workspaceId!),
    enabled: !!workspaceId
  })

  const addMutation = useMutation({
    mutationFn: () => addMember(workspaceId!, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
      setEmail('')
      setInviteError('')
    },
    onError: (err: any) => setInviteError(err.message)
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    }
  })

  return (
    <div className="mx-auto max-w-2xl px-12 py-10">
      <div className="mb-2 flex items-center gap-3">
        <Users className="h-5 w-5 text-notion-text-secondary" />
        <h1 className="text-lg font-semibold text-notion-text">Workspace access</h1>
      </div>
      <p className="mb-8 text-sm text-notion-text-secondary">
        Optional: invite others only if you use shared workspaces. Solo use works without inviting anyone.
      </p>

      {/* Invite form */}
      <div className="mb-8 flex gap-2">
        <div className="flex-1">
          <Input
            id="invite-email"
            placeholder="Invite by email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={inviteError}
          />
        </div>
        <Button
          onClick={() => addMutation.mutate()}
          disabled={!email || addMutation.isPending}
          className="self-start"
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Invite
        </Button>
      </div>

      {/* Members list */}
      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Just you for now"
          description="Add someone later if this workspace ever needs to be shared."
        />
      ) : (
        <div className="divide-y divide-notion-border rounded-lg border border-notion-border">
          {members.map((member: WorkspaceMember) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={member.user.displayName} src={member.user.avatarUrl} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-notion-text truncate">
                  {member.user.displayName}
                </p>
                <p className="text-xs text-notion-text-secondary truncate">
                  {member.user.email}
                </p>
              </div>
              <Badge>{member.role}</Badge>
              {member.role !== 'ADMIN' && (
                <button
                  onClick={() => removeMutation.mutate(member.userId)}
                  className="flex h-7 w-7 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-red"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
