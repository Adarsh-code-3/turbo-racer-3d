'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

const LANE_WIDTH = 2.8
const ROAD_WIDTH = LANE_WIDTH * 5
const ROAD_LENGTH = 300
const PLAYER_Z = 8
const CAR_COLORS = [0xff4444, 0x44aaff, 0xffaa00, 0x44ff44, 0xff44ff, 0xffff44]
const NITRO_COLOR = 0x8B5CF6

function createCarGeometry() {
  const group = new THREE.Group()

  // Body
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.5, 3.2)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8B5CF6, metalness: 0.8, roughness: 0.2 })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = 0.4
  body.castShadow = true
  group.add(body)

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.3, 0.4, 1.5)
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.3 })
  const cabin = new THREE.Mesh(cabinGeo, cabinMat)
  cabin.position.set(0, 0.85, -0.2)
  cabin.castShadow = true
  group.add(cabin)

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12)
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.3, roughness: 0.8 })
  const wheelPositions = [
    [-0.85, 0.2, 0.9], [0.85, 0.2, 0.9],
    [-0.85, 0.2, -0.9], [0.85, 0.2, -0.9]
  ]
  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat)
    wheel.rotation.z = Math.PI / 2
    wheel.position.set(...pos)
    group.add(wheel)
  })

  // Headlights
  const lightGeo = new THREE.SphereGeometry(0.12, 8, 8)
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2 })
  const hl1 = new THREE.Mesh(lightGeo, lightMat)
  hl1.position.set(-0.55, 0.45, -1.6)
  group.add(hl1)
  const hl2 = new THREE.Mesh(lightGeo, lightMat)
  hl2.position.set(0.55, 0.45, -1.6)
  group.add(hl2)

  // Tail lights
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 })
  const tl1 = new THREE.Mesh(lightGeo, tailMat)
  tl1.position.set(-0.55, 0.45, 1.6)
  group.add(tl1)
  const tl2 = new THREE.Mesh(lightGeo, tailMat)
  tl2.position.set(0.55, 0.45, 1.6)
  group.add(tl2)

  return group
}

function createObstacleCar(color) {
  const group = new THREE.Group()

  const bodyGeo = new THREE.BoxGeometry(1.5, 0.5, 3.0)
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = 0.4
  body.castShadow = true
  group.add(body)

  const cabinGeo = new THREE.BoxGeometry(1.2, 0.4, 1.4)
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.5, roughness: 0.3 })
  const cabin = new THREE.Mesh(cabinGeo, cabinMat)
  cabin.position.set(0, 0.85, -0.1)
  group.add(cabin)

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.13, 10)
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
  ;[[-0.8, 0.18, 0.8], [0.8, 0.18, 0.8], [-0.8, 0.18, -0.8], [0.8, 0.18, -0.8]].forEach(pos => {
    const w = new THREE.Mesh(wheelGeo, wheelMat)
    w.rotation.z = Math.PI / 2
    w.position.set(...pos)
    group.add(w)
  })

  // Tail lights
  const tailGeo = new THREE.SphereGeometry(0.1, 6, 6)
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.5 })
  const t1 = new THREE.Mesh(tailGeo, tailMat)
  t1.position.set(-0.5, 0.4, 1.5)
  group.add(t1)
  const t2 = new THREE.Mesh(tailGeo, tailMat)
  t2.position.set(0.5, 0.4, 1.5)
  group.add(t2)

  return group
}

