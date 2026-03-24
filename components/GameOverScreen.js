'use client'

export default function GameOverScreen({ score, highScore, onRestart }) {
  const isNewBest = score >= highScore && score > 0

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center px-5 text-center max-w-sm w-full animate-slide-up">
        {isNewBest && (
          <div className="mb-3 px-4 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full">
            <span className="text-violet-400 text-xs sm:text-sm font-bold tracking-wider">NEW BEST</span>
          </div>
        )}

        <h2 className="text-3xl sm:text-5xl font-black text-white mb-1">WRECKED</h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">Your run has ended</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-0.5">Score</span>
            <span className="text-2xl sm:text-3xl font-black text-white">{score.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-0.5">Best</span>
            <span className={`text-2xl sm:text-3xl font-black ${isNewBest ? 'text-violet-400' : 'text-white'}`}>
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-3.5 sm:px-10 sm:py-4 bg-violet-600 text-white text-base sm:text-lg font-bold rounded-2xl
            transition-all duration-200 min-h-[48px] active:scale-[0.96]"
          style={{ boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
        >
          RACE AGAIN
        </button>

        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 text-gray-500 text-xs sm:text-sm font-medium
            active:text-white transition-colors duration-150"
        >
          Back to Menu
        </button>
      </div>
    </div>
  )
}
