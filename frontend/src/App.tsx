import { useState } from 'react'
import { uploadImage, analyzeImage, generateModel } from './api/client'
import type { Step, StyleSuggestion } from './types'
import UploadZone from './components/UploadZone'
import StyleCards from './components/StyleCards'
import TaskStatus from './components/TaskStatus'
import ModelViewer from './components/ModelViewer'

const STEP_LABELS: Partial<Record<Step, string>> = {
  UPLOAD: '上传照片',
  ANALYZING: '上传照片',
  SELECT_STYLE: '选择风格',
  GENERATING: '生成3D',
  VIEWING: '查看结果',
}

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ['UPLOAD', 'SELECT_STYLE', 'GENERATING', 'VIEWING']
  const currentIdx = steps.indexOf(current === 'ANALYZING' ? 'UPLOAD' : current === 'FAILED' ? 'GENERATING' : current)

  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${i < currentIdx ? 'bg-popmart-pink text-white' : ''}
            ${i === currentIdx ? 'bg-gradient-to-r from-popmart-pink to-popmart-purple text-white shadow-lg shadow-pink-500/40 scale-110' : ''}
            ${i > currentIdx ? 'bg-white/10 text-white/30' : ''}
          `}>
            {i < currentIdx ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === currentIdx ? 'text-white' : 'text-white/30'}`}>
            {STEP_LABELS[step]}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px ${i < currentIdx ? 'bg-popmart-pink' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState<Step>('UPLOAD')
  const [error, setError] = useState<string | null>(null)

  // Upload state
  const [fileId, setFileId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Analyze state
  const [nobgPreviewUrl, setNobgPreviewUrl] = useState<string | null>(null)
  const [clipTags, setClipTags] = useState<string[]>([])
  const [styles, setStyles] = useState<StyleSuggestion[]>([])

  // Generation state
  const [taskId, setTaskId] = useState<string | null>(null)
  const [glbUrl, setGlbUrl] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)

  const handleFileSelected = async (file: File) => {
    setStep('ANALYZING')
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const uploaded = await uploadImage(file)
      setFileId(uploaded.file_id)
      setPreviewUrl(uploaded.preview_url)

      const analyzed = await analyzeImage(uploaded.file_id)
      setNobgPreviewUrl(analyzed.nobg_preview_url)
      setClipTags(analyzed.clip_tags)
      setStyles(analyzed.styles)
      setStep('SELECT_STYLE')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传或分析失败')
      setStep('UPLOAD')
    }
  }

  const handleGenerate = async (prompt: string, styleName: string) => {
    if (!fileId) return
    setSubmitting(true)
    try {
      const res = await generateModel(fileId, prompt, styleName)
      setTaskId(res.task_id)
      setStep('GENERATING')
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDone = (url: string) => {
    setGlbUrl(url)
    setStep('VIEWING')
  }

  const handleFailed = (err: string) => {
    setError(err)
    setStep('FAILED')
  }

  const handleReset = () => {
    setStep('UPLOAD')
    setFileId(null)
    setPreviewUrl(null)
    setNobgPreviewUrl(null)
    setClipTags([])
    setStyles([])
    setTaskId(null)
    setGlbUrl(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-[#160a2e] to-pink-950 text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-popmart-pink/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-popmart-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-popmart-pink via-white to-popmart-cyan bg-clip-text text-transparent">
            AI 盲盒定制
          </h1>
          <p className="text-white/40 text-sm">上传照片 · 生成专属3D泡泡马特风格盲盒</p>
        </div>

        <StepIndicator current={step} />

        {/* Step content */}
        <div className="flex flex-col items-center">
          {(step === 'UPLOAD' || step === 'ANALYZING') && (
            <div className="w-full max-w-md space-y-4">
              <UploadZone
                onFile={handleFileSelected}
                loading={step === 'ANALYZING'}
                previewUrl={previewUrl ?? undefined}
              />
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl p-3">
                  ❌ {error}
                  <button onClick={() => setError(null)} className="ml-2 underline">重试</button>
                </div>
              )}
            </div>
          )}

          {step === 'SELECT_STYLE' && styles.length > 0 && (
            <StyleCards
              styles={styles}
              nobgPreviewUrl={nobgPreviewUrl ?? ''}
              clipTags={clipTags}
              onGenerate={handleGenerate}
              loading={submitting}
            />
          )}

          {step === 'GENERATING' && taskId && (
            <TaskStatus
              taskId={taskId}
              onDone={handleDone}
              onFailed={handleFailed}
            />
          )}

          {step === 'VIEWING' && glbUrl && (
            <ModelViewer glbUrl={glbUrl} onReset={handleReset} />
          )}

          {step === 'FAILED' && (
            <div className="text-center space-y-4 max-w-md">
              <p className="text-5xl">😔</p>
              <p className="text-red-400 font-semibold">3D生成失败</p>
              <p className="text-white/40 text-sm">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-popmart-pink to-popmart-purple text-white font-bold hover:scale-105 transition-transform"
              >
                重新开始
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
