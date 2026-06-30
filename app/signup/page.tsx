'use client'

import { Suspense, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // ... (sab existing code yahan as is rahega, sirf function ka naam SignupPage se SignupForm kar do)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'owner' | 'agent'>('owner')
  const [agencyName, setAgencyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const inviteEmail = searchParams.get('email')
    if (inviteEmail) {
      setEmail(inviteEmail)
      setAccountType('agent')
    }
  }, [searchParams])

  async function handleSignup() {
    setLoading(true)
    setError('')

    if (accountType === 'owner' && !agencyName) {
      setError('Please enter your agency name')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id

 if (accountType === 'owner') {
  await supabase.from('agencies').insert({ name: agencyName, owner_id: userId })
} else {
  const res = await fetch('/api/join-team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, userId })
  })
  const result = await res.json()
  console.log('Join team result:', result)
}

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">

      <div className="hidden md:flex flex-col justify-between w-1/2 bg-blue-600 p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold">🏠 RealCRM</h1>
          <p className="text-blue-200 mt-2">The CRM built for real estate agents</p>
        </div>
        <div className="bg-blue-500 rounded-2xl p-8">
          <p className="text-4xl mb-4">🏢</p>
          <p className="text-xl font-bold mb-2">Start your agency</p>
          <p className="text-blue-200">Create your own agency or join your team as an agent.</p>
        </div>
        <p className="text-blue-300 text-sm">© 2026 RealCRM. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-500 mt-2">Choose how you want to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setAccountType('owner')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                accountType === 'owner' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <p className="text-2xl mb-1">🏢</p>
              <p className="font-bold text-sm text-gray-900">Agency Owner</p>
              <p className="text-xs text-gray-500">Start a new agency</p>
            </button>
            <button
              onClick={() => setAccountType('agent')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                accountType === 'agent' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <p className="text-2xl mb-1">👤</p>
              <p className="font-bold text-sm text-gray-900">Agent</p>
              <p className="text-xs text-gray-500">Join existing team</p>
            </button>
          </div>

          <div className="space-y-4">
            {accountType === 'owner' && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Agency Name</label>
                <input
                  className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Khan Real Estate"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email address</label>
              <input
                className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!!searchParams.get('email')}
              />
              {accountType === 'agent' && (
                <p className="text-xs text-gray-400 mt-1">Use the email your agency invited you with</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <input
                className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}