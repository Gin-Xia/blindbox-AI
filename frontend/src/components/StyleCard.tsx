import type { StyleSuggestion, Aesthetic } from '../types'

const AESTHETIC_CONFIG: Record<Aesthetic, { icon: string; accent: string; ring: string }> = {
  fantasy: { icon: '✨', accent: 'text-yellow-300', ring: 'ring-yellow-400' },
  cyberpunk: { icon: '⚡', accent: 'text-cyan-300', ring: 'ring-cyan-400' },
  chibi: { icon: '🌸', accent: 'text-pink-300', ring: 'ring-pink-400' },
}

interface Props {
  style: StyleSuggestion
  selected: boolean
  prompt: string               // current (possibly edited) prompt text
  onSelect: () => void
  onPromptChange: (text: string) => void
}

export default function StyleCard({ style, selected, prompt, onSelect, onPromptChange }: Props) {
  const cfg = AESTHETIC_CONFIG[style.aesthetic]

  return (
    <div
      onClick={onSelect}
      className={`
        relative rounded-2xl p-4 cursor-pointer transition-all duration-200
        bg-white/8 backdrop-blur-md border
        ${selected
          ? `ring-2 ${cfg.ring} border-transparent shadow-lg`
          : 'border-white/10 hover:border-white/25'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{cfg.icon}</span>
        <span className={`font-bold text-sm ${cfg.accent}`}>{style.style_name}</span>
        {selected && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/15 text-white/80">
            已选择
          </span>
        )}
      </div>

      {/* Editable prompt */}
      <textarea
        value={prompt}
        onClick={e => e.stopPropagation()}
        onChange={e => onPromptChange(e.target.value)}
        rows={5}
        className="w-full bg-black/20 rounded-xl p-3 text-xs text-white/70 leading-relaxed
                   resize-none border border-white/10 focus:border-white/30 focus:outline-none
                   focus:ring-1 focus:ring-white/20 transition-colors"
        placeholder="在此修改提示词..."
      />

      <p className="text-white/30 text-xs mt-2">✏️ 可直接编辑提示词</p>
    </div>
  )
}
