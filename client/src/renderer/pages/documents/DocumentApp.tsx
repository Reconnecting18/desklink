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
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'

interface Doc {
  id: string
  title: string
  content: string
  updatedAt: string
}

const INITIAL_DOCS: Doc[] = [
  {
    id: 'doc-1',
    title: 'Welcome to Documents',
    content: `<h1>Welcome to Documents</h1><p>This is your rich text workspace. Click anywhere to start editing.</p><p>Use the toolbar above to format your text with <strong>bold</strong>, <em>italic</em>, headings, lists, and more.</p><h2>Getting Started</h2><ul><li>Click the <strong>+ New Document</strong> button to create a new doc</li><li>Select any document from the sidebar to open it</li><li>Use the formatting toolbar to style your content</li></ul><p>Your documents are saved automatically as you type.</p>`,
    updatedAt: 'Just now'
  },
  {
    id: 'doc-2',
    title: 'Meeting Notes — Q2 Planning',
    content: `<h1>Meeting Notes — Q2 Planning</h1><p><em>Date: March 27, 2026 · Attendees: Alex, Jordan, Sam</em></p><h2>Agenda</h2><ul><li>Review Q1 outcomes</li><li>Set Q2 priorities</li><li>Assign owners</li></ul><h2>Key Decisions</h2><p>The team agreed to focus on three core initiatives this quarter:</p><ol><li>Launch the new onboarding flow</li><li>Improve performance on the dashboard</li><li>Ship the mobile app beta</li></ol><h2>Action Items</h2><ul><li><strong>Alex</strong> — Draft onboarding spec by April 3</li><li><strong>Jordan</strong> — Performance audit by April 5</li><li><strong>Sam</strong> — Mobile beta plan by April 7</li></ul>`,
    updatedAt: '2 hours ago'
  },
  {
    id: 'doc-3',
    title: 'Product Spec: Auth Flow',
    content: `<h1>Product Spec: Auth Flow</h1><p>This document outlines the authentication flow for DeskLink v1.0.</p><h2>Overview</h2><p>Users can sign up and log in using email/password. JWT tokens are used for session management with refresh token rotation.</p><h2>Requirements</h2><ul><li>Email + password registration</li><li>Login with remember me option</li><li>Password reset via email</li><li>Session timeout after 30 days of inactivity</li></ul><h2>Technical Notes</h2><p>Access tokens expire after 15 minutes. Refresh tokens are rotated on each use and expire after 30 days.</p><code>POST /auth/login\nPOST /auth/register\nPOST /auth/refresh\nPOST /auth/logout</code>`,
    updatedAt: 'Yesterday'
  }
]

let _nextDocId = 4

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
  const { activePageId, updatePageTitle, pendingDocumentAction, clearPendingDocumentAction, activeApp } =
    useUIStore()
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS)
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1')
  const editorRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  const selectedDoc = docs.find((d) => d.id === selectedDocId) ?? docs[0]

  const handleNewDoc = useCallback(() => {
    const id = `doc-${_nextDocId++}`
    const newDoc: Doc = {
      id,
      title: 'Untitled',
      content: '<h1>Untitled</h1><p></p>',
      updatedAt: 'Just now'
    }
    setDocs((prev) => [newDoc, ...prev])
    setSelectedDocId(id)
    if (activePageId) updatePageTitle(activePageId, 'Untitled')
  }, [activePageId, updatePageTitle])

  useEffect(() => {
    if (activeApp !== 'documents' || pendingDocumentAction !== 'new') return
    handleNewDoc()
    clearPendingDocumentAction()
  }, [activeApp, pendingDocumentAction, handleNewDoc, clearPendingDocumentAction])

  const handleSelectDoc = (doc: Doc) => {
    // Save current editor content before switching
    if (editorRef.current && selectedDoc) {
      const html = editorRef.current.innerHTML
      setDocs((prev) =>
        prev.map((d) => (d.id === selectedDoc.id ? { ...d, content: html, updatedAt: 'Just now' } : d))
      )
    }
    setSelectedDocId(doc.id)
  }

  const handleDeleteDoc = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    if (docs.length <= 1) return
    const remaining = docs.filter((d) => d.id !== docId)
    setDocs(remaining)
    if (selectedDocId === docId) {
      setSelectedDocId(remaining[0].id)
    }
  }

  const handleTitleInput = useCallback(() => {
    if (!titleRef.current || !selectedDoc) return
    const newTitle = titleRef.current.innerText.trim() || 'Untitled'
    setDocs((prev) =>
      prev.map((d) => (d.id === selectedDoc.id ? { ...d, title: newTitle, updatedAt: 'Just now' } : d))
    )
    if (activePageId) updatePageTitle(activePageId, newTitle)
  }, [selectedDoc, activePageId, updatePageTitle])

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current || !selectedDoc) return
    const html = editorRef.current.innerHTML
    setDocs((prev) =>
      prev.map((d) => (d.id === selectedDoc.id ? { ...d, content: html, updatedAt: 'Just now' } : d))
    )
  }, [selectedDoc])

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

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — document list */}
      <div className="flex w-56 shrink-0 flex-col border-r border-notion-border bg-notion-sidebar overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-notion-border px-3 py-2.5">
          <span className="text-xs font-semibold text-notion-text">Documents</span>
          <button
            type="button"
            onClick={handleNewDoc}
            title="New document"
            className="flex h-6 w-6 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover hover:text-notion-text transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Doc list */}
        <div className="flex-1 overflow-y-auto py-1">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => handleSelectDoc(doc)}
              className={cn(
                'group flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors',
                doc.id === selectedDocId
                  ? 'bg-notion-sidebar-hover text-notion-text'
                  : 'text-notion-text-secondary hover:bg-notion-sidebar-hover/60 hover:text-notion-text'
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="flex-1 truncate text-xs">{doc.title}</span>
              <button
                type="button"
                onClick={(e) => handleDeleteDoc(e, doc.id)}
                className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-notion-text-tertiary hover:text-notion-red group-hover:flex"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — editor */}
      <div className="flex flex-1 flex-col overflow-hidden bg-notion-bg">
        {selectedDoc && (
          <>
            {/* Formatting toolbar */}
            <div className="flex items-center gap-0.5 border-b border-notion-border bg-notion-sidebar px-4 py-1.5">
              {TOOLBAR_ACTIONS.map(({ cmd, icon: Icon, title }) => (
                <button
                  key={cmd}
                  type="button"
                  title={title}
                  onMouseDown={(e) => {
                    e.preventDefault() // prevent losing focus
                    execFormat(cmd)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded text-notion-text-secondary transition-colors hover:bg-notion-sidebar-hover hover:text-notion-text"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1">
                <span className="text-[11px] text-notion-text-tertiary">
                  Edited {selectedDoc.updatedAt}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded text-notion-text-tertiary hover:bg-notion-sidebar-hover"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-16 py-12">
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
                    // Prose styles for rendered HTML
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
                  dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
