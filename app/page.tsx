'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [contactCount, setContactCount] = useState(0)
  const [dealCount, setDealCount] = useState(0)
  const [closedValue, setClosedValue] = useState(0)

  useEffect(() => {
    async function loadStats() {
      const { count: contacts } = await supabase.from('contacts').select('*', { count: 'exact', head: true })
      const { data: deals } = await supabase.from('deals').select('*')
      const closed = deals?.filter(d => d.stage === 'closed').reduce((sum, d) => sum + (d.value || 0), 0)
      setContactCount(contacts || 0)
      setDealCount(deals?.length || 0)
      setClosedValue(closed || 0)
    }
    loadStats()
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>
      <p className="text-gray-500 mb-8">Here's your CRM overview</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-sm text-blue-600 font-medium">Total Contacts</p>
          <p className="text-4xl font-bold text-blue-700 mt-1">{contactCount}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-sm text-yellow-600 font-medium">Active Deals</p>
          <p className="text-4xl font-bold text-yellow-700 mt-1">{dealCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-sm text-green-600 font-medium">Closed Revenue</p>
          <p className="text-4xl font-bold text-green-700 mt-1">€{closedValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/contacts" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <p className="text-xl font-bold mb-1">👥 Contacts</p>
          <p className="text-gray-500 text-sm">Manage your leads, buyers and sellers</p>
        </Link>
        <Link href="/pipeline" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <p className="text-xl font-bold mb-1">📊 Pipeline</p>
          <p className="text-gray-500 text-sm">Track deals from prospecting to closed</p>
        </Link>
      </div>
    </div>
  )
}