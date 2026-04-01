import apiClient from './client'

export interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'SPREADSHEET' | 'PRESENTATION'
  content?: Record<string, unknown> | null
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export async function listDocuments(workspaceId: string): Promise<Document[]> {
  return apiClient.get(`/workspaces/${workspaceId}/documents`)
}

export async function createDocument(
  workspaceId: string,
  data: { title: string; type?: string; content?: Record<string, unknown> }
): Promise<Document> {
  return apiClient.post(`/workspaces/${workspaceId}/documents`, {
    type: 'DOCUMENT',
    ...data
  })
}

export async function updateDocument(
  workspaceId: string,
  documentId: string,
  data: { title?: string; content?: Record<string, unknown> }
): Promise<Document> {
  return apiClient.patch(`/workspaces/${workspaceId}/documents/${documentId}`, data)
}

export async function deleteDocument(workspaceId: string, documentId: string): Promise<void> {
  return apiClient.delete(`/workspaces/${workspaceId}/documents/${documentId}`)
}
