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

  const pipelineData = [
    { stage: 'Prospecting', count: deals.filter(d => d.stage === 'prospecting').length, value: deals.filter(d => d.stage === 'prospecting').reduce((s, d) => s + d.value, 0) },
    { stage: 'Offer', count: deals.filter(d => d.stage === 'offer').length, value: deals.filter(d => d.stage === 'offer').reduce((s, d) => s + d.value, 0) },
    { stage: 'Contract', count: deals.filter(d => d.stage === 'contract').length, value: deals.filter(d => d.stage === 'contract').reduce((s, d) => s + d.value, 0) },
    { stage: 'Closed', count: deals.filter(d => d.stage === 'closed').length, value: deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0) },
  ]

  const contactTypeData = [
    { name: 'Leads', value: contacts.filter(c => c.type === 'lead').length, color: '#6b7280' },
    { name: 'Buyers', value: contacts.filter(c => c.type === 'buyer').length, color: '#3b82f6' },
    { name: 'Sellers', value: contacts.filter(c => c.type === 'seller').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0)

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

  const totalRevenue = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0)
  const avgDealValue = deals.length > 0 ? deals.reduce((s, d) => s + d.value, 0) / deals.length : 0
  const completedTasks = tasks.filter(t => t.completed).length
  const conversionRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed').length / deals.length) * 100) : 0

  // UPDATED: dark:bg-gray-950 added on loading screen
  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>

  return (
    // UPDATED: dark:bg-gray-950 added
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-8">

        <div className="mb-8">
          {/* UPDATED: dark:text-white added */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          {/* UPDATED: dark:text-gray-400 added */}
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your performance and growth</p>
        </div>

        {/* UPDATED: dark mode bg added on stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `€${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Avg Deal Value', value: `€${Math.round(avgDealValue).toLocaleString()}`, icon: '📊', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '🎯', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Tasks Done', value: `${completedTasks}/${tasks.length}`, icon: '✅', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          ].map(stat => (
            // UPDATED: dark:bg-gray-900 dark:border-gray-800 added
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              {/* UPDATED: dark:text-gray-400 added */}
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* UPDATED: dark:bg-gray-900 dark:border-gray-800 added on chart cards */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* UPDATED: dark:text-white added */}
            <h2 className="font-bold text-gray-900 dark:text-white mb-6">Deals by Stage</h2>
            {deals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No deals yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData}>
                  {/* UPDATED: dark grid color */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  {/* UPDATED: dark tick color */}
                  <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  {/* UPDATED: dark tooltip style */}
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* UPDATED: dark:bg-gray-900 dark:border-gray-800 added */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* UPDATED: dark:text-white added */}
            <h2 className="font-bold text-gray-900 dark:text-white mb-6">Contacts by Type</h2>
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
                  {/* UPDATED: dark tooltip style */}
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* UPDATED: dark:bg-gray-900 dark:border-gray-800 added */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* UPDATED: dark:text-white added */}
            <h2 className="font-bold text-gray-900 dark:text-white mb-6">New Contacts (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                {/* UPDATED: dark grid color */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                {/* UPDATED: dark tick color */}
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                {/* UPDATED: dark tooltip style */}
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* UPDATED: dark:bg-gray-900 dark:border-gray-800 added */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* UPDATED: dark:text-white added */}
            <h2 className="font-bold text-gray-900 dark:text-white mb-6">Revenue by Stage (€)</h2>
            {deals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No deals yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData}>
                  {/* UPDATED: dark grid color */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  {/* UPDATED: dark tick color */}
                  <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  {/* UPDATED: dark tooltip style */}
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => `€${Number(value).toLocaleString()}`} />
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