import { useAppStore } from '@/store/useAppStore'
import { useCompression } from '@/hooks/useCompression'
import { open } from '@tauri-apps/plugin-dialog'

function formatSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(2) + ' GB'
  return (bytes / 1_048_576).toFixed(1) + ' MB'
}

export function ActionArea() {
  const store = useAppStore()
  const { startCompression, cancelCompression, openOutputFile } = useCompression()

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Output Folder'
      })
      if (selected && typeof selected === 'string') {
        store.setOutputFolder(selected)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-4">
      {/* CTA (default) */}
      {store.status === 'idle' && (
        <div className="space-y-3">
          {/* Save Destination */}
          <div className="glass rounded-xl p-3 border border-outline-variant/30 flex items-center justify-between gap-3">
            <div className="flex flex-col ml-1 overflow-hidden">
              <span className="text-on-surface-variant font-semibold" style={{ fontSize: '13px' }}>Save Destination</span>
              <span className="text-on-surface truncate font-medium" style={{ fontSize: '14px' }}>
                {store.outputFolder || 'Same folder as original file'}
              </span>
            </div>
            <div className="flex gap-1 shrink-0">
              {store.outputFolder && (
                <button
                  onClick={() => store.setOutputFolder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors font-medium"
                  title="Reset to default"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                </button>
              )}
              <button
                onClick={handleSelectFolder}
                className="px-3 py-1.5 rounded-lg bg-surface-variant text-on-surface hover:bg-primary/20 hover:text-primary transition-colors font-semibold text-xs"
              >
                Change
              </button>
            </div>
          </div>

          <button
            onClick={startCompression}
            disabled={store.queue.length === 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-dim to-primary text-on-primary font-bold btn-glow flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: '17px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '21px', fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            {store.queue.length > 1 ? `Compress All (${store.queue.length})` : 'Compress Now'}
          </button>
        </div>
      )}

      {/* Progress */}
      {store.status === 'compressing' && (
        <div>
          <div className="glass rounded-xl p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-on-surface font-semibold" style={{ fontSize: '15px' }}>
                Compressing {store.activeIndex + 1} of {store.queue.length}…
              </span>
              <span className="font-mono text-primary font-bold" style={{ fontSize: '16px' }}>{Math.round(store.progress.pct)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mb-2">
              <div className="progress-fill" style={{ width: `${store.progress.pct}%` }} />
            </div>
            <div className="flex justify-between" style={{ fontSize: '14px' }}>
              <span className="text-on-surface-variant font-mono font-medium">
                {store.progress.etaSeconds > 0 ? `${Math.round(store.progress.etaSeconds)}s remaining` : 'Estimating…'}
              </span>
              <span className="text-on-surface-variant font-mono font-medium">
                {store.progress.fps > 0 ? `${Math.round(store.progress.fps)} fps` : '-- fps'}
              </span>
            </div>
            <button
              onClick={cancelCompression}
              className="mt-4 w-full py-2 rounded-lg border border-error/40 text-error hover:bg-error/10 transition-colors font-medium"
              style={{ fontSize: '15px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {store.status === 'done' && store.result && (
        <div className="result-panel">
          <div className="glass rounded-xl p-5 border border-primary/30" style={{ boxShadow: '0 0 24px rgba(78,222,163,0.1)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '23px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-on-surface font-semibold" style={{ fontSize: '16px' }}>Compression complete!</span>
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-on-surface-variant font-medium" style={{ fontSize: '13px' }}>Original</div>
                <div className="text-on-surface font-bold" style={{ fontSize: '19px' }}>{formatSize(store.result.inputSizeBytes)}</div>
              </div>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '21px' }}>arrow_right_alt</span>
              <div className="text-center">
                <div className="text-on-surface-variant font-medium" style={{ fontSize: '13px' }}>Compressed</div>
                <div className="text-primary font-bold" style={{ fontSize: '19px' }}>{formatSize(store.result.outputSizeBytes)}</div>
              </div>
            </div>
            <div className="text-center mb-5">
              <div className="text-primary font-bold" style={{ fontSize: '29px' }}>−{store.result.savedPct}%</div>
              <div className="text-on-surface-variant font-medium" style={{ fontSize: '14px' }}>You saved {store.result.savedMB.toFixed(2)} MB</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={openOutputFile} className="py-2.5 rounded-xl bg-primary text-on-primary font-semibold btn-glow transition-all" style={{ fontSize: '15px' }}>
                <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '17px', fontVariationSettings: "'FILL' 1" }}>folder_open</span>Open File
              </button>
              <button onClick={store.resetForNew} className="py-2.5 rounded-xl glass border border-outline-variant/40 text-on-surface font-semibold hover:border-outline-variant/70 transition-all" style={{ fontSize: '15px' }}>
                Compress Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {store.status === 'error' && (
        <div>
          <div className="glass rounded-xl p-4 border border-error/30 bg-error-container/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '19px', fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="text-error font-medium" style={{ fontSize: '15px' }}>Compression failed</span>
            </div>
            <p className="text-on-surface-variant mb-3 font-medium" style={{ fontSize: '14px' }}>{store.errorMsg}</p>
            <button onClick={store.resetForNew} className="w-full py-2 rounded-lg border border-error/40 text-error hover:bg-error/10 transition-colors" style={{ fontSize: '14px' }}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
