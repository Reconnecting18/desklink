import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { listBoards, createBoard, getBoard, createColumn, createTask, moveTask } from '@/api/boards'
import type { Board, BoardColumn, Task } from '@/api/boards'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskDetailPanel } from './TaskDetailPanel'

interface BoardViewProps {
  projectId: string
}

export function BoardView({ projectId }: BoardViewProps) {
  const queryClient = useQueryClient()
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { data: boards = [] } = useQuery({
    queryKey: ['boards', projectId],
    queryFn: () => listBoards(projectId)
  })

  // Auto-select first board
  const activeBoardId = selectedBoardId || boards[0]?.id

  const { data: board } = useQuery({
    queryKey: ['board', activeBoardId],
    queryFn: () => getBoard(activeBoardId!),
    enabled: !!activeBoardId
  })

  const createBoardMutation = useMutation({
    mutationFn: () => createBoard(projectId, { name: newBoardName }),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', projectId] })
      setSelectedBoardId(newBoard.id)
      setShowNewBoard(false)
      setNewBoardName('')
    }
  })

  const createColumnMutation = useMutation({
    mutationFn: () => createColumn(activeBoardId!, { name: newColumnName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', activeBoardId] })
      setShowNewColumn(false)
      setNewColumnName('')
    }
  })

  const moveMutation = useMutation({
    mutationFn: ({ taskId, columnId, position }: { taskId: string; columnId: string; position: number }) =>
      moveTask(taskId, { columnId, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', activeBoardId] })
    }
  })

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTaskById(event.active.id as string)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Determine target column
    let targetColumnId: string
    let position = 0

    // Check if dropped over a column
    const targetColumn = board?.columns?.find((c) => c.id === overId)
    if (targetColumn) {
      targetColumnId = targetColumn.id
      position = targetColumn.tasks?.length || 0
    } else {
      // Dropped over a task — find its column
      const col = board?.columns?.find((c) => c.tasks?.some((t) => t.id === overId))
      if (!col) return
      targetColumnId = col.id
      const taskIndex = col.tasks?.findIndex((t) => t.id === overId) ?? 0
      position = taskIndex
    }

    moveMutation.mutate({ taskId, columnId: targetColumnId, position })
  }

  const findTaskById = (id: string): Task | undefined => {
    for (const col of board?.columns || []) {
      const task = col.tasks?.find((t) => t.id === id)
      if (task) return task
    }
    return undefined
  }

  const columns = board?.columns || []

  if (boards.length === 0 && !showNewBoard) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={Plus}
          title="No boards yet"
          description="Create a board to start organizing tasks into columns."
          actionLabel="Create board"
          onAction={() => setShowNewBoard(true)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Board tabs */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-notion-border bg-notion-bg px-8 py-3">
        {boards.map((b: Board) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSelectedBoardId(b.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              b.id === activeBoardId
                ? 'bg-notion-sidebar text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            }`}
          >
            {b.name}
          </button>
        ))}
        {showNewBoard ? (
          <div className="flex items-center gap-1">
            <input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newBoardName.trim()) createBoardMutation.mutate()
                if (e.key === 'Escape') { setShowNewBoard(false); setNewBoardName('') }
              }}
              className="w-28 rounded border border-notion-border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-notion-accent"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowNewBoard(true)}
            className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Kanban columns */}
      <div className="flex flex-1 gap-3 overflow-x-auto px-8 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {columns.map((column: BoardColumn, index: number) => (
            <KanbanColumn
              key={column.id}
              column={column}
              columnIndex={index}
              projectId={projectId}
              boardId={activeBoardId!}
              onTaskClick={(taskId) => setSelectedTaskId(taskId)}
            />
          ))}

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>

        {/* Add column */}
        <div className="w-64 shrink-0">
          {showNewColumn ? (
            <div className="rounded-lg border border-dashed border-notion-border bg-notion-sidebar p-3">
              <input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newColumnName.trim()) createColumnMutation.mutate()
                  if (e.key === 'Escape') { setShowNewColumn(false); setNewColumnName('') }
                }}
                className="mb-2 w-full rounded border border-notion-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-notion-accent"
              />
              <div className="flex gap-1">
                <Button size="sm" onClick={() => createColumnMutation.mutate()}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowNewColumn(false); setNewColumnName('') }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewColumn(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-notion-border px-4 py-8 text-sm text-notion-text-tertiary hover:border-notion-text-tertiary hover:text-notion-text-secondary transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add column
            </button>
          )}
        </div>
      </div>

      {/* Task detail panel */}
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
