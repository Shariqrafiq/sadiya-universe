import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminLoginSchema, type AdminLoginInput } from '../lib/validation'
import { useAuth } from '../lib/auth'
import { demoMode } from '../lib/supabase'

export default function AdminLogin() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [msg, setMsg] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) })
  const onSubmit = async (v: AdminLoginInput) => {
    setMsg(null)
    const r = await login(v.password, v.email)
    if (r.ok) nav('/studio')
    else setMsg('Sign-in failed. Check your email and password.')
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-5 py-10">
      <h1 className="text-center font-script text-4xl">Studio sign-in</h1>
      {demoMode && <p role="note" className="rounded-xl bg-yellow-100 px-3 py-1 text-center text-sm text-ink">DEMO MODE: any email and password work.</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3" noValidate>
        <label htmlFor="em" className="block font-semibold">Admin email</label>
        <input id="em" type="email" autoComplete="username" className="field" {...register('email')} />
        <p role="alert" className="min-h-[1.2rem] text-sm text-red-700">{errors.email?.message}</p>
        <label htmlFor="ap" className="block font-semibold">Password</label>
        <input id="ap" type="password" autoComplete="current-password" className="field" {...register('password')} />
        <p role="alert" className="min-h-[1.2rem] text-sm text-red-700">{errors.password?.message ?? msg}</p>
        <button className="btn w-full" disabled={isSubmitting}>{isSubmitting ? 'Checking…' : 'Sign in'}</button>
      </form>
    </main>
  )
}
