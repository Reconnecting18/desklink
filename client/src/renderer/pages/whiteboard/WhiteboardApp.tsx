import { useState } from 'react'
import { PenTool, Layers, Plus, MoreHorizontal, Clock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { listWhiteboards, createWhiteboard, type Whiteboard } from '@/api/whiteboards'
import { listMockups, createMockup, type Mockup } from '@/api/mockups'

type WhiteboardTab = 'whiteboards' | 'mockups'

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function BoardCard({ title, updatedAt }: { title: string; updatedAt: string }) {
  return (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-notion-border bg-notion-bg transition-shadow hover:shadow-md">
      {/* Thumbnail placeholder */}
      <div className="flex h-36 items-center justify-center bg-notion-sidebar/40">
        <div className="h-16 w-16 rounded-xl bg-notion-border/40" />
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-snug text-notion-text">{title}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-notion-text-tertiary">
            <Clock className="h-3.5 w-3.5" />
            {formatRelative(updatedAt)}
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-notion-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-notion-sidebar-hover hover:text-notion-text-secondary"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function WhiteboardGrid({
  items,
  isLoading,
  error,
  label,
  Icon
}: {
  items: (Whiteboard | Mockup)[]
  isLoading: boolean
  error: Error | null
  label: string
  Icon: React.ElementType
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-xl border border-notion-border bg-notion-sidebar/40"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-28 text-center">
        <Icon className="h-12 w-12 text-notion-text-tertiary" />
        <p className="text-sm font-medium text-notion-red">Failed to load {label.toLowerCase()}s</p>
        <p className="text-xs text-notion-text-tertiary">{error.message}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
        <Icon className="h-12 w-12 text-notion-text-tertiary" />
        <div>
          <p className="text-sm font-medium text-notion-text-secondary">
            No {label.toLowerCase()}s yet
          </p>
          <p className="mt-2 text-sm text-notion-text-tertiary">
            Create your first {label.toLowerCase()} to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <BoardCard key={item.id} title={item.title} updatedAt={item.updatedAt} />
      ))}
    </div>
  )
}

export function WhiteboardApp() {
  const [activeTab, setActiveTab] = useState<WhiteboardTab>('whiteboards')
  const accessToken = useAuthStore((s) => s.accessToken)
  const activeWorkspaceId = useUIStore((s) => s.activeWorkspaceId)
  const queryClient = useQueryClient()

  const enabled = !!accessToken && !!activeWorkspaceId

  const whiteboardsQuery = useQuery({
    queryKey: ['whiteboards', activeWorkspaceId],
    queryFn: () => listWhiteboards(activeWorkspaceId!),
    enabled
  })

  const mockupsQuery = useQuery({
    queryKey: ['mockups', activeWorkspaceId],
    queryFn: () => listMockups(activeWorkspaceId!),
    enabled
  })

  const createWhiteboardMutation = useMutation({
    mutationFn: () => createWhiteboard(activeWorkspaceId!, { title: 'Untitled Whiteboard' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whiteboards', activeWorkspaceId] })
  })

  const createMockupMutation = useMutation({
    mutationFn: () => createMockup(activeWorkspaceId!, { title: 'Untitled Mockup' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mockups', activeWorkspaceId] })
  })

  const isWhiteboards = activeTab === 'whiteboards'
  const Icon = isWhiteboards ? PenTool : Layers
  const label = isWhiteboards ? 'Whiteboard' : 'Mockup'
  const activeQuery = isWhiteboards ? whiteboardsQuery : mockupsQuery
  const items = (activeQuery.data ?? []) as (Whiteboard | Mockup)[]

  const handleNew = () => {
    if (!activeWorkspaceId) return
    if (isWhiteboards) {
      createWhiteboardMutation.mutate()
    } else {
      createMockupMutation.mutate()
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-notion-bg">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-notion-border px-[15px] py-[5px]">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-notion-text-secondary" />
          <h1 className="text-xl font-semibold tracking-tight text-notion-text">
            {isWhiteboards ? 'Whiteboards' : 'Mockups'}
          </h1>
        </div>
        <Button
          size="sm"
          type="button"
          className="p-[5px]"
          onClick={handleNew}
          disabled={!activeWorkspaceId}
        >
          <Plus className="h-3.5 w-3.5" />
          New {label}
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 gap-2 border-b border-notion-border p-[5px]">
        {(['whiteboards', 'mockups'] as WhiteboardTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex items-center gap-1.5 rounded-md p-[5px] text-sm font-medium capitalize transition-colors',
              activeTab === tab
                ? 'border-b-2 border-notion-accent text-notion-accent'
                : 'mb-[2px] text-notion-text-secondary hover:text-notion-text'
            )}
          >
            {tab === 'whiteboards' ? (
              <PenTool className="h-4 w-4 shrink-0" />
            ) : (
              <Layers className="h-4 w-4 shrink-0" />
            )}
            <span className="pt-px">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-[5px]">
        <WhiteboardGrid
          items={items}
          isLoading={activeQuery.isLoading}
          error={activeQuery.error}
          label={label}
          Icon={Icon}
        />
      </div>
    </div>
  )
}
