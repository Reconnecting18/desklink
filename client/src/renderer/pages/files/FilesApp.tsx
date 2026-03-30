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
  ChevronDown,
  Plus,
  LayoutGrid,
  List,
  Upload,
  Trash2,
  MoreHorizontal,
  Search
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface FileNode {
  id: string
  name: string
  type: 'folder' | 'file'
  mimeType?: string
  size?: string
  modified?: string
  children?: FileNode[]
}

const MOCK_TREE: FileNode[] = [
  {
    id: 'f1',
    name: 'Projects',
    type: 'folder',
    children: [
      {
        id: 'f1-1',
        name: 'DeskLink',
        type: 'folder',
        children: [
          { id: 'f1-1-1', name: 'README.md', type: 'file', mimeType: 'text', size: '4 KB', modified: 'Today' },
          { id: 'f1-1-2', name: 'package.json', type: 'file', mimeType: 'code', size: '2 KB', modified: 'Today' },
          { id: 'f1-1-3', name: 'tsconfig.json', type: 'file', mimeType: 'code', size: '1 KB', modified: 'Yesterday' }
        ]
      },
      {
        id: 'f1-2',
        name: 'Design System',
        type: 'folder',
        children: [
          { id: 'f1-2-1', name: 'components.fig', type: 'file', mimeType: 'image', size: '12 MB', modified: '2 days ago' },
          { id: 'f1-2-2', name: 'tokens.json', type: 'file', mimeType: 'code', size: '8 KB', modified: '3 days ago' }
        ]
      }
    ]
  },
  {
    id: 'f2',
    name: 'Documents',
    type: 'folder',
    children: [
      { id: 'f2-1', name: 'Q2 Roadmap.pdf', type: 'file', mimeType: 'text', size: '340 KB', modified: 'Today' },
      { id: 'f2-2', name: 'Meeting Notes.docx', type: 'file', mimeType: 'text', size: '56 KB', modified: 'Yesterday' },
      { id: 'f2-3', name: 'Budget 2026.xlsx', type: 'file', mimeType: 'text', size: '128 KB', modified: 'Last week' }
    ]
  },
  {
    id: 'f3',
    name: 'Assets',
    type: 'folder',
    children: [
      {
        id: 'f3-1',
        name: 'Images',
        type: 'folder',
        children: [
          { id: 'f3-1-1', name: 'logo.png', type: 'file', mimeType: 'image', size: '24 KB', modified: 'Last week' },
          { id: 'f3-1-2', name: 'banner.jpg', type: 'file', mimeType: 'image', size: '1.2 MB', modified: 'Last week' },
          { id: 'f3-1-3', name: 'icons.svg', type: 'file', mimeType: 'image', size: '8 KB', modified: '2 weeks ago' }
        ]
      },
      {
        id: 'f3-2',
        name: 'Videos',
        type: 'folder',
        children: [
          { id: 'f3-2-1', name: 'demo.mp4', type: 'file', mimeType: 'video', size: '48 MB', modified: 'Last month' }
        ]
      }
    ]
  },
  { id: 'f4', name: 'archive.zip', type: 'file', mimeType: 'archive', size: '256 MB', modified: 'Last month' },
  { id: 'f5', name: 'notes.txt', type: 'file', mimeType: 'text', size: '2 KB', modified: 'Today' }
]

function getMimeIcon(mimeType?: string): React.ElementType {
  switch (mimeType) {
    case 'image': return Image
    case 'video': return Film
    case 'audio': return Music
    case 'archive': return Archive
    case 'code': return Code2
    default: return FileText
  }
}

function getMimeColor(mimeType?: string): string {
  switch (mimeType) {
    case 'image': return 'text-notion-purple'
    case 'video': return 'text-notion-red'
    case 'audio': return 'text-notion-orange'
    case 'archive': return 'text-notion-yellow'
    case 'code': return 'text-notion-green'
    default: return 'text-notion-accent'
  }
}

interface TreeNodeProps {
  node: FileNode
  depth: number
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (node: FileNode) => void
  onToggle: (id: string) => void
}

