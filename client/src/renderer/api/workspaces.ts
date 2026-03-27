import apiClient from './client'

export interface Workspace {
  id: string
  name: string
  description?: string | null
  logoUrl?: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  joinedAt: string
}

export async function listWorkspaces(): Promise<Workspace[]> {
  return apiClient.get('/workspaces')
}

export async function getWorkspace(id: string): Promise<Workspace> {
  return apiClient.get(`/workspaces/${id}`)
}

export async function createWorkspace(data: {
  name: string
  description?: string
}): Promise<Workspace> {
  return apiClient.post('/workspaces', data)
}

export async function updateWorkspace(
  id: string,
  data: { name?: string; description?: string }
): Promise<Workspace> {
  return apiClient.patch(`/workspaces/${id}`, data)
}

export async function deleteWorkspace(id: string): Promise<void> {
  return apiClient.delete(`/workspaces/${id}`)
}

export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return apiClient.get(`/workspaces/${workspaceId}/members`)
}

export async function addMember(
  workspaceId: string,
  data: { email: string; role?: string }
): Promise<WorkspaceMember> {
  return apiClient.post(`/workspaces/${workspaceId}/members`, data)
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  return apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`)
}
