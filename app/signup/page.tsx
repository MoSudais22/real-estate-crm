'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
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

        <div className="space-y-4">
          <div className="bg-blue-500 rounded-2xl p-6">
            <p className="text-lg font-bold mb-1">Start closing more deals</p>
            <p className="text-blue-200 text-sm">Join hundreds of real estate agents who use RealCRM to grow their business</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: '500+', label: 'Active Agents' },
              { number: '$2M+', label: 'Deals Tracked' },
              { number: '98%', label: 'Satisfaction' },
              { number: '24/7', label: 'Support' },
            ].map(stat => (
              <div key={stat.label} className="bg-blue-500 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{stat.number}</p>
                <p className="text-blue-200 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">© 2026 RealCRM. All rights reserved.</p>
      </div>

      {/* Right Side — Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-500 mt-2">Start your free RealCRM account today</p>
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
                placeholder="Min 6 characters"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 transition-all text-lg mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </div>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-center text-gray-400 text-xs mt-4">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}