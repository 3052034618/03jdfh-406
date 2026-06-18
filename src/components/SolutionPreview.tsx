import { useState, useRef } from 'react'
import {
  Eye,
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
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  MinusCircle,
  PenLine,
  Filter,
  ClipboardList,
  Download,
  Circle,
  Stamp,
  Target,
  Ban,
} from 'lucide-react'
import {
  useProjectStore,
  SCENE_LABELS,
  TONE_LABELS,
  ERA_LABELS,
  type KeywordMaskStatus,
  type ReviewStatus,
  type ItemNotes,
  type ItemNoteCompletion,
  type ReviewMinutes,
  type ReviewConclusion,
} from '@/store/projectStore'

type FilterType = 'all' | 'approved' | 'pending' | 'risk'

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

function ReviewBadge({ status }: { status?: ReviewStatus }) {
  if (!status) return null
  const cfg = {
    approved: { label: '通过', className: 'bg-safe/15 text-safe-glow border-safe/30' },
    pending: { label: '待改', className: 'bg-warn/15 text-warn-glow border-warn/30' },
    risk: { label: '风险', className: 'bg-danger/15 text-danger-glow border-danger/30' },
  }
  const { label, className } = cfg[status]
  return (
    <span className={`px-2 py-0.5 text-xs font-mono rounded-sm border ${className}`}>
      {label}
    </span>
  )
}

