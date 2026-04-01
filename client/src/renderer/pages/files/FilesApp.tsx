import { useState } from 'react'
import {
  Folder,
  FolderOpen,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Code2,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  Upload,
  MoreHorizontal,
  Search,
  AlertCircle
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { listFiles, type FileItem } from '@/api/files'

function getMimeIcon(mimeType?: string | null): React.ElementType {
  switch (mimeType) {
    case 'image': return Image
    case 'video': return Film
    case 'audio': return Music
    case 'archive': return Archive
    case 'code': return Code2
    default: return FileText
  }
}

function getMimeColor(mimeType?: string | null): string {
  switch (mimeType) {
    case 'image': return 'text-notion-purple'
    case 'video': return 'text-notion-red'
    case 'audio': return 'text-notion-orange'
    case 'archive': return 'text-notion-yellow'
    case 'code': return 'text-notion-green'
    default: return 'text-notion-accent'
  }
}

function formatBytes(bytes?: number | null): string {
  if (bytes == null) return '—'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-notion-border/30">
          <td className="px-5 py-3">
            <div className="h-4 w-48 animate-pulse rounded bg-notion-sidebar-hover" />
          </td>
          <td className="px-5 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-notion-sidebar-hover" />
          </td>
          <td className="px-5 py-3">
            <div className="h-4 w-12 animate-pulse rounded bg-notion-sidebar-hover" />
          </td>
          <td className="px-2 py-3" />
        </tr>
      ))}
    </>
  )
}

