import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useAnimation } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginInput } from '../lib/validation'
import { useAuth } from '../lib/auth'
import { demoMode, configured } from '../lib/supabase'
import { birthday } from '../config/birthday'
import { blip, chime } from '../lib/sfx'

export function SecretLogin() {
  const { login } = useAuth()
  const nav = useNavigate()
  const shake = useAnimation()
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (v: LoginInput) => {
    setMsg(null)
    const r = await login(v.password)
    if (r.ok) { setOk(true); chime(); setTimeout(() => nav('/world'), 1200) }
    else { setMsg(r.message ?? 'Try again.'); blip(220, 0.25, 'triangle'); shake.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.4 } }) }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-5 py-10 text-center">
      <motion.div aria-hidden animate={ok ? { rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] } : { y: [0, -8, 0] }} transition={{ repeat: ok ? 0 : Infinity, duration: ok ? 0.8 : 3 }} className="text-7xl">
        {ok ? '🔓' : '🔒'}
      </motion.div>
      <h1 className="font-script text-4xl">Welcome, {birthday.name} 💗</h1>
      <p>Only someone who knows our little secret can enter.</p>
      {demoMode && <p role="note" className="rounded-xl bg-yellow-100 px-3 py-1 text-sm">DEMO MODE (dev only): any password works.</p>}
      {!demoMode && !configured && <p role="alert" className="rounded-xl bg-red-100 px-3 py-1 text-sm">Supabase is not configured. See README.</p>}
      <motion.form animate={shake} onSubmit={handleSubmit(onSubmit)} className="card w-full space-y-3" noValidate>
        <label htmlFor="pw" className="block text-left font-semibold">Our secret</label>
        <div className="relative">
          <input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password"
            aria-invalid={!!errors.password || !!msg} aria-describedby="pw-err"
            className="field pr-12" {...register('password')} />
          <button type="button" aria-label={show ? 'Hide secret' : 'Show secret'} aria-pressed={show}
            onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p id="pw-err" role="alert" className="min-h-[1.5rem] text-sm text-red-700">{errors.password?.message ?? msg}</p>
        <button className="btn w-full" disabled={isSubmitting || ok}>{ok ? 'Welcome home 💞' : isSubmitting ? 'Checking…' : 'Unlock'}</button>
      </motion.form>
    </main>
  )
}
