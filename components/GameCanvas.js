'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

const LANE_WIDTH = 2.6
const NUM_LANES = 5
const ROAD_WIDTH = LANE_WIDTH * NUM_LANES
const PLAYER_Z = 8
const SPAWN_Z = -120
const DESPAWN_Z = 25
const CAR_COLORS = [0xff3344, 0x33aaff, 0xffaa00, 0x33ff88, 0xff33cc, 0xffee33]
const NITRO_COLOR = 0x8B5CF6

// Detect mobile for quality scaling
const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

// Shared geometries (created once)
let sharedGeo = null
function getSharedGeo() {
  if (sharedGeo) return sharedGeo
  sharedGeo = {
    carBody: new THREE.BoxGeometry(1.6, 0.55, 3.2),
    carCabin: new THREE.BoxGeometry(1.3, 0.45, 1.5),
    obsBody: new THREE.BoxGeometry(1.5, 0.5, 2.8),
    obsCabin: new THREE.BoxGeometry(1.2, 0.4, 1.3),
    wheel: new THREE.BoxGeometry(0.15, 0.4, 0.4),
    light: new THREE.BoxGeometry(0.2, 0.15, 0.05),
    nitroGem: new THREE.OctahedronGeometry(0.45, 0),
    nitroRing: new THREE.RingGeometry(0.5, 0.7, 6),
    road: new THREE.PlaneGeometry(ROAD_WIDTH + 2, 400),
    laneLine: new THREE.PlaneGeometry(0.06, 400),
    barrier: new THREE.BoxGeometry(0.4, 0.8, 400),
    building: new THREE.BoxGeometry(1, 1, 1),
    lampPost: new THREE.BoxGeometry(0.08, 5, 0.08),
    lampGlow: new THREE.BoxGeometry(0.3, 0.3, 0.3),
  }
  return sharedGeo
}

// Shared materials
let sharedMat = null
function getSharedMat() {
  if (sharedMat) return sharedMat
  sharedMat = {
    road: new THREE.MeshBasicMaterial({ color: 0x111122 }),
    roadShoulder: new THREE.MeshBasicMaterial({ color: 0x0d0d1a }),
    laneSolid: new THREE.MeshBasicMaterial({ color: 0xff8800 }),
    laneDash: new THREE.MeshBasicMaterial({ color: 0x333355 }),
    barrier: new THREE.MeshBasicMaterial({ color: 0x222244 }),
    barrierStripe: new THREE.MeshBasicMaterial({ color: 0xff4400 }),
    playerBody: new THREE.MeshPhongMaterial({ color: 0x8B5CF6, emissive: 0x2a1a5e, shininess: 80 }),
    playerCabin: new THREE.MeshPhongMaterial({ color: 0x0a0a1a, emissive: 0x050510, shininess: 60 }),
    playerWheel: new THREE.MeshBasicMaterial({ color: 0x111111 }),
    headlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    headlightGlow: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }),
    taillight: new THREE.MeshBasicMaterial({ color: 0xff2200 }),
    taillightGlow: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4 }),
    obsCabin: new THREE.MeshBasicMaterial({ color: 0x1a1a2e }),
    obsWheel: new THREE.MeshBasicMaterial({ color: 0x111111 }),
    obsTail: new THREE.MeshBasicMaterial({ color: 0xff1100 }),
    nitroGem: new THREE.MeshBasicMaterial({ color: NITRO_COLOR }),
    nitroRing: new THREE.MeshBasicMaterial({ color: NITRO_COLOR, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    lampPost: new THREE.MeshBasicMaterial({ color: 0x333355 }),
  }
  return sharedMat
}

