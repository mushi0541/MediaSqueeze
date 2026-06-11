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
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-on-surface-variant uppercase tracking-wider font-medium" style={{ fontSize: '13px' }}>Controls</span>
          <button 
            onClick={() => store.setIsProMode(!store.isProMode)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${store.isProMode ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-variant text-outline hover:text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>crown</span>
            PRO MODE
          </button>
        </div>

        {!store.isProMode ? (
          /* Simple Mode */
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-primary mb-2" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>magic_button</span>
              <h3 className="text-on-surface font-semibold mb-1" style={{ fontSize: '15px' }}>Smart Compression</h3>
              <p className="text-on-surface-variant mb-4" style={{ fontSize: '13px' }}>MediaSqueeze automatically selects the best format and codec for your file.</p>
              
              <div className="w-full text-left">
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Quality Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => store.setPreset(p)}
                      className={`py-2 rounded-lg font-medium text-sm transition-all ${store.preset === p ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(78,222,163,0.3)]' : 'bg-surface border border-outline-variant/30 text-on-surface-variant hover:border-primary/50'}`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-outline text-center px-2" style={{ fontSize: '12px' }}>Enable <strong className="text-primary">PRO MODE</strong> for granular control over resolution, framerate, and audio.</p>
          </div>
        ) : (
          /* Pro Mode (Advanced Controls) */
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px' }}>tune</span>
              <span className="text-on-surface font-semibold" style={{ fontSize: '14px' }}>Advanced Tuning</span>
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
                  <option value="hevc">H.265 (HEVC)</option>
                  <option value="h264">H.264 (AVC)</option>
                  <option value="av1">AV1</option>
                  <option value="vp9">VP9</option>
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
                  <option value="custom">Custom...</option>
                </select>
                {store.resolution === 'custom' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={store.customResolutionWidth}
                      onChange={(e) => store.setCustomResolutionWidth(e.target.value)}
                      placeholder="W"
                      className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none font-mono text-center font-medium"
                      style={{ fontSize: '13px' }}
                    />
                    <span className="text-outline font-bold">×</span>
                    <input
                      type="number"
                      value={store.customResolutionHeight}
                      onChange={(e) => store.setCustomResolutionHeight(e.target.value)}
                      placeholder="H"
                      className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none font-mono text-center font-medium"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                )}
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
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Output Format</label>
                <select
                  value={store.format}
                  onChange={(e) => store.setFormat(e.target.value as any)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option value="mp4">MP4</option>
                  <option value="mkv">MKV</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                  <option value="avi">AVI</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Framerate</label>
                <select
                  value={store.fpsOverride}
                  onChange={(e) => store.setFpsOverride(e.target.value as any)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option value="original">Original</option>
                  <option value="60">60 FPS</option>
                  <option value="30">30 FPS</option>
                  <option value="24">24 FPS (Cinema)</option>
                  <option value="15">15 FPS</option>
                  <option value="custom">Custom...</option>
                </select>
                {store.fpsOverride === 'custom' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={store.customFps}
                      onChange={(e) => store.setCustomFps(e.target.value)}
                      placeholder="FPS"
                      className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none font-mono text-center font-medium"
                      style={{ fontSize: '13px' }}
                    />
                    <span className="text-on-surface-variant font-medium text-xs">FPS</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-medium" style={{ fontSize: '13px' }}>Aspect Ratio</label>
                <select
                  value={store.aspectRatio}
                  onChange={(e) => store.setAspectRatio(e.target.value as any)}
                  className="w-full bg-surface border border-outline-variant/30 rounded px-2 py-1.5 text-on-surface focus:border-primary outline-none transition-colors font-medium"
                  style={{ fontSize: '14px' }}
                >
                  <option value="original">Original</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait / TikTok)</option>
                  <option value="4:3">4:3 (Classic)</option>
                  <option value="1:1">1:1 (Square / Instagram)</option>
                </select>
              </div>
              <div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-on-surface-variant font-medium" style={{ fontSize: '13px' }}>Speed</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        value={store.speed}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0 && val <= 100) store.setSpeed(val);
                        }}
                        className="w-16 bg-surface border border-outline-variant/30 rounded px-1 py-0.5 text-on-surface focus:border-primary outline-none font-mono text-center font-medium"
                        style={{ fontSize: '13px' }}
                        step="0.1"
                        min="0.1"
                        max="10"
                      />
                      <span className="font-mono text-primary text-xs">x</span>
                    </div>
                  </div>
                  <input type="range" min="0.25" max="4" step="0.25" value={Math.min(Math.max(store.speed, 0.25), 4)}
                    onChange={(e) => store.setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{ background: '#2f3632' }} />
                  <div className="flex justify-between mt-1" style={{ fontSize: '12px' }}>
                    <span className="text-on-surface-variant/50 font-mono">0.25x</span>
                    <span className="text-on-surface-variant/50 font-mono">Normal</span>
                    <span className="text-on-surface-variant/50 font-mono">4.0x</span>
                  </div>
                </div>
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
                  <option value="aac">AAC</option>
                  <option value="libopus">Opus</option>
                  <option value="libmp3lame">MP3</option>
                  <option value="copy">Pass-through</option>
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
        )}
        
        {store.isProMode && (
          <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
             <div className="flex items-start gap-2 text-primary" style={{ fontSize: '12px' }}>
                <span className="material-symbols-outlined mt-0.5" style={{ fontSize: '14px' }}>info</span>
                <p>You are using advanced controls. These settings override the Smart Compression presets.</p>
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
