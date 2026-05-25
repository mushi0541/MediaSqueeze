import { TopBar } from '@/components/TopBar'
import { LeftSidebar } from '@/components/LeftSidebar'
import { DropZone } from '@/components/DropZone'
import { MediaTypeSwitcher } from '@/components/MediaTypeSwitcher'
import { PresetCards } from '@/components/PresetCards'
import { ActionArea } from '@/components/ActionArea'
import { RightSidebar } from '@/components/RightSidebar'

export default function App() {
  return (
    <div className="bg-surface-container-lowest text-on-surface text-body-md antialiased h-screen flex flex-col overflow-hidden relative">
      {/* Animated background layer */}
      <div className="fixed inset-0 z-0 animated-bg terminal-grid opacity-90 pointer-events-none" />

      <TopBar />

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <LeftSidebar />

        {/* Main canvas */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 gap-5 min-w-0">
          {/* Header row */}
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-on-surface font-semibold" style={{ fontSize: '20px' }}>Compress Media</h1>
              <p className="text-on-surface-variant" style={{ fontSize: '13px' }}>Optimize videos and images without losing visual quality.</p>
            </div>
            <MediaTypeSwitcher />
          </header>

          <DropZone />
          <PresetCards />
          <ActionArea />
        </main>

        <RightSidebar />
      </div>
    </div>
  )
}
