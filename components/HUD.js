'use client'

export default function HUD({ score, speed, combo, nitro, nitroActive, onNitroActivate }) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none">
      {/* Top bar - safe area aware */}
      <div className="absolute top-0 left-0 right-0 pt-[env(safe-area-inset-top,8px)] px-3 sm:px-5 pb-2"
           style={{ paddingTop: 'max(env(safe-area-inset-top, 8px), 8px)' }}>
        <div className="flex justify-between items-start">
          {/* Score */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">Score</span>
            <span className="text-white text-xl sm:text-3xl font-black tabular-nums leading-tight">
              {score.toLocaleString()}
            </span>
            {combo > 1 && (
              <span className="text-violet-400 text-[10px] sm:text-xs font-bold mt-0.5"
                    style={{ textShadow: '0 0 10px rgba(139,92,246,0.6)' }}>
                x{combo} COMBO
              </span>
            )}
          </div>

          {/* Speed */}
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">Speed</span>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-xl sm:text-3xl font-black tabular-nums leading-tight ${nitroActive ? 'text-violet-400' : 'text-white'}`}
                    style={nitroActive ? { textShadow: '0 0 15px rgba(139,92,246,0.6)' } : {}}>
                {Math.round(speed)}
              </span>
              <span className="text-gray-600 text-[9px] sm:text-xs font-bold">km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nitro bar - bottom, safe area aware */}
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-5 pointer-events-auto"
           style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)' }}>
        <div className="relative pb-1">
          {nitro >= 30 && !nitroActive && (
            <div className="text-center mb-1.5">
              <span className="text-violet-400 text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase"
                    style={{ animation: 'pulse-glow 1.2s ease-in-out infinite', textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>
                NITRO READY
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nitro button */}
            <button
              onClick={onNitroActivate}
              disabled={nitro < 30}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0
                transition-all duration-150
                ${nitro >= 30
                  ? 'bg-violet-600 active:scale-90'
                  : 'bg-white/5 border border-white/10'
                }
                ${nitroActive ? 'bg-violet-500' : ''}
              `}
              style={nitro >= 30 ? { boxShadow: '0 0 20px rgba(139,92,246,0.5)' } : {}}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke={nitro >= 30 ? 'white' : '#444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </button>

            {/* Nitro bar */}
            <div className="flex-1 h-2.5 sm:h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  nitroActive
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                    : nitro >= 30
                    ? 'bg-gradient-to-r from-violet-600 to-violet-400'
                    : 'bg-white/15'
                }`}
                style={{
                  width: `${nitro}%`,
                  ...(nitroActive ? { boxShadow: '0 0 10px rgba(139,92,246,0.4)' } : {})
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Left/Right steer indicators on mobile */}
      <div className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-start pl-2 sm:hidden opacity-20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-2 sm:hidden opacity-20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  )
}