function createPlayerCar() {
  const geo = getSharedGeo()
  const mat = getSharedMat()
  const group = new THREE.Group()

  const body = new THREE.Mesh(geo.carBody, mat.playerBody)
  body.position.y = 0.45
  group.add(body)

  const cabin = new THREE.Mesh(geo.carCabin, mat.playerCabin)
  cabin.position.set(0, 0.9, -0.15)
  group.add(cabin)

  // Spoiler
  const spoilerGeo = new THREE.BoxGeometry(1.4, 0.06, 0.3)
  const spoiler = new THREE.Mesh(spoilerGeo, mat.playerBody)
  spoiler.position.set(0, 0.95, 1.4)
  group.add(spoiler)
  const spoilerStandGeo = new THREE.BoxGeometry(0.06, 0.25, 0.06)
  const ss1 = new THREE.Mesh(spoilerStandGeo, mat.playerWheel)
  ss1.position.set(-0.5, 0.8, 1.4)
  group.add(ss1)
  const ss2 = new THREE.Mesh(spoilerStandGeo, mat.playerWheel)
  ss2.position.set(0.5, 0.8, 1.4)
  group.add(ss2)

  // Wheels (simple boxes, no cylinders)
  const wheelPositions = [[-0.85, 0.2, 1.0], [0.85, 0.2, 1.0], [-0.85, 0.2, -0.9], [0.85, 0.2, -0.9]]
  wheelPositions.forEach(pos => {
    const w = new THREE.Mesh(geo.wheel, mat.playerWheel)
    w.position.set(...pos)
    group.add(w)
  })

  // Headlights
  const hl1 = new THREE.Mesh(geo.light, mat.headlight)
  hl1.position.set(-0.6, 0.45, -1.63)
  group.add(hl1)
  const hl2 = new THREE.Mesh(geo.light, mat.headlight)
  hl2.position.set(0.6, 0.45, -1.63)
  group.add(hl2)

  // Headlight glow cones
  const coneGeo = new THREE.ConeGeometry(1.5, 8, 4)
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xffeedd, transparent: true, opacity: 0.04 })
  const cone = new THREE.Mesh(coneGeo, coneMat)
  cone.rotation.x = Math.PI / 2
  cone.position.set(0, 0.3, -5.5)
  group.add(cone)

  // Tail lights
  const tl1 = new THREE.Mesh(geo.light, mat.taillight)
  tl1.position.set(-0.6, 0.45, 1.63)
  group.add(tl1)
  const tl2 = new THREE.Mesh(geo.light, mat.taillight)
  tl2.position.set(0.6, 0.45, 1.63)
  group.add(tl2)

  // Neon underglow
  const underGeo = new THREE.PlaneGeometry(1.8, 3.4)
  const underMat = new THREE.MeshBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
  const underglow = new THREE.Mesh(underGeo, underMat)
  underglow.rotation.x = -Math.PI / 2
  underglow.position.y = 0.02
  group.add(underglow)
  group.userData.underglow = underglow

  return group
}

function createObstacleCar(color) {
  const geo = getSharedGeo()
  const mat = getSharedMat()
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshBasicMaterial({ color })
  const body = new THREE.Mesh(geo.obsBody, bodyMat)
  body.position.y = 0.4
  group.add(body)

  const cabin = new THREE.Mesh(geo.obsCabin, mat.obsCabin)
  cabin.position.set(0, 0.85, -0.1)
  group.add(cabin)

  const wheelPositions = [[-0.8, 0.18, 0.8], [0.8, 0.18, 0.8], [-0.8, 0.18, -0.8], [0.8, 0.18, -0.8]]
  wheelPositions.forEach(pos => {
    const w = new THREE.Mesh(geo.wheel, mat.obsWheel)
    w.position.set(...pos)
    group.add(w)
  })

  // Tail lights
  const tl1 = new THREE.Mesh(geo.light, mat.obsTail)
  tl1.position.set(-0.55, 0.4, 1.42)
  group.add(tl1)
  const tl2 = new THREE.Mesh(geo.light, mat.obsTail)
  tl2.position.set(0.55, 0.4, 1.42)
  group.add(tl2)

  // Tail light glow
  const glowGeo = new THREE.PlaneGeometry(0.4, 0.2)
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 })
  const g1 = new THREE.Mesh(glowGeo, glowMat)
  g1.position.set(-0.55, 0.4, 1.45)
  group.add(g1)
  const g2 = new THREE.Mesh(glowGeo, glowMat)
  g2.position.set(0.55, 0.4, 1.45)
  group.add(g2)

  return group
}