function ReviewButtons({
  itemId,
  currentStatus,
  onSetStatus,
}: {
  itemId: string
  currentStatus?: ReviewStatus
  onSetStatus: (id: string, status: ReviewStatus) => void
}) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onSetStatus(itemId, 'approved')}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-sm border transition-colors ${
          currentStatus === 'approved'
            ? 'bg-safe/20 text-safe-glow border-safe/40'
            : 'bg-void/50 text-fgdim border-border hover:border-safe/30 hover:text-safe-glow'
        }`}
      >
        <ThumbsUp className="w-3 h-3" />
        通过
      </button>
      <button
        onClick={() => onSetStatus(itemId, 'pending')}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-sm border transition-colors ${
          currentStatus === 'pending'
            ? 'bg-warn/20 text-warn-glow border-warn/40'
            : 'bg-void/50 text-fgdim border-border hover:border-warn/30 hover:text-warn-glow'
        }`}
      >
        <MinusCircle className="w-3 h-3" />
        待改
      </button>
      <button
        onClick={() => onSetStatus(itemId, 'risk')}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-sm border transition-colors ${
          currentStatus === 'risk'
            ? 'bg-danger/20 text-danger-glow border-danger/40'
            : 'bg-void/50 text-fgdim border-border hover:border-danger/30 hover:text-danger-glow'
        }`}
      >
        <AlertCircle className="w-3 h-3" />
        风险
      </button>
    </div>
  )
}

function NoteEditor({
  itemId,
  notes,
  onSetNote,
  noteCompletion,
  onToggleCompletion,
}: {
  itemId: string
  notes: ItemNotes
  onSetNote: (id: string, category: keyof ItemNotes, text: string) => void
  noteCompletion: ItemNoteCompletion
  onToggleCompletion: (id: string, category: keyof ItemNoteCompletion) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<keyof ItemNotes>('narrative')

  const tabs: { key: keyof ItemNotes; label: string; icon: typeof PenLine }[] = [
    { key: 'narrative', label: '编剧', icon: MessageSquare },
    { key: 'audio', label: '音频', icon: Volume2 },
    { key: 'levelDesign', label: '关卡', icon: MapPin },
  ]

  const hasNotes = notes.narrative || notes.audio || notes.levelDesign

  return (
    <div className="mt-3 border-t border-border/50 pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-mono text-fgdim hover:text-amber transition-colors"
      >
        <PenLine className="w-3 h-3" />
        <span>备注</span>
        {hasNotes && <span className="w-1.5 h-1.5 rounded-full bg-amber" />}
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-2">
          <div className="flex gap-1 mb-2">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-sm border transition-colors ${
                  activeTab === key
                    ? 'bg-amber/15 text-amber border-amber/30'
                    : 'bg-void/50 text-fgdim border-border hover:border-amber/20'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
                {notes[key] && <span className="w-1 h-1 rounded-full bg-amber/60" />}
                <span
                  role="checkbox"
                  onClick={(e) => { e.stopPropagation(); onToggleCompletion(itemId, key) }}
                  className="cursor-pointer ml-0.5"
                >
                  {noteCompletion[key] ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-safe-glow" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-fgdim" />
                  )}
                </span>
              </button>
            ))}
          </div>
          <textarea
            value={notes[activeTab]}
            onChange={(e) => onSetNote(itemId, activeTab, e.target.value)}
            placeholder={`输入${tabs.find((t) => t.key === activeTab)?.label}备注...`}
            className="w-full h-20 px-2 py-1.5 text-xs font-sans bg-void/50 border border-border rounded-sm text-fg placeholder:text-muted/50 focus:outline-none focus:border-amber/40 resize-none"
          />
        </div>
      )}
    </div>
  )
}

function ReviewSummary({ reviewStatus }: { reviewStatus: Record<string, ReviewStatus> }) {
  const counts = Object.values(reviewStatus).reduce(
    (acc, s) => {
      acc[s] = (acc[s] || 0) + 1
      return acc
    },
    { approved: 0, pending: 0, risk: 0 } as Record<ReviewStatus, number>
  )
  return (
    <div className="flex gap-2">
      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-safe/15 text-safe-glow rounded-sm border border-safe/30">
        <CheckCircle2 className="w-3 h-3" />
        {counts.approved}
      </span>
      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-warn/15 text-warn-glow rounded-sm border border-warn/30">
        <MinusCircle className="w-3 h-3" />
        {counts.pending}
      </span>
      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-danger/15 text-danger-glow rounded-sm border border-danger/30">
        <AlertCircle className="w-3 h-3" />
        {counts.risk}
      </span>
    </div>
  )
}

export default function SolutionPreview() {
  const { getCurrentProject, exportProject, setSegmentNote, setPathNote, setReviewStatus, setNoteCompletion, setReviewConclusion, generateReviewMinutes, projects } =
    useProjectStore()
  const proj = getCurrentProject()
  const exported = exportProject() as Record<string, unknown>

  const [meetingMode, setMeetingMode] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const [minutesExpanded, setMinutesExpanded] = useState(false)
  const [minutesTab, setMinutesTab] = useState<keyof ReviewMinutes['todoByCategory']>('narrative')
  const minutesRef = useRef<HTMLDivElement>(null)

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    if (meetingMode) {
      setCardIndex(0)
    }
  }

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

  const handleSetSegmentNote = (id: string, category: keyof ItemNotes, text: string) => {
    setSegmentNote(id, category, text)
  }

  const handleSetPathNote = (id: string, category: keyof ItemNotes, text: string) => {
    setPathNote(id, category, text)
  }

  const handleSetReviewStatus = (id: string, status: ReviewStatus) => {
    setReviewStatus(id, status)
  }

  const handleToggleCompletion = (id: string, category: keyof ItemNoteCompletion) => {
    const current = proj.noteCompletion[id]?.[category] ?? false
    setNoteCompletion(id, category, !current)
  }

  const matchesFilter = (itemId: string) => {
    if (filter === 'all') return true
    return proj.reviewStatus[itemId] === filter
  }

  const allCardIds = [
    'scene-info',
    ...proj.segments.map((s) => s.id),
    ...proj.reasoningPaths.map((rp) => rp.id),
  ]
  const filteredCardIds = allCardIds.filter(matchesFilter)
  const cardIds = meetingMode ? filteredCardIds : allCardIds
  const totalCards = cardIds.length
  const currentCardId = cardIds[cardIndex] || 'scene-info'

  const goToPrev = () => setCardIndex((i) => Math.max(0, i - 1))
  const goToNext = () => setCardIndex((i) => Math.min(totalCards - 1, i + 1))

  const scrollToMinutes = () => {
    minutesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExportMinutes = () => {
    const data = exportProject()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `review-minutes-${proj.projectName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const adoptedProject = Object.values(projects).find((p) => p.decisionStatus === 'adopted')

  const filterLabelMap: Record<string, string> = {
    approved: '通过',
    pending: '待改',
    risk: '风险',
  }

  const renderSceneInfoCard = () => (
    <div className="border border-border rounded-sm bg-panel/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-surface/80 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber" />
          <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">场景信息</h3>
        </div>
        <ReviewBadge status={proj.reviewStatus['scene-info']} />
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-mono text-muted block mb-1">场景地点</span>
            <p className="text-lg font-sans text-fg">
              {proj.sceneLocation === 'custom'
                ? proj.customSceneName || '自定义场景'
                : SCENE_LABELS[proj.sceneLocation]}
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-muted block mb-1">干扰等级</span>
            <p className="text-lg font-sans text-fg">LEVEL {proj.interferenceLevel}</p>
            <div className="flex gap-1 mt-2">
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
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 text-xs font-mono bg-surface text-fgdim rounded-sm">
            {ERA_LABELS[proj.era]}
          </span>
          <span className="px-2 py-0.5 text-xs font-mono bg-surface text-fgdim rounded-sm">
            {TONE_LABELS[proj.broadcastTone]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-fgdim">广播片段</span>
            </div>
            <p className="text-lg font-sans text-fg">{proj.segments.length} 条</p>
            <div className="flex items-center gap-3 mt-1 text-xs font-mono">
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
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-fgdim">解谜路径</span>
            </div>
            <p className="text-lg font-sans text-fg">
              {correctPaths} 正确 / {misleadingPaths} 误导
            </p>
          </div>
        </div>
        <div className="space-y-3 border-t border-border/50 pt-3">
          <div>
            <span className="text-xs font-mono text-muted block mb-1">项目名称</span>
            <p className="text-sm text-fg">{proj.projectName || '未命名项目'}</p>
          </div>
          <div>
            <span className="text-xs font-mono text-muted block mb-1">项目ID</span>
            <p className="text-sm font-mono text-fgdim">{proj.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-xs font-mono text-muted">创建: {formatDate(proj.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-xs font-mono text-muted">更新: {formatDate(proj.updatedAt)}</span>
            </div>
          </div>
        </div>
        {proj.playerClues && (
          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-fgdim">玩家线索</span>
            </div>
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
          </div>
        )}
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber" />
            <span className="font-mono text-xs text-fgdim">噪声配置</span>
          </div>
          <div className="space-y-2">
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
        </div>
        <div className="border-t border-border/50 pt-3">
          <ReviewButtons
            itemId="scene-info"
            currentStatus={proj.reviewStatus['scene-info']}
            onSetStatus={handleSetReviewStatus}
          />
        </div>
      </div>
    </div>
  )

  const renderSegmentCard = (segId: string) => {
    const seg = proj.segments.find((s) => s.id === segId)
    if (!seg) return null
    const mask = proj.segmentMasks.find((sm) => sm.segmentId === seg.id)
    const notes = proj.segmentNotes[seg.id] || { narrative: '', audio: '', levelDesign: '' }
    const completion = proj.noteCompletion[seg.id] || { narrative: false, audio: false, levelDesign: false }
    return (
      <div className="border border-border rounded-sm bg-panel/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-surface/80 border-b border-border">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-amber tracking-widest">
              CH-{String(seg.index).padStart(2, '0')}
            </h3>
          </div>
          <ReviewBadge status={proj.reviewStatus[seg.id]} />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-1">
            {seg.keywords.slice(0, 5).map((kw) => (
              <span
                key={kw}
                className="px-1.5 py-0.5 text-xs font-mono bg-amber/10 text-amber/80 rounded-sm"
              >
                {kw}
              </span>
            ))}
          </div>
          <p className="terminal-text text-sm text-fg/90 bg-void/50 border border-border rounded-sm p-3">
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
                        {Math.round(m.probability * 100)}%
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
          <div className="border-t border-border/50 pt-3">
            <ReviewButtons
              itemId={seg.id}
              currentStatus={proj.reviewStatus[seg.id]}
              onSetStatus={handleSetReviewStatus}
            />
          </div>
          <NoteEditor itemId={seg.id} notes={notes} onSetNote={handleSetSegmentNote} noteCompletion={completion} onToggleCompletion={handleToggleCompletion} />
        </div>
      </div>
    )
  }

  const renderPathCard = (pathId: string) => {
    const rp = proj.reasoningPaths.find((p) => p.id === pathId)
    if (!rp) return null
    const notes = proj.pathNotes[rp.id] || { narrative: '', audio: '', levelDesign: '' }
    const completion = proj.noteCompletion[rp.id] || { narrative: false, audio: false, levelDesign: false }
    return (
      <div
        className={`border rounded-sm bg-panel/50 overflow-hidden ${
          rp.isCorrect ? 'border-safe/40' : 'border-danger/40'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-surface/80 border-b border-border">
          <div className="flex items-center gap-2">
            {rp.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-safe-glow" />
            ) : (
              <XCircle className="w-4 h-4 text-danger-glow" />
            )}
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">
              推理路径 {rp.isCorrect ? '(正确)' : '(误导)'}
            </h3>
          </div>
          <ReviewBadge status={proj.reviewStatus[rp.id]} />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-sans ${rp.isCorrect ? 'text-safe-glow' : 'text-danger-glow'}`}>
              {rp.conclusion}
            </span>
            <span className="text-xs font-mono text-muted">难度 {rp.difficulty}/5</span>
          </div>
          {rp.fragments.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
            {rp.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-muted">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="border-t border-border/50 pt-3">
            <ReviewButtons
              itemId={rp.id}
              currentStatus={proj.reviewStatus[rp.id]}
              onSetStatus={handleSetReviewStatus}
            />
          </div>
          <NoteEditor itemId={rp.id} notes={notes} onSetNote={handleSetPathNote} noteCompletion={completion} onToggleCompletion={handleToggleCompletion} />
        </div>
      </div>
    )
  }

  const renderCurrentCard = () => {
    if (currentCardId === 'scene-info') return renderSceneInfoCard()
    const segIdx = proj.segments.findIndex((s) => s.id === currentCardId)
    if (segIdx >= 0) return renderSegmentCard(currentCardId)
    return renderPathCard(currentCardId)
  }

  const renderOverview = () => (
    <div className="space-y-6">
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
          {proj.segments.filter((s) => matchesFilter(s.id)).length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              暂无广播片段，请先在"频段草稿"中生成
            </div>
          ) : (
            proj.segments.filter((s) => matchesFilter(s.id)).map((seg) => {
              const mask = proj.segmentMasks.find((sm) => sm.segmentId === seg.id)
              const notes = proj.segmentNotes[seg.id] || { narrative: '', audio: '', levelDesign: '' }
              const completion = proj.noteCompletion[seg.id] || { narrative: false, audio: false, levelDesign: false }
              const hasNotes = notes.narrative || notes.audio || notes.levelDesign
              return (
                <div key={seg.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber">
                        CH-{String(seg.index).padStart(2, '0')}
                      </span>
                      <ReviewBadge status={proj.reviewStatus[seg.id]} />
                      {hasNotes && <PenLine className="w-3 h-3 text-amber/60" />}
                    </div>
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
                                {Math.round(m.probability * 100)}%
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
                  <div className="mt-3 flex items-center gap-3">
                    <ReviewButtons
                      itemId={seg.id}
                      currentStatus={proj.reviewStatus[seg.id]}
                      onSetStatus={handleSetReviewStatus}
                    />
                  </div>
                  <NoteEditor itemId={seg.id} notes={notes} onSetNote={handleSetSegmentNote} noteCompletion={completion} onToggleCompletion={handleToggleCompletion} />
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
            {proj.reasoningPaths.filter((rp) => matchesFilter(rp.id)).length === 0 ? (
              <p className="text-sm text-muted italic text-center py-4">
                暂无推理路径，请先在"解谜校验"中生成
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {proj.reasoningPaths.filter((rp) => matchesFilter(rp.id)).map((rp) => {
                  const notes = proj.pathNotes[rp.id] || { narrative: '', audio: '', levelDesign: '' }
                  const completion = proj.noteCompletion[rp.id] || { narrative: false, audio: false, levelDesign: false }
                  const hasNotes = notes.narrative || notes.audio || notes.levelDesign
                  return (
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
                        <div className="flex items-center gap-2">
                          <ReviewBadge status={proj.reviewStatus[rp.id]} />
                          {hasNotes && <PenLine className="w-3 h-3 text-amber/60" />}
                          <span className="text-xs font-mono text-muted">
                            难度 {rp.difficulty}/5
                          </span>
                        </div>
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
                      <div className="mt-2 flex items-center gap-3">
                        <ReviewButtons
                          itemId={rp.id}
                          currentStatus={proj.reviewStatus[rp.id]}
                          onSetStatus={handleSetReviewStatus}
                        />
                      </div>
                      <NoteEditor itemId={rp.id} notes={notes} onSetNote={handleSetPathNote} noteCompletion={completion} onToggleCompletion={handleToggleCompletion} />
                    </div>
                  )
                })}
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

  const renderMeetingMode = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrev}
            disabled={cardIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors border-border text-fgdim hover:border-amber/30 hover:text-amber disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            上一项
          </button>
          <span className="font-mono text-sm text-amber">
            {cardIndex + 1} / {totalCards}
          </span>
          <button
            onClick={goToNext}
            disabled={cardIndex === totalCards - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors border-border text-fgdim hover:border-amber/30 hover:text-amber disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一项
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMinutesExpanded(true); setTimeout(scrollToMinutes, 50) }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono bg-amber/15 text-amber border border-amber/30 rounded-sm hover:bg-amber/25 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            生成纪要
          </button>
          <div className="flex gap-1 flex-wrap">
            {cardIds.map((id, i) => (
              <button
                key={id}
                onClick={() => setCardIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === cardIndex
                    ? 'bg-amber'
                    : proj.reviewStatus[id] === 'approved'
                    ? 'bg-safe-glow'
                    : proj.reviewStatus[id] === 'risk'
                    ? 'bg-danger-glow'
                    : proj.reviewStatus[id] === 'pending'
                    ? 'bg-warn-glow'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      {filteredCardIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted">
          <AlertCircle className="w-8 h-8 mb-3" />
          <p className="text-sm font-mono">
            没有匹配的{filterLabelMap[filter] || ''}项
          </p>
        </div>
      ) : (
        renderCurrentCard()
      )}
    </div>
  )

  return (
    <div className="panel-enter space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber" />
            <h2 className="font-mono text-lg text-amber tracking-wide">方案预览</h2>
          </div>
          {adoptedProject && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-safe/15 text-safe-glow border border-safe/30 rounded-sm">
              <Stamp className="w-3 h-3" />
              采用方案: {adoptedProject.projectName}
            </span>
          )}
          <div className="h-px flex-1 bg-gradient-to-r from-amber/30 to-transparent" />
          <ReviewSummary reviewStatus={proj.reviewStatus} />
        </div>
        <button
          onClick={() => {
            setMeetingMode(!meetingMode)
            setCardIndex(0)
            setMinutesExpanded(false)
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors ${
            meetingMode
              ? 'bg-amber/15 text-amber border-amber/30'
              : 'bg-void/50 text-fgdim border-border hover:border-amber/30 hover:text-amber'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {meetingMode ? '会议模式' : '会议模式'}
        </button>
      </div>

      <div className="flex items-center gap-2 py-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber" />
          <span className="text-xs font-mono text-fgdim">筛选</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleFilterChange('all')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded-sm border transition-colors ${
              filter === 'all'
                ? 'bg-amber/15 text-amber border-amber/30'
                : 'bg-void/50 text-fgdim border-border hover:border-amber/20 hover:text-amber'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleFilterChange('approved')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded-sm border transition-colors ${
              filter === 'approved'
                ? 'bg-safe/15 text-safe-glow border-safe/30'
                : 'bg-void/50 text-fgdim border-border hover:border-safe/20 hover:text-safe-glow'
            }`}
          >
            通过
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded-sm border transition-colors ${
              filter === 'pending'
                ? 'bg-warn/15 text-warn-glow border-warn/30'
                : 'bg-void/50 text-fgdim border-border hover:border-warn/20 hover:text-warn-glow'
            }`}
          >
            待改
          </button>
          <button
            onClick={() => handleFilterChange('risk')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded-sm border transition-colors ${
              filter === 'risk'
                ? 'bg-danger/15 text-danger-glow border-danger/30'
                : 'bg-void/50 text-fgdim border-border hover:border-danger/20 hover:text-danger-glow'
            }`}
          >
            风险
          </button>
        </div>
      </div>

      {meetingMode ? renderMeetingMode() : renderOverview()}

      <div ref={minutesRef} className="border border-border rounded-sm bg-panel/30 overflow-hidden">
        <button
          onClick={() => setMinutesExpanded(!minutesExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 bg-surface/80 border-b border-border hover:bg-surface/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-xs text-fgdim tracking-widest uppercase">评审纪要</h3>
          </div>
          {minutesExpanded ? (
            <ChevronUp className="w-4 h-4 text-fgdim" />
          ) : (
            <ChevronDown className="w-4 h-4 text-fgdim" />
          )}
        </button>
        {minutesExpanded && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {([
                  { key: 'narrative', label: '编剧待办', icon: ClipboardList },
                  { key: 'audio', label: '音频待办', icon: Mic },
                  { key: 'levelDesign', label: '关卡待办', icon: MapPin },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setMinutesTab(key)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
                      minutesTab === key
                        ? 'bg-amber/15 text-amber border-amber/30'
                        : 'bg-void/50 text-fgdim border-border hover:border-amber/20 hover:text-amber'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleExportMinutes}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono bg-amber/15 text-amber border border-amber/30 rounded-sm hover:bg-amber/25 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                导出纪要
              </button>
            </div>
            {(() => {
              const minutes = generateReviewMinutes()
              const todos = minutes.todoByCategory[minutesTab]
              if (todos.length === 0) {
                return <p className="text-sm text-muted italic text-center py-4">暂无待办事项</p>
              }
              return (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {todos.map((todo, i) => {
                    const isCompleted = todo.completed[minutesTab]
                    return (
                      <div key={i} className={`border border-border rounded-sm bg-void/30 p-3 ${isCompleted ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="cursor-pointer"
                              onClick={() => handleToggleCompletion(todo.itemId, minutesTab)}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-safe-glow" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-fgdim" />
                              )}
                            </span>
                            <span className="text-xs font-mono text-fgdim">
                              {todo.itemType === 'segment' ? '广播片段' : '推理路径'}
                            </span>
                            <span className={`text-sm font-sans ${isCompleted ? 'line-through text-muted' : 'text-fg'}`}>
                              {todo.itemTitle}
                            </span>
                          </div>
                          <ReviewBadge status={todo.status} />
                        </div>
                        {todo.notes[minutesTab] && (
                          <p className={`text-xs bg-panel/50 rounded-sm p-2 border border-border/50 ${isCompleted ? 'line-through text-muted' : 'text-fgdim'}`}>
                            {todo.notes[minutesTab]}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {(() => {
              const minutes = generateReviewMinutes()
              const conclusion = minutes.conclusion
              if (!conclusion) return null
              return (
                <div className="mt-4 bg-surface/50 rounded-sm p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Stamp className="w-4 h-4 text-amber" />
                    <h4 className="font-mono text-xs text-fgdim tracking-widest uppercase">评审结论</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-safe-glow" />
                      <span className="text-xs font-mono text-muted">采用方案:</span>
                      <span className="text-sm text-fg">{conclusion.adoptedProjectName || '未决定'}</span>
                    </div>
                    {conclusion.eliminatedProjectIds.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Ban className="w-3.5 h-3.5 text-danger-glow mt-0.5" />
                        <div>
                          <span className="text-xs font-mono text-muted">驳回方案:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {conclusion.eliminatedProjectIds.map((id) => {
                              const p = projects[id]
                              return p ? (
                                <span key={id} className="px-2 py-0.5 text-xs font-mono bg-danger/10 text-danger-glow rounded-sm">
                                  {p.projectName}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {Object.entries(conclusion.decisionReasons).length > 0 && (
                      <div>
                        <span className="text-xs font-mono text-muted">选择理由:</span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(conclusion.decisionReasons).map(([id, reason]) => {
                            const p = projects[id]
                            return (
                              <div key={id} className="text-xs text-fgdim">
                                <span className="text-amber">{p?.projectName || id}</span>: {reason}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-mono text-muted">下一步待办:</span>
                      <div className="mt-2 space-y-2">
                        {([
                          { key: 'narrative' as const, label: '编剧' },
                          { key: 'audio' as const, label: '音频' },
                          { key: 'levelDesign' as const, label: '关卡' },
                        ]).map(({ key, label }) => (
                          <div key={key}>
                            <span className="text-xs font-mono text-fgdim">{label}</span>
                            <textarea
                              value={proj.reviewConclusion.nextSteps[key]}
                              onChange={(e) => {
                                setReviewConclusion({
                                  ...proj.reviewConclusion,
                                  nextSteps: { ...proj.reviewConclusion.nextSteps, [key]: e.target.value }
                                })
                              }}
                              className="w-full h-16 px-2 py-1.5 text-xs font-sans bg-void/50 border border-border rounded-sm text-fg placeholder:text-muted/50 focus:outline-none focus:border-amber/40 resize-none mt-1"
                              placeholder={`输入${label}待办...`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
