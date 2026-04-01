import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Plus,
  FileText,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Code,
  Trash2,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  type Document
} from '@/api/documents'

const TOOLBAR_ACTIONS = [
  { cmd: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
  { cmd: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
  { cmd: 'underline', icon: Underline, title: 'Underline (Ctrl+U)' },
  { cmd: 'h1', icon: Heading1, title: 'Heading 1' },
  { cmd: 'h2', icon: Heading2, title: 'Heading 2' },
  { cmd: 'insertUnorderedList', icon: List, title: 'Bullet list' },
  { cmd: 'code', icon: Code, title: 'Code block' }
]

export function DocumentApp() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const {
    activeWorkspaceId,
    activePageId,
    updatePageTitle,
    pendingDocumentAction,
    clearPendingDocumentAction,
    activeApp
  } = useUIStore()
  const queryClient = useQueryClient()

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  // Local HTML content keyed by doc id — populated from API on first open
  const [localContent, setLocalContent] = useState<Record<string, string>>({})
  const editorRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enabled = !!accessToken && !!activeWorkspaceId

  const { data: docs, isLoading, error } = useQuery({
    queryKey: ['documents', activeWorkspaceId],
    queryFn: () => listDocuments(activeWorkspaceId!),
    enabled
  })

  // Auto-select first doc when list loads
  useEffect(() => {
    if (docs && docs.length > 0 && !selectedDocId) {
      setSelectedDocId(docs[0].id)
    }
  }, [docs, selectedDocId])

  const selectedDoc: Document | null = docs?.find((d) => d.id === selectedDocId) ?? null

  // Seed local content from API data when a doc is first selected
  useEffect(() => {
    if (!selectedDoc) return
    if (localContent[selectedDoc.id] !== undefined) return
    const html =
      typeof selectedDoc.content?.html === 'string' ? selectedDoc.content.html : ''
    setLocalContent((prev) => ({ ...prev, [selectedDoc.id]: html }))
  }, [selectedDoc, localContent])

  const createMutation = useMutation({
    mutationFn: (title: string) =>
      createDocument(activeWorkspaceId!, {
        title,
        type: 'DOCUMENT',
        content: { html: '' }
      }),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', activeWorkspaceId] })
      setSelectedDocId(doc.id)
      setLocalContent((prev) => ({ ...prev, [doc.id]: '' }))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteDocument(activeWorkspaceId!, docId),
    onSuccess: (_data, docId) => {
      queryClient.invalidateQueries({ queryKey: ['documents', activeWorkspaceId] })
      setLocalContent((prev) => {
        const next = { ...prev }
        delete next[docId]
        return next
      })
      if (selectedDocId === docId) setSelectedDocId(null)
    }
  })

  const saveMutation = useMutation({
    mutationFn: ({ docId, title, html }: { docId: string; title?: string; html?: string }) => {
      const payload: { title?: string; content?: Record<string, unknown> } = {}
      if (title !== undefined) payload.title = title
      if (html !== undefined) payload.content = { html }
      return updateDocument(activeWorkspaceId!, docId, payload)
    }
  })

  const scheduleSave = useCallback(
    (docId: string, title?: string, html?: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveMutation.mutate({ docId, title, html })
      }, 800)
    },
    [saveMutation]
  )

  const handleNewDoc = useCallback(() => {
    if (!activeWorkspaceId) return
    createMutation.mutate('Untitled')
    if (activePageId) updatePageTitle(activePageId, 'Untitled')
  }, [activeWorkspaceId, activePageId, updatePageTitle, createMutation])

  useEffect(() => {
    if (activeApp !== 'documents' || pendingDocumentAction !== 'new') return
    handleNewDoc()
    clearPendingDocumentAction()
  }, [activeApp, pendingDocumentAction, handleNewDoc, clearPendingDocumentAction])

  const handleSelectDoc = (doc: Document) => {
    setSelectedDocId(doc.id)
  }

  const handleDeleteDoc = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    deleteMutation.mutate(docId)
  }

  const handleTitleInput = useCallback(() => {
    if (!titleRef.current || !selectedDoc) return
    const newTitle = titleRef.current.innerText.trim() || 'Untitled'
    if (activePageId) updatePageTitle(activePageId, newTitle)
    scheduleSave(selectedDoc.id, newTitle)
  }, [selectedDoc, activePageId, updatePageTitle, scheduleSave])

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current || !selectedDoc) return
    const html = editorRef.current.innerHTML
    setLocalContent((prev) => ({ ...prev, [selectedDoc.id]: html }))
    scheduleSave(selectedDoc.id, undefined, html)
  }, [selectedDoc, scheduleSave])

  const execFormat = (cmd: string) => {
    if (cmd === 'h1') {
      document.execCommand('formatBlock', false, 'h1')
    } else if (cmd === 'h2') {
      document.execCommand('formatBlock', false, 'h2')
    } else if (cmd === 'code') {
      document.execCommand('formatBlock', false, 'pre')
    } else {
      document.execCommand(cmd, false)
    }
    editorRef.current?.focus()
  }

  const editorHtml = selectedDoc ? (localContent[selectedDoc.id] ?? '') : ''
  const updatedAt = selectedDoc
    ? new Date(selectedDoc.updatedAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — document list */}
      <div className="flex w-64 min-w-[16rem] shrink-0 flex-col overflow-hidden border-r border-notion-border/50 bg-notion-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-notion-border/50 p-[5px]">
          <span className="text-sm font-semibold text-notion-text">Documents</span>
          <button
            type="button"
            onClick={handleNewDoc}
            title="New document"
            disabled={!activeWorkspaceId}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-notion-text-tertiary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Doc list */}
        <div className="m-[5px] flex-1 space-y-0.5 overflow-y-auto p-[5px]">
          {isLoading ? (
            <div className="space-y-1 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded-md bg-notion-sidebar-hover" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <AlertCircle className="h-6 w-6 text-notion-text-tertiary" />
              <p className="text-xs text-notion-text-tertiary">Failed to load documents</p>
            </div>
          ) : !docs || docs.length === 0 ? (
            <p className="py-4 text-center text-xs text-notion-text-tertiary">
              No documents yet — create one above
            </p>
          ) : (
            docs.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectDoc(doc)}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors',
                  doc.id === selectedDocId
                    ? 'bg-notion-sidebar-hover text-notion-text'
                    : 'text-notion-text-secondary hover:bg-notion-sidebar-hover/60 hover:text-notion-text'
                )}
              >
                <FileText className="h-4 w-4 shrink-0 opacity-60" />
                <span className="flex-1 truncate text-sm leading-snug">{doc.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteDoc(e, doc.id)}
                  className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-notion-text-tertiary hover:text-notion-red group-hover:flex"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel — editor */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-notion-bg">
        {!activeWorkspaceId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <FileText className="h-10 w-10 text-notion-text-tertiary" />
            <p className="text-sm text-notion-text-secondary">No workspace selected</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
          </div>
        ) : !selectedDoc ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <FileText className="h-10 w-10 text-notion-text-tertiary" />
            <p className="text-sm text-notion-text-secondary">No document selected</p>
            <p className="text-xs text-notion-text-tertiary">
              Select a document from the sidebar or create a new one
            </p>
          </div>
        ) : (
          <>
            {/* Formatting toolbar */}
            <div className="flex min-h-10 items-center gap-1 border-b border-notion-border/50 bg-notion-sidebar px-5 py-2.5">
              {TOOLBAR_ACTIONS.map(({ cmd, icon: Icon, title }) => (
                <button
                  key={cmd}
                  type="button"
                  title={title}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    execFormat(cmd)
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-notion-text-tertiary">Edited {updatedAt}</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-notion-text-tertiary hover:bg-notion-sidebar-hover"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto p-[5px]">
              <div className="mx-auto max-w-3xl px-14 py-14 md:px-20 md:py-16">
                {/* Editable title */}
                <div
                  ref={titleRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleTitleInput}
                  className={cn(
                    'mb-6 text-4xl font-bold text-notion-text outline-none',
                    'empty:before:text-notion-text-tertiary empty:before:content-["Untitled"]'
                  )}
                  style={{ minHeight: '1.2em' }}
                  key={`title-${selectedDoc.id}`}
                  dangerouslySetInnerHTML={{ __html: selectedDoc.title }}
                />

                {/* Editable body */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  className={cn(
                    'min-h-[400px] text-sm leading-relaxed text-notion-text outline-none',
                    'empty:before:text-notion-text-tertiary empty:before:content-["Start_writing,_or_press_//_for_commands…"]',
                    '[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-notion-text',
                    '[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-notion-text',
                    '[&_p]:mb-2 [&_p]:leading-relaxed',
                    '[&_ul]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc',
                    '[&_ol]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal',
                    '[&_li]:mb-0.5',
                    '[&_strong]:font-semibold',
                    '[&_em]:italic',
                    '[&_u]:underline',
                    '[&_pre]:mb-2 [&_pre]:rounded [&_pre]:bg-notion-sidebar [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs',
                    '[&_code]:rounded [&_code]:bg-notion-sidebar [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs'
                  )}
                  key={`body-${selectedDoc.id}`}
                  dangerouslySetInnerHTML={{ __html: editorHtml }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
