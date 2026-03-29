import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, Calendar, CheckSquare, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'

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

const MOCK_SCHEDULE = [
  { id: '1', time: '9:00 AM', title: 'Team standup', place: 'Office' },
  { id: '2', time: '2:00 PM', title: 'Design review', place: 'Zoom' },
  { id: '3', time: '4:30 PM', title: 'Sprint planning', place: 'Conf room B' }
]

function greetingForHour(h: number): string {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeDashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const user = useAuthStore((s) => s.user)
  const recentVisits = useUIStore((s) => s.recentVisits)
  const [todos, setTodos] = useState<HomeTodo[]>(loadTodos)
  const [newTodo, setNewTodo] = useState('')
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])

  const hour = new Date().getHours()
  const greeting = greetingForHour(hour)
  const name = user?.displayName?.split(/\s+/)[0]

  const base = `/w/${workspaceId ?? ''}`

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const quickLinks = useMemo(
    () => [
      { title: 'Inbox', href: `${base}/inbox`, desc: 'Mentions and updates' },
      { title: 'Files', href: `${base}/files`, desc: 'Browse and upload' },
      { title: 'Planner', href: `${base}/projects`, desc: 'Boards and tasks' },
      { title: 'Whiteboard', href: `${base}/whiteboard`, desc: 'Sketch and plan' }
    ],
    [base]
  )

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
    <div className="mx-auto max-w-4xl px-8 py-10 md:px-12 md:py-12">
      {/* Greeting */}
      <header className="mb-10">
        <div className="flex items-start gap-3">
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

      <div className="space-y-10">
        {/* Recently visited */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
            <Clock className="h-3.5 w-3.5" />
            Pick up where you left off
          </h2>
          {recentVisits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-notion-border bg-notion-sidebar/40 px-5 py-8 text-center text-sm text-notion-text-secondary">
              As you open Inbox, Files, and Planner, shortcuts will appear here.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentVisits.map((v) => (
                <Link
                  key={v.id}
                  to={v.href}
                  className="group flex min-w-[10.5rem] max-w-[12rem] flex-col rounded-xl border border-notion-border bg-notion-bg p-4 shadow-sm transition-all hover:border-notion-text-tertiary/40 hover:shadow-md"
                >
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-notion-text group-hover:text-notion-accent">
                    {v.title}
                  </span>
                  <span className="mt-2 text-xs text-notion-text-tertiary">
                    {new Date(v.visitedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Todos */}
          <section className="rounded-xl border border-notion-border bg-notion-bg p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
              <CheckSquare className="h-3.5 w-3.5" />
              On your desk today
            </h2>
            <div className="space-y-2">
              {todos.length === 0 && (
                <p className="text-sm text-notion-text-secondary">No tasks yet — add one below.</p>
              )}
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:bg-notion-sidebar/60"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(t.id)}
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      t.done
                        ? 'border-notion-accent bg-notion-accent text-white'
                        : 'border-notion-border bg-notion-bg'
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
                    className="shrink-0 text-xs text-notion-text-tertiary hover:text-notion-red"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a task…"
                className="min-w-0 flex-1 rounded-lg border border-notion-border bg-notion-sidebar px-3 py-2 text-sm text-notion-text placeholder:text-notion-text-tertiary focus:border-notion-accent focus:outline-none"
              />
              <Button type="button" size="sm" onClick={addTodo}>
                Add
              </Button>
            </div>
          </section>

          {/* Schedule */}
          <section className="rounded-xl border border-notion-border bg-notion-bg p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
              <Calendar className="h-3.5 w-3.5" />
              Today on the calendar
            </h2>
            <ul className="space-y-4">
              {MOCK_SCHEDULE.map((ev) => (
                <li key={ev.id} className="flex gap-4 border-b border-notion-border/80 pb-4 last:border-0 last:pb-0">
                  <span className="w-16 shrink-0 text-xs font-medium tabular-nums text-notion-accent">
                    {ev.time}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-notion-text">{ev.title}</p>
                    <p className="mt-0.5 text-xs text-notion-text-tertiary">{ev.place}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-notion-text-tertiary">
              Connect your planner calendar later for live events.
            </p>
          </section>
        </div>

        {/* Quick open */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
            Jump in
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                to={q.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-notion-border bg-notion-sidebar/50 px-4 py-4 transition-colors hover:bg-notion-sidebar-hover"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-notion-text">{q.title}</p>
                  <p className="mt-0.5 text-xs text-notion-text-tertiary">{q.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-notion-text-tertiary" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
