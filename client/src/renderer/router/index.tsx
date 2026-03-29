import { createHashRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { WorkspaceRoot } from './WorkspaceRoot'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ProjectsPage } from '@/pages/planner/ProjectsPage'
import { ProjectDetailPage } from '@/pages/planner/ProjectDetailPage'
import { WorkspaceSettingsPage } from '@/pages/workspace/WorkspaceSettingsPage'
import { MembersPage } from '@/pages/workspace/MembersPage'
import { InboxApp } from '@/pages/inbox/InboxApp'
import { WhiteboardApp } from '@/pages/whiteboard/WhiteboardApp'
import { FilesApp } from '@/pages/files/FilesApp'
import { HomeDashboardPage } from '@/pages/home/HomeDashboardPage'

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/',
            element: <WorkspaceRoot />
          },
          {
            path: '/w/:workspaceId',
            children: [
              {
                index: true,
                element: <HomeDashboardPage />
              },
              {
                path: 'settings',
                element: <WorkspaceSettingsPage />
              },
              {
                path: 'members',
                element: <MembersPage />
              },
              {
                path: 'projects',
                element: <ProjectsPage />
              },
              {
                path: 'projects/:projectId',
                element: <ProjectDetailPage />
              },
              {
                path: 'inbox',
                element: <InboxApp />
              },
              {
                path: 'whiteboard',
                element: <WhiteboardApp />
              },
              {
                path: 'files',
                element: <FilesApp />
              },
              {
                path: 'files/:folderId',
                element: <FilesApp />
              }
            ]
          }
        ]
      }
    ]
  }
])
