import { useState } from 'react'
import { CheckCircle, XCircle, GitBranch, Plus, Trash2, RefreshCw, Link2, ArrowRight } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { getGlobalAudibleFragments } from '@/utils/noiseMasking'
import { generateReasoningPathsFromMasks } from '@/utils/reasoningPath'

export default function PuzzleVerify() {
  const {
    getCurrentProject,
    setCorrectAnswer,
    setCorrectClueChain,
    addMisleadingAnswer,
    removeMisleadingAnswer,
    setReasoningPaths,
  } = useProjectStore()

  const proj = getCurrentProject()
  const { correctAnswer, correctClueChain, misleadingAnswers, reasoningPaths, segmentMasks } = proj

  const [newMisleading, setNewMisleading] = useState('')

  const handleAddMisleading = () => {
    if (newMisleading.trim()) {
      addMisleadingAnswer(newMisleading.trim())
      setNewMisleading('')
    }
  }

  const handleGeneratePaths = () => {
    const paths = generateReasoningPathsFromMasks(segmentMasks, correctAnswer, misleadingAnswers)
    setReasoningPaths(paths)
  }

  const { clear: clearKeywords, partial: partialKeywords, masked: maskedKeywords } = getGlobalAudibleFragments(segmentMasks)

  const correctPaths = reasoningPaths.filter((p) => p.isCorrect)
  const misleadingPaths = reasoningPaths.filter((p) => !p.isCorrect)

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
              rows={2}
              className="w-full px-4 py-3 rounded-sm bg-panel border border-safe/30 text-fg text-sm font-sans
                placeholder:text-muted resize-none focus:border-safe/60"
            />
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-safe-glow/70" />
              <h4 className="font-mono text-xs text-fgdim tracking-widest uppercase">线索链</h4>
            </div>
            <textarea
              value={correctClueChain}
              onChange={(e) => setCorrectClueChain(e.target.value)}
              placeholder="输入从可听片段到正确答案的推理线索链，如：听到「病房」→ 结合「血迹」→ 推断「医院地下室」…"
              rows={3}
              className="w-full px-4 py-3 rounded-sm bg-panel border border-safe/20 text-fg text-sm font-sans
                placeholder:text-muted resize-none focus:border-safe/40"
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
            <div className="space-y-1.5 text-xs font-sans">
              {clearKeywords.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-safe-glow flex-shrink-0">可辨识：</span>
                  <span className="text-fg/70 flex-wrap">{clearKeywords.join('、')}</span>
                </div>
              )}
              {partialKeywords.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-warn-glow flex-shrink-0">部分遮蔽：</span>
                  <span className="text-fg/70 flex-wrap">{partialKeywords.join('、')}</span>
                </div>
              )}
              {maskedKeywords.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-danger-glow flex-shrink-0">高度遮蔽：</span>
                  <span className="text-fg/70 flex-wrap">{maskedKeywords.join('、')}</span>
                </div>
              )}
              {segmentMasks.length === 0 && (
                <div className="text-muted">请先生成广播文本并调整噪声层</div>
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
          <section className="space-y-3">
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">推理路径树</h3>
            {reasoningPaths.length === 0 ? (
              <div className="border border-border rounded-sm bg-void/50 p-8 text-center">
                <GitBranch className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-sm font-sans text-muted">
                  填写正确答案和误导答案后，点击"生成推理路径"查看分析
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {correctPaths.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-safe-glow" />
                      <h4 className="font-mono text-xs text-safe-glow tracking-widest uppercase">正确路径</h4>
                    </div>
                    <div className="space-y-4">
                      {correctPaths.map((path) => (
                        <div
                          key={path.id}
                          className="border border-safe/30 bg-safe/5 rounded-sm p-4 relative"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-safe-glow/50 rounded-l-sm" />
                          
                          <div className="flex items-center justify-between mb-4 ml-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-safe-glow" />
                              <span className="font-mono text-sm text-safe-glow">
                                {path.conclusion}
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
                                        ? 'bg-safe/60'
                                        : 'bg-border'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="relative pl-8 ml-2">
                            <div className="absolute left-3 top-4 bottom-4 w-px bg-safe-glow/30 border-l-2 border-dashed border-safe-glow/30" />
                            
                            {path.fragments.length > 0 && (
                              <div className="space-y-3">
                                {path.fragments.map((fragment, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                      <div className="w-2 h-2 rounded-full bg-safe-glow border-2 border-safe/20" />
                                    </div>
                                    {idx < path.fragments.length - 1 && (
                                      <div className="absolute -left-4 top-full h-3 w-px bg-safe-glow/40" />
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-1 rounded-sm text-xs font-mono bg-safe/15 text-safe-glow border border-safe/30">
                                        {fragment}
                                      </span>
                                      {idx < path.fragments.length - 1 && (
                                        <ArrowRight className="w-3 h-3 text-safe-glow/50" />
                                      )}
                                    </div>
                                    
                                    {idx < path.steps.length && (
                                      <div className="mt-1 ml-1 text-xs font-sans text-fg/50">
                                        {path.steps[idx]}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-safe/20 relative">
                              <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                <div className="w-3 h-3 rounded-full bg-safe-glow flex items-center justify-center">
                                  <CheckCircle className="w-1.5 h-1.5 text-void" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-1">
                                <span className="text-xs font-mono text-muted">结论 →</span>
                                <span className="text-sm font-sans font-medium text-safe-glow">
                                  &quot;{path.conclusion}&quot;
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {misleadingPaths.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-danger-glow" />
                      <h4 className="font-mono text-xs text-danger-glow tracking-widest uppercase">误导路径</h4>
                    </div>
                    <div className="space-y-4">
                      {misleadingPaths.map((path) => (
                        <div
                          key={path.id}
                          className="border border-danger/30 bg-danger/5 rounded-sm p-4 relative"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-danger-glow/50 rounded-l-sm" />
                          
                          <div className="flex items-center justify-between mb-4 ml-2">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-danger-glow" />
                              <span className="font-mono text-sm text-danger-glow">
                                {path.conclusion}
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
                                        ? 'bg-danger/60'
                                        : 'bg-border'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="relative pl-8 ml-2">
                            <div className="absolute left-3 top-4 bottom-4 w-px border-l-2 border-dashed border-danger-glow/30" />
                            
                            {path.fragments.length > 0 && (
                              <div className="space-y-3">
                                {path.fragments.map((fragment, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                      <div className="w-2 h-2 rounded-full bg-danger-glow border-2 border-danger/20" />
                                    </div>
                                    {idx < path.fragments.length - 1 && (
                                      <div className="absolute -left-4 top-full h-3 w-px border-l border-dashed border-danger-glow/40" />
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-1 rounded-sm text-xs font-mono bg-danger/15 text-danger-glow border border-danger/30">
                                        {fragment}
                                      </span>
                                      {idx < path.fragments.length - 1 && (
                                        <ArrowRight className="w-3 h-3 text-danger-glow/50" />
                                      )}
                                    </div>
                                    
                                    {idx < path.steps.length && (
                                      <div className="mt-1 ml-1 text-xs font-sans text-fg/50">
                                        {path.steps[idx]}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-danger/20 relative">
                              <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                <div className="w-3 h-3 rounded-full bg-danger-glow flex items-center justify-center">
                                  <XCircle className="w-1.5 h-1.5 text-void" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-1">
                                <span className="text-xs font-mono text-muted">结论 →</span>
                                <span className="text-sm font-sans font-medium text-danger-glow">
                                  &quot;{path.conclusion}&quot;
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
