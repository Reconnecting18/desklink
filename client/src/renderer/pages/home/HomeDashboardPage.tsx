import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import {
  listWorkspaceEventsInRange,
  localDateKey,
  localDayRangeIsoStrings
} from '@/api/workspaceEvents'

const TAGLINES = [
  'Clear a little space on your desk today.',
  'Small steps finish big projects.',
  'Your workspace, one glance away.'
]

const TODOS_STORAGE = 'desklink-home-todos'

interface HomeTodo {
  id: string
  text: string
  done: boolean
}

function loadTodos(): HomeTodo[] {
  try {
    const raw = localStorage.getItem(TODOS_STORAGE)
    if (!raw) return []
    return JSON.parse(raw) as HomeTodo[]
  } catch {
    return []
  }
}

function saveTodos(todos: HomeTodo[]) {
  localStorage.setItem(TODOS_STORAGE, JSON.stringify(todos))
}

function formatEventTime(ev: { startTime: string; endTime: string; allDay: boolean }): string {
  if (ev.allDay) return 'All day'
  const s = new Date(ev.startTime)
  const e = new Date(ev.endTime)
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
  return `${s.toLocaleTimeString(undefined, opts)} – ${e.toLocaleTimeString(undefined, opts)}`
}

function greetingForHour(h: number): string {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeDashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const { recentVisits, openOrFocusApp } = useUIStore()
  const [todos, setTodos] = useState<HomeTodo[]>(loadTodos)
  const [newTodo, setNewTodo] = useState('')
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])

  const todayKey = useMemo(() => localDateKey(), [])
  const { startDate, endDate } = useMemo(() => localDayRangeIsoStrings(), [])

  const eventsQuery = useQuery({
    queryKey: ['workspace-events-today', workspaceId, todayKey],
    queryFn: () => listWorkspaceEventsInRange(workspaceId!, startDate, endDate),
    enabled: !!workspaceId && !!accessToken,
    staleTime: 60_000
  })

  const hour = new Date().getHours()
  const greeting = greetingForHour(hour)
  const name = user?.displayName?.split(/\s+/)[0]

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = () => {
    const t = newTodo.trim()
    if (!t) return
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: t, done: false }])
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  }

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((x) => x.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6 sm:py-8 md:px-8">
      {/* Greeting */}
      <header className="mb-10 mt-1">
        <div className="flex items-start gap-3 justify-center text-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-notion-sidebar">
            <Sparkles className="h-5 w-5 text-notion-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-notion-text md:text-3xl">
              {greeting}
              {name ? `, ${name}` : ''}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-notion-text-secondary">{tagline}</p>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col gap-6">
        {/* Recently visited */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
            <Clock className="h-3.5 w-3.5" />
            Recently Viewed
          </h2>
          {recentVisits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-notion-border/50 bg-notion-sidebar/30 px-5 py-8 text-center text-sm text-notion-text-secondary">
              As you open Inbox, Files, and Planner, shortcuts will appear here.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentVisits.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    openOrFocusApp(v.appId)
                    navigate(v.href)
                  }}
                  className="group flex min-h-[5rem] min-w-[9rem] max-w-[10rem] flex-col gap-2 rounded-xl bg-notion-sidebar/60 p-[5px] text-left transition-all hover:bg-notion-sidebar-hover justify-start items-start"
                >
                  <span className="line-clamp-2 min-h-0 text-sm font-medium leading-snug text-notion-text group-hover:text-notion-accent">
                    {v.title}
                  </span>
                  <span className="mt-auto shrink-0 text-[11px] text-notion-text-tertiary">
                    {new Date(v.visitedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-7 md:grid-cols-2 md:gap-8">
          {/* Todos */}
          <section className="rounded-xl bg-notion-sidebar/50 p-5 md:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
              <CheckSquare className="h-3.5 w-3.5" />
              On your desk today
            </h2>
            <div className="space-y-1">
              {todos.length === 0 && (
                <p className="py-2 text-sm text-notion-text-secondary">No tasks yet — add one below.</p>
              )}
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-notion-sidebar-hover/60"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(t.id)}
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      t.done
                        ? 'border-notion-accent bg-notion-accent text-white'
                        : 'border-notion-border bg-transparent'
                    )}
                    aria-label={t.done ? 'Mark incomplete' : 'Mark done'}
                  >
                    {t.done && <span className="text-[10px] leading-none">✓</span>}
                  </button>
                  <span
                    className={cn(
                      'min-w-0 flex-1 text-sm leading-relaxed',
                      t.done ? 'text-notion-text-tertiary line-through' : 'text-notion-text'
                    )}
                  >
                    {t.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTodo(t.id)}
                    className="shrink-0 rounded p-2 text-xs text-notion-text-tertiary hover:text-notion-red"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-notion-border/40 px-3 py-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a task…"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-notion-text placeholder:text-notion-text-tertiary focus:outline-none"
              />
              <Button type="button" size="sm" variant="ghost" onClick={addTodo} className="shrink-0 text-xs">
                Add
              </Button>
            </div>
          </section>

          {/* Schedule — real planner events for this workspace (local day) */}
          <section className="rounded-xl bg-notion-sidebar/50 p-5 md:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
              <Calendar className="h-3.5 w-3.5" />
              Today on the calendar
            </h2>
            {eventsQuery.isLoading && (
              <div className="space-y-3 py-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-notion-border/30" />
                ))}
              </div>
            )}
            {eventsQuery.isError && (
              <div className="py-4 text-center">
                <p className="text-sm text-notion-red">Could not load today&apos;s events</p>
                <p className="mt-1 text-xs text-notion-text-tertiary">
                  {(eventsQuery.error as Error)?.message ?? 'Unknown error'}
                </p>
              </div>
            )}
            {eventsQuery.isSuccess && eventsQuery.data.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <Calendar className="h-7 w-7 text-notion-text-tertiary" />
                <p className="text-sm text-notion-text-secondary">No events today</p>
                <p className="text-xs text-notion-text-tertiary">
                  Open Planner to add calendar events to your projects
                </p>
              </div>
            )}
            {eventsQuery.isSuccess && eventsQuery.data.length > 0 && (
              <ul className="space-y-3">
                {eventsQuery.data.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex gap-3 border-b border-notion-border/40 pb-3 last:border-0 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (workspaceId) {
                          navigate(`/w/${workspaceId}/projects/${ev.projectId}`)
                        }
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-notion-text hover:text-notion-accent">
                        {ev.title}
                      </p>
                      <p className="mt-0.5 text-xs text-notion-text-tertiary">{ev.projectName}</p>
                      <p className="mt-1 text-xs text-notion-text-secondary">
                        {formatEventTime(ev)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      </div>
    </div>
  )
}
