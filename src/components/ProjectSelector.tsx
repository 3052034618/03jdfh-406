import { useState, useRef, useEffect } from 'react'
import { FolderOpen, Plus, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'

export default function ProjectSelector() {
  const {
    projects,
    currentProjectId,
    getCurrentProject,
    createProject,
    switchProject,
    renameProject,
    deleteProject,
  } = useProjectStore()

  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentProject = getCurrentProject()
  const projectList = Object.values(projects)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
        setEditingId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  const handleStartRename = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleConfirmRename = (id: string) => {
    if (editingName.trim()) {
      renameProject(id, editingName.trim())
    }
    setEditingId(null)
  }

  const handleDeleteProject = (id: string) => {
    if (projectList.length <= 1) return
    if (confirm('确定要删除这个方案吗？删除后无法恢复。')) {
      deleteProject(id)
      if (currentProjectId === id) {
        setIsOpen(false)
      }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-panel border border-border
          text-sm font-sans text-fg hover:border-amber/40 transition-all duration-200"
      >
        <FolderOpen className="w-4 h-4 text-amber" />
        <span className="max-w-[180px] truncate">{currentProject.projectName}</span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 rounded-sm bg-panel border border-border shadow-2xl z-50">
          <div className="p-2 border-b border-border/50">
            <span className="font-mono text-xs text-fgdim tracking-wide">章节方案</span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {projectList.map((proj) => (
              <div
                key={proj.id}
                className={`px-3 py-2 border-b border-border/30 ${
                  proj.id === currentProjectId ? 'bg-amber/10' : 'hover:bg-surface'
                }`}
              >
                {editingId === proj.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(proj.id)}
                      className="flex-1 px-2 py-1 bg-void border border-amber/40 text-fg text-sm rounded-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleConfirmRename(proj.id)}
                      className="p-1 text-safe-glow hover:bg-safe/10 rounded-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-muted hover:bg-border rounded-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <button
                      onClick={() => {
                        switchProject(proj.id)
                        setIsOpen(false)
                      }}
                      className="flex-1 text-left truncate text-sm font-sans text-fg/90"
                    >
                      {proj.projectName}
                    </button>
                    <button
                      onClick={() => handleStartRename(proj.id, proj.projectName)}
                      className="p-1 text-muted hover:text-amber hover:bg-amber/10 rounded-sm opacity-0 group-hover:opacity-100"
                      title="重命名"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1 text-muted hover:text-danger-glow hover:bg-danger/10 rounded-sm opacity-0 group-hover:opacity-100"
                      title="删除"
                      disabled={projectList.length <= 1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="font-mono text-xs text-muted mt-0.5">
                  更新于 {new Date(proj.updatedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {isCreating ? (
            <div className="p-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  placeholder="输入方案名称…"
                  className="flex-1 px-2 py-1.5 bg-void border border-amber/40 text-fg text-sm rounded-sm focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreateProject}
                  className="p-1.5 text-safe-glow hover:bg-safe/10 rounded-sm"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewProjectName('')
                  }}
                  className="p-1.5 text-muted hover:bg-border rounded-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full px-3 py-2 flex items-center gap-2 text-sm font-sans text-amber
                hover:bg-amber/10 border-t border-border/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建方案
            </button>
          )}
        </div>
      )}
    </div>
  )
}
