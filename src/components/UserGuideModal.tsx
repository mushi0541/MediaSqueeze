import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

const VIDEO_GUIDES = [
  {
    icon: 'smart_display',
    title: 'Video Codec',
    items: [
      { label: 'H.265 (HEVC)', desc: 'Best compression ratio. Produces the smallest files while keeping excellent quality. Widely supported on modern devices.' },
      { label: 'H.264 (AVC)', desc: 'Maximum compatibility. Works on virtually every device, browser, and player. Slightly larger files than H.265.' },
      { label: 'AV1', desc: 'Next-generation open codec. Outstanding efficiency but encoding is significantly slower. Best for archival.' },
      { label: 'VP9', desc: 'Google\'s open codec. Great for web streaming. Good balance of quality and file size.' },
    ],
  },
  {
    icon: 'aspect_ratio',
    title: 'Resolution',
    items: [
      { label: 'Original', desc: 'Keep the source resolution unchanged. No upscaling or downscaling is applied.' },
      { label: '4K (3840×2160)', desc: 'Ultra-high definition. Best for large displays. Produces the largest files.' },
      { label: '1080p (1920×1080)', desc: 'Full HD. The sweet spot for most content — great quality with reasonable file size.' },
      { label: '720p / 480p', desc: 'Smaller resolutions ideal for mobile viewing or when bandwidth is limited.' },
    ],
  },
  {
    icon: 'tune',
    title: 'CRF (Constant Rate Factor)',
    items: [
      { label: 'Range: 0–51', desc: 'Controls the quality-to-size tradeoff. Lower values mean higher quality but bigger files.' },
      { label: '0–17', desc: 'Visually lossless — virtually indistinguishable from the original. Very large files.' },
      { label: '18–23', desc: 'High quality. CRF 23 is the default and produces an excellent balance.' },
      { label: '24–51', desc: 'Smaller files with increasing quality loss. Above 30 is noticeably degraded.' },
    ],
  },
  {
    icon: 'repeat',
    title: '2-Pass Encoding',
    items: [
      { label: 'How it works', desc: 'First pass analyzes the entire video to understand complexity. Second pass uses that data to distribute quality optimally.' },
      { label: 'When to use', desc: 'Best for final exports where quality matters most. Takes roughly twice as long but produces more consistent results.' },
    ],
  },
  {
    icon: 'volume_up',
    title: 'Audio Settings',
    items: [
      { label: 'AAC', desc: 'Industry standard. Best compatibility across all devices and platforms.' },
      { label: 'Opus', desc: 'Superior quality at lower bitrates. Ideal for streaming and web content.' },
      { label: 'Bitrate (64–320 kbps)', desc: '128 kbps is good for speech. 192–256 kbps is great for music. 320 kbps is near-lossless.' },
      { label: 'Remove Audio', desc: 'Strips the audio track entirely. Useful for creating silent loops, GIF-like clips, or saving maximum space.' },
    ],
  },
]

const IMAGE_GUIDES = [
  {
    icon: 'high_quality',
    title: 'Image Quality',
    items: [
      { label: 'Range: 1–100%', desc: 'Controls how much detail is preserved. Higher values keep more detail but produce larger files.' },
      { label: '90–100%', desc: 'Near-lossless. Almost identical to the original. Minimal size reduction.' },
      { label: '75–85%', desc: 'The sweet spot. Imperceptible quality loss with significant size savings.' },
      { label: 'Below 60%', desc: 'Noticeable artifacts begin to appear. Best for thumbnails or previews only.' },
    ],
  },
  {
    icon: 'image',
    title: 'Output Format',
    items: [
      { label: 'WEBP', desc: 'Modern format with the best compression. Up to 30% smaller than JPEG at the same quality. Ideal for web use.' },
      { label: 'JPG (JPEG)', desc: 'Universal format. Supported everywhere. Great for photographs and complex images.' },
      { label: 'PNG', desc: 'Lossless compression. Supports transparency. Best for graphics, logos, and screenshots. Larger files.' },
    ],
  },
  {
    icon: 'delete_sweep',
    title: 'Strip Metadata',
    items: [
      { label: 'What it removes', desc: 'EXIF data including camera model, GPS coordinates, timestamps, and software info embedded in your images.' },
      { label: 'Why use it', desc: 'Protects your privacy by removing location data. Also saves a small amount of additional file size.' },
    ],
  },
]