function createNitroPickup() {
  const geo = getSharedGeo()
  const mat = getSharedMat()
  const group = new THREE.Group()

  const gem = new THREE.Mesh(geo.nitroGem, mat.nitroGem)
  gem.position.y = 1.0
  group.add(gem)

  const ring = new THREE.Mesh(geo.nitroRing, mat.nitroRing)
  ring.position.y = 1.0
  ring.rotation.x = -Math.PI / 2
  group.add(ring)

  return group
}

export default function GameCanvas({
  gameState,
  steerInput,
  nitroActive,
  onGameOver,
  onScoreUpdate,
  onSpeedUpdate,
  onComboUpdate,
  onNitroUpdate
}) {
  const mountRef = useRef(null)
  const gameRef = useRef(null)
  const steerRef = useRef(0)
  const nitroRef = useRef(false)
  const gameStateRef = useRef('start')

  // Keep refs in sync to avoid re-creating gameLoop
  steerRef.current = steerInput
  nitroRef.current = nitroActive
  gameStateRef.current = gameState

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const geo = getSharedGeo()
    const mat = getSharedMat()

    // Renderer - optimized for mobile
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2)
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(pixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    // NO shadows - huge performance gain
    mount.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x060612, 30, 120)
    scene.background = new THREE.Color(0x060612)

    // Camera
    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.5, 150)
    camera.position.set(0, 4.0, 13)
    camera.lookAt(0, 0.5, -10)

    // Minimal lighting (one ambient + one directional, no shadows)
    const ambient = new THREE.AmbientLight(0x445566, 1.2)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xccbbff, 0.8)
    dirLight.position.set(3, 8, 5)
    scene.add(dirLight)

    // ===== ROAD =====
    const road = new THREE.Mesh(geo.road, mat.road)
    road.rotation.x = -Math.PI / 2
    road.position.y = -0.01
    scene.add(road)

    // Lane lines (only edge lines as solid, middle as color hints)
    for (let lane = -2; lane <= 2; lane++) {
      const isEdge = Math.abs(lane) === 2
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(isEdge ? 0.1 : 0.04, 400),
        isEdge ? mat.laneSolid : mat.laneDash
      )
      line.rotation.x = -Math.PI / 2
      line.position.set(lane * LANE_WIDTH, 0.005, 0)
      scene.add(line)
    }

    // Center dashes (fewer, uses one merged geometry approach)
    for (let laneOff of [-1, 0, 1]) {
      for (let d = -20; d < 20; d++) {
        const dash = new THREE.Mesh(
          new THREE.PlaneGeometry(0.05, 2),
          mat.laneDash
        )
        dash.rotation.x = -Math.PI / 2
        dash.position.set(laneOff * LANE_WIDTH + LANE_WIDTH / 2, 0.006, d * 10)
        scene.add(dash)
      }
    }

    // Side barriers with reflective stripes
    for (let side of [-1, 1]) {
      const b = new THREE.Mesh(geo.barrier, mat.barrier)
      b.position.set(side * (ROAD_WIDTH / 2 + 0.5), 0.4, 0)
      scene.add(b)

      // Reflective top stripe
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, 400),
        mat.barrierStripe
      )
      stripe.rotation.x = -Math.PI / 2
      stripe.position.set(side * (ROAD_WIDTH / 2 + 0.5), 0.81, 0)
      scene.add(stripe)
    }

    // ===== CITY SKYLINE (fewer, bigger, simpler) =====
    const buildingCount = isMobile ? 15 : 25
    const buildings = []
    for (let side of [-1, 1]) {
      for (let i = 0; i < buildingCount; i++) {
        const h = 8 + Math.random() * 30
        const w = 3 + Math.random() * 5
        const d = 3 + Math.random() * 5
        const buildMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.7 + Math.random() * 0.1, 0.15, 0.04 + Math.random() * 0.04)
        })
        const b = new THREE.Mesh(geo.building, buildMat)
        b.scale.set(w, h, d)
        const xOff = ROAD_WIDTH / 2 + 3 + Math.random() * 20
        b.position.set(side * xOff, h / 2, -i * 16 + Math.random() * 8)
        scene.add(b)
        buildings.push({ mesh: b, origZ: b.position.z })

        // Window glow strips
        if (Math.random() > 0.3) {
          const winColor = [0x8B5CF6, 0x3B82F6, 0xEC4899, 0x06B6D4][Math.floor(Math.random() * 4)]
          const winMat = new THREE.MeshBasicMaterial({ color: winColor, transparent: true, opacity: 0.12 + Math.random() * 0.15 })
          const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, h * 0.85), winMat)
          win.position.copy(b.position)
          win.position.x += side * (-w / 2 - 0.02)
          win.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2
          scene.add(win)
          buildings.push({ mesh: win, origZ: win.position.z, linkedTo: b })
        }
      }
    }

    // ===== LAMP POSTS (far fewer) =====
    const lampCount = isMobile ? 12 : 20
    const lamps = []
    for (let side of [-1, 1]) {
      for (let i = 0; i < lampCount; i++) {
        const post = new THREE.Mesh(geo.lampPost, mat.lampPost)
        const z = -i * (400 / lampCount)
        post.position.set(side * (ROAD_WIDTH / 2 + 1.2), 2.5, z)
        scene.add(post)

        const glowColor = i % 2 === 0 ? 0x8B5CF6 : 0x3B82F6
        const glowMat = new THREE.MeshBasicMaterial({ color: glowColor })
        const glow = new THREE.Mesh(geo.lampGlow, glowMat)
        glow.position.set(side * (ROAD_WIDTH / 2 + 1.2), 5.1, z)
        scene.add(glow)

        lamps.push({ post, glow, origZ: z, side })
      }
    }

    // ===== SPEED LINES (fewer on mobile) =====
    const speedLineCount = isMobile ? 15 : 30
    const speedLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 2.0)
    ])
    const speedLines = []
    for (let i = 0; i < speedLineCount; i++) {
      const lineMat = new THREE.LineBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0 })
      const line = new THREE.Line(speedLineGeo, lineMat)
      line.position.set(
        (Math.random() - 0.5) * ROAD_WIDTH * 1.2,
        0.2 + Math.random() * 3,
        PLAYER_Z - Math.random() * 50
      )
      scene.add(line)
      speedLines.push(line)
    }

    // ===== PLAYER =====
    const player = createPlayerCar()
    player.position.set(0, 0, PLAYER_Z)
    scene.add(player)

    // ===== GROUND PLANE (beyond road) =====
    const groundGeo = new THREE.PlaneGeometry(200, 400)
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x050510 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.05
    scene.add(ground)

    // ===== GAME STATE =====
    const g = {
      renderer, scene, camera, player,
      obstacles: [],
      nitroPickups: [],
      playerX: 0,
      speed: 80,
      maxSpeed: 200,
      distance: 0,
      score: 0,
      combo: 0,
      comboTimer: 0,
      nitro: 0,
      spawnTimer: 1,
      nitroSpawnTimer: 3,
      lastTime: performance.now(),
      disposed: false,
      frameCount: 0,
    }
    gameRef.current = g

    // Callback refs for stable loop
    const onGameOverRef = { current: onGameOver }
    const onScoreUpdateRef = { current: onScoreUpdate }
    const onSpeedUpdateRef = { current: onSpeedUpdate }
    const onComboUpdateRef = { current: onComboUpdate }
    const onNitroUpdateRef = { current: onNitroUpdate }

    // Game loop
    function loop() {
      if (g.disposed) return
      const raf = requestAnimationFrame(loop)
      g.raf = raf

      if (gameStateRef.current !== 'playing') {
        renderer.render(scene, camera)
        return
      }

      const now = performance.now()
      const dt = Math.min((now - g.lastTime) / 1000, 0.05)
      g.lastTime = now
      g.frameCount++

      const isNitro = nitroRef.current
      const steer = steerRef.current

      // Speed ramp
      if (isNitro) {
        g.speed = Math.min(g.maxSpeed + 80, g.speed + 80 * dt)
      } else {
        g.speed = Math.min(g.maxSpeed, g.speed + 2.5 * dt)
        g.maxSpeed = Math.min(300, g.maxSpeed + 0.4 * dt)
      }
      const moveSpeed = g.speed * 0.06

      // Steering (smooth)
      const steerForce = steer * 14 * dt
      g.playerX += steerForce
      g.playerX = Math.max(-ROAD_WIDTH / 2 + 1.2, Math.min(ROAD_WIDTH / 2 - 1.2, g.playerX))

      // Player
      player.position.x += (g.playerX - player.position.x) * 12 * dt
      player.rotation.y = -steer * 0.18
      player.rotation.z = -steer * 0.06

      // Underglow pulses with nitro
      const ug = player.userData.underglow
      if (ug) {
        ug.material.opacity = isNitro ? 0.35 + Math.sin(now * 0.01) * 0.1 : 0.12
        ug.material.color.setHex(isNitro ? 0xEC4899 : 0x8B5CF6)
      }

      // Camera
      camera.position.x += (g.playerX * 0.25 - camera.position.x) * 4 * dt
      const targetY = isNitro ? 5.0 : 4.0
      camera.position.y += (targetY - camera.position.y) * 3 * dt
      const targetFov = isNitro ? 75 : 65
      camera.fov += (targetFov - camera.fov) * 3 * dt
      camera.updateProjectionMatrix()

      // Score
      g.distance += moveSpeed * dt
      g.score += Math.round(moveSpeed * dt * 10 * Math.max(1, g.combo))

      // Only update React state every few frames to reduce overhead
      if (g.frameCount % 3 === 0) {
        onScoreUpdateRef.current(g.score)
        onSpeedUpdateRef.current(g.speed)
      }

      // Combo
      if (g.combo > 1) {
        g.comboTimer -= dt
        if (g.comboTimer <= 0) {
          g.combo = 0
          onComboUpdateRef.current(0)
        }
      }

      // Scroll environment
      const scrollDist = g.distance * 5
      const lampSpacing = 400 / lampCount
      lamps.forEach(l => {
        const totalLen = lampCount * lampSpacing
        let z = ((l.origZ + scrollDist) % totalLen)
        if (z > 30) z -= totalLen
        l.post.position.z = z
        l.glow.position.z = z
      })

      const buildSpacing = 16
      const buildTotal = buildingCount * buildSpacing
      buildings.forEach(b => {
        if (b.linkedTo) return
        let z = ((b.origZ + scrollDist) % buildTotal)
        if (z > 30) z -= buildTotal
        b.mesh.position.z = z
      })
      buildings.forEach(b => {
        if (!b.linkedTo) return
        b.mesh.position.z = b.linkedTo.position.z
      })

      // Spawn obstacles
      g.spawnTimer -= dt
      if (g.spawnTimer <= 0) {
        const difficulty = Math.min(1, g.distance / 400)
        const numCars = 1 + Math.floor(Math.random() * (1 + difficulty * 2))
        const usedLanes = new Set()

        for (let c = 0; c < numCars; c++) {
          let laneIdx
          let attempts = 0
          do {
            laneIdx = Math.floor(Math.random() * NUM_LANES) - 2
            attempts++
          } while (usedLanes.has(laneIdx) && attempts < 10)
          if (usedLanes.has(laneIdx)) continue
          usedLanes.add(laneIdx)

          const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
          const car = createObstacleCar(color)
          car.position.set(laneIdx * LANE_WIDTH, 0, SPAWN_Z - Math.random() * 20)
          car.userData.lane = laneIdx
          car.userData.speed = 0.2 + Math.random() * 0.4
          car.userData.passed = false
          scene.add(car)
          g.obstacles.push(car)
        }

        g.spawnTimer = Math.max(0.5, 2.2 - difficulty * 1.5) + Math.random() * 0.5
      }

      // Spawn nitro
      g.nitroSpawnTimer -= dt
      if (g.nitroSpawnTimer <= 0) {
        const pickup = createNitroPickup()
        const lane = Math.floor(Math.random() * NUM_LANES) - 2
        pickup.position.set(lane * LANE_WIDTH, 0, SPAWN_Z)
        scene.add(pickup)
        g.nitroPickups.push(pickup)
        g.nitroSpawnTimer = 5 + Math.random() * 5
      }

      // Update obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const obs = g.obstacles[i]
        obs.position.z += moveSpeed * dt * (1 - obs.userData.speed)

        const dx = Math.abs(obs.position.x - g.playerX)
        const dz = Math.abs(obs.position.z - PLAYER_Z)

        // Collision
        if (dx < 1.35 && dz < 2.2) {
          onGameOverRef.current(g.score)
          return
        }

        // Near miss
        if (!obs.userData.passed && obs.position.z > PLAYER_Z + 2.5) {
          obs.userData.passed = true
          if (dx < 2.8 && dx > 1.35) {
            g.combo += 1
            g.comboTimer = 3
            g.score += 50 * g.combo
            onComboUpdateRef.current(g.combo)
            onScoreUpdateRef.current(g.score)
          }
        }

        if (obs.position.z > DESPAWN_Z) {
          scene.remove(obs)
          g.obstacles.splice(i, 1)
        }
      }

      // Update nitro pickups
      for (let i = g.nitroPickups.length - 1; i >= 0; i--) {
        const pickup = g.nitroPickups[i]
        pickup.position.z += moveSpeed * dt

        // Animate rotation
        pickup.children[0].rotation.y += 3.5 * dt
        pickup.children[0].position.y = 1.0 + Math.sin(now * 0.004) * 0.2

        const dx = Math.abs(pickup.position.x - g.playerX)
        const dz = Math.abs(pickup.position.z - PLAYER_Z)
        if (dx < 1.5 && dz < 2) {
          g.nitro = Math.min(100, g.nitro + 25)
          onNitroUpdateRef.current(g.nitro)
          scene.remove(pickup)
          g.nitroPickups.splice(i, 1)
          continue
        }
        if (pickup.position.z > DESPAWN_Z) {
          scene.remove(pickup)
          g.nitroPickups.splice(i, 1)
        }
      }

      // Speed lines
      const speedFactor = Math.min(1, (g.speed - 80) / 180)
      speedLines.forEach(line => {
        line.material.opacity = speedFactor * (isNitro ? 0.6 : 0.3)
        line.position.z += moveSpeed * dt * 2
        if (line.position.z > PLAYER_Z + 5) {
          line.position.z = PLAYER_Z - 30 - Math.random() * 30
          line.position.x = (Math.random() - 0.5) * ROAD_WIDTH * 1.2
          line.position.y = 0.2 + Math.random() * 3
        }
      })

      // Nitro visual effects
      if (isNitro) {
        scene.fog.far = 160
        scene.background.setHex(0x08041a)
      } else {
        scene.fog.far += (120 - scene.fog.far) * 2 * dt
        scene.background.lerp(new THREE.Color(0x060612), 3 * dt)
      }

      renderer.render(scene, camera)
    }

    loop()

    // Resize handler
    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Orientation change for mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100)
    })

    return () => {
      g.disposed = true
      if (g.raf) cancelAnimationFrame(g.raf)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
    }
  }, []) // No deps - runs once, uses refs for live values

  // Keep callback refs updated
  useEffect(() => { /* callbacks update via refs above */ })

  return <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
}
