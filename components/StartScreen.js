'use client'

export default function StartScreen({ onStart, highScore }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />

      <div className="relative z-10 flex flex-col items-center px-5 text-center max-w-md w-full">
        <span className="text-violet-400 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-3">
          High Octane Racing
        </span>

        <h1 className="text-[clamp(3rem,12vw,6rem)] font-black text-white leading-[0.9] tracking-tighter">
          TURBO
        </h1>
        <h1 className="text-[clamp(3rem,12vw,6rem)] font-black leading-[0.9] tracking-tighter mb-5"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
          RACER
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-xs leading-relaxed">
          Tilt your phone to steer. Dodge traffic. Collect nitro. How far can you go?
        </p>

        <button
          onClick={onStart}
          className="relative px-8 py-3.5 sm:px-10 sm:py-4 bg-violet-600 text-white text-base sm:text-lg font-bold rounded-2xl
            transition-all duration-200 min-h-[48px] active:scale-[0.96]"
          style={{ boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
        >
          TAP TO RACE
        </button>

        {highScore > 0 && (
          <div className="mt-5 animate-slide-up">
            <span className="text-gray-500 text-xs">Best Score</span>
            <p className="text-xl font-bold text-violet-400">{highScore.toLocaleString()}</p>
          </div>
        )}

        <div className="mt-8 flex gap-6 sm:gap-8 text-gray-500 text-[10px] sm:text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <span>Tilt to steer</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span>Collect nitro</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
              </svg>
            </div>
            <span>Dodge traffic</span>
          </div>
        </div>
      </div>
    </div>
  )
}
