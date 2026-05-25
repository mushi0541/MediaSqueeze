export type MediaType  = 'video' | 'image'
export type Preset     = 'low' | 'medium' | 'high'
export type AppStatus  = 'idle' | 'compressing' | 'done' | 'error'
export type Resolution = 'original' | '4k' | '1080p' | '720p' | '480p'
export type OutputFormat = 'mp4' | 'mkv' | 'webm'
export type ImageFormat  = 'jpg' | 'png' | 'webp'
export type HwAccel      = 'cpu' | 'nvenc' | 'amf' | 'qsv'

export interface QueuedFile {
  id: string
  path: string
  name: string
  sizeBytes: number
  sizeMB: string
  // Status tracking for batch queue
  status: 'pending' | 'compressing' | 'done' | 'error'
  result?: CompressionResult
  errorMsg?: string
  // video-only
  duration?: string
  durationSeconds?: number
  resolution?: string
  codec?: string
  fps?: string
  // image-only
  dimensions?: string
  colorMode?: string
}

export interface ProgressPayload {
  pct: number
  etaSeconds: number
  fps: number
}

export interface CompressionResult {
  inputSizeBytes: number
  outputSizeBytes: number
  savedMB: number
  savedPct: number
  outputPath: string
}

export interface HistoryEntry {
  id: string
  filename: string
  mediaType: MediaType
  preset: Preset
  inputSizeMB: number
  outputSizeMB: number
  savedPct: number
  timestamp: string
  outputPath?: string
}

export interface VideoInfo {
  duration: number
  width: number
  height: number
  codec: string
  fps: number
  size: number
}

export interface ImageInfo {
  width: number
  height: number
  format: string
  size: number
}
