'use client'

export default function GameOverScreen({ score, highScore, onRestart }) {
  const isNewBest = score >= highScore && score > 0

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center animate-slide-up">
        {isNewBest && (
          <div className="mb-4 px-4 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-full">
            <span className="text-violet-400 text-sm font-bold tracking-wider">NEW BEST</span>
          </div>
        )}

        <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">WRECKED</h2>
        <p className="text-gray-500 text-sm mb-8">Your run has ended</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Score</span>
            <span className="text-3xl font-black text-white">{score.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Best</span>
            <span className={`text-3xl font-black ${isNewBest ? 'text-violet-400' : 'text-white'}`}>
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-10 py-4 bg-violet-600 text-white text-lg font-bold rounded-2xl
            transition-all duration-300 min-h-[56px]
            hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]
            active:scale-[0.96]"
        >
          RACE AGAIN
        </button>

        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-6 py-2 text-gray-500 text-sm font-medium
            hover:text-white transition-colors duration-200"
        >
          Back to Menu
        </button>
      </div>
    </div>
  )
}
