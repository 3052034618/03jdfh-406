import type { NoiseConfig, KeywordMaskStatus, BroadcastSegment, SegmentMaskResult } from '@/store/projectStore'

interface NoiseWeights {
  environmental: number
  emotional: number
  general: number
  positional: number
}

const NOISE_WEIGHTS: Record<keyof NoiseConfig, NoiseWeights> = {
  rain: { environmental: 0.8, emotional: 0.2, general: 0.4, positional: 0.3 },
  whiteNoise: { environmental: 0.5, emotional: 0.5, general: 0.6, positional: 0.4 },
  reversedVocal: { environmental: 0.3, emotional: 0.9, general: 0.5, positional: 0.2 },
  powerOutage: { environmental: 0.6, emotional: 0.4, general: 0.3, positional: 0.8 },
}

const ENVIRONMENTAL_WORDS = [
  '病房', '走廊', '手术室', '地下室', '配药间', '太平间',
  '收费站', '加油站', '隧道', '路肩', '立交桥', '服务区',
  '站台', '轨道', '控制室', '通风井', '换乘通道', '设备间',
  '塔顶', '灯室', '储藏室', '悬崖', '雾号', '螺旋梯',
  '壁炉', '阁楼', '地窖', '木廊', '柴房', '古井',
  '铁锈', '碎玻璃', '霉斑', '潮湿', '雾气', '盐蚀',
]

const EMOTIONAL_WORDS = [
  '求你了', '快跑', '别回头', '太迟了', '对不起', '务必遵守',
  '不可违抗', '不得延误', '立即行动', '不要犹豫', '生死攸关',
  '它们即将到来', '献祭已完成', '门已打开', '聆听真理', '不要闭眼',
  '循环继续', '无法停止', '记住我说的话',
]

const POSITIONAL_WORDS = [
  '开头', '第一', '初始', '最后', '结束', '末尾', '终止',
  '紧急', '警告', '通告', '通知', '最高', '最终',
]

function classifyKeyword(keyword: string): keyof NoiseWeights {
  if (ENVIRONMENTAL_WORDS.includes(keyword)) return 'environmental'
  if (EMOTIONAL_WORDS.includes(keyword)) return 'emotional'
  if (POSITIONAL_WORDS.includes(keyword)) return 'positional'
  return 'general'
}

export function calculateKeywordMasksForSegment(
  segment: BroadcastSegment,
  noiseConfig: NoiseConfig
): KeywordMaskStatus[] {
  const cleanedText = segment.text.replace(/[█▓░…—]/g, '')
  const actualKeywords = segment.keywords.filter((kw) => cleanedText.includes(kw))

  return actualKeywords.map((keyword) => {
    const category = classifyKeyword(keyword)

    let combinedProb = 0
    for (const [channel, weights] of Object.entries(NOISE_WEIGHTS)) {
      const intensity = noiseConfig[channel as keyof NoiseConfig] / 100
      const weight = weights[category]
      const channelProb = intensity * weight
      combinedProb = 1 - (1 - combinedProb) * (1 - channelProb)
    }

    const positionBias = Math.random() * 0.1
    combinedProb = Math.min(1, combinedProb + positionBias)

    let level: KeywordMaskStatus['level']
    if (combinedProb > 0.7) level = 'masked'
    else if (combinedProb > 0.3) level = 'partial'
    else level = 'clear'

    return {
      keyword,
      probability: Math.round(combinedProb * 100) / 100,
      level,
    }
  })
}

export function calculateAllSegmentMasks(
  segments: BroadcastSegment[],
  noiseConfig: NoiseConfig
): SegmentMaskResult[] {
  return segments.map((seg) => {
    const masks = calculateKeywordMasksForSegment(seg, noiseConfig)
    const simulatedChars = simulateNoisyTextChars(seg.text, masks, noiseConfig)
    const simulatedText = simulatedChars.map((c) => c.char).join('')
    const audibleFragments = masks
      .filter((m) => m.level === 'clear' || m.level === 'partial')
      .map((m) => m.keyword)

    return {
      segmentId: seg.id,
      segmentIndex: seg.index,
      masks,
      simulatedText,
      audibleFragments,
    }
  })
}

