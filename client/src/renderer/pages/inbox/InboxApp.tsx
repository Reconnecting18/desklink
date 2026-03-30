import { useState } from 'react'
import { CheckCheck, AtSign, Bell, MessageSquare, User, Circle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Message {
  id: string
  sender: string
  senderInitials: string
  senderColor: string
  subject: string
  preview: string
  timestamp: string
  unread: boolean
  type: 'mention' | 'comment' | 'notification' | 'message'
  body: string
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'Alex Chen',
    senderInitials: 'AC',
    senderColor: '#2383E2',
    subject: 'Mentioned you in "Q2 Roadmap"',
    preview: '@you Can you review the timeline section before EOD?',
    timestamp: '2m ago',
    unread: true,
    type: 'mention',
    body: 'Hey! I added you to the Q2 Roadmap document. Can you review the timeline section before EOD? I want to make sure the milestones are realistic given the current sprint capacity.\n\nSpecifically, I need your input on:\n- The release date for v2.1\n- Resource allocation for the design phase\n- Dependencies on the backend team'
  },
  {
    id: 'm2',
    sender: 'Jordan Lee',
    senderInitials: 'JL',
    senderColor: '#9065B0',
    subject: 'Comment on "Sprint Planning Board"',
    preview: 'Left a comment on task "Implement auth flow"',
    timestamp: '15m ago',
    unread: true,
    type: 'comment',
    body: 'I left a comment on the "Implement auth flow" task in the Sprint Planning Board.\n\nComment: "This looks good overall, but we should consider adding refresh token rotation for better security. I can pair with you on this if needed — just let me know your availability this week."'
  },
  {
    id: 'm3',
    sender: 'System',
    senderInitials: 'SY',
    senderColor: '#33B679',
    subject: 'Project "DeskLink v1.0" is due soon',
    preview: 'The project deadline is in 3 days. 4 tasks remaining.',
    timestamp: '1h ago',
    unread: true,
    type: 'notification',
    body: 'This is an automated reminder that the project "DeskLink v1.0" has a deadline in 3 days.\n\nCurrent status:\n- 4 tasks remaining\n- 2 tasks in progress\n- 1 task blocked\n\nPlease review the board and update task statuses to ensure the deadline is met.'
  },
  {
    id: 'm4',
    sender: 'Sam Rivera',
    senderInitials: 'SR',
    senderColor: '#FA8C16',
    subject: 'Shared "Design System v2" with you',
    preview: 'Sam shared a document with you',
    timestamp: '3h ago',
    unread: false,
    type: 'message',
    body: 'Hi! I\'ve shared the updated Design System v2 document with you. It includes all the new component specs, color tokens, and typography guidelines we discussed in last week\'s design review.\n\nFeel free to leave comments directly in the document. I\'ll be reviewing feedback on Friday.'
  },
  {
    id: 'm5',
    sender: 'Taylor Kim',
    senderInitials: 'TK',
    senderColor: '#E255A1',
    subject: 'Mentioned you in "Bug Tracker"',
    preview: '@you This bug is blocking the release, can you take a look?',
    timestamp: 'Yesterday',
    unread: false,
    type: 'mention',
    body: 'I\'ve tagged you on a critical bug in the Bug Tracker.\n\nBug: "Authentication fails on Safari 16.x"\nPriority: Urgent\nStatus: Open\n\nThis is blocking the v1.0 release. The issue seems to be related to the SameSite cookie attribute. Can you investigate and provide an ETA for the fix?'
  },
  {
    id: 'm6',
    sender: 'Morgan Davis',
    senderInitials: 'MD',
    senderColor: '#EB5757',
    subject: 'Comment on "API Documentation"',
    preview: 'Great work on the endpoints section!',
    timestamp: 'Yesterday',
    unread: false,
    type: 'comment',
    body: 'Just reviewed the API Documentation you updated. Great work on the endpoints section — the examples are really clear and the error codes table is exactly what the frontend team needed.\n\nOne small suggestion: could you add a section on rate limiting? Some of our enterprise clients have been asking about it.'
  }
]

