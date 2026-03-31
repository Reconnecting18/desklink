import { useState } from 'react'
import { PenTool, Layers, Plus, MoreHorizontal, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

type WhiteboardTab = 'whiteboards' | 'mockups'

interface BoardItem {
  id: string
  name: string
  updatedAt: string
  collaborators: number
  thumbnail: string
}

const MOCK_WHITEBOARDS: BoardItem[] = [
  { id: 'wb1', name: 'Q2 Planning Session', updatedAt: '2 hours ago', collaborators: 3, thumbnail: '#2383E2' },
  { id: 'wb2', name: 'System Architecture Diagram', updatedAt: 'Yesterday', collaborators: 2, thumbnail: '#9065B0' },
  { id: 'wb3', name: 'User Flow Brainstorm', updatedAt: '3 days ago', collaborators: 5, thumbnail: '#33B679' }
]

const MOCK_MOCKUPS: BoardItem[] = [
  { id: 'mk1', name: 'Dashboard Redesign', updatedAt: '1 hour ago', collaborators: 2, thumbnail: '#FA8C16' },
  { id: 'mk2', name: 'Mobile Onboarding', updatedAt: '2 days ago', collaborators: 4, thumbnail: '#E255A1' },
  { id: 'mk3', name: 'Settings Page v2', updatedAt: 'Last week', collaborators: 1, thumbnail: '#EB5757' }
]

function BoardCard({ item }: { item: BoardItem }) {
  return (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-notion-border bg-notion-bg transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div
        className="flex h-36 items-center justify-center"
        style={{ backgroundColor: item.thumbnail + '18' }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl opacity-30"
          style={{ backgroundColor: item.thumbnail }}
        />
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-snug text-notion-text">{item.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-notion-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {item.updatedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {item.collaborators}
            </span>
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

export function WhiteboardApp() {
  const [activeTab, setActiveTab] = useState<WhiteboardTab>('whiteboards')

  const items = activeTab === 'whiteboards' ? MOCK_WHITEBOARDS : MOCK_MOCKUPS
  const Icon = activeTab === 'whiteboards' ? PenTool : Layers
  const label = activeTab === 'whiteboards' ? 'Whiteboard' : 'Mockup'

  return (
    <div className="flex h-full flex-col overflow-hidden bg-notion-bg">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-notion-border px-[15px] py-[5px]">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-notion-text-secondary" />
          <h1 className="text-xl font-semibold tracking-tight text-notion-text">
            {activeTab === 'whiteboards' ? 'Whiteboards' : 'Mockups'}
          </h1>
        </div>
        <Button size="sm" type="button" className="p-[5px]">
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
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
            <Icon className="h-12 w-12 text-notion-text-tertiary" />
            <div>
              <p className="text-sm font-medium text-notion-text-secondary">No {label.toLowerCase()}s yet</p>
              <p className="mt-2 text-sm text-notion-text-tertiary">Create your first {label.toLowerCase()} to get started</p>
            </div>
            <Button size="sm" type="button" className="mt-2">
              <Plus className="h-3.5 w-3.5" />
              New {label}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <BoardCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
