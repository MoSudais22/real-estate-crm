'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Deal = {
  id: string
  title: string
  value: number
  stage: string
}

const STAGES = ['prospecting', 'offer', 'contract', 'closed']

// UPDATED: dark mode colors added in STAGE_CONFIG
const STAGE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  prospecting: { label: 'Prospecting', icon: '🔍', color: 'text-gray-600 dark:text-gray-300', bg: 'bg-gray-50 dark:bg-gray-900', border: 'border-gray-200 dark:border-gray-700' },
  offer: { label: 'Offer', icon: '📝', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  contract: { label: 'Contract', icon: '🤝', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  closed: { label: 'Closed', icon: '✅', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('prospecting')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

async function fetchDeals() {
  const { data: { user } } = await supabase.auth.getUser()

  // Check karo owner hai ya agent
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  let query = supabase.from('deals').select('*').order('created_at', { ascending: false })

  if (agency) {
    // Owner — agency ke sab deals dikhao
    query = query.eq('agency_id', agency.id)
  } else {
    // Agent — sirf apne deals
    query = query.eq('user_id', user?.id)
  }

  const { data } = await query
  setDeals(data || [])
  setLoading(false)
}

async function addDeal() {
  if (!title) return
  const { data: { user } } = await supabase.auth.getUser()

  // Agency ID dhundo
  let agencyId = null
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  if (agency) {
    agencyId = agency.id
  } else {
    const { data: membership } = await supabase
      .from('team_members')
      .select('agency_id')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .single()
    agencyId = membership?.agency_id || null
  }

  await supabase.from('deals').insert({
    title, value: parseFloat(value) || 0, stage,
    user_id: user?.id,
    agency_id: agencyId  // ← yeh add kiya
  })

  setTitle(''); setValue(''); setShowForm(false)
  fetchDeals()
}

  async function moveStage(deal: Deal, newStage: string) {
    await supabase.from('deals').update({ stage: newStage }).eq('id', deal.id)
    const { data: { user } } = await supabase.auth.getUser()
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user?.email,
        contactName: deal.title,
        type: newStage === 'closed' ? 'deal_closed' : 'follow_up',
      })
    })
    fetchDeals()
  }

  async function deleteDeal(id: string) {
    await supabase.from('deals').delete().eq('id', id)
    fetchDeals()
  }

  const dealsByStage = (s: string) => deals.filter(d => d.stage === s)
  const totalValue = (s: string) => dealsByStage(s).reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    // UPDATED: dark:bg-gray-950 added
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            {/* UPDATED: dark:text-white added */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
            {/* UPDATED: dark:text-gray-400 added */}
            <p className="text-gray-500 dark:text-gray-400 mt-1">{deals.length} total deals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Deal
          </button>
        </div>

        {showForm && (
          // UPDATED: dark:bg-gray-900 dark:border-gray-800 added
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            {/* UPDATED: dark:text-white added */}
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">New Deal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* UPDATED: dark classes added on all inputs */}
              <input
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deal title (e.g. 123 Main St)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Value (€)"
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
              {/* UPDATED: dark classes added on select */}
              <select
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={stage}
                onChange={e => setStage(e.target.value)}
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addDeal} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium">
                Save Deal
              </button>
              {/* UPDATED: dark:bg-gray-800 dark:text-gray-300 added */}
              <button onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {STAGES.map(s => {
              const config = STAGE_CONFIG[s]
              const stageDeals = dealsByStage(s)
              return (
                // UPDATED: dark classes already in config.bg and config.border
                <div key={s} className={`rounded-2xl border-2 ${config.border} ${config.bg} p-4`}>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <h2 className={`font-bold text-sm ${config.color}`}>{config.label}</h2>
                    </div>
                    {/* UPDATED: dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 added */}
                    <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full border dark:border-gray-700">
                      {stageDeals.length}
                    </span>
                  </div>

                  {stageDeals.length > 0 && (
                    <p className={`text-xs font-medium mb-3 ${config.color}`}>
                      €{totalValue(s).toLocaleString()} total
                    </p>
                  )}

                  <div className="flex flex-col gap-3 min-h-32">
                    {stageDeals.length === 0 ? (
                      // UPDATED: dark:text-gray-600 added
                      <div className="text-center py-8 text-gray-300 dark:text-gray-600 text-sm">
                        No deals
                      </div>
                    ) : (
                      stageDeals.map(deal => (
                        // UPDATED: dark:bg-gray-800 dark:border-gray-700 added
                        <div key={deal.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                          {/* UPDATED: dark:text-white added */}
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{deal.title}</p>
                          {/* UPDATED: dark:text-green-400 added */}
                          <p className="text-green-600 dark:text-green-400 font-bold text-sm mb-3">
                            €{deal.value?.toLocaleString()}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {STAGES.filter(st => st !== s).map(st => (
                              // UPDATED: dark classes added on move buttons
                              <button
                                key={st}
                                onClick={() => moveStage(deal, st)}
                                className="text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 transition-all"
                              >
                                → {STAGE_CONFIG[st].icon}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => deleteDeal(deal.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}