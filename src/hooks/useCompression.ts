import { useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import { useAppStore } from '@/store/useAppStore'
import type { ProgressPayload, QueuedFile, HistoryEntry, VideoInfo, ImageInfo } from '@/types'

const VIDEO_EXTS = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'm4v']
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'tif', 'bmp', 'gif']

export function useCompression() {
  const store = useAppStore()

  // Load history on mount
  useEffect(() => {
    invoke<string>('load_history').then((raw) => {
      try { store.loadHistory(JSON.parse(raw)) } catch {}
    }).catch(() => {})
  }, [])

  // Check FFmpeg availability
  useEffect(() => {
    invoke<boolean>('check_ffmpeg').catch(() => {})
  }, [])

  // Listen to progress events
  useEffect(() => {
    const unlisten = listen<ProgressPayload>('compress-progress', (e) => {
      store.setProgress(e.payload)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  const pickFile = useCallback(async (paths?: string[]) => {
    const mediaType = useAppStore.getState().mediaType
    const isVideo = mediaType === 'video'
    let selectedPaths: string[] = paths || []

    if (selectedPaths.length === 0) {
      const result = await open({
        multiple: true,
        filters: [{
          name: isVideo ? 'Video' : 'Image',
          extensions: isVideo ? VIDEO_EXTS : IMAGE_EXTS,
        }],
      })
      if (!result) return
      if (Array.isArray(result)) {
        selectedPaths = result
      } else if (typeof result === 'string') {
        selectedPaths = [result]
      }
    }

    if (selectedPaths.length === 0) return

    // Check first file extension to auto-detect media type
    const firstExt = selectedPaths[0].split('.').pop()?.toLowerCase() ?? ''
    if (VIDEO_EXTS.includes(firstExt) && !isVideo) {
      useAppStore.getState().setMediaType('video')
    } else if (IMAGE_EXTS.includes(firstExt) && isVideo) {
      useAppStore.getState().setMediaType('image')
    }

    const currentMediaType = useAppStore.getState().mediaType
    const newFiles: QueuedFile[] = []

    for (const selected of selectedPaths) {
      const name = selected.split(/[\\/]/).pop() ?? selected
      const id = Date.now().toString() + Math.random().toString(36).substring(7)

      if (currentMediaType === 'video') {
        try {
          const info = await invoke<VideoInfo>('get_video_info', { path: selected })
          const secs = Math.round(info.duration)
          const h = Math.floor(secs / 3600)
          const m = Math.floor((secs % 3600) / 60)
          const s = secs % 60
          const duration = `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          const sizeBytes = info.size
          const sizeMB = sizeBytes >= 1_073_741_824
            ? (sizeBytes / 1_073_741_824).toFixed(2) + ' GB'
            : (sizeBytes / 1_048_576).toFixed(1) + ' MB'

          newFiles.push({
            id, status: 'pending', path: selected, name, sizeBytes, sizeMB,
            duration, durationSeconds: info.duration,
            resolution: `${info.width}×${info.height}`,
            codec: info.codec.toUpperCase(),
            fps: info.fps > 0 ? info.fps.toFixed(2) : undefined,
          })
        } catch (e) {
          console.error('Could not read video metadata:', e)
        }
      } else {
        try {
          const info = await invoke<ImageInfo>('get_image_info', { path: selected })
          const sizeBytes = info.size
          const sizeMB = sizeBytes >= 1_073_741_824
            ? (sizeBytes / 1_073_741_824).toFixed(2) + ' GB'
            : (sizeBytes / 1_048_576).toFixed(1) + ' MB'

          newFiles.push({
            id, status: 'pending', path: selected, name, sizeBytes, sizeMB,
            dimensions: `${info.width}×${info.height}`,
            codec: info.format.toUpperCase(),
          })
        } catch (e) {
          console.error('Could not read image metadata:', e)
        }
      }
    }

    if (newFiles.length > 0) {
      useAppStore.getState().addToQueue(newFiles)
    }
  }, [])

  const startCompression = useCallback(async () => {
    const state = useAppStore.getState()
    const { queue, preset, crf, resolution, format, removeAudio, hwAccel,
            mediaType, imageQuality, imageFormat, stripMetadata, outputFolder } = state
    if (queue.length === 0) return

    useAppStore.getState().setStatus('compressing')

    for (let i = 0; i < queue.length; i++) {
      const file = queue[i]
      if (file.status === 'done') continue

      useAppStore.getState().setActiveIndex(i)
      useAppStore.getState().updateQueuedFile(file.id, { status: 'compressing' })
      useAppStore.getState().setProgress({ pct: 0, etaSeconds: 0, fps: 0 })

      const outDir = outputFolder ?? file.path.replace(/[\\/][^\\/]+$/, '')
      const baseName = file.name.replace(/\.[^.]+$/, '')

      try {
        if (mediaType === 'video') {
          const outName = `${baseName}_${preset}.${format}`
          const outputPath = `${outDir}\\${outName}`

          const result = await invoke<{ output_path: string; output_size: number }>('compress_video', {
            inputPath: file.path,
            outputPath,
            crf,
            preset,
            resolution,
            format,
            removeAudio,
            hwAccel,
          })

          const inputSizeBytes = file.sizeBytes
          const outputSizeBytes = result.output_size
          const savedMB = (inputSizeBytes - outputSizeBytes) / 1_048_576
          const savedPct = Math.round((savedMB / (inputSizeBytes / 1_048_576)) * 100)

          const compResult = {
            inputSizeBytes, outputSizeBytes, savedMB, savedPct,
            outputPath: result.output_path,
          }
          useAppStore.getState().updateQueuedFile(file.id, { status: 'done', result: compResult })
          
          if (i === queue.length - 1) {
            useAppStore.getState().setResult(compResult)
          }

          const entry: HistoryEntry = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            filename: file.name,
            mediaType: 'video',
            preset,
            inputSizeMB: parseFloat((inputSizeBytes / 1_048_576).toFixed(2)),
            outputSizeMB: parseFloat((outputSizeBytes / 1_048_576).toFixed(2)),
            savedPct,
            timestamp: new Date().toISOString(),
            outputPath: result.output_path,
          }
          useAppStore.getState().addHistory(entry)
          const allHistory = useAppStore.getState().history
          await invoke('save_history', { entriesJson: JSON.stringify(allHistory.slice(0, 20)) })
        } else {
          // Image compression
          const outName = `${baseName}_${preset}.${imageFormat}`
          const outputPath = `${outDir}\\${outName}`

          const result = await invoke<{ output_path: string; output_size: number }>('compress_image', {
            inputPath: file.path,
            outputPath,
            quality: imageQuality,
            format: imageFormat,
            stripMetadata,
          })

          const inputSizeBytes = file.sizeBytes
          const outputSizeBytes = result.output_size
          const savedMB = (inputSizeBytes - outputSizeBytes) / 1_048_576
          const savedPct = Math.round((savedMB / (inputSizeBytes / 1_048_576)) * 100)

          const compResult = {
            inputSizeBytes, outputSizeBytes, savedMB, savedPct,
            outputPath: result.output_path,
          }
          useAppStore.getState().updateQueuedFile(file.id, { status: 'done', result: compResult })

          if (i === queue.length - 1) {
            useAppStore.getState().setResult(compResult)
          }

          const entry: HistoryEntry = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            filename: file.name,
            mediaType: 'image',
            preset,
            inputSizeMB: parseFloat((inputSizeBytes / 1_048_576).toFixed(2)),
            outputSizeMB: parseFloat((outputSizeBytes / 1_048_576).toFixed(2)),
            savedPct,
            timestamp: new Date().toISOString(),
            outputPath: result.output_path,
          }
          useAppStore.getState().addHistory(entry)
          const allHistory = useAppStore.getState().history
          await invoke('save_history', { entriesJson: JSON.stringify(allHistory.slice(0, 20)) })
        }
      } catch (e) {
        if (useAppStore.getState().status === 'idle') {
          // It was cancelled intentionally, break out of loop
          useAppStore.getState().updateQueuedFile(file.id, { status: 'pending' })
          break
        }
        useAppStore.getState().updateQueuedFile(file.id, { status: 'error', errorMsg: String(e) })
      }
    }

    if (useAppStore.getState().status !== 'idle') {
      useAppStore.getState().setStatus('done')
    }
  }, [])

  const cancelCompression = useCallback(async () => {
    await invoke('cancel_compression')
    useAppStore.getState().setStatus('idle')
    useAppStore.getState().setProgress({ pct: 0, etaSeconds: 0, fps: 0 })
  }, [])

  const openOutputFile = useCallback(async () => {
    const result = useAppStore.getState().result
    if (!result?.outputPath) return
    await invoke('reveal_file', { path: result.outputPath })
  }, [])

  return { pickFile, startCompression, cancelCompression, openOutputFile }
}
