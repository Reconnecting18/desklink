import apiClient from './client'

export interface FileItem {
  id: string
  name: string
  isFolder: boolean
  mimeType?: string | null
  size?: number | null
  parentId?: string | null
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export async function listFiles(
  workspaceId: string,
  params?: { parentId?: string }
): Promise<FileItem[]> {
  return apiClient.get(`/workspaces/${workspaceId}/files`, { params })
}

export async function createFolder(
  workspaceId: string,
  data: { name: string; parentId?: string }
): Promise<FileItem> {
  return apiClient.post(`/workspaces/${workspaceId}/files/folder`, data)
}

export async function deleteFile(workspaceId: string, fileId: string): Promise<void> {
  return apiClient.delete(`/workspaces/${workspaceId}/files/${fileId}`)
}
