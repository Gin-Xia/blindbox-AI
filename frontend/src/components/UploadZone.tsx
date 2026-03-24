import { useRef, useState, useCallback } from 'react'

interface Props {
  onFile: (file: File) => void
  loading: boolean
  previewUrl?: string
}

export default function UploadZone({ onFile, loading, previewUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    onFile(file)
  }, [onFile])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${dragging
            ? 'border-popmart-pink bg-pink-500/10 scale-105'
            : 'border-white/20 hover:border-popmart-pink/60 hover:bg-white/5'
          }
          ${loading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {previewUrl ? (
          <div className="space-y-3">
            <img
              src={previewUrl}
              alt="Uploaded"
              className="w-40 h-40 object-cover rounded-xl mx-auto shadow-lg shadow-pink-500/20"
            />
            <p className="text-white/50 text-sm">点击替换图片</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">📸</div>
            <p className="text-white font-semibold text-lg">上传你的照片</p>
            <p className="text-white/40 text-sm">拖拽或点击选择 · JPG / PNG / WEBP · 最大10MB</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-popmart-pink border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/70 text-sm">分析中...</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