function TreeNode({ node, depth, selectedId, expandedIds, onSelect, onToggle }: TreeNodeProps) {
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const Icon = node.type === 'folder'
    ? (isExpanded ? FolderOpen : Folder)
    : getMimeIcon(node.mimeType)

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node)
          if (node.type === 'folder') onToggle(node.id)
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
          isSelected
            ? 'bg-notion-sidebar-hover text-notion-text'
            : 'text-notion-text-secondary hover:bg-notion-sidebar-hover/60 hover:text-notion-text'
        )}
        style={{ paddingLeft: `${20 + depth * 16}px` }}
      >
        {node.type === 'folder' ? (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
            {isExpanded
              ? <ChevronDown className="h-3 w-3 text-notion-text-tertiary" />
              : <ChevronRight className="h-3 w-3 text-notion-text-tertiary" />}
          </span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Icon className={cn('h-3.5 w-3.5 shrink-0', node.type === 'folder' ? 'text-notion-orange' : getMimeColor(node.mimeType))} />
        <span className="flex-1 truncate">{node.name}</span>
      </button>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getChildFiles(node: FileNode | null, allNodes: FileNode[]): FileNode[] {
  if (!node) {
    // root level
    return allNodes
  }
  if (node.type === 'folder') {
    return node.children ?? []
  }
  return []
}

export function FilesApp() {
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['f1', 'f2', 'f3']))
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectNode = (node: FileNode) => {
    setSelectedNode(node.type === 'folder' ? node : null)
    if (node.type === 'file') setSelectedFileId(node.id)
  }

  const currentFiles = getChildFiles(selectedNode, MOCK_TREE)

  const filteredFiles = searchQuery
    ? currentFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentFiles

  const breadcrumb = selectedNode ? selectedNode.name : 'All Files'

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — directory tree */}
      <div className="flex w-64 min-w-[16rem] shrink-0 flex-col overflow-hidden border-r border-notion-border/50 bg-notion-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-notion-border/50 px-3 py-2">
          <span className="text-sm font-semibold text-notion-text">Files</span>
          <button
            type="button"
            title="New folder"
            className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* All Files root */}
          <button
            type="button"
            onClick={() => { setSelectedNode(null); setSelectedFileId(null) }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm transition-colors',
              selectedNode === null
                ? 'bg-notion-sidebar-hover text-notion-text'
                : 'text-notion-text-secondary hover:bg-notion-sidebar-hover/60 hover:text-notion-text'
            )}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-notion-accent" />
            <span className="font-medium">All Files</span>
          </button>

          <div className="mt-1 border-t border-notion-border/60 pt-1">
            {MOCK_TREE.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedNode?.id ?? null}
                expandedIds={expandedIds}
                onSelect={handleSelectNode}
                onToggle={toggleExpand}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — file listing */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-notion-bg">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-notion-border/50 px-5 py-3.5">
          {/* Breadcrumb */}
          <div className="flex min-w-0 shrink-0 items-center gap-2 text-xs text-notion-text-secondary">
            <span
              className="cursor-pointer hover:text-notion-text"
              onClick={() => setSelectedNode(null)}
            >
              Files
            </span>
            {selectedNode && (
              <>
                <ChevronRight className="h-3 w-3 text-notion-text-tertiary" />
                <span className="text-notion-text">{selectedNode.name}</span>
              </>
            )}
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
              className="flex h-9 items-center gap-2 rounded-md border border-notion-border bg-notion-sidebar px-4 text-sm text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
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
        <div className="flex-1 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <Folder className="h-10 w-10 text-notion-text-tertiary" />
              <p className="text-sm font-medium text-notion-text-secondary">
                {searchQuery ? 'No files match your search' : 'This folder is empty'}
              </p>
              <p className="text-xs text-notion-text-tertiary">
                {searchQuery ? 'Try a different search term' : 'Upload files or create a new folder'}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border/50 bg-notion-sidebar/30">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">Modified</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-notion-text-tertiary">Size</th>
                  <th className="w-10 px-2 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => {
                  const Icon = file.type === 'folder'
                    ? Folder
                    : getMimeIcon(file.mimeType)
                  const isSelected = selectedFileId === file.id
                  return (
                    <tr
                      key={file.id}
                      onClick={() => handleSelectNode(file)}
                      className={cn(
                        'group cursor-pointer border-b border-notion-border/30 transition-colors',
                        isSelected ? 'bg-notion-sidebar-hover' : 'hover:bg-notion-sidebar/60'
                      )}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Icon className={cn(
                            'h-4 w-4 shrink-0',
                            file.type === 'folder' ? 'text-notion-orange' : getMimeColor(file.mimeType)
                          )} />
                          <span className="leading-snug text-notion-text">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-notion-text-tertiary">{file.modified ?? '—'}</td>
                      <td className="px-5 py-3 text-notion-text-tertiary">{file.size ?? '—'}</td>
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
                })}
              </tbody>
            </table>
          ) : (
            /* Grid view */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-4 p-6">
              {filteredFiles.map((file) => {
                const Icon = file.type === 'folder'
                  ? Folder
                  : getMimeIcon(file.mimeType)
                const isSelected = selectedFileId === file.id
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleSelectNode(file)}
                    className={cn(
                      'flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all',
                      isSelected
                        ? 'border-notion-accent bg-notion-accent/5'
                        : 'border-notion-border hover:border-notion-text-tertiary/60 hover:bg-notion-sidebar/60'
                    )}
                  >
                    <Icon className={cn(
                      'h-8 w-8',
                      file.type === 'folder' ? 'text-notion-orange' : getMimeColor(file.mimeType)
                    )} />
                    <span className="w-full truncate text-xs leading-snug text-notion-text">{file.name}</span>
                    {file.size && (
                      <span className="text-[11px] text-notion-text-tertiary">{file.size}</span>
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
            {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>
      </div>
    </div>
  )
}
