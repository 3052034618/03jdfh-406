import { useMemo } from 'react'
import { CloudRain, AudioLines, RotateCcw, Power, AlertTriangle, Eye } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { calculateKeywordMasks, simulateNoisyText } from '@/utils/noiseMasking'

const NOISE_CHANNELS = [
  { key: 'rain' as const, label: '雨声', icon: CloudRain, color: 'text-blue-400' },
  { key: 'whiteNoise' as const, label: '白噪', icon: AudioLines, color: 'text-gray-300' },
  { key: 'reversedVocal' as const, label: '倒放人声', icon: RotateCcw, color: 'text-purple-400' },
  { key: 'powerOutage' as const, label: '断电杂音', icon: Power, color: 'text-red-400' },
]

export default function NoiseLayer() {
  const { segments, noiseConfig, setNoiseConfig } = useProjectStore()

  const keywordMasks = useMemo(
    () => calculateKeywordMasks(segments, noiseConfig),
    [segments, noiseConfig]
  )

  const maskedCount = keywordMasks.filter((m) => m.level === 'masked').length
  const partialCount = keywordMasks.filter((m) => m.level === 'partial').length
  const clearCount = keywordMasks.filter((m) => m.level === 'clear').length

  const hasCriticalMask = keywordMasks.some((m) => m.level === 'masked')

  const simulatedSegments = useMemo(
    () =>
      segments.map((seg) => ({
        id: seg.id,
        index: seg.index,
        simulated: simulateNoisyText(seg.text, seg.keywords, noiseConfig),
      })),
    [segments, noiseConfig]
  )

  return (
    <div className="panel-enter space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <AudioLines className="w-4 h-4 text-amber" />
          <h2 className="font-mono text-lg text-amber tracking-wide">噪声层</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber/30 to-transparent" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <section className="space-y-3">
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">噪声通道</h3>
            <div className="space-y-4">
              {NOISE_CHANNELS.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-sans text-fg">{label}</span>
                    </div>
                    <span className="font-mono text-xs text-amber">
                      {noiseConfig[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={noiseConfig[key]}
                    onChange={(e) =>
                      setNoiseConfig({ [key]: Number(e.target.value) })
                    }
                    className="w-full slider-amber appearance-none bg-transparent cursor-pointer"
                  />
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber/50 transition-all duration-150"
                      style={{ width: `${noiseConfig[key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">关键词状态</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-sm bg-danger/10 border border-danger/20">
                <div className="font-mono text-lg text-danger-glow">{maskedCount}</div>
                <div className="text-xs text-danger">遮蔽</div>
              </div>
              <div className="p-2 rounded-sm bg-warn/10 border border-warn/20">
                <div className="font-mono text-lg text-warn-glow">{partialCount}</div>
                <div className="text-xs text-warn">部分</div>
              </div>
              <div className="p-2 rounded-sm bg-safe/10 border border-safe/20">
                <div className="font-mono text-lg text-safe-glow">{clearCount}</div>
                <div className="text-xs text-safe">可辨</div>
              </div>
            </div>
          </section>

          {hasCriticalMask && (
            <div className="flex items-start gap-2 p-3 rounded-sm bg-danger/10 border border-danger/30">
              <AlertTriangle className="w-4 h-4 text-danger-glow flex-shrink-0 mt-0.5" />
              <div className="text-xs text-danger-glow font-sans leading-relaxed">
                部分关键词被高度遮蔽，玩家可能无法获取核心线索。建议降低噪声强度或调整广播文本。
              </div>
            </div>
          )}
        </div>

        <div className="col-span-8 space-y-4">
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber" />
              <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">关键词遮蔽预警</h3>
            </div>
            {segments.length === 0 ? (
              <div className="terminal-text text-sm text-muted border border-border rounded-sm bg-void/50 p-6 text-center">
                请先在"频段草稿"中生成广播文本
              </div>
            ) : (
              <div className="space-y-2">
                {segments.map((seg) => {
                  const segKeywords = keywordMasks.filter((m) =>
                    seg.keywords.includes(m.keyword)
                  )
                  return (
                    <div
                      key={seg.id}
                      className="border border-border rounded-sm bg-void/50 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-amber">
                          CH-{String(seg.index).padStart(2, '0')}
                        </span>
                        <div className="flex gap-1">
                          {segKeywords.map((m) => (
                            <span
                              key={m.keyword}
                              className={`px-1.5 py-0.5 text-xs font-mono rounded-sm ${
                                m.level === 'masked'
                                  ? 'keyword-masked'
                                  : m.level === 'partial'
                                  ? 'keyword-partial'
                                  : 'keyword-clear'
                              }`}
                            >
                              {m.keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-sans text-fg/80 leading-relaxed">
                        {seg.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">模拟试听</h3>
            {simulatedSegments.length === 0 ? (
              <div className="terminal-text text-sm text-muted border border-border rounded-sm bg-void/50 p-6 text-center">
                生成广播文本后可模拟试听效果
              </div>
            ) : (
              <div className="space-y-2">
                {simulatedSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="border border-border rounded-sm bg-void/50 p-3 terminal-text"
                  >
                    <div className="flex items-center mb-2">
                      <span className="font-mono text-xs text-amber">
                        CH-{String(seg.index).padStart(2, '0')} 模拟输出
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {seg.simulated.map((c, i) => (
                        <span
                          key={i}
                          className={
                            c.masked ? 'text-danger-glow' : 'text-fg/60'
                          }
                        >
                          {c.char}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
