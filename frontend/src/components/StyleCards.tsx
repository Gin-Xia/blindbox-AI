import { useState } from 'react'
import StyleCard from './StyleCard'
import type { StyleSuggestion } from '../types'

interface Props {
  styles: StyleSuggestion[]
  nobgPreviewUrl: string
  clipTags: string[]
  onGenerate: (prompt: string, styleName: string) => void
  loading: boolean
}

export default function StyleCards({ styles, nobgPreviewUrl, clipTags, onGenerate, loading }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [prompts, setPrompts] = useState<Record<number, string>>(
    Object.fromEntries(styles.map(s => [s.style_id, s.prompt]))
  )

  const selected = styles.find(s => s.style_id === selectedId)

  const handleGenerate = () => {
    if (!selected) return
    onGenerate(prompts[selected.style_id], selected.style_name)
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Before/after preview */}
      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <p className="text-white/40 text-xs mb-2">已去除背景</p>
          <img
            src={nobgPreviewUrl}
            alt="Background removed"
            className="w-28 h-28 object-contain rounded-xl border border-white/10 bg-white/5"
          />
        </div>
        <div className="text-white/30 text-2xl">→</div>
        <div className="text-center">
          <p className="text-white/40 text-xs mb-2">识别到的特征</p>
          <div className="flex flex-wrap gap-1 max-w-48 justify-center">
            {clipTags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                {tag.replace('a person ', '')}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-white/50 text-sm">
        选择一种风格，可编辑提示词后生成3D模型
      </p>

      {/* Style cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {styles.map(style => (
          <StyleCard
            key={style.style_id}
            style={style}
            selected={selectedId === style.style_id}
            prompt={prompts[style.style_id]}
            onSelect={() => setSelectedId(style.style_id)}
            onPromptChange={text => setPrompts(prev => ({ ...prev, [style.style_id]: text }))}
          />
        ))}
      </div>

      {/* Generate button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleGenerate}
          disabled={selectedId === null || loading}
          className={`
            px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200
            ${selectedId !== null && !loading
              ? 'bg-gradient-to-r from-popmart-pink to-popmart-purple text-white shadow-lg shadow-pink-500/30 hover:scale-105 hover:shadow-pink-500/50 active:scale-95'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              提交中...
            </span>
          ) : (
            '✨ 生成3D模型'
          )}
        </button>
      </div>
    </div>
  )
}
