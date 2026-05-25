import { useAppStore } from '@/store/useAppStore'

export function MediaTypeSwitcher() {
  const mediaType = useAppStore((s) => s.mediaType)
  const setMediaType = useAppStore((s) => s.setMediaType)
  const isVideo = mediaType === 'video'

  return (
    <div className="type-pill-bg rounded-full p-1 flex relative">
      <div
        className="absolute top-1 bottom-1 left-1 rounded-full bg-primary transition-all duration-300 z-0"
        style={{
          width: 'calc(50% - 4px)',
          left: isVideo ? '4px' : 'calc(50%)',
          transform: isVideo ? 'translateX(0)' : 'translateX(-4px)',
        }}
      />
      <button
        onClick={() => setMediaType('video')}
        className={`px-5 py-1.5 rounded-full font-medium relative z-10 transition-colors duration-200 ${isVideo ? 'text-on-primary' : 'text-on-surface-variant'}`}
        style={{ fontSize: '15px', minWidth: '72px' }}
      >
        <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '16px' }}>movie</span>Video
      </button>
      <button
        onClick={() => setMediaType('image')}
        className={`px-5 py-1.5 rounded-full font-medium relative z-10 transition-colors duration-200 ${!isVideo ? 'text-on-primary' : 'text-on-surface-variant'}`}
        style={{ fontSize: '15px', minWidth: '72px' }}
      >
        <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '16px' }}>image</span>Image
      </button>
    </div>
  )
}
