import apiClient from './client'

export interface Mockup {
  id: string
  title: string
  description?: string | null
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export async function listMockups(workspaceId: string): Promise<Mockup[]> {
  return apiClient.get(`/workspaces/${workspaceId}/mockups`)
}

export async function createMockup(
  workspaceId: string,
  data: { title: string; description?: string }
): Promise<Mockup> {
  return apiClient.post(`/workspaces/${workspaceId}/mockups`, data)
}

export async function deleteMockup(workspaceId: string, mockupId: string): Promise<void> {
  return apiClient.delete(`/workspaces/${workspaceId}/mockups/${mockupId}`)
}
