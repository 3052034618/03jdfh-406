import type { ReasoningPath, KeywordMaskStatus } from '@/store/projectStore'

export function generateReasoningPaths(
  keywordMasks: KeywordMaskStatus[],
  correctAnswer: string,
  misleadingAnswers: string[]
): ReasoningPath[] {
  const clearKeywords = keywordMasks
    .filter((m) => m.level === 'clear')
    .map((m) => m.keyword)
  const partialKeywords = keywordMasks
    .filter((m) => m.level === 'partial')
    .map((m) => m.keyword)
  const maskedKeywords = keywordMasks
    .filter((m) => m.level === 'masked')
    .map((m) => m.keyword)

  const audibleFragments = [...clearKeywords, ...partialKeywords]
  const paths: ReasoningPath[] = []
  let pathId = 0

  if (correctAnswer && audibleFragments.length > 0) {
    const numCorrectPaths = Math.min(3, audibleFragments.length)
    for (let i = 0; i < numCorrectPaths; i++) {
      const startIdx = i
      const fragments = audibleFragments.slice(startIdx, startIdx + 3)
      const steps = buildReasoningSteps(fragments, correctAnswer)
      paths.push({
        id: `path_${pathId++}`,
        fragments,
        conclusion: correctAnswer,
        isCorrect: true,
        steps,
        difficulty: fragments.length,
      })
    }
  }

  for (const misleading of misleadingAnswers) {
    if (!misleading) continue
    const fragmentPool = [...audibleFragments, ...maskedKeywords.slice(0, 2)]
    if (fragmentPool.length === 0) continue

    const numFragments = 2 + Math.floor(Math.random() * 2)
    const fragments: string[] = []
    for (let i = 0; i < numFragments && i < fragmentPool.length; i++) {
      const idx = Math.floor(Math.random() * fragmentPool.length)
      fragments.push(fragmentPool.splice(idx, 1)[0])
    }

    const steps = buildReasoningSteps(fragments, misleading)
    steps.push(`基于片段"${fragments[fragments.length - 1] || '?'}"的误读，推断出"${misleading}"`)

    paths.push({
      id: `path_${pathId++}`,
      fragments,
      conclusion: misleading,
      isCorrect: false,
      steps,
      difficulty: fragments.length + 1,
    })
  }

  if (correctAnswer && audibleFragments.length === 0) {
    paths.push({
      id: `path_${pathId++}`,
      fragments: [],
      conclusion: '线索完全被遮蔽，无法推理',
      isCorrect: false,
      steps: ['所有关键词均被噪声遮蔽', '玩家无法获取有效信息'],
      difficulty: 99,
    })
  }

  return paths
}

function buildReasoningSteps(fragments: string[], conclusion: string): string[] {
  if (fragments.length === 0) return []

  const steps: string[] = []
  steps.push(`听到片段"${fragments[0]}"`)

  if (fragments.length > 1) {
    for (let i = 1; i < fragments.length; i++) {
      steps.push(`结合"${fragments[i]}"，缩小推理范围`)
    }
  }

  steps.push(`综合线索，指向结论："${conclusion}"`)

  return steps
}
