import {
  Radio,
  Volume2,
  Puzzle,
  Download,
  ChevronRight,
  Activity,
  FileText,
} from 'lucide-react'
import ProjectSelector from './ProjectSelector'
import { useProjectStore, type PanelType } from '@/store/projectStore'

const PANELS: { key: PanelType; label: string; icon: typeof Radio }[] = [
  { key: 'draft', label: '频段草稿', icon: Radio },
  { key: 'noise', label: '噪声层', icon: Volume2 },
  { key: 'verify', label: '解谜校验', icon: Puzzle },
  { key: 'preview', label: '方案预览', icon: FileText },
]

export default function Header() {
  const { activePanel, setActivePanel, getCurrentProject, exportProject } =
    useProjectStore()

  const proj = getCurrentProject()

  const handleExport = () => {
    const data = exportProject()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${proj.projectName || 'radio-puzzle'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentIdx = PANELS.findIndex((p) => p.key === activePanel)

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber animate-signal" />
          <span className="font-mono text-xs text-amber tracking-widest">RADIO PUZZLE</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <ProjectSelector />
      </div>

      <nav className="flex items-center gap-1">
        {PANELS.map(({ key, label, icon: Icon }) => {
          const isActive = activePanel === key
          return (
            <button
              key={key}
              onClick={() => setActivePanel(key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-mono tracking-wide
                transition-all duration-200
                ${isActive
                  ? 'bg-amber/15 text-amber glow-amber'
                  : 'text-muted hover:text-fgdim hover:bg-panel'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-mono text-xs text-fgdim">
          {PANELS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= currentIdx ? 'bg-amber' : 'bg-border'
              }`}
            />
          ))}
          <ChevronRight className="w-3 h-3 text-muted ml-1" />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-mono
            bg-amber/10 text-amber border border-amber/30
            hover:bg-amber/20 hover:border-amber/50 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          导出
        </button>
      </div>
    </header>
  )
}
