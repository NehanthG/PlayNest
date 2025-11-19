import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

export default function Signup() {
  const { signup, isSigningUp } = useAuthStore()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [mounted, setMounted] = useState(false)
  const [interact, setInteract] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) return
    await signup(form)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen interactive Spline background (match Login) */}
      <div className="absolute inset-0">
         <Spline
        scene="https://prod.spline.design/QcaVirju9ugLvOfP/scene.splinecode" 
      />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      
      

      {/* Right-aligned floating form (match Login) */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-full max-w-md">
        <div className={`w-full bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-7 border border-white/20 ring-1 ring-white/10 ${mounted ? '' : ''} ${interact ? 'pointer-events-none opacity-90' : ''}`}>
          <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">Create account</h1>
          <p className="mb-6 text-sm text-white/70">Join and begin your journey</p>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Full name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={onChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={onChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={onChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full inline-flex items-center justify-center rounded-lg bg-white/70 text-slate-900 px-4 py-2 font-medium shadow-lg ring-1 ring-white/40 backdrop-blur-sm hover:bg-white/85 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-60"
            >
              {isSigningUp ? 'Creating…' : 'Sign up'}
            </button>
          </form>
          <p className="mt-5 text-sm text-white/80">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-200 font-medium hover:text-white underline underline-offset-2">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
