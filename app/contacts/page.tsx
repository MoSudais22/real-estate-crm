'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Contact = {
  id: string
  name: string
  email: string
  phone: string
  type: string
  status: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('lead')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    setContacts(data || [])
    setLoading(false)
  }

async function addContact() {
  if (!name) return
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('contacts').insert({
    name, email, phone, type, status: 'new', user_id: user?.id
  })

  // Email notification bhejo
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: user?.email,
      contactName: name,
      type: 'new_contact'
    })
  })

  setName(''); setEmail(''); setPhone('')
  setShowForm(false)
  fetchContacts()
}

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    fetchContacts()
  }

  const filtered = contacts.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || c.type === filterType
    return matchSearch && matchType
  })

  const typeColors: Record<string, string> = {
    lead: 'bg-gray-100 text-gray-700',
    buyer: 'bg-blue-100 text-blue-700',
    seller: 'bg-purple-100 text-purple-700',
  }

  const statusColors: Record<string, string> = {
    new: 'bg-green-100 text-green-700',
    active: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-500 mt-1">{contacts.length} total contacts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Contact
          </button>
        </div>

        {/* Add Contact Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">New Contact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <select
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="lead">Lead</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addContact} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium">
                Save Contact
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <input
            className="border border-gray-200 p-3 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {['all', 'lead', 'buyer', 'seller'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  filterType === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-gray-500 font-medium">No contacts found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first contact to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-11 h-11 flex items-center justify-center text-lg">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-gray-400 text-xs">{c.email}</p>
                  </div>
                </div>

                {/* Phone */}
                {c.phone && (
                  <p className="text-gray-500 text-sm mb-3">📞 {c.phone}</p>
                )}

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${typeColors[c.type] || 'bg-gray-100 text-gray-700'}`}>
                    {c.type}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                    {c.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/contacts/${c.id}`)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="bg-red-50 text-red-500 px-3 py-2 rounded-xl text-sm hover:bg-red-100 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}