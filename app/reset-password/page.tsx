'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">

      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-blue-600 p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold">🏠 RealCRM</h1>
          <p className="text-blue-200 mt-2">The CRM built for real estate agents</p>
        </div>
        <div className="bg-blue-500 rounded-2xl p-8">
          <p className="text-4xl mb-4">🔐</p>
          <p className="text-xl font-bold mb-2">Forgot your password?</p>
          <p className="text-blue-200">No worries! Enter your email and we will send you a reset link instantly.</p>
        </div>
        <p className="text-blue-300 text-sm">© 2026 RealCRM. All rights reserved.</p>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {sent ? (
            // Success state
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
              <p className="text-gray-500 mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Email address</label>
                  <input
                    className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                  />
                </div>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 transition-all text-lg"
                >
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </div>

              <p className="text-center text-gray-500 mt-6">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}