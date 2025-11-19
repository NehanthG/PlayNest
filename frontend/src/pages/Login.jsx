import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

export default function Login() {
  const { login, isLoggingIn } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [interact, setInteract] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    await login(form)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen interactive Spline background */}
      <div className="absolute inset-0">
     <Spline
        scene="https://prod.spline.design/QcaVirju9ugLvOfP/scene.splinecode" 
      />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      

      {/* Right-aligned floating form */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-full max-w-md">
        <div className={`w-full bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-7 border border-white/20 ring-1 ring-white/10 ${interact ? 'pointer-events-none opacity-90' : ''}`}>
          <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">Welcome back</h1>
          <p className="mb-6 text-sm text-white/70">Sign in to continue</p>
          <form onSubmit={onSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                <a className="text-xs text-indigo-200 hover:text-white" href="#">Forgot?</a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={onChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full inline-flex items-center justify-center rounded-lg bg-white/70 text-slate-900 px-4 py-2 font-medium shadow-lg ring-1 ring-white/40 backdrop-blur-sm hover:bg-white/85 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-60"
            >
              {isLoggingIn ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <p className="mt-5 text-sm text-white/80">
            No account?{' '}
            <Link to="/signup" className="text-indigo-200 font-medium hover:text-white underline underline-offset-2">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
