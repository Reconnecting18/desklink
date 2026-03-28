import { createHashRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
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
            element: <Navigate to="/login" replace />
          },
          {
            path: '/w/:workspaceId',
            children: [
              {
                index: true,
                element: <Navigate to="projects" replace />
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
