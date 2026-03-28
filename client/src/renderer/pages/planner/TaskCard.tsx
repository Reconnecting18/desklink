import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { Task } from '@/api/boards'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onClick?: () => void
}

const priorityVariant: Record<string, 'urgent' | 'high' | 'medium' | 'low'> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border border-notion-border/90 bg-notion-bg p-3 shadow-sm transition-shadow',
        'hover:shadow-md',
        isDragging && 'rotate-2 shadow-lg',
        isSortDragging && 'opacity-50'
      )}
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <Badge key={label.id} color={label.color}>
              {label.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm text-notion-text">{task.title}</p>

      {/* Meta row */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={priorityVariant[task.priority] || 'default'}>
            {task.priority}
          </Badge>
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-[11px] text-notion-text-tertiary">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
          {task._count && task._count.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-notion-text-tertiary">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar
            name={task.assignee.displayName ?? task.assignee.name}
            src={task.assignee.avatarUrl}
            size="sm"
          />
        )}
      </div>
    </div>
  )
}
