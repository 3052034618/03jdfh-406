import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

export interface SegmentMaskResult {
  segmentId: string
  segmentIndex: number
  masks: KeywordMaskStatus[]
  simulatedText: string
  audibleFragments: string[]
}

export interface ReasoningPath {
  id: string
  fragments: string[]
  conclusion: string
  isCorrect: boolean
  steps: string[]
  difficulty: number
}

export type ReviewStatus = 'approved' | 'pending' | 'risk'

export interface ItemNotes {
  narrative: string
  audio: string
  levelDesign: string
}

export interface ItemNoteCompletion {
  narrative: boolean
  audio: boolean
  levelDesign: boolean
}

export type DecisionStatus = 'candidate' | 'adopted' | 'eliminated'

export interface ReviewConclusion {
  adoptedProjectId: string | null
  adoptedProjectName: string | null
  eliminatedProjectIds: string[]
  decisionReasons: Record<string, string>
  nextSteps: {
    narrative: string
    audio: string
    levelDesign: string
  }
  decidedAt: string | null
}

export interface ReviewTodo {
  itemId: string
  itemType: 'segment' | 'path'
  itemTitle: string
  status: ReviewStatus
  notes: {
    narrative: string
    audio: string
    levelDesign: string
  }
  completed: {
    narrative: boolean
    audio: boolean
    levelDesign: boolean
  }
}

export interface ReviewMinutes {
  generatedAt: string
  totalItems: number
  approvedCount: number
  pendingCount: number
  riskCount: number
  completedCount: number
  uncompletedCount: number
  todoByCategory: {
    narrative: ReviewTodo[]
    audio: ReviewTodo[]
    levelDesign: ReviewTodo[]
  }
  allTodos: ReviewTodo[]
  conclusion: ReviewConclusion | null
}

export type PanelType = 'draft' | 'noise' | 'verify' | 'preview' | 'compare'
export type SceneLocation = 'abandoned_hospital' | 'midnight_highway' | 'underground_station' | 'lighthouse' | 'cabin' | 'custom'
export type BroadcastTone = 'official' | 'personal' | 'emergency' | 'mechanical' | 'ritual'

export interface ProjectState {
  id: string
  projectName: string
  sceneLocation: SceneLocation
  customSceneName: string
  era: number
  broadcastTone: BroadcastTone
  interferenceLevel: number
  playerClues: string
  segments: BroadcastSegment[]
  noiseConfig: NoiseConfig
  segmentMasks: SegmentMaskResult[]
  correctAnswer: string
  correctClueChain: string
  misleadingAnswers: string[]
  reasoningPaths: ReasoningPath[]
  segmentNotes: Record<string, ItemNotes>
  pathNotes: Record<string, ItemNotes>
  noteCompletion: Record<string, ItemNoteCompletion>
  reviewStatus: Record<string, ReviewStatus>
  decisionStatus: DecisionStatus
  decisionReason: string
  reviewConclusion: ReviewConclusion
  createdAt: string
  updatedAt: string
}

interface ProjectStore extends ProjectState {
  projects: Record<string, ProjectState>
  currentProjectId: string
  activePanel: PanelType

