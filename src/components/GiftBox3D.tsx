import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'

function webglOk(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

function Box({ open, reduced }: { open: boolean; reduced: boolean }) {
  const root = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const hearts = useRef<Group>(null)
  useFrame((s, dt) => {
    if (root.current && !reduced) root.current.rotation.y += dt * 0.4
    if (lid.current) {
      lid.current.position.y += ((open ? 1.6 : 0.65) - lid.current.position.y) * Math.min(1, dt * 4)
      lid.current.rotation.z += ((open ? 0.6 : 0) - lid.current.rotation.z) * Math.min(1, dt * 4)
    }
    if (hearts.current) { hearts.current.visible = open; hearts.current.children.forEach((c, i) => { c.position.y = 0.8 + ((s.clock.elapsedTime * 0.5 + i * 0.3) % 1.6) }) }
  })
  return (
    <group ref={root} position={[0, -0.4, 0]}>
      <mesh castShadow><boxGeometry args={[1.4, 1.2, 1.4]} /><meshStandardMaterial color="#ffb3d1" /></mesh>
      <mesh position={[0, 0, 0]}><boxGeometry args={[0.28, 1.22, 1.42]} /><meshStandardMaterial color="#c98a86" metalness={0.5} roughness={0.3} /></mesh>
      <pointLight position={[0, 0.7, 0]} intensity={open ? 3 : 0.2} color="#ffe0f0" />
      <group ref={lid} position={[0, 0.65, 0]}>
        <mesh castShadow><boxGeometry args={[1.55, 0.3, 1.55]} /><meshStandardMaterial color="#d9ccff" /></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.28, 0.32, 1.57]} /><meshStandardMaterial color="#c98a86" metalness={0.5} roughness={0.3} /></mesh>
        <mesh position={[-0.2, 0.28, 0]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#c98a86" /></mesh>
        <mesh position={[0.2, 0.28, 0]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#c98a86" /></mesh>
      </group>
      <group ref={hearts} visible={false}>
        {[-0.4, 0, 0.4, 0.2].map((x, i) => <mesh key={i} position={[x, 0.8, (i - 1.5) * 0.2]}><sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color="#ff6fa5" emissive="#ff6fa5" emissiveIntensity={0.8} /></mesh>)}
      </group>
    </group>
  )
}

export function GiftBox3D({ reduced = false }: { reduced?: boolean }) {
  const [open, setOpen] = useState(false)
  const [gl] = useState(webglOk)
  const lowEnd = (navigator.hardwareConcurrency ?? 4) <= 2
  const toggle = () => setOpen((o) => !o)
  return (
    <section aria-label="Interactive gift box" className="text-center">
      <button onClick={toggle} aria-pressed={open} aria-label={open ? 'Close the gift box' : 'Open the gift box'} className="mx-auto block h-64 w-full max-w-sm touch-manipulation rounded-3xl">
        {gl && !lowEnd ? (
          <Canvas dpr={[1, 1.5]} shadows camera={{ position: [2.6, 1.8, 3.2], fov: 45 }} aria-hidden>
            <ambientLight intensity={0.8} /><directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
            <Box open={open} reduced={reduced} />
          </Canvas>
        ) : (
          <div aria-hidden className="text-8xl transition-transform" style={{ transform: open ? 'scale(1.2) rotate(-6deg)' : 'none' }}>{open ? '🎉' : '🎁'}</div>
        )}
      </button>
      <p className="mt-2 text-sm">{open ? '' : 'Tap the box to open it'}</p>
      <p role="status" className="min-h-[3rem] font-script text-2xl">{open ? 'Surprise, Sadiya! You are the most beautiful part of my life.' : ''}</p>
    </section>
  )
}
