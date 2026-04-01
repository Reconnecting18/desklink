import { listProjects } from './projects'
import { listEvents, type CalendarEvent } from './boards'

export type WorkspaceCalendarEvent = CalendarEvent & { projectName: string }

/** ISO range for the user's local calendar day (for planner listEvents filters). */
export function localDayRangeIsoStrings(d = new Date()): { startDate: string; endDate: string } {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  const end = new Date(d)
  end.setHours(23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Events across all projects in a workspace whose start/end fall within the listEvents filter window. */
export async function listWorkspaceEventsInRange(
  workspaceId: string,
  startDate: string,
  endDate: string
): Promise<WorkspaceCalendarEvent[]> {
  const projects = await listProjects(workspaceId)
  const rows = await Promise.all(
    projects.map(async (p) => {
      const events = await listEvents(p.id, { startDate, endDate })
      return events.map((e) => ({ ...e, projectName: p.name }))
    })
  )
  return rows
    .flat()
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}
