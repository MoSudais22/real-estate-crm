'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type AgentStats = {
  email: string
  user_id: string
  contacts: number
  deals: number
  closedDeals: number
  revenue: number
  conversionRate: number
}

export default function OwnerDashboardPage() {
  const [agentStats, setAgentStats] = useState<AgentStats[]>([])
  const [agency, setAgency] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()

    // Agency dhundo
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', user?.id)
      .single()

    if (!agencyData) {
      router.push('/')
      return
    }

    setAgency(agencyData)

    // Team members dhundo
    const { data: members } = await supabase
      .from('team_members')
      .select('*')
      .eq('agency_id', agencyData.id)
      .eq('status', 'active')

    if (!members || members.length === 0) {
      setLoading(false)
      return
    }

    // Har agent ki stats nikalo
    const stats: AgentStats[] = []

    for (const member of members) {
      if (!member.user_id) continue

      const { data: contacts } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', member.user_id)

      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', member.user_id)

      const closedDeals = deals?.filter(d => d.stage === 'closed') || []
      const revenue = closedDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      const conversionRate = deals?.length ? Math.round((closedDeals.length / deals.length) * 100) : 0

      stats.push({
        email: member.email,
        user_id: member.user_id,
        contacts: contacts?.length || 0,
        deals: deals?.length || 0,
        closedDeals: closedDeals.length,
        revenue,
        conversionRate,
      })
    }

    setAgentStats(stats)
    setLoading(false)
  }

  const chartData = agentStats.map(a => ({
    name: a.email.split('@')[0],
    contacts: a.contacts,
    deals: a.deals,
    closed: a.closedDeals,
    revenue: a.revenue,
  }))

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Performance</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{agency?.name} — {agentStats.length} active agents</p>
        </div>

        {agentStats.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-gray-500 dark:text-gray-400">No active agents yet. Invite agents from the Team page.</p>
          </div>
        ) : (
          <>
            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {agentStats.map(agent => (
                <div key={agent.user_id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  {/* Agent Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg">
                      {agent.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{agent.email.split('@')[0]}</p>
                      <p className="text-gray-400 text-xs">{agent.email}</p>
                    </div>
                    {/* Top performer badge */}
                    {agent.revenue === Math.max(...agentStats.map(a => a.revenue)) && agent.revenue > 0 && (
                      <span className="ml-auto bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">
                        🏆 Top Performer
                      </span>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Contacts</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{agent.contacts}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Total Deals</p>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{agent.deals}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Closed Deals</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{agent.closedDeals}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Conversion</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{agent.conversionRate}%</p>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="font-bold text-gray-900 dark:text-white">€{agent.revenue.toLocaleString()}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Deal Progress</span>
                      <span>{agent.closedDeals}/{agent.deals} closed</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${agent.deals > 0 ? (agent.closedDeals / agent.deals) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white mb-6">Contacts & Deals Comparison</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="contacts" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Contacts" />
                    <Bar dataKey="deals" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Deals" />
                    <Bar dataKey="closed" fill="#10b981" radius={[4, 4, 0, 0]} name="Closed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white mb-6">Revenue Comparison (€)</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => `€${Number(value).toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}