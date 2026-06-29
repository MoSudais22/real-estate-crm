'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()

    const [{ data: dealsData }, { data: contactsData }, { data: tasksData }] = await Promise.all([
      supabase.from('deals').select('*').eq('user_id', user?.id),
      supabase.from('contacts').select('*').eq('user_id', user?.id),
      supabase.from('tasks').select('*').eq('user_id', user?.id),
    ])

    setDeals(dealsData || [])
    setContacts(contactsData || [])
    setTasks(tasksData || [])
    setLoading(false)
  }

  // Pipeline data
  const pipelineData = [
    { stage: 'Prospecting', count: deals.filter(d => d.stage === 'prospecting').length, value: deals.filter(d => d.stage === 'prospecting').reduce((s, d) => s + d.value, 0) },
    { stage: 'Offer', count: deals.filter(d => d.stage === 'offer').length, value: deals.filter(d => d.stage === 'offer').reduce((s, d) => s + d.value, 0) },
    { stage: 'Contract', count: deals.filter(d => d.stage === 'contract').length, value: deals.filter(d => d.stage === 'contract').reduce((s, d) => s + d.value, 0) },
    { stage: 'Closed', count: deals.filter(d => d.stage === 'closed').length, value: deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0) },
  ]

  // Contacts by type
  const contactTypeData = [
    { name: 'Leads', value: contacts.filter(c => c.type === 'lead').length, color: '#6b7280' },
    { name: 'Buyers', value: contacts.filter(c => c.type === 'buyer').length, color: '#3b82f6' },
    { name: 'Sellers', value: contacts.filter(c => c.type === 'seller').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0)

  // Monthly contacts (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    const monthNum = date.getMonth()
    const count = contacts.filter(c => {
      const d = new Date(c.created_at)
      return d.getMonth() === monthNum && d.getFullYear() === year
    }).length
    return { month, count }
  })

  // Stats
  const totalRevenue = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0)
  const avgDealValue = deals.length > 0 ? deals.reduce((s, d) => s + d.value, 0) / deals.length : 0
  const completedTasks = tasks.filter(t => t.completed).length
  const conversionRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed').length / deals.length) * 100) : 0

  const COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#10b981']

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your performance and growth</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `€${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Avg Deal Value', value: `€${Math.round(avgDealValue).toLocaleString()}`, icon: '📊', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '🎯', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Tasks Done', value: `${completedTasks}/${tasks.length}`, icon: '✅', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Pipeline Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-6">Deals by Stage</h2>
            {deals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No deals yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Contacts Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-6">Contacts by Type</h2>
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No contacts yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contactTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {contactTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Monthly Contacts Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-6">New Contacts (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Stage */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-6">Revenue by Stage (€)</h2>
            {deals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No deals yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}