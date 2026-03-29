import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Calendar,
  User,
  Flag,
  Tag,
  MessageSquare,
  Send,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { getTask, updateTask, listComments, createComment, deleteTask } from '@/api/boards'
import type { Comment } from '@/api/boards'

interface TaskDetailPanelProps {
  taskId: string
  projectId: string
  onClose: () => void
}

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export function TaskDetailPanel({ taskId, projectId, onClose }: TaskDetailPanelProps) {
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [description, setDescription] = useState('')

  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId)
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => listComments(taskId)
  })

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateTask>[1]) => updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['board'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
      onClose()
    }
  })

  const commentMutation = useMutation({
    mutationFn: () => createComment(taskId, { content: commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      setCommentText('')
    }
  })

  if (!task) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-96 items-center justify-center border-l border-notion-border bg-white shadow-lg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-notion-border bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-notion-border px-5 py-4">
        <span className="text-xs font-medium text-notion-text-secondary">Task details</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteMutation.mutate()}
            className="flex h-7 w-7 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-red"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {/* Title */}
        {editingTitle ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim() && title !== task.title) {
                updateMutation.mutate({ title })
              }
              setEditingTitle(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            autoFocus
            className="w-full text-base font-semibold text-notion-text focus:outline-none"
          />
        ) : (
          <h2
            onClick={() => {
              setTitle(task.title)
              setEditingTitle(true)
            }}
            className="cursor-text text-base font-semibold text-notion-text hover:bg-notion-sidebar-hover rounded px-1 -mx-1"
          >
            {task.title}
          </h2>
        )}

        {/* Properties */}
        <div className="flex flex-col gap-4">
          {/* Priority */}
          <div className="flex items-center gap-3">
            <span className="flex w-20 items-center gap-1.5 text-xs text-notion-text-secondary">
              <Flag className="h-3.5 w-3.5" />
              Priority
            </span>
            <div className="flex gap-1">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => updateMutation.mutate({ priority: p })}
                  className={cn(
                    'rounded px-2 py-0.5 text-xs transition-colors',
                    task.priority === p
                      ? 'bg-notion-accent text-white'
                      : 'bg-notion-sidebar text-notion-text-secondary hover:bg-notion-sidebar-hover'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-3">
            <span className="flex w-20 items-center gap-1.5 text-xs text-notion-text-secondary">
              <Calendar className="h-3.5 w-3.5" />
              Due date
            </span>
            <input
              type="date"
              value={task.dueDate ? task.dueDate.split('T')[0] : ''}
              onChange={(e) =>
                updateMutation.mutate({
                  dueDate: e.target.value ? new Date(e.target.value).toISOString() : null
                })
              }
              className="rounded border border-notion-border px-2 py-0.5 text-xs text-notion-text focus:outline-none focus:ring-1 focus:ring-notion-accent"
            />
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="flex w-20 items-center gap-1.5 text-xs text-notion-text-secondary pt-0.5">
                <Tag className="h-3.5 w-3.5" />
                Labels
              </span>
              <div className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <Badge key={label.id} color={label.color}>
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-notion-text-secondary">Description</h3>
          {editingDesc ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== (task.description || '')) {
                  updateMutation.mutate({ description })
                }
                setEditingDesc(false)
              }}
              autoFocus
              rows={4}
              className="w-full rounded border border-notion-border px-2 py-1.5 text-sm text-notion-text focus:outline-none focus:ring-1 focus:ring-notion-accent resize-none"
            />
          ) : (
            <div
              onClick={() => {
                setDescription(task.description || '')
                setEditingDesc(true)
              }}
              className="min-h-[60px] cursor-text rounded px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-sidebar-hover"
            >
              {task.description || 'Add a description...'}
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xs font-medium text-notion-text-secondary">
            <MessageSquare className="h-3.5 w-3.5" />
            Comments ({comments.length})
          </h3>

          <div className="flex flex-col gap-4">
            {comments.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar
                  name={comment.author?.displayName ?? comment.author?.name}
                  src={comment.author?.avatarUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-notion-text">
                      {comment.author?.displayName ?? comment.author?.name ?? 'You'}
                    </span>
                    <span className="text-[10px] text-notion-text-tertiary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-notion-text-secondary">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* New comment */}
          <div className="mt-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commentText.trim()) commentMutation.mutate()
              }}
              placeholder="Write a comment..."
              className="flex-1 rounded border border-notion-border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-notion-accent"
            />
            <button
              onClick={() => commentMutation.mutate()}
              disabled={!commentText.trim()}
              className="flex h-8 w-8 items-center justify-center rounded text-notion-accent hover:bg-notion-sidebar-hover disabled:opacity-30"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
