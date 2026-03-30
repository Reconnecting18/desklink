import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { listTasks, createTask, updateTask } from '@/api/boards'
import type { Task } from '@/api/boards'
import { TaskDetailPanel } from './TaskDetailPanel'

interface ListViewProps {
  projectId: string
}

const priorityVariant: Record<string, 'urgent' | 'high' | 'medium' | 'low'> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

export function ListView({ projectId }: ListViewProps) {
  const queryClient = useQueryClient()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'title'>('priority')

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => listTasks(projectId)
  })

  const createMutation = useMutation({
    mutationFn: () => createTask(projectId, { title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setNewTitle('')
      setShowNewTask(false)
    }
  })

  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    return a.title.localeCompare(b.title)
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-notion-border px-8 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-notion-text-secondary">Sort by:</span>
          {(['priority', 'dueDate', 'title'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs transition-colors',
                sortBy === s
                  ? 'bg-notion-sidebar-hover font-medium text-notion-text'
                  : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
              )}
            >
              {s === 'dueDate' ? 'Due date' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowNewTask(true)}>
          <Plus className="mr-1 h-3 w-3" />
          New task
        </Button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && !showNewTask ? (
          <EmptyState
            icon={Plus}
            title="No tasks yet"
            description="Create tasks to track your work."
            actionLabel="New task"
            onAction={() => setShowNewTask(true)}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-notion-border text-left">
                <th className="px-8 py-3.5 text-xs font-medium text-notion-text-secondary">Title</th>
                <th className="w-24 px-3 py-3.5 text-xs font-medium text-notion-text-secondary">Priority</th>
                <th className="w-24 px-3 py-3.5 text-xs font-medium text-notion-text-secondary">Status</th>
                <th className="w-28 px-3 py-3.5 text-xs font-medium text-notion-text-secondary">Due date</th>
                <th className="w-16 px-3 py-3.5 text-xs font-medium text-notion-text-secondary">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {showNewTask && (
                <tr className="border-b border-notion-border">
                  <td colSpan={5} className="px-8 py-3.5">
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTitle.trim()) createMutation.mutate()
                        if (e.key === 'Escape') { setShowNewTask(false); setNewTitle('') }
                      }}
                      placeholder="Task title... (Enter to save, Esc to cancel)"
                      autoFocus
                      className="w-full px-3 py-2 text-sm focus:outline-none"
                    />
                  </td>
                </tr>
              )}
              {sortedTasks.map((task: Task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="cursor-pointer border-b border-notion-border hover:bg-notion-sidebar-hover/50 transition-colors"
                >
                  <td className="px-8 py-3.5 text-sm text-notion-text">{task.title}</td>
                  <td className="px-3 py-3.5">
                    <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-notion-text-secondary">
                    {task.status}
                  </td>
                  <td className="px-3 py-3.5 text-xs text-notion-text-secondary">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })
                      : '—'}
                  </td>
                  <td className="px-3 py-3.5">
                    {task.assignee && (
                      <Avatar
                        name={task.assignee.displayName ?? task.assignee.name}
                        src={task.assignee.avatarUrl}
                        size="sm"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  )
}
