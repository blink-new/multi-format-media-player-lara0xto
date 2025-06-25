import MediaPlayerV1 from "./components/media-player-v1"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">
            Multi-Format Media Player
          </h1>
          <p className="text-slate-400 mt-2">
            Professional media player with audio effects, equalizer, and visual controls
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 py-8">
        <MediaPlayerV1 />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          <p>Built with React, TypeScript, and Web Audio API</p>
        </div>
      </footer>
    </div>
  )
}

export default App