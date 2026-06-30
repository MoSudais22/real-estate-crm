'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Agency = { id: string; name: string; owner_id: string }
type TeamMember = { id: string; email: string; role: string; status: string }

export default function TeamPage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [agencyName, setAgencyName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAgency()
  }, [])

  async function loadAgency() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', user?.id)
      .single()

    if (agencyData) {
      setAgency(agencyData)
      setIsOwner(true)
      loadMembers(agencyData.id)
    }
    setLoading(false)
  }

  async function loadMembers(agencyId: string) {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('agency_id', agencyId)
    setMembers(data || [])
  }

  async function createAgency() {
    if (!agencyName) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('agencies')
      .insert({ name: agencyName, owner_id: user?.id })
      .select()
      .single()

    if (data) {
      setAgency(data)
      setIsOwner(true)
      setMessage('Agency created successfully!')
    }
  }

async function inviteMember() {
  if (!inviteEmail || !agency) return
  await supabase.from('team_members').insert({
    agency_id: agency.id,
    email: inviteEmail,
    role: 'agent',
    status: 'pending'
  })

  // Email bhejo
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: inviteEmail,
      contactName: agency.name,
      type: 'team_invite'
    })
  })

  setInviteEmail('')
  setMessage(`Invitation sent to ${inviteEmail}!`)
  loadMembers(agency.id)
}

  async function removeMember(id: string) {
    await supabase.from('team_members').delete().eq('id', id)
    if (agency) loadMembers(agency.id)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your agency and team members</p>
        </div>

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-xl mb-6 text-sm">
            ✅ {message}
          </div>
        )}

        {!agency ? (
          // No agency yet — create one
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Your Agency</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Set up your agency to start inviting team members</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                className="flex-1 border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agency name (e.g. Khan Real Estate)"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
              />
              <button onClick={createAgency} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium">
                Create
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Agency Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold rounded-xl w-14 h-14 flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{agency.name}</p>
                  <p className="text-gray-400 text-sm">{members.length} team members</p>
                </div>
              </div>
            </div>

            {/* Invite Member */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Invite Team Member</h2>
              <div className="flex gap-3">
                <input
                  className="flex-1 border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="agent@example.com"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
                <button onClick={inviteMember} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium">
                  Send Invite
                </button>
              </div>
            </div>

            {/* Team Members List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Team Members</h2>
              {members.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No team members yet. Invite your first agent!</p>
              ) : (
                <div className="space-y-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold rounded-full w-10 h-10 flex items-center justify-center">
                          {m.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{m.email}</p>
                          <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          m.status === 'active' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {m.status}
                        </span>
                        <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-600 text-sm">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}