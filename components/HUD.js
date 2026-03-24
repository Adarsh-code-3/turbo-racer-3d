'use client'

export default function HUD({ score, speed, combo, nitro, nitroActive, onNitroActivate }) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Score</span>
          <span className="text-white text-2xl sm:text-3xl font-black tabular-nums">
            {score.toLocaleString()}
          </span>
          {combo > 1 && (
            <span className="text-violet-400 text-xs font-bold mt-0.5">
              x{combo} COMBO
            </span>
          )}
        </div>

        {/* Speed */}
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Speed</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black tabular-nums ${nitroActive ? 'text-violet-400' : 'text-white'}`}>
              {Math.round(speed)}
            </span>
            <span className="text-gray-500 text-xs font-bold">km/h</span>
          </div>
        </div>
      </div>

      {/* Nitro bar - bottom */}
      <div className="absolute bottom-6 left-4 right-4 pointer-events-auto">
        <div className="relative">
          <div className="flex items-center gap-3">
            {/* Nitro button */}
            <button
              onClick={onNitroActivate}
              disabled={nitro < 30}
              className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0
                transition-all duration-200
                ${nitro >= 30
                  ? 'bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-90'
                  : 'bg-white/5 border border-white/10'
                }
                ${nitroActive ? 'animate-pulse bg-violet-500' : ''}
              `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke={nitro >= 30 ? 'white' : '#555'} strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </button>

            {/* Nitro bar */}
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  nitroActive
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse'
                    : nitro >= 30
                    ? 'bg-gradient-to-r from-violet-600 to-violet-400'
                    : 'bg-white/20'
                }`}
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>

          {nitro >= 30 && !nitroActive && (
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-violet-400 text-[10px] font-bold tracking-wider uppercase"
                  style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}>
              NITRO READY
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
