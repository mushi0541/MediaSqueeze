import { getCurrentWindow } from '@tauri-apps/api/window'

export function TopBar() {
  const appWindow = getCurrentWindow()

  return (
    <nav className="relative z-50 shrink-0 glass border-b border-outline-variant/30 flex items-center px-6 h-14 select-none">
      {/* Brand */}
      <div className="relative flex items-center gap-3 pointer-events-none">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/15 border border-primary/30">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '19px', fontVariationSettings: "'FILL' 1" }}>compress</span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-semibold tracking-tight" style={{ fontSize: '17px' }}>MediaSqueeze</span>
            <span className="font-mono text-primary/60 border border-primary/20 px-1.5 py-px rounded" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>PRO</span>
          </div>
          <div className="text-on-surface-variant font-medium" style={{ fontSize: '13px', letterSpacing: '0.03em' }}>Compression, beautifully done</div>
        </div>
      </div>

      {/* Drag spacer */}
      <div data-tauri-drag-region className="relative flex-1 h-full cursor-default" />

      {/* Center status */}
      <div className="relative flex items-center gap-2 font-mono pointer-events-none" style={{ fontSize: '14px' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'pulse 2s infinite', boxShadow: '0 0 6px #4edea3' }} />
        <span className="text-outline">Engine Active</span>
        <span className="ml-3 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30 font-medium">HW Accel: ON</span>
      </div>

      {/* Drag spacer */}
      <div data-tauri-drag-region className="relative flex-1 h-full cursor-default" />

      {/* Actions (Window Controls) */}
      <div className="relative flex items-center gap-2">
        <button onClick={() => appWindow.minimize()} className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors cursor-pointer font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>remove</span>
        </button>
        <button onClick={() => appWindow.toggleMaximize()} className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors cursor-pointer font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>crop_square</span>
        </button>
        <button onClick={() => appWindow.close()} className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors cursor-pointer font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>close</span>
        </button>
      </div>
    </nav>
  )
}
