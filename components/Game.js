'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import GameCanvas from './GameCanvas'
import HUD from './HUD'
import StartScreen from './StartScreen'
import GameOverScreen from './GameOverScreen'

export default function Game() {
  const [gameState, setGameState] = useState('start') // start, countdown, playing, gameover
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const [tiltX, setTiltX] = useState(0)
  const [touchX, setTouchX] = useState(0)
  const [combo, setCombo] = useState(0)
  const [nitro, setNitro] = useState(0)
  const [nitroActive, setNitroActive] = useState(false)
  const [lane, setLane] = useState(0)
  const [showNitroFlash, setShowNitroFlash] = useState(false)

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
        console.warn('Tilt permission denied')
      }
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      setTiltEnabled(true)
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (!tiltEnabled) return

    const handleOrientation = (e) => {
      if (gameState !== 'playing') return
      const gamma = e.gamma || 0
      const normalized = Math.max(-1, Math.min(1, gamma / 30))
      setTiltX(normalized)
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => window.removeEventListener('deviceorientation', handleOrientation, true)
  }, [tiltEnabled, gameState])

  useEffect(() => {
    const handleTouch = (e) => {
      if (gameState !== 'playing') return
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return
      const screenX = touch.clientX
      const halfWidth = window.innerWidth / 2
      const normalized = (screenX - halfWidth) / halfWidth
      setTouchX(normalized)
    }

    const handleTouchEnd = () => {
      setTouchX(0)
    }

    window.addEventListener('touchmove', handleTouch, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchmove', handleTouch)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState])

  useEffect(() => {
    const handleKey = (e) => {
      if (gameState !== 'playing') return
      if (e.key === 'ArrowLeft' || e.key === 'a') setTouchX(-0.8)
      if (e.key === 'ArrowRight' || e.key === 'd') setTouchX(0.8)
      if (e.key === ' ' || e.key === 'Shift') activateNitro()
    }
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
        setTouchX(0)
      }
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, nitro])

  const activateNitro = useCallback(() => {
    if (nitro >= 30) {
      setNitroActive(true)
      setShowNitroFlash(true)
      setTimeout(() => setShowNitroFlash(false), 300)
      setTimeout(() => setNitroActive(false), 3000)
      setNitro(0)
    }
  }, [nitro])

  const startGame = useCallback(async () => {
    await requestTilt()
    setGameState('countdown')
    setScore(0)
    setSpeed(0)
    setCombo(0)
    setNitro(0)
    setNitroActive(false)
    setCountdown(3)
    setLane(0)
    setTiltX(0)
    setTouchX(0)

    let count = 3
    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        setGameState('playing')
      }
    }, 1000)
  }, [requestTilt])

  const handleGameOver = useCallback((finalScore) => {
    setGameState('gameover')
    if (finalScore > highScore) {
      setHighScore(finalScore)
      localStorage.setItem('turbo-racer-highscore', finalScore.toString())
    }
  }, [highScore])

  const handleScoreUpdate = useCallback((newScore) => {
    setScore(newScore)
  }, [])

  const handleSpeedUpdate = useCallback((newSpeed) => {
    setSpeed(newSpeed)
  }, [])

  const handleComboUpdate = useCallback((newCombo) => {
    setCombo(newCombo)
  }, [])

  const handleNitroUpdate = useCallback((newNitro) => {
    setNitro(Math.min(100, newNitro))
  }, [])

  const steerInput = tiltEnabled ? tiltX : touchX

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      <GameCanvas
        gameState={gameState}
        steerInput={steerInput}
        nitroActive={nitroActive}
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
        onSpeedUpdate={handleSpeedUpdate}
        onComboUpdate={handleComboUpdate}
        onNitroUpdate={handleNitroUpdate}
      />

      {gameState === 'start' && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}

      {gameState === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div key={countdown} className="count-pulse">
            <span className="text-[120px] sm:text-[180px] font-black text-white drop-shadow-[0_0_60px_rgba(139,92,246,0.8)]">
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
            onNitroActivate={activateNitro}
          />
          {showNitroFlash && (
            <div className="absolute inset-0 z-20 pointer-events-none bg-violet-500/20 animate-pulse" />
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
