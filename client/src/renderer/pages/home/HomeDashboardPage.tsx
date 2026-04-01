import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react'
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

// TODO: wire to /workspaces/:workspaceId/projects/:projectId/events filtered to today

function greetingForHour(h: number): string {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeDashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { recentVisits, openOrFocusApp } = useUIStore()
  const [todos, setTodos] = useState<HomeTodo[]>(loadTodos)
  const [newTodo, setNewTodo] = useState('')
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])

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

          {/* Schedule */}
          <section className="rounded-xl bg-notion-sidebar/50 p-5 md:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
              <Calendar className="h-3.5 w-3.5" />
              Today on the calendar
            </h2>
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <Calendar className="h-7 w-7 text-notion-text-tertiary" />
              <p className="text-sm text-notion-text-secondary">No events today</p>
              <p className="text-xs text-notion-text-tertiary">
                Open Planner to add calendar events to your projects
              </p>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
