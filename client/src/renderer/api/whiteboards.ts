import apiClient from './client'

export interface Whiteboard {
  id: string
  title: string
  thumbnail?: string | null
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export async function listWhiteboards(workspaceId: string): Promise<Whiteboard[]> {
  return apiClient.get(`/workspaces/${workspaceId}/whiteboards`)
}

export async function createWhiteboard(
  workspaceId: string,
  data: { title: string }
): Promise<Whiteboard> {
  return apiClient.post(`/workspaces/${workspaceId}/whiteboards`, data)
}

export async function deleteWhiteboard(workspaceId: string, whiteboardId: string): Promise<void> {
  return apiClient.delete(`/workspaces/${workspaceId}/whiteboards/${whiteboardId}`)
}
