import { useState, useEffect, useRef } from 'react'
import { getTaskStatus } from '../api/client'
import type { TaskStatusValue } from '../types'

interface GenerationState {
  status: TaskStatusValue | null
  progressMessage: string | null
  glbUrl: string | null
  error: string | null
  elapsed: number  // seconds
}

export function useGeneration(taskId: string | null) {
  const [state, setState] = useState<GenerationState>({
    status: null,
    progressMessage: null,
    glbUrl: null,
    error: null,
    elapsed: 0,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!taskId) return

    startTimeRef.current = Date.now()

    const poll = async () => {
      try {
        const data = await getTaskStatus(taskId)
        setState(prev => ({
          ...prev,
          status: data.status,
          progressMessage: data.progress_message,
          glbUrl: data.glb_url,
          error: data.error,
        }))

        if (data.status === 'done' || data.status === 'failed') {
          clearInterval(intervalRef.current!)
          clearInterval(timerRef.current!)
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Network error',
        }))
        clearInterval(intervalRef.current!)
        clearInterval(timerRef.current!)
      }
    }

    // Poll immediately, then every 5 seconds
    poll()
    intervalRef.current = setInterval(poll, 5000)

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsed: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }))
    }, 1000)

    return () => {
      clearInterval(intervalRef.current!)
      clearInterval(timerRef.current!)
    }
  }, [taskId])

  return state
}
