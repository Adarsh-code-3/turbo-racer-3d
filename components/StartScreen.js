'use client'

export default function StartScreen({ onStart, highScore }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="mb-2">
          <span className="text-violet-400 text-sm font-bold tracking-[0.3em] uppercase">
            High Octane
          </span>
        </div>

        <h1 className="text-[clamp(3rem,10vw,6rem)] font-black text-white leading-none tracking-tighter mb-1">
          TURBO
        </h1>
        <h1 className="text-[clamp(3rem,10vw,6rem)] font-black leading-none tracking-tighter mb-6"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
          RACER
        </h1>

        <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-sm">
          Tilt your phone to steer. Dodge traffic. Collect nitro. How far can you go?
        </p>

        <button
          onClick={onStart}
          className="relative px-10 py-4 bg-violet-600 text-white text-lg font-bold rounded-2xl
            transition-all duration-300 min-h-[56px]
            hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]
            active:scale-[0.96]"
        >
          <span className="relative z-10">TAP TO RACE</span>
          <div className="absolute inset-0 rounded-2xl opacity-50"
               style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
            <div className="absolute inset-0 rounded-2xl bg-violet-600 blur-xl" />
          </div>
        </button>

        {highScore > 0 && (
          <div className="mt-6 animate-slide-up">
            <span className="text-gray-500 text-sm">Best Score</span>
            <p className="text-2xl font-bold text-violet-400">{highScore.toLocaleString()}</p>
          </div>
        )}

        <div className="mt-10 flex gap-8 text-gray-500 text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <span>Tilt to steer</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span>Collect nitro</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
