import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { BoardColumn, Task } from '@/api/boards'
import { createTask } from '@/api/boards'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  column: BoardColumn
  projectId: string
  boardId: string
  onTaskClick: (taskId: string) => void
}

export function KanbanColumn({ column, projectId, boardId, onTaskClick }: KanbanColumnProps) {
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

  return (
    <div className="flex w-64 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-notion-text-secondary">
            {column.name}
          </span>
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-notion-sidebar px-1 text-[10px] text-notion-text-tertiary">
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
        className={`flex flex-1 flex-col gap-1.5 rounded-lg p-1 transition-colors ${
          isOver ? 'bg-notion-accent/5' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>

        {/* New task inline form */}
        {showNewTask && (
          <div className="rounded-lg border border-notion-border bg-white p-2">
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