  getCurrentProject: () => ProjectState
  createProject: (name: string) => string
  switchProject: (id: string) => void
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void

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
  setSegmentMasks: (masks: SegmentMaskResult[]) => void
  setCorrectAnswer: (answer: string) => void
  setCorrectClueChain: (chain: string) => void
  addMisleadingAnswer: (answer: string) => void
  removeMisleadingAnswer: (index: number) => void
  setReasoningPaths: (paths: ReasoningPath[]) => void
  setActivePanel: (panel: PanelType) => void
  setSegmentNote: (segmentId: string, category: keyof ItemNotes, text: string) => void
  setPathNote: (pathId: string, category: keyof ItemNotes, text: string) => void
  setNoteCompletion: (itemId: string, category: keyof ItemNoteCompletion, completed: boolean) => void
  setReviewStatus: (itemId: string, status: ReviewStatus) => void
  setDecisionStatus: (projectId: string, status: DecisionStatus, reason: string) => void
  setReviewConclusion: (conclusion: ReviewConclusion) => void
  generateReviewMinutes: (projectId?: string) => ReviewMinutes
  exportProject: (projectId?: string) => object
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

function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function migrateProject(project: Partial<ProjectState>): ProjectState {
  const base = createDefaultProject(project.projectName || '已迁移项目')
  return {
    ...base,
    ...project,
    id: project.id || base.id,
    projectName: project.projectName || base.projectName,
    sceneLocation: project.sceneLocation || base.sceneLocation,
    customSceneName: project.customSceneName || base.customSceneName,
    era: project.era || base.era,
    broadcastTone: project.broadcastTone || base.broadcastTone,
    interferenceLevel: project.interferenceLevel || base.interferenceLevel,
    playerClues: project.playerClues || base.playerClues,
    segments: project.segments || base.segments,
    noiseConfig: { ...base.noiseConfig, ...(project.noiseConfig || {}) },
    segmentMasks: project.segmentMasks || base.segmentMasks,
    correctAnswer: project.correctAnswer || base.correctAnswer,
    correctClueChain: project.correctClueChain || base.correctClueChain,
    misleadingAnswers: project.misleadingAnswers || base.misleadingAnswers,
    reasoningPaths: project.reasoningPaths || base.reasoningPaths,
    segmentNotes: project.segmentNotes || base.segmentNotes,
    pathNotes: project.pathNotes || base.pathNotes,
    noteCompletion: project.noteCompletion || base.noteCompletion,
    reviewStatus: project.reviewStatus || base.reviewStatus,
    decisionStatus: project.decisionStatus || base.decisionStatus,
    decisionReason: project.decisionReason ?? base.decisionReason,
    reviewConclusion: project.reviewConclusion || base.reviewConclusion,
    createdAt: project.createdAt || base.createdAt,
    updatedAt: project.updatedAt || base.updatedAt,
  }
}

function createDefaultProject(name: string): ProjectState {
  return {
    id: generateId(),
    projectName: name,
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
    segmentMasks: [],
    correctAnswer: '',
    correctClueChain: '',
    misleadingAnswers: [],
    reasoningPaths: [],
    segmentNotes: {},
    pathNotes: {},
    noteCompletion: {},
    reviewStatus: {},
    decisionStatus: 'candidate',
    decisionReason: '',
    reviewConclusion: {
      adoptedProjectId: null,
      adoptedProjectName: null,
      eliminatedProjectIds: [],
      decisionReasons: {},
      nextSteps: { narrative: '', audio: '', levelDesign: '' },
      decidedAt: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const initialProject = createDefaultProject('未命名项目')

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initialProject,
      projects: {
        [initialProject.id]: initialProject,
      },
      currentProjectId: initialProject.id,
      activePanel: 'draft',

      getCurrentProject: () => {
        const state = get()
        const proj = state.projects[state.currentProjectId]
        return proj ? migrateProject(proj) : createDefaultProject('空项目')
      },

      createProject: (name) => {
        const newProject = createDefaultProject(name)
        set((state) => ({
          ...newProject,
          projects: {
            ...state.projects,
            [newProject.id]: newProject,
          },
          currentProjectId: newProject.id,
          activePanel: 'draft',
        }))
        return newProject.id
      },

      switchProject: (id) => {
        set((state) => {
          if (!state.projects[id]) return state
          return {
            ...state.projects[id],
            currentProjectId: id,
            activePanel: 'draft',
          }
        })
      },

      renameProject: (id, name) => {
        set((state) => {
          if (!state.projects[id]) return state
          const updatedProject = {
            ...state.projects[id],
            projectName: name,
            updatedAt: new Date().toISOString(),
          }
          return {
            ...(state.currentProjectId === id ? updatedProject : {}),
            projects: {
              ...state.projects,
              [id]: updatedProject,
            },
          }
        })
      },

      deleteProject: (id) => {
        set((state) => {
          const projects = { ...state.projects }
          delete projects[id]
          const remainingIds = Object.keys(projects)
          if (remainingIds.length === 0) {
            const newProject = createDefaultProject('未命名项目')
            return {
              ...newProject,
              projects: { [newProject.id]: newProject },
              currentProjectId: newProject.id,
              activePanel: 'draft',
            }
          }
          const newCurrentId = state.currentProjectId === id ? remainingIds[0] : state.currentProjectId
          return {
            ...projects[newCurrentId],
            projects,
            currentProjectId: newCurrentId,
          }
        })
      },

      setProjectName: (name) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          projectName: name,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setSceneLocation: (location) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          sceneLocation: location,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setCustomSceneName: (name) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          customSceneName: name,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setEra: (era) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          era,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setBroadcastTone: (tone) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          broadcastTone: tone,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setInterferenceLevel: (level) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          interferenceLevel: level,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setPlayerClues: (clues) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          playerClues: clues,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      generateSegments: () => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]
        const segments = generateBroadcastTexts(
          proj.sceneLocation,
          proj.customSceneName,
          proj.era,
          proj.broadcastTone,
          proj.interferenceLevel,
          proj.playerClues
        )
        const updatedProject = {
          ...state.projects[id],
          segments,
          segmentMasks: [],
          reasoningPaths: [],
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      updateSegment: (segId, text) => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]

        const clueWords = proj.playerClues.split(/[,，、\s]+/).filter(Boolean)
        const sceneData = getSceneData(proj.sceneLocation, proj.customSceneName)
        const newKeywords = extractKeywords(text, sceneData.keywords, clueWords)

        const updatedSegments = proj.segments.map((s) =>
          s.id === segId ? { ...s, text, keywords: newKeywords } : s
        )

        const updatedProject = {
          ...state.projects[id],
          segments: updatedSegments,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setNoiseConfig: (config) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          noiseConfig: { ...state.projects[id].noiseConfig, ...config },
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setSegmentMasks: (masks) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          segmentMasks: masks,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setCorrectAnswer: (answer) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          correctAnswer: answer,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setCorrectClueChain: (chain) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          correctClueChain: chain,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      addMisleadingAnswer: (answer) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          misleadingAnswers: [...state.projects[id].misleadingAnswers, answer],
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      removeMisleadingAnswer: (index) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          misleadingAnswers: state.projects[id].misleadingAnswers.filter(
            (_, i) => i !== index
          ),
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setReasoningPaths: (paths) => {
        const state = get()
        const id = state.currentProjectId
        const updatedProject = {
          ...state.projects[id],
          reasoningPaths: paths,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: {
            ...state.projects,
            [id]: updatedProject,
          },
        })
      },

      setActivePanel: (panel) => set({ activePanel: panel }),

      setSegmentNote: (segmentId, category, text) => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]
        const existing = proj.segmentNotes[segmentId] || { narrative: '', audio: '', levelDesign: '' }
        const updatedProject = {
          ...proj,
          segmentNotes: { ...proj.segmentNotes, [segmentId]: { ...existing, [category]: text } },
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: { ...state.projects, [id]: updatedProject },
        })
      },

      setPathNote: (pathId, category, text) => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]
        const existing = proj.pathNotes[pathId] || { narrative: '', audio: '', levelDesign: '' }
        const updatedProject = {
          ...proj,
          pathNotes: { ...proj.pathNotes, [pathId]: { ...existing, [category]: text } },
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: { ...state.projects, [id]: updatedProject },
        })
      },

      setReviewStatus: (itemId, status) => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]
        const updatedProject = {
          ...proj,
          reviewStatus: { ...proj.reviewStatus, [itemId]: status },
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: { ...state.projects, [id]: updatedProject },
        })
      },

      setNoteCompletion: (itemId, category, completed) => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]
        const existing = proj.noteCompletion[itemId] || { narrative: false, audio: false, levelDesign: false }
        const updatedProject = {
          ...proj,
          noteCompletion: { ...proj.noteCompletion, [itemId]: { ...existing, [category]: completed } },
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: { ...state.projects, [id]: updatedProject },
        })
      },

      setDecisionStatus: (projectId, status, reason) => {
        const state = get()
        const proj = state.projects[projectId]
        if (!proj) return
        const updatedProject = {
          ...proj,
          decisionStatus: status,
          decisionReason: reason,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...(state.currentProjectId === projectId ? updatedProject : {}),
          projects: { ...state.projects, [projectId]: updatedProject },
        })
      },

      setReviewConclusion: (conclusion) => {
        const state = get()
        const id = state.currentProjectId
        const proj = state.projects[id]
        const updatedProject = {
          ...proj,
          reviewConclusion: conclusion,
          updatedAt: new Date().toISOString(),
        }
        set({
          ...updatedProject,
          projects: { ...state.projects, [id]: updatedProject },
        })
      },

      generateReviewMinutes: (projectId?: string): ReviewMinutes => {
        const state = get()
        const id = projectId || state.currentProjectId
        const proj = state.projects[id]
        if (!proj) {
          return {
            generatedAt: new Date().toISOString(),
            totalItems: 0,
            approvedCount: 0,
            pendingCount: 0,
            riskCount: 0,
            completedCount: 0,
            uncompletedCount: 0,
            todoByCategory: { narrative: [], audio: [], levelDesign: [] },
            allTodos: [],
            conclusion: null,
          }
        }

        const migrated = migrateProject(proj)
        const todos: ReviewTodo[] = []

        for (const seg of migrated.segments) {
          const status = migrated.reviewStatus[seg.id] || 'pending'
          const notes = migrated.segmentNotes[seg.id] || { narrative: '', audio: '', levelDesign: '' }
          const completion = migrated.noteCompletion[seg.id] || { narrative: false, audio: false, levelDesign: false }
          const hasNotes = notes.narrative || notes.audio || notes.levelDesign
          if (status !== 'approved' || hasNotes) {
            todos.push({
              itemId: seg.id,
              itemType: 'segment',
              itemTitle: `频段 ${seg.index}`,
              status,
              notes,
              completed: completion,
            })
          }
        }

        for (const path of migrated.reasoningPaths) {
          const status = migrated.reviewStatus[path.id] || 'pending'
          const notes = migrated.pathNotes[path.id] || { narrative: '', audio: '', levelDesign: '' }
          const completion = migrated.noteCompletion[path.id] || { narrative: false, audio: false, levelDesign: false }
          const hasNotes = notes.narrative || notes.audio || notes.levelDesign
          if (status !== 'approved' || hasNotes) {
            todos.push({
              itemId: path.id,
              itemType: 'path',
              itemTitle: path.isCorrect ? `正确路径：${path.conclusion}` : `误导路径：${path.conclusion}`,
              status,
              notes,
              completed: completion,
            })
          }
        }

        const isCategoryCompleted = (t: ReviewTodo, cat: keyof ItemNoteCompletion) => t.completed[cat]
        const completedCount = todos.filter((t) =>
          isCategoryCompleted(t, 'narrative') && isCategoryCompleted(t, 'audio') && isCategoryCompleted(t, 'levelDesign')
        ).length

        const filterByCategory = (cat: keyof ItemNotes) =>
          todos.filter((t) => t.status !== 'approved' || t.notes[cat])

        const allProjects = state.projects
        const adoptedProject = Object.values(allProjects).find((p) => p.decisionStatus === 'adopted')
        const conclusion: ReviewConclusion = {
          adoptedProjectId: adoptedProject?.id || null,
          adoptedProjectName: adoptedProject?.projectName || null,
          eliminatedProjectIds: Object.values(allProjects)
            .filter((p) => p.decisionStatus === 'eliminated')
            .map((p) => p.id),
          decisionReasons: Object.fromEntries(
            Object.values(allProjects)
              .filter((p) => p.decisionReason)
              .map((p) => [p.id, p.decisionReason])
          ),
          nextSteps: migrated.reviewConclusion?.nextSteps || { narrative: '', audio: '', levelDesign: '' },
          decidedAt: adoptedProject ? new Date().toISOString() : null,
        }

        return {
          generatedAt: new Date().toISOString(),
          totalItems: todos.length,
          approvedCount: todos.filter((t) => t.status === 'approved').length,
          pendingCount: todos.filter((t) => t.status === 'pending').length,
          riskCount: todos.filter((t) => t.status === 'risk').length,
          completedCount,
          uncompletedCount: todos.length - completedCount,
          todoByCategory: {
            narrative: filterByCategory('narrative'),
            audio: filterByCategory('audio'),
            levelDesign: filterByCategory('levelDesign'),
          },
          allTodos: todos,
          conclusion,
        }
      },

      exportProject: (projectId) => {
        const state = get()
        const id = projectId || state.currentProjectId
        const proj = state.projects[id]
        if (!proj) return {}

        return {
          projectId: proj.id,
          projectName: proj.projectName,
          createdAt: proj.createdAt,
          exportedAt: new Date().toISOString(),
          scene: {
            location: proj.sceneLocation,
            locationLabel: SCENE_LABELS[proj.sceneLocation],
            customName: proj.customSceneName,
            era: proj.era,
            eraLabel: ERA_LABELS[proj.era],
            tone: proj.broadcastTone,
            toneLabel: TONE_LABELS[proj.broadcastTone],
            interferenceLevel: proj.interferenceLevel,
          },
          playerClues: proj.playerClues,
          broadcastSegments: proj.segments.map((s) => ({
            id: s.id,
            index: s.index,
            originalText: s.text,
            keywords: s.keywords,
            notes: proj.segmentNotes[s.id] || null,
            noteCompletion: proj.noteCompletion[s.id] || null,
            reviewStatus: proj.reviewStatus[s.id] || null,
          })),
          noiseLayer: {
            rain: proj.noiseConfig.rain,
            whiteNoise: proj.noiseConfig.whiteNoise,
            reversedVocal: proj.noiseConfig.reversedVocal,
            powerOutage: proj.noiseConfig.powerOutage,
          },
          segmentMaskResults: proj.segmentMasks.map((sm) => ({
            segmentIndex: sm.segmentIndex,
            simulatedText: sm.simulatedText,
            audibleFragments: sm.audibleFragments,
            keywordMasks: sm.masks.map((m) => ({
              keyword: m.keyword,
              probability: Math.round(m.probability * 100),
              level: m.level,
            })),
          })),
          summary: {
            totalKeywords: proj.segmentMasks.flatMap((sm) => sm.masks).length,
            maskedCount: proj.segmentMasks.flatMap((sm) => sm.masks).filter((m) => m.level === 'masked').length,
            partialCount: proj.segmentMasks.flatMap((sm) => sm.masks).filter((m) => m.level === 'partial').length,
            clearCount: proj.segmentMasks.flatMap((sm) => sm.masks).filter((m) => m.level === 'clear').length,
            allAudibleFragments: [...new Set(proj.segmentMasks.flatMap((sm) => sm.audibleFragments))],
          },
          puzzle: {
            correctAnswer: proj.correctAnswer,
            correctClueChain: proj.correctClueChain,
            misleadingAnswers: proj.misleadingAnswers,
          },
          reasoningPaths: proj.reasoningPaths.map((rp) => ({
            id: rp.id,
            conclusion: rp.conclusion,
            isCorrect: rp.isCorrect,
            fragments: rp.fragments,
            steps: rp.steps,
            difficulty: rp.difficulty,
            notes: proj.pathNotes[rp.id] || null,
            noteCompletion: proj.noteCompletion[rp.id] || null,
            reviewStatus: proj.reviewStatus[rp.id] || null,
          })),
          decisionStatus: proj.decisionStatus,
          decisionReason: proj.decisionReason,
          reviewSummary: {
            approved: Object.entries(proj.reviewStatus).filter(([, v]) => v === 'approved').map(([k]) => k),
            pending: Object.entries(proj.reviewStatus).filter(([, v]) => v === 'pending').map(([k]) => k),
            risk: Object.entries(proj.reviewStatus).filter(([, v]) => v === 'risk').map(([k]) => k),
          },
          reviewMinutes: get().generateReviewMinutes(id),
          reviewerNotes: {
            forDesigner: `场景：${SCENE_LABELS[proj.sceneLocation]} | 年代：${ERA_LABELS[proj.era]} | 口吻：${TONE_LABELS[proj.broadcastTone]} | 干扰等级：${proj.interferenceLevel}`,
            forNarrative: `玩家已知线索：${proj.playerClues || '无'}；正确答案：${proj.correctAnswer || '未设置'}；误导答案：${proj.misleadingAnswers.length} 个`,
            forAudio: `噪声配置 - 雨声：${proj.noiseConfig.rain}%，白噪：${proj.noiseConfig.whiteNoise}%，倒放：${proj.noiseConfig.reversedVocal}%，断电：${proj.noiseConfig.powerOutage}%`,
          },
        }
      },
    }),
    {
      name: 'radio-puzzle-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const migratedProjects: Record<string, ProjectState> = {}
        for (const [id, proj] of Object.entries(state.projects)) {
          migratedProjects[id] = migrateProject(proj)
        }
        state.projects = migratedProjects
      },
    }
  )
)

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

export function getSceneData(scene: SceneLocation, customName: string) {
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

export function extractKeywords(
  text: string,
  sceneKeywords: string[],
  clueWords: string[]
): string[] {
  const cleanedText = text.replace(/[█▓░…—]/g, '')
  const found: string[] = []

  for (const kw of sceneKeywords) {
    if (cleanedText.includes(kw)) {
      found.push(kw)
    }
  }

  for (const cw of clueWords) {
    if (cw && cleanedText.includes(cw) && !found.includes(cw)) {
      found.push(cw)
    }
  }

  return found.length > 0 ? found : []
}
