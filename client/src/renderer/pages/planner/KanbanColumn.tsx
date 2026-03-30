import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BoardColumn, Task } from '@/api/boards'
import { createTask } from '@/api/boards'
import { TaskCard } from './TaskCard'

const COLUMN_ACCENTS = [
  'bg-notion-purple',
  'bg-notion-yellow',
  'bg-notion-blue',
  'bg-notion-green'
] as const

interface KanbanColumnProps {
  column: BoardColumn
  columnIndex: number
  projectId: string
  boardId: string
  onTaskClick: (taskId: string) => void
}

export function KanbanColumn({
  column,
  columnIndex,
  projectId,
  boardId,
  onTaskClick
}: KanbanColumnProps) {
  const queryClient = useQueryClient()
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const createMutation = useMutation({
    mutationFn: () =>
      createTask(projectId, { title: newTitle, columnId: column.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setShowNewTask(false)
      setNewTitle('')
    }
  })

  const tasks = column.tasks || []

  const accent = COLUMN_ACCENTS[columnIndex % COLUMN_ACCENTS.length]

  return (
    <div className="flex w-[272px] shrink-0 flex-col">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', accent)} aria-hidden />
          <span className="truncate text-sm font-semibold text-notion-text">{column.name}</span>
          <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-notion-sidebar px-1.5 text-[11px] font-medium tabular-nums text-notion-text-secondary">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-1 flex-col gap-3 rounded-xl border border-transparent bg-notion-sidebar/40 p-3 transition-colors',
          isOver && 'border-notion-accent/25 bg-notion-accent/5'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>

        {/* New task inline form */}
        {showNewTask && (
          <div className="rounded-lg border border-notion-border bg-notion-bg p-4 shadow-sm">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTitle.trim()) createMutation.mutate()
                if (e.key === 'Escape') {
                  setShowNewTask(false)
                  setNewTitle('')
                }
              }}
              className="w-full text-sm focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
