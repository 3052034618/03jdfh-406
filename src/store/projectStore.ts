import { create } from 'zustand'

export interface BroadcastSegment {
  id: string
  index: number
  text: string
  keywords: string[]
}

export interface NoiseConfig {
  rain: number
  whiteNoise: number
  reversedVocal: number
  powerOutage: number
}

export interface KeywordMaskStatus {
  keyword: string
  probability: number
  level: 'masked' | 'partial' | 'clear'
}

export interface ReasoningPath {
  id: string
  fragments: string[]
  conclusion: string
  isCorrect: boolean
  steps: string[]
  difficulty: number
}

export type PanelType = 'draft' | 'noise' | 'verify'
export type SceneLocation = 'abandoned_hospital' | 'midnight_highway' | 'underground_station' | 'lighthouse' | 'cabin' | 'custom'
export type BroadcastTone = 'official' | 'personal' | 'emergency' | 'mechanical' | 'ritual'

interface ProjectStore {
  projectName: string
  sceneLocation: SceneLocation
  customSceneName: string
  era: number
  broadcastTone: BroadcastTone
  interferenceLevel: number
  playerClues: string
  segments: BroadcastSegment[]
  noiseConfig: NoiseConfig
  keywordMasks: KeywordMaskStatus[]
  correctAnswer: string
  misleadingAnswers: string[]
  reasoningPaths: ReasoningPath[]
  activePanel: PanelType

  setProjectName: (name: string) => void
  setSceneLocation: (location: SceneLocation) => void
  setCustomSceneName: (name: string) => void
  setEra: (era: number) => void
  setBroadcastTone: (tone: BroadcastTone) => void
  setInterferenceLevel: (level: number) => void
  setPlayerClues: (clues: string) => void
  generateSegments: () => void
  updateSegment: (id: string, text: string) => void
  setNoiseConfig: (config: Partial<NoiseConfig>) => void
  setKeywordMasks: (masks: KeywordMaskStatus[]) => void
  setCorrectAnswer: (answer: string) => void
  addMisleadingAnswer: (answer: string) => void
  removeMisleadingAnswer: (index: number) => void
  setReasoningPaths: (paths: ReasoningPath[]) => void
  setActivePanel: (panel: PanelType) => void
  exportProject: () => object
}

const SCENE_LABELS: Record<SceneLocation, string> = {
  abandoned_hospital: '废弃医院',
  midnight_highway: '深夜公路',
  underground_station: '地下台站',
  lighthouse: '孤岛灯塔',
  cabin: '林中小屋',
  custom: '自定义',
}

export { SCENE_LABELS }

export const TONE_LABELS: Record<BroadcastTone, string> = {
  official: '官方通告',
  personal: '私人遗言',
  emergency: '紧急求救',
  mechanical: '机械循环',
  ritual: '宗教仪式',
}

export const ERA_LABELS: Record<number, string> = {
  1960: '1960s',
  1970: '1970s',
  1980: '1980s',
  1990: '1990s',
  2000: '2000s',
  2010: '2010s',
  2020: '2020s',
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectName: '未命名项目',
  sceneLocation: 'abandoned_hospital',
  customSceneName: '',
  era: 1980,
  broadcastTone: 'official',
  interferenceLevel: 3,
  playerClues: '',
  segments: [],
  noiseConfig: {
    rain: 20,
    whiteNoise: 10,
    reversedVocal: 0,
    powerOutage: 0,
  },
  keywordMasks: [],
  correctAnswer: '',
  misleadingAnswers: [],
  reasoningPaths: [],
  activePanel: 'draft',

  setProjectName: (name) => set({ projectName: name }),
  setSceneLocation: (location) => set({ sceneLocation: location }),
  setCustomSceneName: (name) => set({ customSceneName: name }),
  setEra: (era) => set({ era }),
  setBroadcastTone: (tone) => set({ broadcastTone: tone }),
  setInterferenceLevel: (level) => set({ interferenceLevel: level }),
  setPlayerClues: (clues) => set({ playerClues: clues }),

  generateSegments: () => {
    const state = get()
    const segments = generateBroadcastTexts(
      state.sceneLocation,
      state.customSceneName,
      state.era,
      state.broadcastTone,
      state.interferenceLevel,
      state.playerClues
    )
    set({ segments, keywordMasks: [], reasoningPaths: [] })
  },

  updateSegment: (id, text) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === id ? { ...s, text } : s
      ),
    })),

  setNoiseConfig: (config) =>
    set((state) => ({
      noiseConfig: { ...state.noiseConfig, ...config },
    })),

  setKeywordMasks: (masks) => set({ keywordMasks: masks }),

  setCorrectAnswer: (answer) => set({ correctAnswer: answer }),

  addMisleadingAnswer: (answer) =>
    set((state) => ({
      misleadingAnswers: [...state.misleadingAnswers, answer],
    })),

  removeMisleadingAnswer: (index) =>
    set((state) => ({
      misleadingAnswers: state.misleadingAnswers.filter((_, i) => i !== index),
    })),

  setReasoningPaths: (paths) => set({ reasoningPaths: paths }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  exportProject: () => {
    const state = get()
    return {
      projectName: state.projectName,
      scene: {
        location: state.sceneLocation,
        customName: state.customSceneName,
        era: state.era,
        tone: state.broadcastTone,
        interferenceLevel: state.interferenceLevel,
      },
      playerClues: state.playerClues,
      broadcastSegments: state.segments.map((s) => ({
        index: s.index,
        text: s.text,
        keywords: s.keywords,
      })),
      noiseLayer: state.noiseConfig,
      keywordMaskStatus: state.keywordMasks,
      puzzle: {
        correctAnswer: state.correctAnswer,
        misleadingAnswers: state.misleadingAnswers,
      },
      reasoningPaths: state.reasoningPaths,
      exportedAt: new Date().toISOString(),
    }
  },
}))

