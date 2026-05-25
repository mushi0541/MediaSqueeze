import { useAppStore } from '@/store/useAppStore'
import type { Preset } from '@/types'

const PRESETS = [
  { id: 'low' as Preset, label: 'Low', desc: 'Smallest file', icon: 'compress', iconColor: 'text-tertiary', crfDetail: '~60–70% smaller · CRF 36', imgDetail: '~60–70% smaller · Quality 50%' },
  { id: 'medium' as Preset, label: 'Medium', desc: 'Balanced quality', icon: 'tune', iconColor: 'text-primary', crfDetail: '~40–50% smaller · CRF 28', imgDetail: '~40–50% smaller · Quality 75%' },
  { id: 'high' as Preset, label: 'High', desc: 'Best quality kept', icon: 'diamond', iconColor: '', crfDetail: '~20–30% smaller · CRF 20', imgDetail: '~20–30% smaller · Quality 90%' },
] as const

export function PresetCards() {
  const preset = useAppStore((s) => s.preset)
  const setPreset = useAppStore((s) => s.setPreset)
  const mediaType = useAppStore((s) => s.mediaType)
  const isVideo = mediaType === 'video'

  return (
    <section>
      <h4 className="text-on-surface-variant mb-3 font-semibold" style={{ fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Compression Preset</h4>
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((p) => {
          const isActive = preset === p.id
          return (
            <div
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`glass rounded-xl p-4 cursor-pointer border transition-all duration-200 preset-card text-center relative overflow-hidden
                ${isActive ? 'preset-active animate-float' : 'border-outline-variant/30 hover:border-outline-variant/60 hover:-translate-y-0.5'}
              `}
            >
              {/* Active top bar */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" style={{ boxShadow: '0 0 8px rgba(78,222,163,0.8)' }} />
                  <div className="absolute top-2 right-2">
                    <span className="font-mono bg-primary/20 text-primary px-1.5 py-px rounded" style={{ fontSize: '12px', letterSpacing: '0.06em' }}>✦ REC</span>
                  </div>
                </>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border ${isActive ? 'bg-primary/15 border-primary/30' : 'bg-surface-container-high/80 border-outline-variant/30'}`}>
                <span
                  className={`material-symbols-outlined ${p.id === 'high' ? '' : (isActive ? 'text-primary' : p.iconColor)}`}
                  style={{
                    fontSize: '21px',
                    fontVariationSettings: "'FILL' 1",
                    ...(p.id === 'high' ? { color: '#fbbf24' } : {}),
                  }}
                >{p.icon}</span>
              </div>
              <div className={`font-semibold mb-0.5 ${isActive ? 'text-primary' : 'text-on-surface'}`} style={{ fontSize: '15px' }}>{p.label}</div>
              <div className="text-on-surface-variant mb-2 font-medium" style={{ fontSize: '14px' }}>{p.desc}</div>
              <div className={`font-mono ${isActive ? 'text-primary/70' : 'text-outline'}`} style={{ fontSize: '13px' }}>
                {isVideo ? p.crfDetail : p.imgDetail}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
