import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Backdrop } from './components/Backdrop'
import { Navbar } from './components/Navbar'
import { MusicPlayer } from './components/MusicPlayer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'

const Birthday = lazy(() => import('./pages/Birthday'))
const Memories = lazy(() => import('./pages/Memories'))
const Gifts = lazy(() => import('./pages/Gifts'))
const Stars = lazy(() => import('./pages/Stars'))
const Letter = lazy(() => import('./pages/Letter'))
const Finale = lazy(() => import('./pages/Finale'))
const Studio = lazy(() => import('./pages/Studio'))

function PrivateLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<p role="status" className="p-10 text-center">Loading…</p>}><Outlet /></Suspense>
    </>
  )
}

export default function App() {
  return (
    <>
      <button className="sr-only focus:not-sr-only" onClick={() => document.getElementById('main')?.focus()}>Skip to content</button>
      {/* shared clip shape for the heart photo frame */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id="heartclip" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.95 C0.1,0.65 0,0.4 0,0.28 C0,0.1 0.12,0 0.27,0 C0.38,0 0.46,0.06 0.5,0.14 C0.54,0.06 0.62,0 0.73,0 C0.88,0 1,0.1 1,0.28 C1,0.4 0.9,0.65 0.5,0.95Z" />
        </clipPath>
      </svg>
      <Backdrop />
      <div id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<PrivateLayout />}>
              <Route path="/world" element={<Birthday />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/gifts" element={<Gifts />} />
              <Route path="/stars" element={<Stars />} />
              <Route path="/letter" element={<Letter />} />
              <Route path="/finale" element={<Finale />} />
              <Route element={<AdminRoute />}><Route path="/studio" element={<Studio />} /></Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <MusicPlayer />
    </>
  )
}