function generateBroadcastTexts(
  scene: SceneLocation,
  customName: string,
  era: number,
  tone: BroadcastTone,
  interference: number,
  clues: string
): BroadcastSegment[] {
  const sceneData = getSceneData(scene, customName)
  const toneData = getToneData(tone)
  const eraModifier = getEraModifier(era)
  const clueWords = clues.split(/[,，、\s]+/).filter(Boolean)

  const count = 3 + Math.floor(Math.random() * 3)
  const segments: BroadcastSegment[] = []

  for (let i = 0; i < count; i++) {
    const template = toneData.templates[i % toneData.templates.length]
    const sceneWord = sceneData.keywords[Math.floor(Math.random() * sceneData.keywords.length)]
    const detailWord = sceneData.details[Math.floor(Math.random() * sceneData.details.length)]
    const actionWord = sceneData.actions[Math.floor(Math.random() * sceneData.actions.length)]
    const eraWord = eraModifier.vocabulary[Math.floor(Math.random() * eraModifier.vocabulary.length)]
    const toneWord = toneData.expressions[Math.floor(Math.random() * toneData.expressions.length)]

    let text = template
      .replace('{scene}', sceneWord)
      .replace('{detail}', detailWord)
      .replace('{action}', actionWord)
      .replace('{era}', eraWord)
      .replace('{tone}', toneWord)

    if (clueWords.length > 0 && Math.random() > 0.4) {
      const clue = clueWords[Math.floor(Math.random() * clueWords.length)]
      const insertPos = Math.floor(Math.random() * text.length)
      text = text.slice(0, insertPos) + clue + text.slice(insertPos)
    }

    text = applyInterference(text, interference)

    const keywords = extractKeywords(text, sceneData.keywords, clueWords)

    segments.push({
      id: `seg_${Date.now()}_${i}`,
      index: i + 1,
      text,
      keywords,
    })
  }

  return segments
}

function getSceneData(scene: SceneLocation, customName: string) {
  const data: Record<string, { keywords: string[]; details: string[]; actions: string[] }> = {
    abandoned_hospital: {
      keywords: ['病房', '走廊', '手术室', '地下室', '配药间', '太平间'],
      details: ['铁锈', '碎玻璃', '霉斑', '残留药瓶', '断裂电线', '血迹'],
      actions: ['听到脚步声', '灯光闪烁', '门自动关上', '仪器发出蜂鸣', '水龙头滴水'],
    },
    midnight_highway: {
      keywords: ['收费站', '加油站', '隧道', '路肩', '立交桥', '服务区'],
      details: ['雾气', '车灯残影', '轮胎痕迹', '路边标记', '废弃车辆', '反光镜碎片'],
      actions: ['引擎熄火', '收音机失灵', '后视镜闪过人影', '路标反转', '电话没有信号'],
    },
    underground_station: {
      keywords: ['站台', '轨道', '控制室', '通风井', '换乘通道', '设备间'],
      details: ['潮湿墙壁', '闪烁灯管', '旧海报', '铁轨锈迹', '废弃工具', '不明管线'],
      actions: ['广播自动播放', '灯管爆裂', '轨道传来震动', '电梯自行运行', '监控画面雪花'],
    },
    lighthouse: {
      keywords: ['塔顶', '灯室', '储藏室', '悬崖', '雾号', '螺旋梯'],
      details: ['盐蚀痕迹', '破碎镜片', '旧航海图', '绳索残段', '锈蚀齿轮', '海鸟残骸'],
      actions: ['灯光忽明忽暗', '雾号自行响起', '门被风撞击', '望远镜指向空海', '潮水异常上涨'],
    },
    cabin: {
      keywords: ['壁炉', '阁楼', '地窖', '木廊', '柴房', '古井'],
      details: ['腐木', '动物骨骼', '旧照片', '刻痕', '枯萎草药', '封印符号'],
      actions: ['窗户自行打开', '地板下传来低语', '画像眼睛移动', '炉火突然熄灭', '井中传来回声'],
    },
  }

  if (scene === 'custom') {
    return {
      keywords: [customName || '未知区域', '深处', '边界', '中心', '角落'],
      details: ['不明痕迹', '异样气息', '残留物', '断裂处', '异常标记'],
      actions: ['声音从远处传来', '光线发生变化', '温度骤降', '空气变得沉重', '时间感模糊'],
    }
  }

  return data[scene] || data.abandoned_hospital
}

