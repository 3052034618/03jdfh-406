import {
  FileText,
  MapPin,
  Calendar,
  Radio,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  Users,
  Mic,
  Lightbulb,
  Eye,
  Clock,
} from 'lucide-react'
import {
  useProjectStore,
  SCENE_LABELS,
  TONE_LABELS,
  ERA_LABELS,
  type KeywordMaskStatus,
} from '@/store/projectStore'

function MaskStatusBadge({ level }: { level: KeywordMaskStatus['level'] }) {
  const config = {
    masked: {
      label: '完全屏蔽',
      className: 'bg-danger/20 text-danger-glow border-danger/40',
    },
    partial: {
      label: '部分可闻',
      className: 'bg-warn/20 text-warn-glow border-warn/40',
    },
    clear: {
      label: '清晰可辨',
      className: 'bg-safe/20 text-safe-glow border-safe/40',
    },
  }
  const { label, className } = config[level]
  return (
    <span className={`px-1.5 py-0.5 text-xs font-mono rounded-sm border ${className}`}>
      {label}
    </span>
  )
}

export default function SolutionPreview() {
  const { getCurrentProject, exportProject } = useProjectStore()
  const proj = getCurrentProject()
  const exported = exportProject() as Record<string, unknown>

  const allMasks = proj.segmentMasks.flatMap((sm) => sm.masks)
  const maskedCount = allMasks.filter((m) => m.level === 'masked').length
  const partialCount = allMasks.filter((m) => m.level === 'partial').length
  const clearCount = allMasks.filter((m) => m.level === 'clear').length

  const correctPaths = proj.reasoningPaths.filter((rp) => rp.isCorrect).length
  const misleadingPaths = proj.reasoningPaths.filter((rp) => !rp.isCorrect).length

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="panel-enter space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber" />
          <h2 className="font-mono text-lg text-amber tracking-wide">方案预览</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber/30 to-transparent" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-border rounded-sm bg-panel/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-amber" />
            <span className="font-mono text-xs text-fgdim tracking-widest uppercase">场景</span>
          </div>
          <p className="text-lg font-sans text-fg">
            {proj.sceneLocation === 'custom'
              ? proj.customSceneName || '自定义场景'
              : SCENE_LABELS[proj.sceneLocation]}
          </p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 text-xs font-mono bg-surface text-fgdim rounded-sm">
              {ERA_LABELS[proj.era]}
            </span>
            <span className="px-2 py-0.5 text-xs font-mono bg-surface text-fgdim rounded-sm">
              {TONE_LABELS[proj.broadcastTone]}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-sm bg-panel/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-amber" />
            <span className="font-mono text-xs text-fgdim tracking-widest uppercase">干扰等级</span>
          </div>
          <p className="text-lg font-sans text-fg">LEVEL {proj.interferenceLevel}</p>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-sm ${
                  proj.interferenceLevel >= level ? 'bg-amber' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="border border-border rounded-sm bg-panel/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-amber" />
            <span className="font-mono text-xs text-fgdim tracking-widest uppercase">广播片段</span>
          </div>
          <p className="text-lg font-sans text-fg">{proj.segments.length} 条</p>
          <div className="flex items-center gap-3 mt-2 text-xs font-mono">
            <span className="text-safe-glow">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              关键词 {allMasks.length}
            </span>
            <span className="text-danger-glow">
              <XCircle className="w-3 h-3 inline mr-1" />
              屏蔽 {maskedCount}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-sm bg-panel/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-amber" />
            <span className="font-mono text-xs text-fgdim tracking-widest uppercase">解谜路径</span>
          </div>
          <p className="text-lg font-sans text-fg">
            {correctPaths} 正确 / {misleadingPaths} 误导
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-mono">
            <span className="text-safe-glow">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              答案: {proj.correctAnswer ? '已设置' : '未设置'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <Calendar className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">项目信息</h3>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <span className="text-xs font-mono text-muted">项目名称</span>
              <p className="text-sm text-fg">{proj.projectName || '未命名项目'}</p>
            </div>
            <div>
              <span className="text-xs font-mono text-muted">项目ID</span>
              <p className="text-sm font-mono text-fgdim">{proj.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-xs font-mono text-muted">
                创建: {formatDate(proj.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-xs font-mono text-muted">
                更新: {formatDate(proj.updatedAt)}
              </span>
            </div>
          </div>
        </section>

        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <Lightbulb className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">玩家线索</h3>
          </div>
          <div className="p-4">
            {proj.playerClues ? (
              <div className="terminal-text text-sm text-fg/90 bg-void/50 border border-border rounded-sm p-3">
                {proj.playerClues.split(/[,，、\s]+/).filter(Boolean).map((clue, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 mr-2 mb-1 bg-amber/10 text-amber/80 rounded-sm"
                  >
                    {clue}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">未设置玩家线索</p>
            )}
          </div>
        </section>

        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <AlertTriangle className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">噪声配置</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { key: 'rain', label: '雨声' },
              { key: 'whiteNoise', label: '白噪' },
              { key: 'reversedVocal', label: '倒放人声' },
              { key: 'powerOutage', label: '断电失真' },
            ].map(({ key, label }) => {
              const value = proj.noiseConfig[key as keyof typeof proj.noiseConfig]
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-fgdim">{label}</span>
                    <span className="font-mono text-amber">{value}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber/dim to-amber transition-all"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
          <Mic className="w-4 h-4 text-amber" />
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">广播文本概览</h3>
        </div>
        <div className="divide-y divide-border">
          {proj.segments.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              暂无广播片段，请先在"频段草稿"中生成
            </div>
          ) : (
            proj.segments.map((seg) => {
              const mask = proj.segmentMasks.find((sm) => sm.segmentId === seg.id)
              return (
                <div key={seg.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-amber">
                      CH-{String(seg.index).padStart(2, '0')}
                    </span>
                    <div className="flex gap-1">
                      {seg.keywords.slice(0, 5).map((kw) => (
                        <span
                          key={kw}
                          className="px-1.5 py-0.5 text-xs font-mono bg-amber/10 text-amber/80 rounded-sm"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="terminal-text text-sm text-fg/90 bg-void/50 border border-border rounded-sm p-3 mb-2">
                    {seg.text}
                  </p>
                  {mask && (
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-fgdim">模拟传输后文本：</p>
                      <p className="terminal-text text-sm text-fg/70 bg-void/30 border border-border/50 rounded-sm p-3">
                        {mask.simulatedText}
                      </p>
                      {mask.masks.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mask.masks.map((m, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-xs font-mono text-fgdim">{m.keyword}</span>
                              <MaskStatusBadge level={m.level} />
                              <span className="text-xs font-mono text-muted">
                                {m.probability}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {mask.audibleFragments.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-mono text-fgdim">可闻片段：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mask.audibleFragments.map((frag, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 text-xs font-mono bg-safe/15 text-safe-glow rounded-sm"
                              >
                                {frag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <CheckCircle2 className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">解谜设置</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <span className="text-xs font-mono text-muted block mb-1">正确答案</span>
              <div className="terminal-text text-sm text-safe-glow bg-safe/10 border border-safe/30 rounded-sm p-3">
                {proj.correctAnswer || <span className="text-muted italic">未设置</span>}
              </div>
            </div>
            <div>
              <span className="text-xs font-mono text-muted block mb-1">误导答案 ({proj.misleadingAnswers.length})</span>
              <div className="space-y-1">
                {proj.misleadingAnswers.length === 0 ? (
                  <p className="text-sm text-muted italic">未设置误导答案</p>
                ) : (
                  proj.misleadingAnswers.map((ans, i) => (
                    <div
                      key={i}
                      className="terminal-text text-sm text-danger-glow bg-danger/10 border border-danger/30 rounded-sm p-2"
                    >
                      {ans}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <Brain className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">推理路径</h3>
          </div>
          <div className="p-4">
            {proj.reasoningPaths.length === 0 ? (
              <p className="text-sm text-muted italic text-center py-4">
                暂无推理路径，请先在"解谜校验"中生成
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {proj.reasoningPaths.map((rp) => (
                  <div
                    key={rp.id}
                    className={`border rounded-sm p-3 ${
                      rp.isCorrect
                        ? 'border-safe/40 bg-safe/5'
                        : 'border-danger/40 bg-danger/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rp.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-safe-glow" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger-glow" />
                        )}
                        <span className={`text-sm font-sans ${rp.isCorrect ? 'text-safe-glow' : 'text-danger-glow'}`}>
                          {rp.conclusion}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted">
                        难度 {rp.difficulty}/5
                      </span>
                    </div>
                    {rp.fragments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rp.fragments.map((frag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 text-xs font-mono bg-amber/10 text-amber/80 rounded-sm"
                          >
                            {frag}
                          </span>
                        ))}
                      </div>
                    )}
                    <ol className="text-xs text-fgdim space-y-1">
                      {rp.steps.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-mono text-muted">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                      {rp.steps.length > 3 && (
                        <li className="text-muted italic">... 共 {rp.steps.length} 步</li>
                      )}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
          <Users className="w-4 h-4 text-amber" />
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">各部门备注</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber" />
              <span className="font-mono text-xs text-amber tracking-widest">DESIGNER</span>
            </div>
            <p className="text-sm text-fg/80 leading-relaxed">
              {(exported.reviewerNotes as { forDesigner: string })?.forDesigner || '暂无备注'}
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-safe-glow" />
              <span className="font-mono text-xs text-safe-glow tracking-widest">NARRATIVE</span>
            </div>
            <p className="text-sm text-fg/80 leading-relaxed">
              {(exported.reviewerNotes as { forNarrative: string })?.forNarrative || '暂无备注'}
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-danger-glow" />
              <span className="font-mono text-xs text-danger-glow tracking-widest">AUDIO</span>
            </div>
            <p className="text-sm text-fg/80 leading-relaxed">
              {(exported.reviewerNotes as { forAudio: string })?.forAudio || '暂无备注'}
            </p>
          </div>
        </div>
      </section>

      {allMasks.length > 0 && (
        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <FileText className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">关键词屏蔽统计</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-danger/10 border border-danger/30 rounded-sm">
                <p className="text-3xl font-mono text-danger-glow">{maskedCount}</p>
                <p className="text-xs font-mono text-danger-glow/80 mt-1">完全屏蔽</p>
              </div>
              <div className="text-center p-3 bg-warn/10 border border-warn/30 rounded-sm">
                <p className="text-3xl font-mono text-warn-glow">{partialCount}</p>
                <p className="text-xs font-mono text-warn-glow/80 mt-1">部分可闻</p>
              </div>
              <div className="text-center p-3 bg-safe/10 border border-safe/30 rounded-sm">
                <p className="text-3xl font-mono text-safe-glow">{clearCount}</p>
                <p className="text-xs font-mono text-safe-glow/80 mt-1">清晰可辨</p>
              </div>
            </div>
            <div className="h-4 bg-border rounded-sm overflow-hidden flex">
              {maskedCount > 0 && (
                <div
                  className="h-full bg-danger-glow transition-all"
                  style={{ width: `${(maskedCount / allMasks.length) * 100}%` }}
                />
              )}
              {partialCount > 0 && (
                <div
                  className="h-full bg-warn-glow transition-all"
                  style={{ width: `${(partialCount / allMasks.length) * 100}%` }}
                />
              )}
              {clearCount > 0 && (
                <div
                  className="h-full bg-safe-glow transition-all"
                  style={{ width: `${(clearCount / allMasks.length) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs font-mono text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-danger-glow rounded-full" /> 屏蔽
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-warn-glow rounded-full" /> 部分
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-safe-glow rounded-full" /> 清晰
              </span>
            </div>
          </div>
        </section>
      )}

      {(exported.summary as { allAudibleFragments?: string[] })?.allAudibleFragments?.length > 0 && (
        <section className="border border-border rounded-sm bg-panel/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 border-b border-border">
            <Lightbulb className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">全部可闻片段</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {(exported.summary as { allAudibleFragments: string[] }).allAudibleFragments.map(
                (frag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm font-mono bg-safe/15 text-safe-glow border border-safe/30 rounded-sm"
                  >
                    {frag}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
