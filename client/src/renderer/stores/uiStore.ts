import { create } from 'zustand'

export type AppId = 'home' | 'inbox' | 'documents' | 'whiteboard' | 'files' | 'settings'

const RECENT_VISITS_KEY = 'desklink-recent-visits'

export interface RecentVisit {
  id: string
  title: string
  href: string
  appId: AppId
  visitedAt: number
}

function loadRecentVisits(): RecentVisit[] {
  try {
    const raw = localStorage.getItem(RECENT_VISITS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentVisit[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistRecentVisits(visits: RecentVisit[]) {
  localStorage.setItem(RECENT_VISITS_KEY, JSON.stringify(visits.slice(0, 8)))
}

export interface PageTab {
  id: string
  title: string
  appId: AppId
  /** Optional sub-path within the app (e.g. project id, doc id) */
  path?: string
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarWidth: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void

  // Workspace
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string | null) => void

  // Command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  /** When set to `'new'`, DocumentApp creates a new doc then clears. */
  pendingDocumentAction: 'new' | null
  requestNewDocument: () => void
  clearPendingDocumentAction: () => void

  // App switcher — which top-level app is currently shown
  activeApp: AppId
  setActiveApp: (app: AppId) => void
  /** Focus an existing tab for the app or open a new one, then activate the app. */
  openOrFocusApp: (appId: AppId) => void

  // Page tabs — browser-style tabs per session
  pages: PageTab[]
  activePageId: string | null
  addPage: (page?: Partial<Omit<PageTab, 'id'>>) => void
  setActivePage: (id: string) => void
  closePage: (id: string) => void
  updatePageTitle: (id: string, title: string) => void

  /** Recently opened places (persisted, max 8). Deduped by href. */
  recentVisits: RecentVisit[]
  pushRecentVisit: (entry: { title: string; href: string; appId: AppId }) => void
}

let _nextPageId = 2 // start at 2 since we seed one default tab

const defaultPage: PageTab = {
  id: 'page-1',
  title: 'Dashboard',
  appId: 'home'
}

export const useUIStore = create<UIState>((set, get) => ({
  // Sidebar
  sidebarOpen: true,
  sidebarWidth: 240,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),

  // Workspace
  activeWorkspaceId: null,
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  pendingDocumentAction: null,
  requestNewDocument: () => set({ pendingDocumentAction: 'new' }),
  clearPendingDocumentAction: () => set({ pendingDocumentAction: null }),

  // App switcher
  activeApp: 'home',
  setActiveApp: (activeApp) => set({ activeApp }),

  openOrFocusApp: (appId) => {
    const { pages } = get()
    const existing = pages.find((p) => p.appId === appId)
    if (existing) {
      set({ activePageId: existing.id, activeApp: appId })
    } else {
      get().addPage({ appId })
      set({ activeApp: appId })
    }
  },

  // Page tabs
  pages: [defaultPage],
  activePageId: defaultPage.id,

  addPage: (partial = {}) => {
    const id = `page-${_nextPageId++}`
    const appId: AppId = partial.appId ?? get().activeApp
    const titleMap: Record<AppId, string> = {
      home: 'Dashboard',
      inbox: 'Inbox',
      documents: 'New page',
      whiteboard: 'Whiteboard',
      files: 'Files',
      settings: 'Settings'
    }
    const newPage: PageTab = {
      id,
      title: partial.title ?? titleMap[appId],
      appId,
      path: partial.path
    }
    set((state) => ({
      pages: [...state.pages, newPage],
      activePageId: id
    }))
  },

  setActivePage: (id) => {
    const page = get().pages.find((p) => p.id === id)
    if (page) {
      set({ activePageId: id, activeApp: page.appId })
    }
  },

  closePage: (id) => {
    const { pages, activePageId } = get()
    if (pages.length <= 1) return // always keep at least one tab
    const idx = pages.findIndex((p) => p.id === id)
    const remaining = pages.filter((p) => p.id !== id)
    let nextActiveId = activePageId
    if (activePageId === id) {
      // activate the tab to the left, or the first remaining
      const newIdx = Math.max(0, idx - 1)
      nextActiveId = remaining[newIdx]?.id ?? null
    }
    const nextPage = remaining.find((p) => p.id === nextActiveId)
    set({
      pages: remaining,
      activePageId: nextActiveId,
      ...(nextPage ? { activeApp: nextPage.appId } : {})
    })
  },

  updatePageTitle: (id, title) => {
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, title } : p))
    }))
  },

  recentVisits: loadRecentVisits(),

  pushRecentVisit: (entry) => {
    const visit: RecentVisit = {
      id: crypto.randomUUID(),
      title: entry.title,
      href: entry.href,
      appId: entry.appId,
      visitedAt: Date.now()
    }
    set((state) => {
      const filtered = state.recentVisits.filter((v) => v.href !== visit.href)
      const next = [visit, ...filtered].slice(0, 8)
      persistRecentVisits(next)
      return { recentVisits: next }
    })
  }
}))
