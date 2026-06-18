import { useEffect, useMemo } from 'react'
import { CloudRain, AudioLines, RotateCcw, Power, AlertTriangle, Eye } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { calculateAllSegmentMasks, getGlobalAudibleFragments } from '@/utils/noiseMasking'

const NOISE_CHANNELS = [
  { key: 'rain' as const, label: '雨声', icon: CloudRain, color: 'text-blue-400' },
  { key: 'whiteNoise' as const, label: '白噪', icon: AudioLines, color: 'text-gray-300' },
  { key: 'reversedVocal' as const, label: '倒放人声', icon: RotateCcw, color: 'text-purple-400' },
  { key: 'powerOutage' as const, label: '断电杂音', icon: Power, color: 'text-red-400' },
]

export default function NoiseLayer() {
  const { getCurrentProject, setNoiseConfig, setSegmentMasks } = useProjectStore()
  const proj = getCurrentProject()

  useEffect(() => {
    if (proj.segments.length > 0) {
      const masks = calculateAllSegmentMasks(proj.segments, proj.noiseConfig)
      setSegmentMasks(masks)
    }
  }, [proj.segments, proj.noiseConfig, setSegmentMasks])

  const stats = useMemo(() => {
    const { clear, partial, masked } = getGlobalAudibleFragments(proj.segmentMasks)
    const allMasks = proj.segmentMasks.flatMap((sm) => sm.masks)
    return {
      clear: clear.length,
      partial: partial.length,
      masked: masked.length,
      total: allMasks.length,
      hasCritical: masked.length > 0,
    }
  }, [proj.segmentMasks])

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
                      {proj.noiseConfig[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={proj.noiseConfig[key]}
                    onChange={(e) =>
                      setNoiseConfig({ [key]: Number(e.target.value) })
                    }
                    className="w-full slider-amber appearance-none bg-transparent cursor-pointer"
                  />
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber/50 transition-all duration-150"
                      style={{ width: `${proj.noiseConfig[key]}%` }}
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
                <div className="font-mono text-lg text-danger-glow">{stats.masked}</div>
                <div className="text-xs text-danger">遮蔽</div>
              </div>
              <div className="p-2 rounded-sm bg-warn/10 border border-warn/20">
                <div className="font-mono text-lg text-warn-glow">{stats.partial}</div>
                <div className="text-xs text-warn">部分</div>
              </div>
              <div className="p-2 rounded-sm bg-safe/10 border border-safe/20">
                <div className="font-mono text-lg text-safe-glow">{stats.clear}</div>
                <div className="text-xs text-safe">可辨</div>
              </div>
            </div>
          </section>

          {stats.hasCritical && (
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
            {proj.segments.length === 0 ? (
              <div className="terminal-text text-sm text-muted border border-border rounded-sm bg-void/50 p-6 text-center">
                请先在"频段草稿"中生成广播文本
              </div>
            ) : (
              <div className="space-y-2">
                {proj.segments.map((seg) => {
                  const segMask = proj.segmentMasks.find(
                    (sm) => sm.segmentId === seg.id
                  )
                  const segKeywords = segMask?.masks || []
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
                          {segKeywords.length > 0 ? (
                            segKeywords.map((m) => (
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
                                <span className="ml-1 opacity-60">
                                  {Math.round(m.probability * 100)}%
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-mono text-muted">无匹配关键词</span>
                          )}
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
            {proj.segmentMasks.length === 0 ? (
              <div className="terminal-text text-sm text-muted border border-border rounded-sm bg-void/50 p-6 text-center">
                生成广播文本后可模拟试听效果
              </div>
            ) : (
              <div className="space-y-2">
                {proj.segmentMasks.map((sm) => (
                  <div
                    key={sm.segmentId}
                    className="border border-border rounded-sm bg-void/50 p-3 terminal-text"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-amber">
                        CH-{String(sm.segmentIndex).padStart(2, '0')} 模拟输出
                      </span>
                      {sm.audibleFragments.length > 0 && (
                        <div className="flex gap-1">
                          <span className="text-xs font-mono text-muted">可闻:</span>
                          {sm.audibleFragments.map((f, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 text-xs font-mono bg-safe/15 text-safe-glow rounded-sm"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-fg/70">
                      {sm.simulatedText}
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
