import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, List, Calendar } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getProject } from '@/api/projects'
import { BoardView } from './BoardView'
import { ListView } from './ListView'
import { CalendarView } from './CalendarView'

type ViewTab = 'board' | 'list' | 'calendar'

const tabs: { key: ViewTab; label: string; icon: React.ElementType }[] = [
  { key: 'board', label: 'Board', icon: LayoutDashboard },
  { key: 'list', label: 'List', icon: List },
  { key: 'calendar', label: 'Calendar', icon: Calendar }
]

const tabHint: Record<ViewTab, string> = {
  board: 'Kanban',
  list: 'Table',
  calendar: 'Schedule'
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [activeTab, setActiveTab] = useState<ViewTab>('board')

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId
  })

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-notion-border bg-notion-bg px-8 pb-4 pt-10 md:px-12">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-notion-sidebar text-lg font-semibold text-notion-text">
            {(project?.name || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-notion-text">
              {project?.name || 'Loading...'}
            </h1>
            {project?.description && (
              <p className="mt-1 text-sm leading-relaxed text-notion-text-secondary">{project.description}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-notion-sidebar p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                title={tabHint[tab.key]}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all',
                  activeTab === tab.key
                    ? 'bg-notion-bg font-medium text-notion-text shadow-sm'
                    : 'text-notion-text-secondary hover:text-notion-text'
                )}
              >
                <tab.icon className="h-3.5 w-3.5 opacity-80" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'board' && <BoardView projectId={projectId!} />}
        {activeTab === 'list' && <ListView projectId={projectId!} />}
        {activeTab === 'calendar' && <CalendarView projectId={projectId!} />}
      </div>
    </div>
  )
}