export function UserGuideModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video')

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-[680px] max-h-[80vh] rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(165deg, rgba(22,29,25,0.97) 0%, rgba(14,21,17,0.98) 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(78,222,163,0.08), inset 0 1px 0 rgba(78,222,163,0.1)',
          animation: 'fade-in 0.25s ease',
        }}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-outline-variant/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 border border-primary/30">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '23px', fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div>
              <h2 className="text-on-surface font-semibold" style={{ fontSize: '19px' }}>User Guide</h2>
              <p className="text-on-surface-variant font-medium" style={{ fontSize: '14px' }}>Learn what each compression setting does</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer font-medium">
            <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>close</span>
          </button>
        </div>

        {/* Tabs header */}
        <div className="shrink-0 px-6 pt-4 pb-0 flex gap-6 border-b border-outline-variant/20">
          <button onClick={() => setActiveTab('video')} className="focus:outline-none">
            <TabLabel icon="movie" label="Video Settings" active={activeTab === 'video'} />
          </button>
          <button onClick={() => setActiveTab('image')} className="focus:outline-none">
            <TabLabel icon="image" label="Image Settings" active={activeTab === 'image'} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarGutter: 'stable' }}>
          {activeTab === 'video' && (
            <div className="space-y-5 animate-[fade-in_0.3s_ease]">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px', fontVariationSettings: "'FILL' 1" }}>movie</span>
                <span className="text-primary font-semibold uppercase tracking-wider" style={{ fontSize: '14px' }}>Video Compression</span>
                <div className="flex-1 h-px bg-outline-variant/20 ml-2" />
              </div>
              {VIDEO_GUIDES.map((section) => (
                <GuideSection key={section.title} icon={section.icon} title={section.title} items={section.items} />
              ))}
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-5 animate-[fade-in_0.3s_ease]">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px', fontVariationSettings: "'FILL' 1" }}>image</span>
                <span className="text-primary font-semibold uppercase tracking-wider" style={{ fontSize: '14px' }}>Image Compression</span>
                <div className="flex-1 h-px bg-outline-variant/20 ml-2" />
              </div>
              {IMAGE_GUIDES.map((section) => (
                <GuideSection key={section.title} icon={section.icon} title={section.title} items={section.items} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-outline-variant/25 flex items-center justify-between">
          <a
            href="https://github.com/mushi0541"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer group font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-60 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span style={{ fontSize: '14px' }}>@mushi0541</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-outline font-mono" style={{ fontSize: '13px' }}>MediaSqueeze v1.0</span>
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-semibold btn-glow cursor-pointer" style={{ fontSize: '14px' }}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabLabel({ icon, label, active }: { icon: string; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 pb-3 border-b-2 ${active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
      <span className="font-medium" style={{ fontSize: '14px' }}>{label}</span>
    </div>
  )
}

function GuideSection({ icon, title, items }: { icon: string; title: string; items: { label: string; desc: string }[] }) {
  return (
    <div className="rounded-xl border border-outline-variant/25 overflow-hidden" style={{ background: 'rgba(36,44,39,0.35)' }}>
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-outline-variant/20" style={{ background: 'rgba(78,222,163,0.04)' }}>
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '19px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <span className="text-on-surface font-semibold" style={{ fontSize: '15px' }}>{title}</span>
      </div>
      <div className="divide-y divide-outline-variant/15">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-3 flex gap-3">
            <span className="material-symbols-outlined text-primary/60 mt-0.5 shrink-0" style={{ fontSize: '16px' }}>chevron_right</span>
            <div>
              <span className="text-on-surface font-semibold block" style={{ fontSize: '14px' }}>{item.label}</span>
              <span className="text-on-surface-variant leading-relaxed block mt-0.5 font-medium" style={{ fontSize: '14px' }}>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
