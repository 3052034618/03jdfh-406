import { useMemo } from 'react'
import { useProjectStore, SCENE_LABELS, type ProjectState } from '@/store/projectStore'
import { GitCompare, Volume2, CheckCircle2, XCircle, Brain, AlertTriangle, Trophy } from 'lucide-react'

interface ProjectMetrics {
  id: string
  projectName: string
  sceneLabel: string
  noiseConfig: ProjectState['noiseConfig']
  audibleCount: number
  maskedCount: number
  avgDifficulty: number | null
  correctPaths: number
  misleadingPaths: number
  approvedCount: number
  pendingCount: number
  riskCount: number
  score: number
}

const NOISE_KEYS = ['rain', 'whiteNoise', 'reversedVocal', 'powerOutage'] as const
const NOISE_LABELS: Record<string, string> = {
  rain: '雨声',
  whiteNoise: '白噪',
  reversedVocal: '倒放',
  powerOutage: '断电',
}

function computeMetrics(proj: ProjectState): ProjectMetrics {
  const allMasks = proj.segmentMasks.flatMap((sm) => sm.masks)
  const audibleCount = allMasks.filter((m) => m.level === 'clear' || m.level === 'partial').length
  const maskedCount = allMasks.filter((m) => m.level === 'masked').length

  const correctPaths = proj.reasoningPaths.filter((p) => p.isCorrect)
  const misleadingPaths = proj.reasoningPaths.filter((p) => !p.isCorrect)
  const avgDifficulty = correctPaths.length > 0
    ? correctPaths.reduce((sum, p) => sum + p.difficulty, 0) / correctPaths.length
    : null

  const reviewEntries = Object.values(proj.reviewStatus)
  const approvedCount = reviewEntries.filter((s) => s === 'approved').length
  const pendingCount = reviewEntries.filter((s) => s === 'pending').length
  const riskCount = reviewEntries.filter((s) => s === 'risk').length

  const score = audibleCount * 2 - (avgDifficulty ?? 0) - riskCount * 3

  return {
    id: proj.id,
    projectName: proj.projectName,
    sceneLabel: SCENE_LABELS[proj.sceneLocation],
    noiseConfig: proj.noiseConfig,
    audibleCount,
    maskedCount,
    avgDifficulty,
    correctPaths: correctPaths.length,
    misleadingPaths: misleadingPaths.length,
    approvedCount,
    pendingCount,
    riskCount,
    score,
  }
}

function NoiseBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-fgdim">{label}</span>
        <span className="font-mono text-xs text-amber">{value}%</span>
      </div>
      <div className="h-2 bg-border rounded-sm">
        <div className="h-2 bg-amber rounded-sm transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ComparisonBar({
  label,
  values,
  maxVal,
  icon: Icon,
}: {
  label: string
  values: { id: string; value: number; isRecommended: boolean }[]
  maxVal: number
  icon: React.ElementType
}) {
  const safeMax = Math.max(maxVal, 1)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-amber" />
        <span className="font-mono text-xs text-fgdim tracking-wide">{label}</span>
      </div>
      <div className="space-y-1">
        {values.map((v) => (
          <div key={v.id} className="flex items-center gap-2">
            <div className="h-2 bg-border rounded-sm flex-1">
              <div
                className={`h-2 rounded-sm transition-all ${v.isRecommended ? 'bg-amber' : 'bg-amber/40'}`}
                style={{ width: `${(v.value / safeMax) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-fg w-8 text-right">{v.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProjectComparison() {
  const { projects } = useProjectStore()
  const projectList = Object.values(projects)

  const { metrics, recommendedId } = useMemo(() => {
    const metrics = projectList.map(computeMetrics)
    const recommendedId = metrics.length >= 2
      ? metrics.reduce((best, cur) => (cur.score > best.score ? cur : best), metrics[0]).id
      : null
    return { metrics, recommendedId }
  }, [projectList])

  if (projectList.length === 0) {
    return (
      <div className="panel-enter flex flex-col items-center justify-center py-20 text-fgdim">
        <GitCompare className="w-10 h-10 mb-3 text-muted" />
        <p className="font-mono text-sm">没有可比较的方案</p>
      </div>
    )
  }

  if (projectList.length === 1) {
    return (
      <div className="panel-enter flex flex-col items-center justify-center py-20 text-fgdim">
        <GitCompare className="w-10 h-10 mb-3 text-muted" />
        <p className="font-mono text-sm">至少需要两个方案才能进行对比</p>
        <p className="font-mono text-xs text-muted mt-1">请在项目选择器中新建更多方案</p>
      </div>
    )
  }

  const maxAudible = Math.max(...metrics.map((m) => m.audibleCount))
  const maxMasked = Math.max(...metrics.map((m) => m.maskedCount))
  const maxRisk = Math.max(...metrics.map((m) => m.riskCount))
  const maxScore = Math.max(...metrics.map((m) => m.score))
  const minScore = Math.min(...metrics.map((m) => m.score))
  const scoreRange = maxScore - minScore || 1

  return (
    <div className="panel-enter space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-amber" />
          <h2 className="font-mono text-lg text-amber tracking-wide">方案对比</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber/30 to-transparent" />
        <span className="font-mono text-xs text-muted">{metrics.length} 个方案</span>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}>
        {metrics.map((m) => {
          const isRec = m.id === recommendedId
          return (
            <div
              key={m.id}
              className={`relative rounded-sm border p-4 space-y-4 ${
                isRec
                  ? 'bg-amber/5 border-amber/40 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                  : 'bg-panel/30 border-border'
              }`}
            >
              {isRec && (
                <div className="absolute -top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 bg-amber text-void text-xs font-mono font-bold rounded-sm">
                  <Trophy className="w-3 h-3" />
                  推荐
                </div>
              )}

              <div>
                <h3 className="font-sans text-sm text-fg font-semibold truncate">{m.projectName}</h3>
                <span className="font-mono text-xs text-fgdim">{m.sceneLabel}</span>
              </div>

              <div className="space-y-2">
                {NOISE_KEYS.map((key) => (
                  <NoiseBar key={key} value={m.noiseConfig[key]} label={NOISE_LABELS[key]} />
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-safe-glow" />
                  <span className="font-mono text-xs text-fgdim">可听关键词</span>
                  <span className="font-mono text-xs text-safe-glow ml-auto">{m.audibleCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-danger-glow" />
                  <span className="font-mono text-xs text-fgdim">遮蔽关键词</span>
                  <span className="font-mono text-xs text-danger-glow ml-auto">{m.maskedCount}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-amber" />
                  <span className="font-mono text-xs text-fgdim">推理难度</span>
                  <span className="font-mono text-xs text-amber ml-auto">
                    {m.avgDifficulty !== null ? m.avgDifficulty.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-safe-glow" />
                  <span className="font-mono text-xs text-fgdim">正确 / 误导</span>
                  <span className="font-mono text-xs text-fg ml-auto">
                    <span className="text-safe-glow">{m.correctPaths}</span>
                    <span className="text-muted mx-1">/</span>
                    <span className="text-warn-glow">{m.misleadingPaths}</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber" />
                  <span className="font-mono text-xs text-fgdim">审查状态</span>
                </div>
                <div className="flex gap-3 font-mono text-xs">
                  <span className="text-safe-glow">{m.approvedCount} 通过</span>
                  <span className="text-warn-glow">{m.pendingCount} 待审</span>
                  <span className="text-danger-glow">{m.riskCount} 风险</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="font-mono text-xs text-fgdim">综合评分</span>
                <span className="font-mono text-sm text-amber font-bold">{m.score.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-panel/30 border border-border rounded-sm p-5 space-y-5">
        <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">指标对比</h3>

        <ComparisonBar
          label="可听关键词"
          values={metrics.map((m) => ({ id: m.id, value: m.audibleCount, isRecommended: m.id === recommendedId }))}
          maxVal={maxAudible}
          icon={Volume2}
        />

        <ComparisonBar
          label="遮蔽关键词"
          values={metrics.map((m) => ({ id: m.id, value: m.maskedCount, isRecommended: m.id === recommendedId }))}
          maxVal={maxMasked}
          icon={XCircle}
        />

        <ComparisonBar
          label="风险项目数"
          values={metrics.map((m) => ({ id: m.id, value: m.riskCount, isRecommended: m.id === recommendedId }))}
          maxVal={Math.max(maxRisk, 1)}
          icon={AlertTriangle}
        />

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber" />
            <span className="font-mono text-xs text-fgdim tracking-wide">综合评分</span>
          </div>
          <div className="space-y-1">
            {metrics.map((m) => {
              const normalized = ((m.score - minScore) / scoreRange) * 100
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="h-2 bg-border rounded-sm flex-1">
                    <div
                      className={`h-2 rounded-sm transition-all ${m.id === recommendedId ? 'bg-amber' : 'bg-amber/40'}`}
                      style={{ width: `${Math.max(normalized, 4)}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-fg w-12 text-right">{m.score.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
