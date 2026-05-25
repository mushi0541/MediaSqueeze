import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '@/store/useAppStore'
import type { HistoryEntry, Preset } from '@/types'

function presetColor(p: Preset) {
  if (p === 'low')  return { bg: 'bg-tertiary/15', text: 'text-tertiary' }
  if (p === 'high') return { bg: '', text: '' }
  return { bg: 'bg-primary/15', text: 'text-primary' }
}

export function RightSidebar() {
  const store = useAppStore()
  const [metrics, setMetrics] = useState({ cpu: 0, memUsed: 0, memTotal: 16000 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isCompressing = store.status === 'compressing'

  // Poll live system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data: any = await invoke('get_system_metrics')
        setMetrics({ cpu: data.cpu, memUsed: data.mem_used, memTotal: data.mem_total })
      } catch (e) {
        console.error("Failed to get metrics", e)
      }
    }
    
    // Fetch immediately, then every 1s
    fetchMetrics()
    intervalRef.current = setInterval(fetchMetrics, 1000)
    
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  // Est. output calculation dynamically based on selected settings
  const estOutput = (() => {
    if (store.queue.length === 0) return '-- MB'
    
    // If done with everything, we can't easily show total unless we sum history, but let's just sum the queue
    let totalInputMB = 0
    let totalEstMB = 0

    for (const file of store.queue) {
      if (file.status === 'done' && file.result) {
        totalEstMB += file.result.outputSizeBytes / 1_048_576
        continue
      }

      const inputMB = file.sizeBytes / 1_048_576
      totalInputMB += inputMB

      if (store.mediaType === 'image') {
        let formatMult = 1.0
        if (store.imageFormat === 'png') formatMult = 1.5
        if (store.imageFormat === 'webp') formatMult = 0.7
        totalEstMB += inputMB * (store.imageQuality / 100) * formatMult
      } else {
        // Video estimation
        let duration = 60 // fallback
        if (file.durationSeconds) {
          duration = file.durationSeconds
        }
        
        let baseBitrate = 4000 // 1080p fallback
        if (store.resolution === '4k') baseBitrate = 12000
        else if (store.resolution === '720p') baseBitrate = 2000
        else if (store.resolution === '480p') baseBitrate = 1000

        // Adjust based on CRF (baseline 23)
        const crfMult = Math.pow(2, (23 - store.crf) / 6.0)
        const videoBitrate = baseBitrate * crfMult

        const audioBitrate = store.removeAudio ? 0 : store.audioBitrate
        const totalBitrateKbps = videoBitrate + audioBitrate
        const estMB = (totalBitrateKbps * duration) / 8192 // kbps to MB

        // Cap estimation at original size unless it's expanding aggressively
        totalEstMB += Math.min(estMB, inputMB * 1.5)
      }
    }

    return `${totalEstMB.toFixed(1)} MB`
  })()

  return (
    <aside className="w-72 shrink-0 flex flex-col border-l border-outline-variant/25 glass overflow-hidden">
      {/* System metrics */}
      <div className="p-4 border-b border-outline-variant/20 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px' }}>query_stats</span>
          <span className="font-mono text-on-surface-variant uppercase tracking-wider font-medium" style={{ fontSize: '13px' }}>System Metrics</span>
        </div>

        {/* Est output */}
        <div className="glass rounded-lg p-3 flex items-center justify-between border-l-2 border-primary mb-4">
          <div className="text-on-surface-variant font-medium" style={{ fontSize: '14px' }}>Est. Output</div>
          <div className="font-mono text-primary font-bold" style={{ fontSize: '17px' }}>{estOutput}</div>
        </div>

        {/* Metric bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between font-mono text-on-surface-variant mb-1 font-medium" style={{ fontSize: '13px' }}>
              <span>CPU Load</span><span>{Math.round(metrics.cpu)}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="metric-bar-fill bg-secondary transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, metrics.cpu))}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-mono text-on-surface-variant mb-1 font-medium" style={{ fontSize: '13px' }}>
              <span>RAM</span>
              <span className="text-on-surface-variant font-medium">
                {(metrics.memUsed / 1024).toFixed(1)} / {(metrics.memTotal / 1024).toFixed(1)} GB
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div 
                className="metric-bar-fill bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${metrics.memTotal > 0 ? (metrics.memUsed / metrics.memTotal) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Job Queue header */}
      <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container/30 flex items-center justify-between flex-shrink-0">
        <span className="font-mono text-on-surface-variant uppercase tracking-wider font-medium" style={{ fontSize: '13px' }}>Job Queue</span>
        <span className="font-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded font-medium" style={{ fontSize: '12px' }}>
          {isCompressing ? '1 Active' : '0 Active'}
        </span>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {store.history.length === 0 ? (
          <div className="text-center py-4 text-on-surface-variant font-medium" style={{ fontSize: '14px' }}>
            <span className="material-symbols-outlined block mx-auto mb-1 opacity-40" style={{ fontSize: '29px' }}>history</span>
            Compressions appear here
          </div>
        ) : (
          store.history.map((entry, i) => (
            <HistoryItem key={entry.id} entry={entry} index={i} />
          ))
        )}
      </div>
    </aside>
  )
}

function HistoryItem({ entry, index }: { entry: HistoryEntry; index: number }) {
  const colors = presetColor(entry.preset)

  return (
    <div className={`history-entry p-3 bg-surface rounded-lg border border-outline-variant/20 flex flex-col gap-1.5 ${index > 0 ? `opacity-${Math.max(60, 100 - index * 15)}` : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="text-on-surface font-semibold truncate" style={{ fontSize: '14px' }}>{entry.filename}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          <button onClick={() => invoke('reveal_file', { path: entry.outputPath || '' })} className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors font-medium" title="Open file location">
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>folder_open</span>
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>more_vert</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-on-surface-variant font-medium" style={{ fontSize: '13px' }}>{entry.inputSizeMB.toFixed(1)} MB → {entry.outputSizeMB.toFixed(1)} MB</span>
        <span className="font-mono text-primary font-bold" style={{ fontSize: '13px' }}>−{entry.savedPct}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`px-1.5 py-px rounded font-mono ${colors.bg} ${colors.text}`}
          style={{
            fontSize: '12px',
            ...(entry.preset === 'high' ? { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' } : {}),
          }}
        >{entry.preset}</span>
        {entry.mediaType === 'image' && (
          <span className="px-1.5 py-px rounded bg-surface-variant text-outline font-mono" style={{ fontSize: '12px' }}>image</span>
        )}
        <span className="text-outline" style={{ fontSize: '12px' }}>{timeAgo(entry.timestamp)}</span>
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return 'Yesterday'
}
