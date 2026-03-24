'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import GameCanvas from './GameCanvas'
import HUD from './HUD'
import StartScreen from './StartScreen'
import GameOverScreen from './GameOverScreen'

export default function Game() {
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const [steerInput, setSteerInput] = useState(0)
  const [combo, setCombo] = useState(0)
  const [nitro, setNitro] = useState(0)
  const [nitroActive, setNitroActive] = useState(false)
  const [showNitroFlash, setShowNitroFlash] = useState(false)

  const touchStartRef = useRef(null)
  const gameStateRef = useRef('start')
  const nitroRef = useRef(0)
  gameStateRef.current = gameState
  nitroRef.current = nitro

  useEffect(() => {
    const stored = localStorage.getItem('turbo-racer-highscore')
    if (stored) setHighScore(parseInt(stored))
  }, [])

  const requestTilt = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission()
        if (perm === 'granted') {
          setTiltEnabled(true)
          return true
        }
      } catch (e) {
        // fallback to touch
      }
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      setTiltEnabled(true)
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (!tiltEnabled) return
    let lastGamma = 0
    const handleOrientation = (e) => {
      if (gameStateRef.current !== 'playing') return
      const gamma = e.gamma || 0
      lastGamma = lastGamma * 0.5 + gamma * 0.5
      const normalized = Math.max(-1, Math.min(1, lastGamma / 25))
      setSteerInput(normalized)
    }
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => window.removeEventListener('deviceorientation', handleOrientation, true)
  }, [tiltEnabled])

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (gameStateRef.current !== 'playing') return
      const touch = e.touches[0]
      if (!touch) return
      touchStartRef.current = touch.clientX
      const halfW = window.innerWidth / 2
      setSteerInput((touch.clientX - halfW) / halfW)
    }
    const handleTouchMove = (e) => {
      if (gameStateRef.current !== 'playing') return
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return
      const halfW = window.innerWidth / 2
      setSteerInput((touch.clientX - halfW) / halfW)
    }
    const handleTouchEnd = () => {
      if (gameStateRef.current !== 'playing') return
      touchStartRef.current = null
      setSteerInput(0)
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  useEffect(() => {
    const keys = new Set()
    const handleKeyDown = (e) => {
      if (gameStateRef.current !== 'playing') return
      keys.add(e.key)
      if (e.key === 'ArrowLeft' || e.key === 'a') setSteerInput(-0.85)
      if (e.key === 'ArrowRight' || e.key === 'd') setSteerInput(0.85)
      if (e.key === ' ' || e.key === 'Shift') activateNitroFn()
    }
    const handleKeyUp = (e) => {
      keys.delete(e.key)
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) {
        const hasLeft = keys.has('ArrowLeft') || keys.has('a')
        const hasRight = keys.has('ArrowRight') || keys.has('d')
        if (!hasLeft && !hasRight) setSteerInput(0)
        else if (hasLeft) setSteerInput(-0.85)
        else setSteerInput(0.85)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const activateNitroFn = useCallback(() => {
    if (nitroRef.current >= 30) {
      setNitroActive(true)
      setShowNitroFlash(true)
      setNitro(0)
      setTimeout(() => setShowNitroFlash(false), 200)
      setTimeout(() => setNitroActive(false), 3000)
    }
  }, [])

  const startGame = useCallback(async () => {
    await requestTilt()
    setGameState('countdown')
    setScore(0)
    setSpeed(0)
    setCombo(0)
    setNitro(0)
    setNitroActive(false)
    setSteerInput(0)
    setCountdown(3)

    let count = 3
    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        setGameState('playing')
      }
    }, 800)
  }, [requestTilt])

  const handleGameOver = useCallback((finalScore) => {
    setGameState('gameover')
    setHighScore(prev => {
      if (finalScore > prev) {
        localStorage.setItem('turbo-racer-highscore', finalScore.toString())
        return finalScore
      }
      return prev
    })
  }, [])

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black" style={{ touchAction: 'none' }}>
      <GameCanvas
        gameState={gameState}
        steerInput={steerInput}
        nitroActive={nitroActive}
        onGameOver={handleGameOver}
        onScoreUpdate={setScore}
        onSpeedUpdate={setSpeed}
        onComboUpdate={setCombo}
        onNitroUpdate={setNitro}
      />

      {gameState === 'start' && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}

      {gameState === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div key={countdown} className="count-pulse">
            <span className="text-[80px] sm:text-[140px] font-black text-white"
                  style={{ textShadow: '0 0 60px rgba(139,92,246,0.8), 0 0 120px rgba(139,92,246,0.4)' }}>
              {countdown > 0 ? countdown : 'GO'}
            </span>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <HUD
            score={score}
            speed={speed}
            combo={combo}
            nitro={nitro}
            nitroActive={nitroActive}
            onNitroActivate={activateNitroFn}
          />
          {showNitroFlash && (
            <div className="absolute inset-0 z-20 pointer-events-none bg-violet-500/20" />
          )}
        </>
      )}

      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onRestart={startGame}
        />
      )}
    </div>
  )
}
