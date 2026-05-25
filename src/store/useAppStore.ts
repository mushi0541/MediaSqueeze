import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MediaType, Preset, Resolution, OutputFormat, ImageFormat, HwAccel,
  AppStatus, QueuedFile, ProgressPayload, CompressionResult, HistoryEntry
} from '@/types'

interface AppState {
  // Media type
  mediaType:     MediaType
  // Queue
  queue:         QueuedFile[]
  activeIndex:   number
  // Preset & video settings
  preset:        Preset
  crf:           number
  resolution:    Resolution
  format:        OutputFormat
  removeAudio:   boolean
  audioCodec:    string
  audioBitrate:  number
  twoPass:       boolean
  videoCodec:    string
  // Image settings
  imageQuality:  number
  imageFormat:   ImageFormat
  imageWidth:    number | null
  imageHeight:   number | null
  stripMetadata: boolean
  // Output
  outputFolder:  string | null
  // HW Accel
  hwAccel:       HwAccel
  // Status
  status:        AppStatus
  errorMsg:      string | null
  // Progress
  progress:      ProgressPayload
  // Result
  result:        CompressionResult | null
  // History
  history:       HistoryEntry[]

  // Actions
  setMediaType:     (t: MediaType) => void
  addToQueue:       (files: QueuedFile[]) => void
  removeFromQueue:  (id: string) => void
  clearQueue:       () => void
  setActiveIndex:   (idx: number) => void
  updateQueuedFile: (id: string, updates: Partial<QueuedFile>) => void
  setPreset:        (p: Preset) => void
  setCrf:           (v: number) => void
  setResolution:    (r: Resolution) => void
  setFormat:        (f: OutputFormat) => void
  setRemoveAudio:   (v: boolean) => void
  setAudioCodec:    (c: string) => void
  setAudioBitrate:  (b: number) => void
  setTwoPass:       (v: boolean) => void
  setVideoCodec:    (c: string) => void
  setImageQuality:  (q: number) => void
  setImageFormat:   (f: ImageFormat) => void
  setImageWidth:    (w: number | null) => void
  setImageHeight:   (h: number | null) => void
  setStripMetadata: (v: boolean) => void
  setOutputFolder:  (p: string | null) => void
  setHwAccel:       (hw: HwAccel) => void
  setStatus:        (s: AppStatus) => void
  setError:         (msg: string) => void
  setProgress:      (p: ProgressPayload) => void
  setResult:        (r: CompressionResult) => void
  addHistory:       (e: HistoryEntry) => void
  loadHistory:      (entries: HistoryEntry[]) => void
  resetForNew:      () => void
}

const PRESET_CRF: Record<Preset, number> = { low: 36, medium: 28, high: 20 }
const PRESET_IMAGE_QUALITY: Record<Preset, number> = { low: 50, medium: 75, high: 90 }

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mediaType:     'video',
      queue:         [],
      activeIndex:   0,
      preset:        'medium',
  crf:           28,
  resolution:    'original',
  format:        'mp4',
  removeAudio:   false,
  audioCodec:    'AAC',
  audioBitrate:  192,
  twoPass:       true,
  videoCodec:    'H.265 (HEVC)',
  imageQuality:  75,
  imageFormat:   'jpg',
  imageWidth:    null,
  imageHeight:   null,
  stripMetadata: false,
  outputFolder:  null,
  hwAccel:       'cpu',
  status:        'idle',
  errorMsg:      null,
  progress:      { pct: 0, etaSeconds: 0, fps: 0 },
  result:        null,
  history:       [],

  setMediaType:     (t) => set({ mediaType: t }),
  addToQueue:       (files) => set((s) => ({ queue: [...s.queue, ...files] })),
  removeFromQueue:  (id) => set((s) => ({ queue: s.queue.filter(f => f.id !== id) })),
  clearQueue:       () => set({ queue: [], activeIndex: 0 }),
  setActiveIndex:   (idx) => set({ activeIndex: idx }),
  updateQueuedFile: (id, updates) => set((s) => ({
    queue: s.queue.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  setPreset:        (p) => set({
    preset: p,
    crf: PRESET_CRF[p],
    imageQuality: PRESET_IMAGE_QUALITY[p],
  }),
  setCrf:           (v) => set({ crf: v }),
  setResolution:    (r) => set({ resolution: r }),
  setFormat:        (f) => set({ format: f }),
  setRemoveAudio:   (v) => set({ removeAudio: v }),
  setAudioCodec:    (c) => set({ audioCodec: c }),
  setAudioBitrate:  (b) => set({ audioBitrate: b }),
  setTwoPass:       (v) => set({ twoPass: v }),
  setVideoCodec:    (c) => set({ videoCodec: c }),
  setImageQuality:  (q) => set({ imageQuality: q }),
  setImageFormat:   (f) => set({ imageFormat: f }),
  setImageWidth:    (w) => set({ imageWidth: w }),
  setImageHeight:   (h) => set({ imageHeight: h }),
  setStripMetadata: (v) => set({ stripMetadata: v }),
  setOutputFolder:  (p) => set({ outputFolder: p }),
  setHwAccel:       (hw) => set({ hwAccel: hw }),
  setStatus:        (s) => set({ status: s }),
  setError:         (msg) => set({ status: 'error', errorMsg: msg }),
  setProgress:      (p) => set({ progress: p }),
  setResult:        (r) => set({ result: r, status: 'done' }),
  addHistory:       (e) => set((s) => ({ history: [e, ...s.history].slice(0, 20) })),
  loadHistory:      (entries) => set({ history: entries }),
      resetForNew:      () => set({
        queue: [], activeIndex: 0, status: 'idle', errorMsg: null,
        progress: { pct: 0, etaSeconds: 0, fps: 0 }, result: null,
      }),
    }),
    {
      name: 'mediasqueeze-settings',
      partialize: (state) => ({
        mediaType: state.mediaType,
        preset: state.preset,
        crf: state.crf,
        resolution: state.resolution,
        format: state.format,
        audioBitrate: state.audioBitrate,
        removeAudio: state.removeAudio,
        hwAccel: state.hwAccel,
        imageQuality: state.imageQuality,
        imageFormat: state.imageFormat,
        stripMetadata: state.stripMetadata,
        outputFolder: state.outputFolder,
      }),
    }
  )
)

if (typeof window !== 'undefined') {
  (window as any).useAppStore = useAppStore
}
