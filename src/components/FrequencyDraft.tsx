import { useState } from 'react'
import {
  Building2,
  Car,
  TrainTrack,
  Waves,
  TreePine,
  PenLine,
  Sparkles,
  Zap,
} from 'lucide-react'
import {
  useProjectStore,
  SCENE_LABELS,
  TONE_LABELS,
  ERA_LABELS,
  type SceneLocation,
  type BroadcastTone,
} from '@/store/projectStore'

const SCENE_ICONS: Record<SceneLocation, typeof Building2> = {
  abandoned_hospital: Building2,
  midnight_highway: Car,
  underground_station: TrainTrack,
  lighthouse: Waves,
  cabin: TreePine,
  custom: PenLine,
}

const SCENES: SceneLocation[] = [
  'abandoned_hospital',
  'midnight_highway',
  'underground_station',
  'lighthouse',
  'cabin',
  'custom',
]

const TONES: BroadcastTone[] = [
  'official',
  'personal',
  'emergency',
  'mechanical',
  'ritual',
]

const ERA_VALUES = [1960, 1970, 1980, 1990, 2000, 2010, 2020]

export default function FrequencyDraft() {
  const {
    getCurrentProject,
    setSceneLocation,
    setCustomSceneName,
    setEra,
    setBroadcastTone,
    setInterferenceLevel,
    setPlayerClues,
    generateSegments,
    updateSegment,
  } = useProjectStore()

  const proj = getCurrentProject()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      generateSegments()
      setIsGenerating(false)
    }, 600)
  }

  return (
    <div className="panel-enter space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber" />
          <h2 className="font-mono text-lg text-amber tracking-wide">频段草稿</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber/30 to-transparent" />
      </div>

      <section className="space-y-3">
        <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">场景位置</h3>
        <div className="grid grid-cols-3 gap-2">
          {SCENES.map((scene) => {
            const Icon = SCENE_ICONS[scene]
            const isActive = proj.sceneLocation === scene
            return (
              <button
                key={scene}
                onClick={() => setSceneLocation(scene)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-200
                  ${isActive
                    ? 'border-amber/60 bg-amber/10 text-amber glow-amber'
                    : 'border-border bg-panel/50 text-fgdim hover:border-amber/30 hover:text-fg'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-sans">{SCENE_LABELS[scene]}</span>
              </button>
            )
          })}
        </div>
        {proj.sceneLocation === 'custom' && (
          <input
            type="text"
            value={proj.customSceneName}
            onChange={(e) => setCustomSceneName(e.target.value)}
            placeholder="输入自定义场景名称…"
            className="w-full px-4 py-2 rounded-sm bg-panel border border-border text-fg text-sm
              placeholder:text-muted focus:border-amber/50"
          />
        )}
      </section>

      <div className="grid grid-cols-3 gap-4">
        <section className="space-y-2">
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">年代感</h3>
          <div className="relative">
            <input
              type="range"
              min={1960}
              max={2020}
              step={10}
              value={proj.era}
              onChange={(e) => setEra(Number(e.target.value))}
              className="w-full slider-amber appearance-none bg-transparent cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              {ERA_VALUES.map((v) => (
                <span
                  key={v}
                  className={`text-xs font-mono ${v === proj.era ? 'text-amber' : 'text-muted'}`}
                >
                  {ERA_LABELS[v]}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">播报口吻</h3>
          <div className="space-y-1">
            {TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => setBroadcastTone(tone)}
                className={`
                  w-full text-left px-3 py-1.5 rounded-sm text-sm font-sans transition-all duration-150
                  ${proj.broadcastTone === tone
                    ? 'bg-amber/15 text-amber border border-amber/30'
                    : 'text-fgdim hover:bg-panel hover:text-fg border border-transparent'
                  }
                `}
              >
                {TONE_LABELS[tone]}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">干扰强度</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setInterferenceLevel(level)}
                className={`
                  flex-1 py-2 rounded-sm text-sm font-mono transition-all duration-150
                  ${proj.interferenceLevel >= level
                    ? 'bg-amber/20 text-amber border border-amber/40'
                    : 'bg-panel text-muted border border-border hover:text-fgdim'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs font-mono text-muted">
            <span>完整</span>
            <span>碎片</span>
          </div>
        </section>
      </div>

      <section className="space-y-2">
        <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">玩家已知线索</h3>
        <textarea
          value={proj.playerClues}
          onChange={(e) => setPlayerClues(e.target.value)}
          placeholder="输入玩家在进入谜题前已掌握的信息，多个线索用逗号分隔…"
          rows={2}
          className="w-full px-4 py-3 rounded-sm bg-panel border border-border text-fg text-sm font-sans
            placeholder:text-muted resize-none focus:border-amber/50"
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">广播文本</h3>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-mono
              border transition-all duration-200
              ${isGenerating
                ? 'bg-amber/5 border-amber/20 text-amber/50 cursor-wait'
                : 'bg-amber/10 border-amber/40 text-amber hover:bg-amber/20 hover:border-amber/60'
              }
            `}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中…' : '生成广播'}
          </button>
        </div>

        {proj.segments.length === 0 ? (
          <div className="terminal-text text-sm text-muted border border-border rounded-sm bg-void/50 p-6 text-center">
            <span className="cursor-blink">配置参数后点击"生成广播"</span>
          </div>
        ) : (
          <div className="space-y-2">
            {proj.segments.map((seg) => (
              <div
                key={seg.id}
                className="border border-border rounded-sm bg-void/50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-1 bg-panel/50 border-b border-border">
                  <span className="font-mono text-xs text-amber">
                    CH-{String(seg.index).padStart(2, '0')}
                  </span>
                  <div className="flex gap-1">
                    {seg.keywords.slice(0, 4).map((kw) => (
                      <span
                        key={kw}
                        className="px-1.5 py-0.5 text-xs font-mono bg-amber/10 text-amber/80 rounded-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <textarea
                  value={seg.text}
                  onChange={(e) => updateSegment(seg.id, e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-transparent terminal-text text-sm text-fg/90
                    resize-none focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
