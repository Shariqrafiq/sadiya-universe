import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Volume2, VolumeX, LogOut, Pencil } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useContent } from '../lib/content'
import { setSoundEnabled, soundEnabled } from '../lib/sfx'


export function Navbar() {
  const { logout, isAdmin } = useAuth()
  const { content } = useContent()
  const L = content.labels
  const links: [string, string][] = [
    ['/world', L.world], ['/memories', L.memories], ['/gifts', L.gifts], ['/stars', L.stars], ['/letter', L.letter],
    ...content.pages.map((p): [string, string] => [`/page/${p.id}`, `${p.emoji} ${p.title}`]),
    ['/finale', L.finale],
  ]
  const nav = useNavigate()
  const [snd, setSnd] = useState(soundEnabled())
  const cls = ({ isActive }: { isActive: boolean }) => `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-petal text-white' : ''}`
  return (
    <nav aria-label="Main" className="sticky top-0 z-20 flex items-center gap-1 overflow-x-auto bg-cream/80 px-3 py-2 backdrop-blur">
      {links.map(([to, label]) => <NavLink key={to} to={to} className={cls}>{label}</NavLink>)}
      {isAdmin && <NavLink to="/studio" className={cls}><Pencil size={14} className="mr-1 inline" />Studio</NavLink>}
      <span className="flex-1" />
      <button aria-label={snd ? 'Mute sound effects' : 'Enable sound effects'} aria-pressed={snd} className="p-2"
        onClick={() => { setSoundEnabled(!snd); setSnd(!snd) }}>{snd ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
      <button aria-label="Lock and leave" className="p-2" onClick={async () => { await logout(); nav('/') }}><LogOut size={20} /></button>
    </nav>
  )
}
