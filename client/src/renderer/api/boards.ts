import apiClient from './client'

export interface BoardColumn {
  id: string
  name: string
  position: number
  boardId: string
  tasks?: Task[]
}

export interface Board {
  id: string
  name: string
  projectId: string
  createdAt: string
  columns?: BoardColumn[]
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  position: number
  dueDate?: string | null
  projectId: string
  columnId?: string | null
  assigneeId?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  assignee?: {
    id: string
    displayName?: string
    name?: string
    email: string
    avatarUrl?: string | null
  } | null
  labels?: TaskLabel[]
  _count?: {
    comments: number
  }
}

export interface TaskLabel {
  id: string
  name: string
  color: string
}

export interface Comment {
  id: string
  content: string
  taskId: string
  authorId: string
  author?: {
    id: string
    displayName?: string
    name?: string
    avatarUrl?: string | null
  }
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  allDay: boolean
  projectId: string
  createdById: string
  createdAt: string
}

// Boards
export async function listBoards(projectId: string): Promise<Board[]> {
  return apiClient.get(`/projects/${projectId}/boards`)
}

export async function getBoard(id: string): Promise<Board> {
  return apiClient.get(`/boards/${id}`)
}

export async function createBoard(
  projectId: string,
  data: { name: string }
): Promise<Board> {
  return apiClient.post(`/projects/${projectId}/boards`, data)
}

export async function deleteBoard(id: string): Promise<void> {
  return apiClient.delete(`/boards/${id}`)
}

// Columns
export async function createColumn(
  boardId: string,
  data: { name: string }
): Promise<BoardColumn> {
  return apiClient.post(`/boards/${boardId}/columns`, data)
}

export async function updateColumn(
  boardId: string,
  columnId: string,
  data: { name?: string }
): Promise<BoardColumn> {
  return apiClient.patch(`/boards/${boardId}/columns/${columnId}`, data)
}

export async function reorderColumns(
  boardId: string,
  columnIds: string[]
): Promise<void> {
  return apiClient.patch(`/boards/${boardId}/columns/reorder`, { columnIds })
}

export async function deleteColumn(boardId: string, columnId: string): Promise<void> {
  return apiClient.delete(`/boards/${boardId}/columns/${columnId}`)
}

// Tasks
export async function listTasks(
  projectId: string,
  params?: { status?: string; priority?: string; assigneeId?: string }
): Promise<Task[]> {
  const res = await apiClient.get<{ data: Task[]; pagination: unknown }>(
    `/projects/${projectId}/tasks`,
    { params }
  )
  return res.data
}

export async function getTask(id: string): Promise<Task> {
  return apiClient.get(`/tasks/${id}`)
}

export async function createTask(
  projectId: string,
  data: {
    title: string
    description?: string
    priority?: string
    columnId?: string
    assigneeId?: string
    dueDate?: string
  }
): Promise<Task> {
  return apiClient.post(`/projects/${projectId}/tasks`, data)
}

export async function updateTask(
  id: string,
  data: {
    title?: string
    description?: string
    priority?: string
    status?: string
    assigneeId?: string | null
    dueDate?: string | null
  }
): Promise<Task> {
  return apiClient.patch(`/tasks/${id}`, data)
}

export async function moveTask(
  id: string,
  data: { columnId: string; position: number }
): Promise<Task> {
  return apiClient.patch(`/tasks/${id}/move`, data)
}

export async function deleteTask(id: string): Promise<void> {
  return apiClient.delete(`/tasks/${id}`)
}

// Comments
export async function listComments(taskId: string): Promise<Comment[]> {
  return apiClient.get(`/tasks/${taskId}/comments`)
}

export async function createComment(
  taskId: string,
  data: { content: string }
): Promise<Comment> {
  return apiClient.post(`/tasks/${taskId}/comments`, data)
}

export async function deleteComment(id: string): Promise<void> {
  return apiClient.delete(`/comments/${id}`)
}

// Labels
export async function addLabel(
  taskId: string,
  data: { name: string; color: string }
): Promise<TaskLabel> {
  return apiClient.post(`/tasks/${taskId}/labels`, data)
}

export async function removeLabel(taskId: string, labelId: string): Promise<void> {
  return apiClient.delete(`/tasks/${taskId}/labels/${labelId}`)
}

// Calendar Events
export async function listEvents(
  projectId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<CalendarEvent[]> {
  return apiClient.get(`/projects/${projectId}/events`, { params })
}

export async function createEvent(
  projectId: string,
  data: {
    title: string
    description?: string
    startTime: string
    endTime: string
    allDay?: boolean
  }
): Promise<CalendarEvent> {
  return apiClient.post(`/projects/${projectId}/events`, data)
}

export async function updateEvent(
  id: string,
  data: {
    title?: string
    description?: string
    startTime?: string
    endTime?: string
    allDay?: boolean
  }
): Promise<CalendarEvent> {
  return apiClient.patch(`/events/${id}`, data)
}

export async function deleteEvent(id: string): Promise<void> {
  return apiClient.delete(`/events/${id}`)
}
