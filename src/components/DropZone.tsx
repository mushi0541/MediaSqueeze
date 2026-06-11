import { useEffect, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '@/store/useAppStore'
import { useCompression } from '@/hooks/useCompression'

const VIDEO_FORMATS = ['MP4', 'AVI', 'MOV', 'MKV', 'WEBM', 'FLV', 'M4V']
const IMAGE_FORMATS = ['JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'BMP', 'GIF']

export function DropZone() {
  const store = useAppStore()
  const { pickFile } = useCompression()
  const [isDragOver, setIsDragOver] = useState(false)
  const isVideo = store.mediaType === 'video'
  const formats = isVideo ? VIDEO_FORMATS : IMAGE_FORMATS
  const queue = store.queue

  useEffect(() => {
    const unDrop = listen<{ paths: string[] }>('tauri://drag-drop', (e) => {
      setIsDragOver(false)
      if (e.payload.paths.length > 0) pickFile(e.payload.paths)
    })
    const unEnter = listen('tauri://drag-enter', () => setIsDragOver(true))
    const unLeave = listen('tauri://drag-leave', () => setIsDragOver(false))
    return () => { unDrop.then(f => f()); unEnter.then(f => f()); unLeave.then(f => f()) }
  }, [pickFile])

  return (
    <section
      onClick={() => queue.length === 0 && pickFile()}
      className={`relative drop-zone ${queue.length === 0 ? 'active-border' : ''} film-grain bg-surface-container/15 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer group transition-all duration-400 overflow-hidden ${isDragOver ? '!border-primary !bg-primary/5' : ''}`}
      style={{ minHeight: '220px' }}
    >
      {/* Idle state */}
      {queue.length === 0 && (
        <div className="flex flex-col items-center z-10 py-10 px-6 text-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high/80 flex items-center justify-center mb-4 border border-outline-variant/40 group-hover:border-primary/50 group-hover:shadow-[0_0_24px_rgba(78,222,163,0.2)] transition-all duration-300 animate-float">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '33px', fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
          </div>
          <h3 className="text-on-surface font-semibold mb-1 group-hover:text-primary transition-colors" style={{ fontSize: '17px' }}>
            {isVideo ? 'Drop your video here' : 'Drop your image here'}
          </h3>
          <p className="text-on-surface-variant mb-5 font-medium" style={{ fontSize: '15px' }}>or click to browse from your device</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {formats.map((f) => (
              <span key={f} className="px-2.5 py-0.5 bg-surface-container-high/70 rounded font-mono text-outline border border-outline-variant/30 group-hover:border-primary/25 transition-colors" style={{ fontSize: '13px' }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Loaded state */}
      {queue.length > 0 && (
        <div className="w-full h-full max-h-[300px] overflow-y-auto p-3 z-10 space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-on-surface-variant font-semibold text-xs uppercase tracking-wider">{queue.length} Files Queued</span>
            <button onClick={() => pickFile()} className="text-primary hover:text-primary-dim text-xs font-medium flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add More
            </button>
          </div>
          
          {queue.map((file, idx) => (
            <div key={file.id} className={`glass rounded-xl p-3 border ${store.activeIndex === idx && store.status === 'compressing' ? 'border-primary' : file.status === 'done' ? 'border-primary/30 opacity-50' : 'border-outline-variant/30'} flex items-start gap-3 transition-all`}>
              <div className={`w-12 h-12 rounded-lg ${store.activeIndex === idx && store.status === 'compressing' ? 'bg-primary/15' : 'bg-surface-container-high'} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
                {file.status === 'done' ? (
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '21px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : (
                  <span className={`material-symbols-outlined ${store.activeIndex === idx && store.status === 'compressing' ? 'text-primary animate-pulse' : 'text-on-surface-variant'}`} style={{ fontSize: '21px', fontVariationSettings: "'FILL' 1" }}>
                    {isVideo ? 'movie' : 'image'}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-on-surface font-semibold truncate" style={{ fontSize: '15px' }}>{file.name}</p>
                  <button onClick={() => store.removeFromQueue(file.id)} className="text-on-surface-variant hover:text-error shrink-0 transition-colors font-medium">
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="px-2 py-px bg-surface-container-high rounded font-mono text-on-surface-variant font-medium" style={{ fontSize: '12px' }}>{file.sizeMB}</span>
                  {file.resolution && <span className="px-2 py-px bg-surface-container-high rounded font-mono text-on-surface-variant font-medium" style={{ fontSize: '12px' }}>{file.resolution}</span>}
                  {file.duration && <span className="px-2 py-px bg-surface-container-high rounded font-mono text-on-surface-variant font-medium" style={{ fontSize: '12px' }}>{file.duration}</span>}
                  {file.codec && <span className="px-2 py-px bg-primary/10 rounded font-mono text-primary border border-primary/20" style={{ fontSize: '12px' }}>{file.codec}</span>}
                </div>
                
                {file.status === 'done' && file.result && (
                  <div className="mt-1.5 text-primary font-mono font-bold flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span>Saved {file.result.savedPct}% (Now {(file.result.outputSizeBytes / 1_048_576).toFixed(1)} MB)</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); invoke('reveal_file', { path: file.result?.outputPath || '' }) }}
                      className="flex items-center gap-1 hover:text-primary-dim transition-colors ml-2 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 cursor-pointer"
                      title="Open file location"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>folder_open</span>
                      Open Folder
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
