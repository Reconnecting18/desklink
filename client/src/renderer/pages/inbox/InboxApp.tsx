import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

// TODO: wire to /workspaces/:workspaceId/inbox once the inbox endpoint is implemented

type FilterTab = 'all' | 'unread' | 'mentions'

export function InboxApp() {
  const [filter, setFilter] = useState<FilterTab>('all')

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — message list */}
      <div className="flex w-80 min-w-[18rem] shrink-0 flex-col overflow-hidden border-r border-notion-border/50 bg-notion-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-notion-border/50 py-[3px] px-[5px]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-notion-text">Inbox</h2>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-notion-border/50 px-4 pb-0 pt-2">
          {(['all', 'unread', 'mentions'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={cn(
                'min-w-[4.5rem] shrink-0 rounded-t px-3 py-2.5 text-xs font-medium capitalize transition-colors',
                filter === tab
                  ? 'border-b-2 border-notion-accent text-notion-accent'
                  : 'mb-[2px] text-notion-text-secondary hover:text-notion-text'
              )}
            >
              {tab === 'all' ? 'All' : tab === 'unread' ? 'Unread' : 'Mentions'}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <CheckCheck className="h-8 w-8 text-notion-text-tertiary" />
          <p className="text-sm font-medium text-notion-text-secondary">You're all caught up</p>
          <p className="text-xs text-notion-text-tertiary">No messages yet</p>
        </div>
      </div>

      {/* Right panel — empty detail */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden bg-notion-bg text-center">
        <CheckCheck className="h-10 w-10 text-notion-text-tertiary" />
        <div>
          <p className="text-sm font-medium text-notion-text-secondary">You're all caught up</p>
          <p className="mt-1 text-xs text-notion-text-tertiary">
            You'll be notified here for @mentions, page activity, and more
          </p>
        </div>
      </div>
    </div>
  )
}
