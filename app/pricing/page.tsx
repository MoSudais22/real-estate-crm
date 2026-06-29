'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubscribe() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, email: user.email }) })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Simple Pricing</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10">Start growing your real estate business</p>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-blue-500 p-8">
          <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full w-fit mb-4">Most Popular</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Pro Plan</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Everything you need to close more deals</p>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">$29</span>
            <span className="text-gray-500 dark:text-gray-400">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {['Unlimited contacts', 'Deal pipeline & Kanban board', 'Activity logs & notes', 'Multi-device access', 'Email support'].map(feature => (
              <li key={feature} className="flex items-center gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          <button onClick={handleSubscribe} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 text-lg">
            {loading ? 'Redirecting...' : 'Start Subscription →'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4">Cancel anytime • Secure payment by Stripe</p>
        </div>
      </div>
    </div>
  )
}