function createNitroPickup() {
  const group = new THREE.Group()
  const geo = new THREE.OctahedronGeometry(0.4, 0)
  const mat = new THREE.MeshStandardMaterial({
    color: NITRO_COLOR,
    emissive: NITRO_COLOR,
    emissiveIntensity: 2,
    metalness: 0.9,
    roughness: 0.1
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.y = 1.0
  group.add(mesh)

  // Glow ring
  const ringGeo = new THREE.TorusGeometry(0.6, 0.05, 8, 20)
  const ringMat = new THREE.MeshStandardMaterial({
    color: NITRO_COLOR,
    emissive: NITRO_COLOR,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.6
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.y = 1.0
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  group.userData.isNitro = true
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
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    obstacles: [],
    nitroPickups: [],
    particles: [],
    roadSegments: [],
    playerX: 0,
    speed: 80,
    maxSpeed: 200,
    distance: 0,
    score: 0,
    combo: 0,
    comboTimer: 0,
    nitro: 0,
    spawnTimer: 0,
    nitroSpawnTimer: 0,
    frameId: null,
    lastTime: 0,
    roadOffset: 0,
    sideObjects: [],
    speedLines: [],
  })

  const initScene = useCallback(() => {
    const g = gameRef.current
    const mount = mountRef.current
    if (!mount) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    mount.appendChild(renderer.domElement)
    g.renderer = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.012)
    scene.background = new THREE.Color(0x0a0a1a)
    g.scene = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70, mount.clientWidth / mount.clientHeight, 0.1, 500
    )
    camera.position.set(0, 4.5, 14)
    camera.lookAt(0, 0.5, -10)
    g.camera = camera

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x334466, 0.8)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5)
    dirLight.position.set(5, 15, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 60
    dirLight.shadow.camera.left = -15
    dirLight.shadow.camera.right = 15
    dirLight.shadow.camera.top = 20
    dirLight.shadow.camera.bottom = -20
    scene.add(dirLight)

    // Player headlight
    const spotLight = new THREE.SpotLight(0xffffff, 3, 40, Math.PI / 6, 0.5)
    spotLight.position.set(0, 2, PLAYER_Z - 2)
    spotLight.target.position.set(0, 0, PLAYER_Z - 30)
    scene.add(spotLight)
    scene.add(spotLight.target)
    g.spotLight = spotLight

    // Road
    for (let i = 0; i < 4; i++) {
      const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH)
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.1,
        roughness: 0.9,
      })
      const road = new THREE.Mesh(roadGeo, roadMat)
      road.rotation.x = -Math.PI / 2
      road.position.z = -ROAD_LENGTH * i + ROAD_LENGTH / 2
      road.receiveShadow = true
      scene.add(road)
      g.roadSegments.push(road)
    }

    // Road lane lines
    for (let i = 0; i < 4; i++) {
      for (let lane = -2; lane <= 2; lane++) {
        const lineGeo = new THREE.PlaneGeometry(0.08, ROAD_LENGTH * 0.9)
        const lineMat = new THREE.MeshStandardMaterial({
          color: lane === -2 || lane === 2 ? 0xffa500 : 0x444466,
          emissive: lane === -2 || lane === 2 ? 0xffa500 : 0x222233,
          emissiveIntensity: 0.3
        })
        const line = new THREE.Mesh(lineGeo, lineMat)
        line.rotation.x = -Math.PI / 2
        line.position.set(lane * LANE_WIDTH, 0.01, -ROAD_LENGTH * i + ROAD_LENGTH / 2)
        scene.add(line)
      }
    }

    // Dashed center lines
    for (let seg = 0; seg < 4; seg++) {
      for (let d = 0; d < 30; d++) {
        for (let laneOff of [-1, 0, 1]) {
          const dashGeo = new THREE.PlaneGeometry(0.06, 3)
          const dashMat = new THREE.MeshStandardMaterial({
            color: 0x555577,
            emissive: 0x333355,
            emissiveIntensity: 0.2
          })
          const dash = new THREE.Mesh(dashGeo, dashMat)
          dash.rotation.x = -Math.PI / 2
          const zPos = -ROAD_LENGTH * seg + d * 10
          dash.position.set(laneOff * LANE_WIDTH + LANE_WIDTH / 2, 0.015, zPos)
          scene.add(dash)
        }
      }
    }

    // Side barriers
    for (let side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const barrierGeo = new THREE.BoxGeometry(0.3, 0.6, ROAD_LENGTH)
        const barrierMat = new THREE.MeshStandardMaterial({
          color: 0x2a2a4a,
          metalness: 0.5,
          roughness: 0.5
        })
        const barrier = new THREE.Mesh(barrierGeo, barrierMat)
        barrier.position.set(side * (ROAD_WIDTH / 2 + 0.15), 0.3, -ROAD_LENGTH * i + ROAD_LENGTH / 2)
        scene.add(barrier)
      }
    }

    // Side lights (lamp posts)
    for (let side of [-1, 1]) {
      for (let i = 0; i < 60; i++) {
        const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 6)
        const postMat = new THREE.MeshStandardMaterial({ color: 0x444466 })
        const post = new THREE.Mesh(postGeo, postMat)
        post.position.set(side * (ROAD_WIDTH / 2 + 1.5), 2, -i * 20)
        scene.add(post)

        const glowGeo = new THREE.SphereGeometry(0.15, 8, 8)
        const glowMat = new THREE.MeshStandardMaterial({
          color: side === -1 ? 0x8B5CF6 : 0x3B82F6,
          emissive: side === -1 ? 0x8B5CF6 : 0x3B82F6,
          emissiveIntensity: 3
        })
        const glow = new THREE.Mesh(glowGeo, glowMat)
        glow.position.set(side * (ROAD_WIDTH / 2 + 1.5), 4, -i * 20)
        scene.add(glow)
        g.sideObjects.push({ post, glow, origZ: -i * 20 })
      }
    }

    // Buildings (background skyline)
    for (let side of [-1, 1]) {
      for (let i = 0; i < 40; i++) {
        const h = 5 + Math.random() * 25
        const w = 2 + Math.random() * 4
        const buildGeo = new THREE.BoxGeometry(w, h, 4 + Math.random() * 6)
        const hue = Math.random() * 0.1 + 0.6
        const buildMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(hue, 0.2, 0.08),
          metalness: 0.7,
          roughness: 0.3
        })
        const building = new THREE.Mesh(buildGeo, buildMat)
        building.position.set(
          side * (ROAD_WIDTH / 2 + 5 + Math.random() * 15),
          h / 2,
          -i * 30 + Math.random() * 10
        )
        scene.add(building)

        // Window lights
        if (Math.random() > 0.4) {
          const winGeo = new THREE.PlaneGeometry(w * 0.8, h * 0.8)
          const winMat = new THREE.MeshStandardMaterial({
            color: 0x8B5CF6,
            emissive: 0x8B5CF6,
            emissiveIntensity: 0.1 + Math.random() * 0.2,
            transparent: true,
            opacity: 0.3
          })
          const win = new THREE.Mesh(winGeo, winMat)
          win.position.copy(building.position)
          win.position.x += side * (-w / 2 - 0.01)
          win.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2
          scene.add(win)
        }
      }
    }

    // Player car
    const player = createCarGeometry()
    player.position.set(0, 0, PLAYER_Z)
    scene.add(player)
    g.player = player

    // Speed line particles
    for (let i = 0; i < 50; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1.5)
      ])
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x8B5CF6,
        transparent: true,
        opacity: 0
      })
      const line = new THREE.Line(lineGeo, lineMat)
      line.position.set(
        (Math.random() - 0.5) * ROAD_WIDTH,
        0.1 + Math.random() * 2,
        PLAYER_Z - Math.random() * 40
      )
      scene.add(line)
      g.speedLines.push(line)
    }

    // Reset state
    g.playerX = 0
    g.speed = 80
    g.distance = 0
    g.score = 0
    g.combo = 0
    g.comboTimer = 0
    g.nitro = 0
    g.spawnTimer = 0
    g.nitroSpawnTimer = 0
    g.lastTime = performance.now()
    g.roadOffset = 0
    g.obstacles = []
    g.nitroPickups = []
    g.particles = []
  }, [])

  const gameLoop = useCallback(() => {
    const g = gameRef.current
    if (!g.scene || gameState !== 'playing') {
      g.frameId = requestAnimationFrame(gameLoop)
      return
    }

    const now = performance.now()
    const dt = Math.min((now - g.lastTime) / 1000, 0.05)
    g.lastTime = now

    // Increase speed over time
    if (nitroActive) {
      g.speed = Math.min(g.maxSpeed + 80, g.speed + 60 * dt)
    } else {
      g.speed = Math.min(g.maxSpeed, g.speed + 2 * dt)
      g.maxSpeed = Math.min(280, g.maxSpeed + 0.3 * dt)
    }
    const moveSpeed = g.speed * 0.05

    // Steering
    const steerForce = steerInput * 12 * dt
    g.playerX += steerForce
    g.playerX = Math.max(-ROAD_WIDTH / 2 + 1, Math.min(ROAD_WIDTH / 2 - 1, g.playerX))

    // Player position + tilt
    g.player.position.x = g.playerX
    g.player.rotation.y = -steerInput * 0.15
    g.player.rotation.z = -steerInput * 0.08

    // Update spotlight
    if (g.spotLight) {
      g.spotLight.position.set(g.playerX, 2, PLAYER_Z - 2)
      g.spotLight.target.position.set(g.playerX, 0, PLAYER_Z - 30)
    }

    // Camera follow
    g.camera.position.x += (g.playerX * 0.3 - g.camera.position.x) * 3 * dt
    const camHeight = nitroActive ? 5.5 : 4.5
    g.camera.position.y += (camHeight - g.camera.position.y) * 2 * dt

    // Distance and score
    g.distance += moveSpeed * dt
    g.score += Math.round(moveSpeed * dt * 10 * (g.combo > 1 ? g.combo : 1))
    onScoreUpdate(g.score)
    onSpeedUpdate(g.speed)

    // Combo timer
    if (g.combo > 1) {
      g.comboTimer -= dt
      if (g.comboTimer <= 0) {
        g.combo = 0
        onComboUpdate(0)
      }
    }

    // Road scrolling
    g.roadOffset += moveSpeed * dt
    g.roadSegments.forEach((seg, i) => {
      seg.position.z = (g.roadOffset % ROAD_LENGTH) + ROAD_LENGTH / 2 - ROAD_LENGTH * i + ROAD_LENGTH
    })

    // Side objects scrolling
    g.sideObjects.forEach(obj => {
      const totalLen = 60 * 20
      const offset = ((g.distance * 5) % totalLen)
      let newZ = obj.origZ + offset
      if (newZ > 30) newZ -= totalLen
      obj.post.position.z = newZ
      obj.glow.position.z = newZ
    })

    // Spawn obstacles
    g.spawnTimer -= dt
    if (g.spawnTimer <= 0) {
      const difficulty = Math.min(1, g.distance / 500)
      const numCars = 1 + Math.floor(Math.random() * (1 + difficulty * 2))

      const usedLanes = new Set()
      for (let c = 0; c < numCars; c++) {
        let laneIdx
        let attempts = 0
        do {
          laneIdx = Math.floor(Math.random() * 5) - 2
          attempts++
        } while (usedLanes.has(laneIdx) && attempts < 10)

        if (usedLanes.has(laneIdx)) continue
        usedLanes.add(laneIdx)

        const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
        const car = createObstacleCar(color)
        const xPos = laneIdx * LANE_WIDTH
        car.position.set(xPos, 0, PLAYER_Z - 80 - Math.random() * 30)
        car.userData.lane = laneIdx
        car.userData.speed = 0.3 + Math.random() * 0.5
        g.scene.add(car)
        g.obstacles.push(car)
      }

      g.spawnTimer = Math.max(0.6, 2.5 - difficulty * 1.5) + Math.random() * 0.5
    }

    // Spawn nitro pickups
    g.nitroSpawnTimer -= dt
    if (g.nitroSpawnTimer <= 0) {
      const pickup = createNitroPickup()
      const lane = Math.floor(Math.random() * 5) - 2
      pickup.position.set(lane * LANE_WIDTH, 0, PLAYER_Z - 70 - Math.random() * 20)
      g.scene.add(pickup)
      g.nitroPickups.push(pickup)
      g.nitroSpawnTimer = 4 + Math.random() * 4
    }

    // Update obstacles
    for (let i = g.obstacles.length - 1; i >= 0; i--) {
      const obs = g.obstacles[i]
      obs.position.z += moveSpeed * dt * (1 - obs.userData.speed)

      // Collision check
      const dx = Math.abs(obs.position.x - g.playerX)
      const dz = Math.abs(obs.position.z - PLAYER_Z)
      if (dx < 1.4 && dz < 2.5) {
        onGameOver(g.score)
        return
      }

      // Near miss scoring
      if (!obs.userData.passed && obs.position.z > PLAYER_Z + 2) {
        obs.userData.passed = true
        const nearDx = Math.abs(obs.position.x - g.playerX)
        if (nearDx < 2.5 && nearDx > 1.4) {
          g.combo += 1
          g.comboTimer = 3
          g.score += 50 * g.combo
          onComboUpdate(g.combo)
          onScoreUpdate(g.score)
        }
      }

      // Remove if behind camera
      if (obs.position.z > PLAYER_Z + 20) {
        g.scene.remove(obs)
        g.obstacles.splice(i, 1)
      }
    }

    // Update nitro pickups
    for (let i = g.nitroPickups.length - 1; i >= 0; i--) {
      const pickup = g.nitroPickups[i]
      pickup.position.z += moveSpeed * dt
      pickup.children[0].rotation.y += 3 * dt
      pickup.children[1].rotation.z += 2 * dt

      // Collect check
      const dx = Math.abs(pickup.position.x - g.playerX)
      const dz = Math.abs(pickup.position.z - PLAYER_Z)
      if (dx < 1.5 && dz < 2) {
        g.nitro = Math.min(100, g.nitro + 25)
        onNitroUpdate(g.nitro)
        g.scene.remove(pickup)
        g.nitroPickups.splice(i, 1)
        continue
      }

      if (pickup.position.z > PLAYER_Z + 15) {
        g.scene.remove(pickup)
        g.nitroPickups.splice(i, 1)
      }
    }

    // Speed lines
    const speedFactor = Math.min(1, (g.speed - 80) / 150)
    g.speedLines.forEach(line => {
      line.material.opacity = speedFactor * 0.4
      line.position.z += moveSpeed * dt * 1.5
      if (line.position.z > PLAYER_Z + 5) {
        line.position.z = PLAYER_Z - 30 - Math.random() * 20
        line.position.x = (Math.random() - 0.5) * ROAD_WIDTH
        line.position.y = 0.1 + Math.random() * 2.5
      }
    })

    // Nitro visual effects
    if (nitroActive) {
      g.scene.fog.density = 0.008
      g.scene.background.setHex(0x0a0520)
    } else {
      g.scene.fog.density += (0.012 - g.scene.fog.density) * 2 * dt
      g.scene.background.lerp(new THREE.Color(0x0a0a1a), 2 * dt)
    }

    g.renderer.render(g.scene, g.camera)
    g.frameId = requestAnimationFrame(gameLoop)
  }, [gameState, steerInput, nitroActive, onGameOver, onScoreUpdate, onSpeedUpdate, onComboUpdate, onNitroUpdate])

  useEffect(() => {
    initScene()
    const g = gameRef.current

    const handleResize = () => {
      if (!g.renderer || !g.camera || !mountRef.current) return
      g.camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      g.camera.updateProjectionMatrix()
      g.renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    g.frameId = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (g.frameId) cancelAnimationFrame(g.frameId)
      if (g.renderer && mountRef.current) {
        mountRef.current.removeChild(g.renderer.domElement)
        g.renderer.dispose()
      }
      // Clean up Three.js objects
      if (g.scene) {
        g.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose())
            } else {
              obj.material.dispose()
            }
          }
        })
      }
    }
  }, [initScene, gameLoop])

  return <div ref={mountRef} className="w-full h-full" />
}
