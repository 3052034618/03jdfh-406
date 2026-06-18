import Header from '@/components/Header'
import FrequencyDraft from '@/components/FrequencyDraft'
import NoiseLayer from '@/components/NoiseLayer'
import PuzzleVerify from '@/components/PuzzleVerify'
import SolutionPreview from '@/components/SolutionPreview'
import { useProjectStore } from '@/store/projectStore'

export default function Home() {
  const { activePanel } = useProjectStore()

  return (
    <div className="min-h-screen bg-void noise-bg text-fg font-sans">
      <div className="crt-overlay" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {activePanel === 'draft' && <FrequencyDraft />}
          {activePanel === 'noise' && <NoiseLayer />}
          {activePanel === 'verify' && <PuzzleVerify />}
          {activePanel === 'preview' && <SolutionPreview />}
        </main>
        <footer className="flex items-center justify-between px-6 py-2 border-t border-border bg-surface/50">
          <span className="font-mono text-xs text-muted">
            RADIO PUZZLE ORCHESTRATOR v1.0
          </span>
          <span className="font-mono text-xs text-muted">
            独立恐怖游戏音频策划工具
          </span>
        </footer>
      </div>
    </div>
  )
}
