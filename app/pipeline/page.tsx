'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Deal = {
  id: string
  title: string
  value: number
  stage: string
  contact_id: string
}

const STAGES = ['prospecting', 'offer', 'contract', 'closed']

const STAGE_COLORS: Record<string, string> = {
  prospecting: 'bg-gray-100 border-gray-300',
  offer: 'bg-blue-50 border-blue-300',
  contract: 'bg-yellow-50 border-yellow-300',
  closed: 'bg-green-50 border-green-300',
}

const STAGE_LABELS: Record<string, string> = {
  prospecting: '🔍 Prospecting',
  offer: '📝 Offer',
  contract: '🤝 Contract',
  closed: '✅ Closed',
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('prospecting')

  useEffect(() => {
    fetchDeals()
  }, [])

async function addDeal() {
  if (!title) return
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('deals').insert({ 
    title, value: parseFloat(value) || 0, stage,
    user_id: user?.id  // ← yeh add karo
  })
  setTitle(''); setValue('')
  fetchDeals()
}

async function fetchDeals() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', user?.id)  // ← yeh add karo
    .order('created_at', { ascending: false })
  setDeals(data || [])
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Deal Pipeline</h1>

      {/* Add Deal Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 flex flex-wrap gap-3">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Deal title (e.g. 123 Main St)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="border p-2 rounded w-40"
          placeholder="Value (€)"
          value={value}
          onChange={e => setValue(e.target.value)}
          type="number"
        />
        <select className="border p-2 rounded" value={stage} onChange={e => setStage(e.target.value)}>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={addDeal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Deal
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {STAGES.map(s => (
          <div key={s} className={`rounded-lg border-2 p-4 min-h-64 ${STAGE_COLORS[s]}`}>
            <h2 className="font-bold mb-3 text-sm uppercase tracking-wide">
              {STAGE_LABELS[s]}
              <span className="ml-2 bg-white rounded-full px-2 py-0.5 text-xs">
                {dealsByStage(s).length}
              </span>
            </h2>

            <div className="flex flex-col gap-3">
              {dealsByStage(s).map(deal => (
                <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm border">
                  <p className="font-medium text-sm">{deal.title}</p>
                  <p className="text-green-600 font-bold text-sm mt-1">€{deal.value.toLocaleString()}</p>

                  {/* Move buttons */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {STAGES.filter(st => st !== s).map(st => (
                      <button
                        key={st}
                        onClick={() => moveStage(deal, st)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        → {st}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteDeal(deal.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}