export function FilesApp() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const activeWorkspaceId = useUIStore((s) => s.activeWorkspaceId)

  // Navigation stack: null = root, otherwise a folder item
  const [folderStack, setFolderStack] = useState<FileItem[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const currentFolder = folderStack.length > 0 ? folderStack[folderStack.length - 1] : null

  const enabled = !!accessToken && !!activeWorkspaceId

  // Sidebar: always root-level items
  const rootQuery = useQuery({
    queryKey: ['files', activeWorkspaceId, 'root'],
    queryFn: () => listFiles(activeWorkspaceId!),
    enabled
  })

  // Main panel: items inside the current folder, or root items if no folder selected
  const mainQuery = useQuery({
    queryKey: ['files', activeWorkspaceId, currentFolder?.id ?? 'root'],
    queryFn: () =>
      listFiles(activeWorkspaceId!, currentFolder ? { parentId: currentFolder.id } : undefined),
    enabled
  })

  const rootItems = rootQuery.data ?? []
  const mainItems = mainQuery.data ?? []

  const filteredItems = searchQuery
    ? mainItems.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mainItems

  const handleSelectFolder = (item: FileItem) => {
    if (!item.isFolder) {
      setSelectedFileId(item.id)
      return
    }
    setFolderStack((prev) => [...prev, item])
    setSelectedFileId(null)
  }

  const handleNavigateToRoot = () => {
    setFolderStack([])
    setSelectedFileId(null)
  }

  const handleNavigateTo = (index: number) => {
    setFolderStack((prev) => prev.slice(0, index + 1))
    setSelectedFileId(null)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — directory tree */}
      <div className="flex w-64 min-w-[16rem] shrink-0 flex-col overflow-hidden border-r border-notion-border/50 bg-notion-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-notion-border/50 p-[5px]">
          <span className="text-sm font-semibold text-notion-text">Files</span>
          <button
            type="button"
            title="New folder"
            className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* All Files root */}
          <button
            type="button"
            onClick={handleNavigateToRoot}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm transition-colors',
              currentFolder === null
                ? 'bg-notion-sidebar-hover text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover/60 hover:text-notion-text'
            )}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-notion-accent" />
            <span className="font-medium">All Files</span>
          </button>

          <div className="mt-1 border-t border-notion-border/60 pt-1">
            {rootQuery.isLoading ? (
              <div className="space-y-1 px-4 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-notion-sidebar-hover" />
                ))}
              </div>
            ) : rootQuery.error ? (
              <p className="px-4 py-3 text-xs text-notion-text-tertiary">Failed to load</p>
            ) : rootItems.length === 0 ? (
              <p className="px-4 py-3 text-xs text-notion-text-tertiary">No files yet</p>
            ) : (
              rootItems.map((item) => {
                const Icon = item.isFolder ? Folder : getMimeIcon(item.mimeType)
                const isActive = currentFolder?.id === item.id || selectedFileId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectFolder(item)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-notion-sidebar-hover text-notion-text'
                        : 'text-notion-text-secondary hover:bg-notion-sidebar-hover/60 hover:text-notion-text'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        item.isFolder ? 'text-notion-orange' : getMimeColor(item.mimeType)
                      )}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.isFolder && <ChevronRight className="h-3 w-3 shrink-0 text-notion-text-tertiary" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Right panel — file listing */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-notion-bg">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-notion-border/50 px-5 py-3.5">
          {/* Breadcrumb */}
          <div className="flex min-w-0 shrink-0 items-center gap-2 text-xs text-notion-text-secondary">
            <span className="cursor-pointer hover:text-notion-text" onClick={handleNavigateToRoot}>
              Files
            </span>
            {folderStack.map((folder, idx) => (
              <span key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-notion-text-tertiary" />
                <span
                  className={cn(
                    idx === folderStack.length - 1
                      ? 'text-notion-text'
                      : 'cursor-pointer hover:text-notion-text'
                  )}
                  onClick={() => idx < folderStack.length - 1 && handleNavigateTo(idx)}
                >
                  {folder.name}
                </span>
              </span>
            ))}
          </div>

          <div className="ml-auto flex min-w-0 flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex h-9 min-w-[12rem] flex-1 items-center gap-2.5 rounded-md border border-notion-border bg-notion-sidebar px-3 transition-colors focus-within:border-notion-accent sm:max-w-md sm:flex-initial">
              <Search className="h-4 w-4 shrink-0 text-notion-text-tertiary" />
              <input
                type="text"
                placeholder="Search files…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent py-2 text-sm text-notion-text placeholder:text-notion-text-tertiary focus:outline-none"
              />
            </div>

            {/* Upload stub */}
            <button
              type="button"
              title="Upload files"
              className="flex h-9 items-center gap-2 rounded-md border border-notion-border bg-notion-sidebar p-[5px] text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
            >
              <Upload className="h-3 w-3" />
              Upload
            </button>

            {/* View toggle */}
            <div className="flex overflow-hidden rounded-md border border-notion-border">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center transition-colors',
                  viewMode === 'list'
                    ? 'bg-notion-sidebar-hover text-notion-text'
                    : 'bg-notion-sidebar text-notion-text-tertiary hover:text-notion-text-secondary'
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center border-l border-notion-border transition-colors',
                  viewMode === 'grid'
                    ? 'bg-notion-sidebar-hover text-notion-text'
                    : 'bg-notion-sidebar text-notion-text-tertiary hover:text-notion-text-secondary'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* File listing */}
        <div className="flex-1 overflow-y-auto p-[5px]">
          {mainQuery.error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <AlertCircle className="h-10 w-10 text-notion-text-tertiary" />
              <p className="text-sm font-medium text-notion-text-secondary">Failed to load files</p>
              <p className="text-xs text-notion-text-tertiary">{(mainQuery.error as Error).message}</p>
            </div>
          ) : viewMode === 'list' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border/50 bg-notion-sidebar/30">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
                    Modified
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">
                    Size
                  </th>
                  <th className="w-10 px-2 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {mainQuery.isLoading ? (
                  <SkeletonRows />
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                        <Folder className="h-10 w-10 text-notion-text-tertiary" />
                        <p className="text-sm font-medium text-notion-text-secondary">
                          {searchQuery ? 'No files match your search' : 'This folder is empty'}
                        </p>
                        <p className="text-xs text-notion-text-tertiary">
                          {searchQuery ? 'Try a different search term' : 'Upload files or create a new folder'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((file) => {
                    const Icon = file.isFolder ? Folder : getMimeIcon(file.mimeType)
                    const isSelected = selectedFileId === file.id
                    return (
                      <tr
                        key={file.id}
                        onClick={() => handleSelectFolder(file)}
                        className={cn(
                          'group cursor-pointer border-b border-notion-border/30 transition-colors',
                          isSelected ? 'bg-notion-sidebar-hover' : 'hover:bg-notion-sidebar/60'
                        )}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0',
                                file.isFolder ? 'text-notion-orange' : getMimeColor(file.mimeType)
                              )}
                            />
                            <span className="leading-snug text-notion-text">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-notion-text-tertiary">
                          {new Date(file.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-notion-text-tertiary">
                          {file.isFolder ? '—' : formatBytes(file.size)}
                        </td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="hidden h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover group-hover:flex"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : mainQuery.isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-4 p-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl border border-notion-border bg-notion-sidebar/40"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <Folder className="h-10 w-10 text-notion-text-tertiary" />
              <p className="text-sm font-medium text-notion-text-secondary">
                {searchQuery ? 'No files match your search' : 'This folder is empty'}
              </p>
              <p className="text-xs text-notion-text-tertiary">
                {searchQuery ? 'Try a different search term' : 'Upload files or create a new folder'}
              </p>
            </div>
          ) : (
            /* Grid view */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-4 p-6">
              {filteredItems.map((file) => {
                const Icon = file.isFolder ? Folder : getMimeIcon(file.mimeType)
                const isSelected = selectedFileId === file.id
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleSelectFolder(file)}
                    className={cn(
                      'flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all',
                      isSelected
                        ? 'border-notion-accent bg-notion-accent/5'
                        : 'border-notion-border hover:border-notion-text-tertiary/60 hover:bg-notion-sidebar/60'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-8 w-8',
                        file.isFolder ? 'text-notion-orange' : getMimeColor(file.mimeType)
                      )}
                    />
                    <span className="w-full truncate text-xs leading-snug text-notion-text">
                      {file.name}
                    </span>
                    {!file.isFolder && file.size != null && (
                      <span className="text-[11px] text-notion-text-tertiary">
                        {formatBytes(file.size)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center border-t border-notion-border px-5 py-2.5">
          <span className="text-[11px] text-notion-text-tertiary">
            {mainQuery.isLoading
              ? 'Loading…'
              : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}${searchQuery ? ` matching "${searchQuery}"` : ''}`}
          </span>
        </div>
      </div>
    </div>
  )
}
