import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { listEvents, createEvent, listTasks } from '@/api/boards'
import type { CalendarEvent, Task } from '@/api/boards'

interface CalendarViewProps {
  projectId: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarView({ projectId }: CalendarViewProps) {
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewEvent, setShowNewEvent] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  const { data: events = [] } = useQuery({
    queryKey: ['events', projectId, year, month],
    queryFn: () =>
      listEvents(projectId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => listTasks(projectId)
  })

  const createMutation = useMutation({
    mutationFn: (dateStr: string) => {
      const start = new Date(dateStr)
      start.setHours(9, 0, 0, 0)
      const end = new Date(dateStr)
      end.setHours(10, 0, 0, 0)
      return createEvent(projectId, {
        title: newTitle,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', projectId] })
      setShowNewEvent(null)
      setNewTitle('')
    }
  })

  // Build calendar grid
  const weeks = useMemo(() => {
    const result: Date[][] = []
    const current = new Date(startDate)
    while (current <= endDate) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      result.push(week)
    }
    return result
  }, [year, month])

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = events.filter((e: CalendarEvent) => e.startTime.startsWith(dateStr))
    const dayTasks = tasks.filter(
      (t: Task) => t.dueDate && t.dueDate.startsWith(dateStr)
    )
    return { events: dayEvents, tasks: dayTasks }
  }

  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <div className="flex h-full flex-col p-6">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-notion-text">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-notion-sidebar-hover"
          >
            <ChevronLeft className="h-4 w-4 text-notion-text-secondary" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-notion-sidebar-hover"
          >
            <ChevronRight className="h-4 w-4 text-notion-text-secondary" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-notion-border">
        {DAYS.map((day) => (
          <div key={day} className="px-2 py-1.5 text-center text-xs font-medium text-notion-text-secondary">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {weeks.flat().map((date, i) => {
          const items = getItemsForDate(date)
          const isCurrentMonth = date.getMonth() === month
          const dateStr = date.toISOString().split('T')[0]

          return (
            <div
              key={i}
              onClick={() => setShowNewEvent(dateStr)}
              className={cn(
                'border-b border-r border-notion-border p-1 min-h-[80px] cursor-pointer hover:bg-notion-sidebar-hover/30 transition-colors',
                !isCurrentMonth && 'bg-notion-sidebar/30'
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday(date)
                    ? 'bg-notion-accent text-white font-medium'
                    : isCurrentMonth
                      ? 'text-notion-text'
                      : 'text-notion-text-tertiary'
                )}
              >
                {date.getDate()}
              </span>

              <div className="mt-0.5 flex flex-col gap-0.5">
                {items.events.slice(0, 2).map((event: CalendarEvent) => (
                  <div
                    key={event.id}
                    className="truncate rounded bg-notion-accent/10 px-1 py-0.5 text-[10px] text-notion-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {event.title}
                  </div>
                ))}
                {items.tasks.slice(0, 2).map((task: Task) => (
                  <div
                    key={task.id}
                    className="truncate rounded bg-notion-orange/10 px-1 py-0.5 text-[10px] text-notion-orange"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.title}
                  </div>
                ))}
                {(items.events.length + items.tasks.length) > 2 && (
                  <span className="text-[10px] text-notion-text-tertiary px-1">
                    +{items.events.length + items.tasks.length - 2} more
                  </span>
                )}
              </div>

              {/* Inline new event form */}
              {showNewEvent === dateStr && (
                <div
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTitle.trim()) createMutation.mutate(dateStr)
                      if (e.key === 'Escape') { setShowNewEvent(null); setNewTitle('') }
                    }}
                    placeholder="Event title"
                    autoFocus
                    className="w-full rounded border border-notion-border px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-notion-accent"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
