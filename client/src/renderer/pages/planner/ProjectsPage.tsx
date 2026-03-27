import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderKanban, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { listProjects, createProject, deleteProject, type Project } from '@/api/projects'

export function ProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => listProjects(workspaceId!),
    enabled: !!workspaceId
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createProject(workspaceId!, { name: newName, description: newDesc || undefined }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      navigate(`/w/${workspaceId}/projects/${project.id}`)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
    }
  })

  return (
    <div className="mx-auto max-w-3xl px-12 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-notion-text">Projects</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New project
        </Button>
      </div>

      {/* Create project inline form */}
      {showCreate && (
        <div className="mb-6 rounded-lg border border-notion-border bg-white p-4">
          <div className="flex flex-col gap-3">
            <Input
              id="project-name"
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <Input
              id="project-desc"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={!newName.trim() || createMutation.isPending}
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCreate(false)
                  setNewName('')
                  setNewDesc('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to organize your tasks, boards, and calendar events."
          actionLabel="New project"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projects.map((project: Project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/w/${workspaceId}/projects/${project.id}`)}
              className="group cursor-pointer rounded-lg border border-notion-border bg-white p-4 transition-colors hover:border-notion-text-tertiary"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-notion-text truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-xs text-notion-text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-notion-text-tertiary">
                    {project._count && (
                      <>
                        <span>{project._count.tasks} tasks</span>
                        <span>{project._count.boards} boards</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteMutation.mutate(project.id)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded opacity-0 group-hover:opacity-100 text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-red transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
