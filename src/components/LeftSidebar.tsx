import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useCompression } from '@/hooks/useCompression'
import { UserGuideModal } from '@/components/UserGuideModal'

export function LeftSidebar() {
  const store = useAppStore()
  const { startCompression } = useCompression()
  const isVideo = store.mediaType === 'video'
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
    <aside className="w-60 shrink-0 flex flex-col border-r border-outline-variant/25 glass overflow-hidden">
      {/* Nav links */}
      <div className="px-3 py-4 space-y-0.5 shrink-0">
        <button
          onClick={() => store.setMediaType('video')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isVideo ? 'nav-active' : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>movie</span> Video
        </button>
        <button
          onClick={() => store.setMediaType('image')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${!isVideo ? 'nav-active' : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>image</span> Image
        </button>
      </div>

      <div className="px-3 mb-2 shrink-0"><div className="h-px bg-outline-variant/20" /></div>

      {/* Advanced controls */}
      <div className="px-4 py-3 flex-1 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-mono text-on-surface-variant uppercase tracking-wider font-medium" style={{ fontSize: '13px' }}>Advanced Controls</span>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px' }}>tune</span>
        </div>

        {isVideo ? (
          <>
            {/* Video section */}
            <div className="space-y-3">
              <div className="text-on-surface font-semibold pb-1 border-b border-outline-variant/20" style={{ fontSize: '14px' }}>Video</div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Codec</label>
                <select
                  value={store.videoCodec}
                  onChange={(e) => store.setVideoCodec(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option>H.265 (HEVC)</option>
                  <option>H.264 (AVC)</option>
                  <option>AV1</option>
                  <option>VP9</option>
                </select>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>HW Acceleration</label>
                <select
                  value={store.hwAccel}
                  onChange={(e) => store.setHwAccel(e.target.value as any)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option value="cpu">None (CPU)</option>
                  <option value="nvenc">NVIDIA (NVENC)</option>
                  <option value="amf">AMD (AMF)</option>
                  <option value="qsv">Intel (QSV)</option>
                </select>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Resolution</label>
                <select
                  value={store.resolution}
                  onChange={(e) => store.setResolution(e.target.value as any)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option value="original">Original</option>
                  <option value="4k">3840×2160 (4K)</option>
                  <option value="1080p">1920×1080 (1080p)</option>
                  <option value="720p">1280×720 (720p)</option>
                  <option value="480p">854×480 (480p)</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-1" style={{ fontSize: '13px' }}>
                  <span className="text-on-surface-variant font-medium">CRF Value</span>
                  <span className="font-mono text-primary">{store.crf}</span>
                </div>
                <input type="range" min="0" max="51" value={store.crf}
                  onChange={(e) => store.setCrf(parseInt(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-primary"
                  style={{ background: '#2f3632' }} />
                <div className="flex justify-between mt-1" style={{ fontSize: '12px' }}>
                  <span className="text-primary">Best quality</span>
                  <span className="text-outline">Smallest file</span>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '14px' }}>
                  <input type="checkbox" checked={store.twoPass} onChange={(e) => store.setTwoPass(e.target.checked)} className="rounded accent-primary" />
                  <span className="text-on-surface font-medium">2-Pass Encoding</span>
                </label>
              </div>
            </div>

            {/* Audio section */}
            <div className="space-y-3">
              <div className="text-on-surface font-semibold pb-1 border-b border-outline-variant/20" style={{ fontSize: '14px' }}>Audio</div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Codec</label>
                <select
                  value={store.audioCodec}
                  onChange={(e) => store.setAudioCodec(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option>AAC</option>
                  <option>Opus</option>
                  <option>MP3</option>
                  <option>Pass-through</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-1" style={{ fontSize: '13px' }}>
                  <span className="text-on-surface-variant font-medium">Bitrate</span>
                  <span className="font-mono text-primary">{store.audioBitrate} kbps</span>
                </div>
                <input type="range" min="64" max="320" value={store.audioBitrate}
                  onChange={(e) => store.setAudioBitrate(parseInt(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-primary"
                  style={{ background: '#2f3632' }} />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '14px' }}>
                  <input type="checkbox" checked={store.removeAudio} onChange={(e) => store.setRemoveAudio(e.target.checked)} className="rounded accent-primary" />
                  <span className="text-on-surface font-medium">Remove Audio</span>
                </label>
              </div>
            </div>
          </>
        ) : (
          /* Image section */
          <div className="space-y-3">
            <div className="text-on-surface font-semibold pb-1 border-b border-outline-variant/20" style={{ fontSize: '14px' }}>Image</div>
            <div>
              <div className="flex justify-between mb-1" style={{ fontSize: '13px' }}>
                <span className="text-on-surface-variant font-medium">Quality</span>
                <span className="font-mono text-primary">{store.imageQuality}%</span>
              </div>
              <input type="range" min="1" max="100" value={store.imageQuality}
                onChange={(e) => store.setImageQuality(parseInt(e.target.value))}
                className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-primary"
                style={{ background: '#2f3632' }} />
              <div className="flex justify-between mt-1" style={{ fontSize: '12px' }}>
                <span className="text-outline">Smallest file</span>
                <span className="text-primary">Best quality</span>
              </div>
            </div>
            <div>
              <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Format</label>
              <select
                value={store.imageFormat}
                onChange={(e) => store.setImageFormat(e.target.value as any)}
                className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                style={{ fontSize: '14px' }}
              >
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '14px' }}>
                <input type="checkbox" checked={store.stripMetadata} onChange={(e) => store.setStripMetadata(e.target.checked)} className="rounded accent-primary" />
                <span className="text-on-surface font-medium">Strip Metadata</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-outline-variant/20">
        {/* User Guide button */}
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={() => setGuideOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant/30 text-on-surface-variant hover:text-primary cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>menu_book</span>
            <span className="text-xs font-medium">User Guide</span>
          </button>
        </div>

        {/* Compress button */}
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={startCompression}
            disabled={store.queue.length === 0 || store.status === 'compressing'}
            className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-semibold btn-glow flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: '15px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
            Compress Now
          </button>
        </div>

        {/* GitHub credit */}
        <div className="px-4 pb-3 flex items-center justify-center">
          <a
            href="https://github.com/mushi0541"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer group font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current opacity-50 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="font-mono" style={{ fontSize: '13px' }}>@mushi0541</span>
          </a>
        </div>
      </div>
    </aside>

    {/* User Guide Modal */}
    <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}
