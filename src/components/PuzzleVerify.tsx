import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, GitBranch, Plus, Trash2, RefreshCw } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { calculateKeywordMasks } from '@/utils/noiseMasking'
import { generateReasoningPaths } from '@/utils/reasoningPath'

export default function PuzzleVerify() {
  const {
    segments,
    noiseConfig,
    correctAnswer,
    misleadingAnswers,
    setCorrectAnswer,
    addMisleadingAnswer,
    removeMisleadingAnswer,
    reasoningPaths,
    setReasoningPaths,
  } = useProjectStore()

  const [newMisleading, setNewMisleading] = useState('')

  const keywordMasks = useMemo(
    () => calculateKeywordMasks(segments, noiseConfig),
    [segments, noiseConfig]
  )

  const handleAddMisleading = () => {
    if (newMisleading.trim()) {
      addMisleadingAnswer(newMisleading.trim())
      setNewMisleading('')
    }
  }

  const handleGeneratePaths = () => {
    const paths = generateReasoningPaths(keywordMasks, correctAnswer, misleadingAnswers)
    setReasoningPaths(paths)
  }

  const clearKeywords = keywordMasks.filter((m) => m.level === 'clear').map((m) => m.keyword)
  const partialKeywords = keywordMasks.filter((m) => m.level === 'partial').map((m) => m.keyword)
  const maskedKeywords = keywordMasks.filter((m) => m.level === 'masked').map((m) => m.keyword)

  return (
    <div className="panel-enter space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-amber" />
          <h2 className="font-mono text-lg text-amber tracking-wide">解谜校验</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber/30 to-transparent" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-safe-glow" />
              <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">正确答案</h3>
            </div>
            <textarea
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="输入谜题的正确答案…"
              rows={3}
              className="w-full px-4 py-3 rounded-sm bg-panel border border-safe/30 text-fg text-sm font-sans
                placeholder:text-muted resize-none focus:border-safe/60"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-danger-glow" />
              <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">误导答案</h3>
            </div>
            <div className="space-y-2">
              {misleadingAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm bg-danger/10 border border-danger/20"
                >
                  <span className="flex-1 text-sm font-sans text-danger-glow">{answer}</span>
                  <button
                    onClick={() => removeMisleadingAnswer(idx)}
                    className="text-danger/60 hover:text-danger-glow transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMisleading}
                  onChange={(e) => setNewMisleading(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMisleading()}
                  placeholder="添加误导答案…"
                  className="flex-1 px-3 py-2 rounded-sm bg-panel border border-border text-fg text-sm font-sans
                    placeholder:text-muted focus:border-danger/50"
                />
                <button
                  onClick={handleAddMisleading}
                  className="px-3 py-2 rounded-sm bg-danger/10 border border-danger/30 text-danger-glow
                    hover:bg-danger/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">可听片段</h3>
            <div className="space-y-1 text-xs font-sans">
              {clearKeywords.length > 0 && (
                <div>
                  <span className="text-safe-glow">可辨识：</span>
                  <span className="text-fg/70">{clearKeywords.join('、')}</span>
                </div>
              )}
              {partialKeywords.length > 0 && (
                <div>
                  <span className="text-warn-glow">部分遮蔽：</span>
                  <span className="text-fg/70">{partialKeywords.join('、')}</span>
                </div>
              )}
              {maskedKeywords.length > 0 && (
                <div>
                  <span className="text-danger-glow">高度遮蔽：</span>
                  <span className="text-fg/70">{maskedKeywords.join('、')}</span>
                </div>
              )}
              {keywordMasks.length === 0 && (
                <div className="text-muted">请先生成广播文本</div>
              )}
            </div>
          </section>

          <button
            onClick={handleGeneratePaths}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-mono
              bg-amber/10 border border-amber/40 text-amber hover:bg-amber/20 hover:border-amber/60
              transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            生成推理路径
          </button>
        </div>

        <div className="col-span-8 space-y-4">
          <section className="space-y-2">
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">推理路径图</h3>
            {reasoningPaths.length === 0 ? (
              <div className="border border-border rounded-sm bg-void/50 p-8 text-center">
                <GitBranch className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-sm font-sans text-muted">
                  填写正确答案和误导答案后，点击"生成推理路径"查看分析
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reasoningPaths.map((path) => (
                  <div
                    key={path.id}
                    className={`
                      border rounded-sm p-4 transition-all
                      ${path.isCorrect
                        ? 'border-safe/30 bg-safe/5'
                        : 'border-danger/30 bg-danger/5'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {path.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-safe-glow" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger-glow" />
                        )}
                        <span
                          className={`font-mono text-sm ${
                            path.isCorrect ? 'text-safe-glow' : 'text-danger-glow'
                          }`}
                        >
                          {path.isCorrect ? '正确路径' : '误导路径'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted">
                          难度 {path.difficulty}
                        </span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < path.difficulty
                                  ? path.isCorrect
                                    ? 'bg-safe/60'
                                    : 'bg-danger/60'
                                  : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {path.fragments.length > 0 && (
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        {path.fragments.map((f, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-sm text-xs font-mono ${
                                path.isCorrect
                                  ? 'bg-safe/10 text-safe-glow border border-safe/20'
                                  : 'bg-danger/10 text-danger-glow border border-danger/20'
                              }`}
                            >
                              {f}
                            </span>
                            {i < path.fragments.length - 1 && (
                              <span className="text-muted text-xs">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1.5 ml-2">
                      {path.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-mono
                              ${path.isCorrect
                                ? 'bg-safe/20 text-safe-glow'
                                : 'bg-danger/20 text-danger-glow'
                              }`}
                          >
                            {i + 1}
                          </div>
                          <span className="text-sm font-sans text-fg/70">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/50">
                      <span className="text-xs font-mono text-muted">结论 → </span>
                      <span
                        className={`text-sm font-sans font-medium ${
                          path.isCorrect ? 'text-safe-glow' : 'text-danger-glow'
                        }`}
                      >
                        "{path.conclusion}"
                      </span>
                    </div>
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
