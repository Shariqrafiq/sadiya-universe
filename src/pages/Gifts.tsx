import { lazy, Suspense } from 'react'
import { GiftCollection } from '../components/GiftCollection'
import { useReducedMotion } from '../hooks/useReducedMotion'

const GiftBox3D = lazy(() => import('../components/GiftBox3D').then((m) => ({ default: m.GiftBox3D })))

export default function Gifts() {
  const reduced = useReducedMotion()
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <h1 className="text-center font-script text-4xl">Little Gifts</h1>
      <GiftCollection />
      <Suspense fallback={<p role="status" className="text-center">Wrapping a 3D surprise…</p>}><GiftBox3D reduced={reduced} /></Suspense>
    </main>
  )
}
