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
      {/* Header */}
      <div className="shrink-0 border-b border-notion-border px-6 pt-6 pb-0">
        <h1 className="text-lg font-semibold text-notion-text">
          {project?.name || 'Loading...'}
        </h1>
        {project?.description && (
          <p className="mt-1 text-sm text-notion-text-secondary">{project.description}</p>
        )}

        {/* Tabs */}
        <div className="mt-4 flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 pb-2 text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-notion-text font-medium text-notion-text'
                  : 'border-transparent text-notion-text-secondary hover:text-notion-text'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
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
