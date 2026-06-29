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

const STAGE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  prospecting: { label: 'Prospecting', icon: '🔍', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  offer: { label: 'Offer', icon: '📝', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  contract: { label: 'Contract', icon: '🤝', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  closed: { label: 'Closed', icon: '✅', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
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
    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    setDeals(data || [])
    setLoading(false)
  }

  async function addDeal() {
    if (!title) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('deals').insert({
      title, value: parseFloat(value) || 0, stage, user_id: user?.id
    })
    setTitle(''); setValue(''); setShowForm(false)
    fetchDeals()
  }

  async function moveStage(deal: Deal, newStage: string) {
    await supabase.from('deals').update({ stage: newStage }).eq('id', deal.id)
    fetchDeals()
  }

  async function deleteDeal(id: string) {
    await supabase.from('deals').delete().eq('id', id)
    fetchDeals()
  }

  const dealsByStage = (s: string) => deals.filter(d => d.stage === s)
  const totalValue = (s: string) => dealsByStage(s).reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
            <p className="text-gray-500 mt-1">{deals.length} total deals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Deal
          </button>
        </div>

        {/* Add Deal Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">New Deal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deal title (e.g. 123 Main St)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Value (€)"
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
              <select
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {STAGES.map(s => {
              const config = STAGE_CONFIG[s]
              const stageDeals = dealsByStage(s)
              return (
                <div key={s} className={`rounded-2xl border-2 ${config.border} ${config.bg} p-4`}>

                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <h2 className={`font-bold text-sm ${config.color}`}>{config.label}</h2>
                    </div>
                    <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full border">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Total Value */}
                  {stageDeals.length > 0 && (
                    <p className={`text-xs font-medium mb-3 ${config.color}`}>
                      €{totalValue(s).toLocaleString()} total
                    </p>
                  )}

                  {/* Deal Cards */}
                  <div className="flex flex-col gap-3 min-h-32">
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-8 text-gray-300 text-sm">
                        No deals
                      </div>
                    ) : (
                      stageDeals.map(deal => (
                        <div key={deal.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                          <p className="font-semibold text-gray-900 text-sm mb-1">{deal.title}</p>
                          <p className="text-green-600 font-bold text-sm mb-3">
                            €{deal.value?.toLocaleString()}
                          </p>

                          {/* Move buttons */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {STAGES.filter(st => st !== s).map(st => (
                              <button
                                key={st}
                                onClick={() => moveStage(deal, st)}
                                className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg text-gray-600 transition-all"
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