function getToneData(tone: BroadcastTone) {
  const data: Record<BroadcastTone, { templates: string[]; expressions: string[] }> = {
    official: {
      templates: [
        '通知：{scene}{detail}区域已封闭，所有人员立即撤离，{tone}。',
        '根据{era}协议，{scene}的{action}，请保持警惕。{tone}。',
        '紧急通告：{scene}检测到{detail}，{action}，切勿接近。',
        '{scene}管理通报：{detail}已被标记，{tone}。所有通道关闭。',
        '系统日志：{scene}区域{action}，状态{detail}。{tone}。',
      ],
      expressions: ['务必遵守', '严格执行', '不可违抗', '此为最终通知', '不得延误'],
    },
    personal: {
      templates: [
        '如果有人听到……我在{scene}，{detail}……{tone}。',
        '记住了，别去{scene}，那里{action}……{tone}。',
        '我看到了……{scene}的{detail}……它们在{action}……{tone}。',
        '这是最后一次……{scene}……{detail}……别相信{era}……{tone}。',
        '对不起……{scene}的{action}……我没能……{detail}……{tone}。',
      ],
      expressions: ['求你了', '快跑', '别回头', '太迟了', '记住我说的话'],
    },
    emergency: {
      templates: [
        '警告！{scene}发生{detail}！立即{action}！{tone}！',
        '紧急！{scene}区域{action}！所有{era}频段已中断！{tone}！',
        '求救信号：{scene}——{detail}——{action}——需要支援！{tone}！',
        'SOS！{scene}失联！{detail}扩散中！{tone}！',
        '最高警报：{scene}的{action}已失控，{detail}！{tone}！',
      ],
      expressions: ['立即行动', '不要犹豫', '生死攸关', '刻不容缓', '这是最后警告'],
    },
    mechanical: {
      templates: [
        '{scene}……{detail}……状态：{action}……{era}……{tone}。',
        '重复：{scene}……{detail}……执行{action}……{tone}。',
        '{scene}编号{era}……检测{detail}……{action}……{tone}。',
        '循环播报：{scene}……{detail}……{action}……{tone}。',
        '{scene}系统……{detail}……{action}……计数{era}……{tone}。',
      ],
      expressions: ['循环继续', '无法停止', '参数固定', '执行完毕', '等待指令'],
    },
    ritual: {
      templates: [
        '当{scene}的{detail}显现，{action}，{era}的契约将重新开启……{tone}。',
        '聆听……{scene}深处的{detail}……{action}……{tone}。',
        '{scene}的{detail}已苏醒，{era}之门即将开启，{action}。{tone}。',
        '古老的{scene}……{detail}在低语……{action}……{tone}。',
        '这是{scene}的呼唤：{detail}降临，{action}，{tone}。',
      ],
      expressions: ['它们即将到来', '献祭已完成', '门已打开', '聆听真理', '不要闭眼'],
    },
  }
  return data[tone]
}

function getEraModifier(era: number) {
  const modifiers: Record<string, { vocabulary: string[] }> = {
    1960: { vocabulary: ['同志', '上级指示', '人民', '保卫', '革命'] },
    1970: { vocabulary: ['组织', '群众', '阶级', '警惕', '保卫'] },
    1980: { vocabulary: ['单位', '报告', '值班', '记录', '通知'] },
    1990: { vocabulary: ['系统', '监控', '终端', '数据库', '频道'] },
    2000: { vocabulary: ['网络', '信号', '基站', '节点', '协议'] },
    2010: { vocabulary: ['云端', '智能', '算法', '终端', '接口'] },
    2020: { vocabulary: ['AI', '数字', '量子', '虚拟', '深度'] },
  }
  const key = String(era) as keyof typeof modifiers
  return modifiers[key] || modifiers[1980]
}

function applyInterference(text: string, level: number): string {
  if (level <= 1) return text

  const chars = text.split('')
  const maskChars = ['█', '▓', '░', '…']
  const maskCount = Math.floor(chars.length * (level - 1) * 0.06)

  for (let i = 0; i < maskCount; i++) {
    const pos = Math.floor(Math.random() * chars.length)
    if (chars[pos] !== ' ' && chars[pos] !== '\n') {
      chars[pos] = maskChars[Math.floor(Math.random() * maskChars.length)]
    }
  }

  if (level >= 4) {
    const breakCount = Math.floor(Math.random() * (level - 2))
    for (let i = 0; i < breakCount; i++) {
      const pos = Math.floor(Math.random() * chars.length)
      chars.splice(pos, 0, '——')
    }
  }

  return chars.join('')
}

function extractKeywords(text: string, sceneKeywords: string[], clueWords: string[]): string[] {
  const found: string[] = []
  for (const kw of sceneKeywords) {
    if (text.includes(kw)) found.push(kw)
  }
  for (const cw of clueWords) {
    if (cw && text.includes(cw) && !found.includes(cw)) found.push(cw)
  }
  return found.length > 0 ? found : sceneKeywords.slice(0, 3)
}
