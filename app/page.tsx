'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [contactCount, setContactCount] = useState(0)
  const [dealCount, setDealCount] = useState(0)
  const [closedValue, setClosedValue] = useState(0)
  const [userName, setUserName] = useState('')
  const [recentContacts, setRecentContacts] = useState<any[]>([])
  const [dealsByStage, setDealsByStage] = useState<Record<string, number>>({})

  useEffect(() => {
    loadStats()
  }, [])

async function loadStats() {
  const { data: { user } } = await supabase.auth.getUser()
  setUserName(user?.email?.split('@')[0] || 'Agent')

  // Check karo owner hai ya agent
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  let contactsQuery = supabase.from('contacts').select('*', { count: 'exact', head: true })
  let dealsQuery = supabase.from('deals').select('*')
  let recentQuery = supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(5)

  if (agency) {
    // Owner — agency ke sab data dikhao
    contactsQuery = contactsQuery.eq('agency_id', agency.id)
    dealsQuery = dealsQuery.eq('agency_id', agency.id)
    recentQuery = recentQuery.eq('agency_id', agency.id)
  } else {
    // Agent — sirf apna data
    contactsQuery = contactsQuery.eq('user_id', user?.id)
    dealsQuery = dealsQuery.eq('user_id', user?.id)
    recentQuery = recentQuery.eq('user_id', user?.id)
  }

  const { count: contacts } = await contactsQuery
  const { data: deals } = await dealsQuery
  const { data: recent } = await recentQuery

  const closed = deals?.filter(d => d.stage === 'closed').reduce((sum, d) => sum + (d.value || 0), 0)
  const stages: Record<string, number> = {}
  deals?.forEach(d => { stages[d.stage] = (stages[d.stage] || 0) + 1 })

  setContactCount(contacts || 0)
  setDealCount(deals?.length || 0)
  setClosedValue(closed || 0)
  setRecentContacts(recent || [])
  setDealsByStage(stages)
}

  const stageColors: Record<string, string> = {
    prospecting: 'bg-gray-200 text-gray-700',
    offer: 'bg-blue-100 text-blue-700',
    contract: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Good morning, <span className="text-blue-600 capitalize">{userName}</span> 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s what&apos;s happening with your pipeline today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{contactCount}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Contacts</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-50 p-3 rounded-xl">
                <span className="text-2xl">🏠</span>
              </div>
              <span className="text-blue-500 text-sm font-medium bg-blue-50 px-2 py-1 rounded-full">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{dealCount}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Active Deals</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">Earned</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">€{closedValue.toLocaleString()}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Closed Revenue</p>
          </div>
        </div>

        {/* Pipeline Overview + Recent Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Pipeline Overview</h2>
              <Link href="/pipeline" className="text-blue-600 text-sm hover:underline">View all →</Link>
            </div>
            {Object.keys(dealsByStage).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No deals yet</p>
            ) : (
              <div className="space-y-3">
                {['prospecting', 'offer', 'contract', 'closed'].map(stage => (
                  dealsByStage[stage] ? (
                    <div key={stage} className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${stageColors[stage]}`}>
                        {stage}
                      </span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(dealsByStage[stage] / dealCount) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{dealsByStage[stage]}</span>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Recent Contacts</h2>
              <Link href="/contacts" className="text-blue-600 text-sm hover:underline">View all →</Link>
            </div>
            {recentContacts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No contacts yet</p>
            ) : (
              <div className="space-y-3">
                {recentContacts.map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-9 h-9 flex items-center justify-center text-sm">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                      <p className="text-gray-400 text-xs">{c.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${c.type === 'buyer' ? 'bg-blue-50 text-blue-600' :
                        c.type === 'seller' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-50 text-gray-600'}`}>
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/contacts', icon: '👤', label: 'Add Contact', color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40' },
            { href: '/pipeline', icon: '🏠', label: 'Add Deal', color: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40' },
            { href: '/contacts', icon: '📋', label: 'View Contacts', color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40' },
            { href: '/pricing', icon: '⭐', label: 'Upgrade Plan', color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40' },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} rounded-2xl p-5 text-center transition-all`}
            >
              <span className="text-3xl block mb-2">{action.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}