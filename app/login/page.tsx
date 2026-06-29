'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else if (data.session) {
      router.refresh()
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">

      {/* Left Side — Branding */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-blue-600 p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold">🏠 RealCRM</h1>
          <p className="text-blue-200 mt-2">The CRM built for real estate agents</p>
        </div>

        <div className="space-y-6">
          {[
            { icon: '👥', title: 'Manage Contacts', desc: 'Keep all your leads and clients organized in one place' },
            { icon: '📊', title: 'Track Deals', desc: 'Never lose a deal with our visual pipeline board' },
            { icon: '📝', title: 'Log Activities', desc: 'Track calls, emails and notes for every contact' },
          ].map(f => (
            <div key={f.title} className="flex gap-4">
              <div className="bg-blue-500 p-3 rounded-xl text-2xl h-fit">{f.icon}</div>
              <div>
                <p className="font-bold">{f.title}</p>
                <p className="text-blue-200 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-blue-300 text-sm">© 2026 RealCRM. All rights reserved.</p>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
            <p className="text-gray-500 mt-2">Sign in to your RealCRM account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email address</label>
              <input
                className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <input
                className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
<div className="flex justify-end">
  <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
    Forgot password?
  </Link>
</div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 transition-all text-lg mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>

          <p className="text-center text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}