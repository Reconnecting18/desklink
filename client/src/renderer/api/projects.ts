import apiClient from './client'

export interface Project {
  id: string
  name: string
  description?: string | null
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
  _count?: {
    tasks: number
    boards: number
  }
}

export async function listProjects(workspaceId: string): Promise<Project[]> {
  const res = await apiClient.get<{ data: Project[]; pagination: unknown }>(
    `/workspaces/${workspaceId}/projects`
  )
  return res.data
}

export async function getProject(id: string): Promise<Project> {
  return apiClient.get(`/projects/${id}`)
}

export async function createProject(
  workspaceId: string,
  data: { name: string; description?: string }
): Promise<Project> {
  return apiClient.post(`/workspaces/${workspaceId}/projects`, data)
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
): Promise<Project> {
  return apiClient.patch(`/projects/${id}`, data)
}

export async function deleteProject(id: string): Promise<void> {
  return apiClient.delete(`/projects/${id}`)
}
