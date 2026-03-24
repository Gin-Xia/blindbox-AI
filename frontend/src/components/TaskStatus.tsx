import { useGeneration } from '../hooks/useGeneration'

interface Props {
  taskId: string
  onDone: (glbUrl: string) => void
  onFailed: (error: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  pending: '等待中',
  processing: '生成中',
  done: '已完成',
  failed: '失败',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  processing: 'text-cyan-400',
  done: 'text-green-400',
  failed: 'text-red-400',
}

export default function TaskStatus({ taskId, onDone, onFailed }: Props) {
  const { status, progressMessage, glbUrl, error, elapsed } = useGeneration(taskId)

  // Trigger parent transitions
  if (status === 'done' && glbUrl) {
    setTimeout(() => onDone(glbUrl), 600)
  }
  if (status === 'failed' && error) {
    setTimeout(() => onFailed(error), 600)
  }

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const timeStr = minutes > 0
    ? `${minutes}分${seconds.toString().padStart(2, '0')}秒`
    : `${seconds}秒`

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      {/* Spinner */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-popmart-pink border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-popmart-purple animate-spin-slow" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🎁</span>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <p className={`text-lg font-bold ${STATUS_COLORS[status ?? 'pending']}`}>
          {STATUS_LABELS[status ?? 'pending']}
        </p>
        <p className="text-white/60 text-sm leading-relaxed px-4">
          {progressMessage ?? '正在连接Hunyuan3D-2...'}
        </p>
        <p className="text-white/30 text-xs">已等待 {timeStr}</p>
      </div>

      {/* Note */}
      {(status === 'pending' || status === 'processing') && (
        <div className="bg-white/5 rounded-xl p-4 text-sm text-white/40 leading-relaxed">
          ⏳ Hunyuan3D生成高质量3D模型通常需要 <span className="text-white/60">5-20分钟</span>，
          请耐心等待。页面可以保持在后台运行。
        </div>
      )}

      {/* Error */}
      {status === 'failed' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
          ❌ {error}
        </div>
      )}
    </div>
  )
}