export function simulateNoisyTextChars(
  text: string,
  masks: KeywordMaskStatus[],
  noiseConfig: NoiseConfig
): { char: string; masked: boolean }[] {
  const maskedKeywords = new Set(
    masks.filter((m) => m.level === 'masked').map((m) => m.keyword)
  )
  const partialKeywords = new Set(
    masks.filter((m) => m.level === 'partial').map((m) => m.keyword)
  )

  const result: { char: string; masked: boolean }[] = []
  let remaining = text

  while (remaining.length > 0) {
    let matched = false

    for (const kw of [...maskedKeywords, ...partialKeywords]) {
      if (remaining.startsWith(kw)) {
        const isFullyMasked = maskedKeywords.has(kw)
        const isPartial = partialKeywords.has(kw)

        for (const ch of kw) {
          if (isFullyMasked) {
            result.push({ char: '█', masked: true })
          } else if (isPartial) {
            result.push({
              char: Math.random() > 0.5 ? ch : '░',
              masked: false,
            })
          } else {
            result.push({ char: ch, masked: false })
          }
        }
        remaining = remaining.slice(kw.length)
        matched = true
        break
      }
    }

    if (!matched) {
      const generalMaskChance =
        (noiseConfig.whiteNoise * 0.003 + noiseConfig.powerOutage * 0.002)
      const isMasked = Math.random() < generalMaskChance && remaining[0] !== ' '
      result.push({
        char: isMasked ? '░' : remaining[0],
        masked: isMasked,
      })
      remaining = remaining.slice(1)
    }
  }

  return result
}

export function getGlobalAudibleFragments(
  segmentMasks: SegmentMaskResult[]
): { clear: string[]; partial: string[]; masked: string[] } {
  const clear = new Set<string>()
  const partial = new Set<string>()
  const masked = new Set<string>()

  for (const sm of segmentMasks) {
    for (const mask of sm.masks) {
      if (mask.level === 'clear') clear.add(mask.keyword)
      else if (mask.level === 'partial') partial.add(mask.keyword)
      else masked.add(mask.keyword)
    }
  }

  return {
    clear: Array.from(clear),
    partial: Array.from(partial),
    masked: Array.from(masked),
  }
}

export function calculateKeywordMasks(
  segments: BroadcastSegment[],
  noiseConfig: NoiseConfig
): KeywordMaskStatus[] {
  const allMasks: KeywordMaskStatus[] = []
  const seenKeywords = new Set<string>()

  for (const seg of segments) {
    const masks = calculateKeywordMasksForSegment(seg, noiseConfig)
    for (const mask of masks) {
      if (!seenKeywords.has(mask.keyword)) {
        seenKeywords.add(mask.keyword)
        allMasks.push(mask)
      }
    }
  }

  return allMasks
}

export function simulateNoisyText(
  text: string,
  keywords: string[],
  noiseConfig: NoiseConfig
): { char: string; masked: boolean }[] {
  const masks: KeywordMaskStatus[] = keywords.map((keyword) => {
    const category = classifyKeyword(keyword)
    let combinedProb = 0
    for (const [channel, weights] of Object.entries(NOISE_WEIGHTS)) {
      const intensity = noiseConfig[channel as keyof NoiseConfig] / 100
      const weight = weights[category]
      const channelProb = intensity * weight
      combinedProb = 1 - (1 - combinedProb) * (1 - channelProb)
    }
    const positionBias = Math.random() * 0.1
    combinedProb = Math.min(1, combinedProb + positionBias)

    let level: KeywordMaskStatus['level']
    if (combinedProb > 0.7) level = 'masked'
    else if (combinedProb > 0.3) level = 'partial'
    else level = 'clear'

    return {
      keyword,
      probability: Math.round(combinedProb * 100) / 100,
      level,
    }
  })

  return simulateNoisyTextChars(text, masks, noiseConfig)
}
