export type Aesthetic = 'fantasy' | 'cyberpunk' | 'chibi'
export type TaskStatusValue = 'pending' | 'processing' | 'done' | 'failed'
export type Step = 'UPLOAD' | 'ANALYZING' | 'SELECT_STYLE' | 'GENERATING' | 'VIEWING' | 'FAILED'

export interface StyleSuggestion {
  style_id: number
  style_name: string
  prompt: string
  aesthetic: Aesthetic
}

export interface UploadResponse {
  file_id: string
  preview_url: string
}

export interface AnalyzeResponse {
  file_id: string
  nobg_preview_url: string
  clip_tags: string[]
  styles: StyleSuggestion[]
}

export interface GenerateResponse {
  task_id: string
  status: string
  message: string
}

export interface TaskStatusResponse {
  task_id: string
  status: TaskStatusValue
  progress_message: string | null
  glb_url: string | null
  error: string | null
}
