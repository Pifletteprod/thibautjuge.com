'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default function SmokeEffect() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    let w = window.innerWidth
    let h = window.innerHeight

    // Caméra orthographique — 1 unité = 1 pixel
    const scene    = new THREE.Scene()
    const camera   = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 1.4, 0.8, 0.0)
    composer.addPass(bloom)

    // Textures organiques (blobs irréguliers)
    const TEXTURE_COUNT = 6
    const textures: THREE.CanvasTexture[] = []
    for (let t = 0; t < TEXTURE_COUNT; t++) {
      const cv = document.createElement('canvas')
      cv.width = cv.height = 128
      const cx = cv.getContext('2d')!
      for (let b = 0; b < 9; b++) {
        const ox = (Math.random() - 0.5) * 30
        const oy = (Math.random() - 0.5) * 30
        const r  = 38 + Math.random() * 22
        const g  = cx.createRadialGradient(64 + ox, 64 + oy, 0, 64 + ox, 64 + oy, r)
        g.addColorStop(0,    'rgba(255,255,255,0.28)')
        g.addColorStop(0.55, 'rgba(255,255,255,0.14)')
        g.addColorStop(0.85, 'rgba(255,255,255,0.04)')
        g.addColorStop(1,    'rgba(255,255,255,0)')
        cx.fillStyle = g
        cx.beginPath()
        cx.arc(64 + ox, 64 + oy, r, 0, Math.PI * 2)
        cx.fill()
      }
      textures.push(new THREE.CanvasTexture(cv))
    }

    let hue = 0
    function nextColor() {
      hue = (hue + 0.07) % 1
      return new THREE.Color().setHSL(hue, 1.0, 0.55)
    }

    type Puff = {
      mesh: THREE.Mesh
      vx: number
      vy: number
      life: number
      maxLife: number
      rotSpeed: number
      turbX: number
      turbY: number
    }

    const puffs: Puff[] = []
    const baseMat = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    let holdColor = nextColor()

    function spawnPuff(px: number, py: number, dx = 0, dy = 0) {
      const m    = baseMat.clone()
      m.map      = textures[Math.floor(Math.random() * TEXTURE_COUNT)]
      m.color    = holdColor.clone()
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m)

      mesh.position.set(px - w / 2, -(py - h / 2), 0)
      mesh.rotation.z = Math.random() * Math.PI * 2

      const s = 4 + Math.random() * 4
      mesh.scale.set(s, s, s)
      scene.add(mesh)

      const life   = 30 + Math.random() * 20
      const speed  = 8
      const spread = 3
      const len = Math.sqrt(dx * dx + dy * dy)

      let vx, vy
      if (len < 0.5) {
        const angle = Math.random() * Math.PI * 2
        const r     = speed * (0.3 + Math.random() * 0.7)
        vx = Math.cos(angle) * r
        vy = Math.sin(angle) * r
      } else {
        vx =  (dx / len) * speed + (Math.random() - 0.5) * spread
        vy = -(dy / len) * speed + (Math.random() - 0.5) * spread
      }

      puffs.push({
        mesh,
        vx,
        vy,
        life,
        maxLife: life,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        turbX: 0,
        turbY: 0,
      })
    }

    const mouse  = { x: 0, y: 0 }
    const delta  = { x: 0, y: 0 }
    let pressed  = false

    function onMouseDown(e: MouseEvent) {
      pressed   = true
      holdColor = nextColor()
      mouse.x   = e.clientX
      mouse.y   = e.clientY
      for (let i = 0; i < 500; i++)
        spawnPuff(mouse.x + (Math.random() - 0.5) * 10, mouse.y + (Math.random() - 0.5) * 10, delta.x, delta.y)
    }
    function onMouseMove(e: MouseEvent) {
      delta.x = e.clientX - mouse.x
      delta.y = e.clientY - mouse.y
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    function onMouseUp() { pressed = false }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)

    function onResize() {
      w = window.innerWidth
      h = window.innerHeight
      camera.left   = -w / 2
      camera.right  =  w / 2
      camera.top    =  h / 2
      camera.bottom = -h / 2
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    function loop() {
      raf = requestAnimationFrame(loop)

      if (pressed) {
        for (let i = 0; i < 80; i++)
          spawnPuff(mouse.x + (Math.random() - 0.5) * 10, mouse.y + (Math.random() - 0.5) * 10, delta.x, delta.y)
        delta.x *= 0.85
        delta.y *= 0.85
      }

      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]

        p.turbX += (Math.random() - 0.5) * 0.4
        p.turbY += (Math.random() - 0.5) * 0.2
        p.turbX *= 0.95
        p.turbY *= 0.95

        p.mesh.position.x += p.vx + p.turbX
        p.mesh.position.y += p.vy + p.turbY
        p.mesh.rotation.z += p.rotSpeed

        if (p.mesh.position.x < -w / 2 || p.mesh.position.x > w / 2) {
          p.vx *= -0.7
          p.mesh.position.x += p.vx
        }
        if (p.mesh.position.y < -h / 2 || p.mesh.position.y > h / 2) {
          p.vy *= -0.7
          p.mesh.position.y += p.vy
        }

        const t     = p.life / p.maxLife
        const alpha = Math.pow(t, 0.35) * (1 - Math.pow(1 - t, 8)) * 0.85
        const scale = t > 0.5 ? p.mesh.scale.x * (1 + 0.014) : p.mesh.scale.x
        p.mesh.scale.set(scale, scale, scale);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha

        p.life--
        if (p.life <= 0) {
          scene.remove(p.mesh)
          p.mesh.geometry.dispose()
          puffs.splice(i, 1)
        }
      }

      composer.render()
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('resize',    onResize)
      renderer.dispose()
      textures.forEach(tx => tx.dispose())
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'screen',
      }}
    />
  )
}