type FilterTab = 'all' | 'unread' | 'mentions'

const TYPE_ICONS: Record<Message['type'], React.ElementType> = {
  mention: AtSign,
  comment: MessageSquare,
  notification: Bell,
  message: User
}

export function InboxApp() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [selectedId, setSelectedId] = useState<string | null>('m1')
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return m.unread
    if (filter === 'mentions') return m.type === 'mention'
    return true
  })

  const selected = messages.find((m) => m.id === selectedId) ?? null
  const unreadCount = messages.filter((m) => m.unread).length

  const markRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    )
  }

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })))
  }

  const handleSelect = (msg: Message) => {
    setSelectedId(msg.id)
    if (msg.unread) markRead(msg.id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — message list */}
      <div className="flex w-80 min-w-[18rem] shrink-0 flex-col overflow-hidden border-r border-notion-border/50 bg-notion-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-notion-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-notion-text">Inbox</h2>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-notion-accent px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              title="Mark all as read"
              className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-notion-text-secondary hover:bg-notion-sidebar-hover hover:text-notion-text transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>All read</span>
            </button>
          )}
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

        {/* Message list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <CheckCheck className="h-8 w-8 text-notion-text-tertiary" />
              <p className="text-sm font-medium text-notion-text-secondary">You're all caught up</p>
              <p className="text-xs text-notion-text-tertiary">No {filter === 'all' ? '' : filter} messages</p>
            </div>
          ) : (
            filtered.map((msg) => {
              const TypeIcon = TYPE_ICONS[msg.type]
              const isSelected = selectedId === msg.id
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSelect(msg)}
                  className={cn(
                    'w-full border-b border-notion-border/40 px-4 py-3 text-left transition-colors',
                    isSelected
                      ? 'bg-notion-sidebar-hover'
                      : 'hover:bg-notion-sidebar-hover/60'
                  )}
                >
                  <div className="flex items-start gap-3 pr-1">
                    {/* Avatar */}
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: msg.senderColor }}
                    >
                      {msg.senderInitials}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-3 pr-2">
                        <span className={cn('truncate text-sm font-medium leading-snug', msg.unread ? 'text-notion-text' : 'text-notion-text-secondary')}>
                          {msg.sender}
                        </span>
                        <span className="shrink-0 text-[11px] text-notion-text-tertiary">{msg.timestamp}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <TypeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-notion-text-tertiary" />
                        <p className={cn('line-clamp-2 text-xs leading-snug', msg.unread ? 'text-notion-text' : 'text-notion-text-tertiary')}>
                          {msg.subject}
                        </p>
                      </div>
                      <p className="line-clamp-2 pl-0.5 text-xs leading-relaxed text-notion-text-tertiary">
                        {msg.preview}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {msg.unread && (
                      <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-notion-accent text-notion-accent" />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel — message detail */}
      <div className="flex flex-1 flex-col overflow-hidden bg-notion-bg">
        {selected ? (
          <>
            {/* Detail header */}
            <div className="border-b border-notion-border p-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: selected.senderColor }}
                >
                  {selected.senderInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-notion-text">{selected.sender}</h3>
                    <span className="text-xs text-notion-text-tertiary">{selected.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-notion-text-secondary">{selected.subject}</p>
                </div>
              </div>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl border-l-2 border-notion-accent/20 py-1 pl-4">
                <div className="space-y-1 text-sm leading-[1.65] text-notion-text">
                  {selected.body.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('- ') ? 'pl-4' : undefined}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <CheckCheck className="h-10 w-10 text-notion-text-tertiary" />
            <div>
              <p className="text-sm font-medium text-notion-text-secondary">You're all caught up</p>
              <p className="mt-1 text-xs text-notion-text-tertiary">
                You'll be notified here for @mentions, page activity, and more
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
