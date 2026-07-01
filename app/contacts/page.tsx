'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'

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

  useEffect(() => { fetchContacts() }, [])

async function fetchContacts() {
  const { data: { user } } = await supabase.auth.getUser()

  // Check karo owner hai ya agent
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  let query = supabase.from('contacts').select('*').order('created_at', { ascending: false })

  if (agency) {
    // Owner hai — agency ke sab contacts dikhao
    query = query.eq('agency_id', agency.id)
  } else {
    // Agent hai — sirf apne contacts
    query = query.eq('user_id', user?.id)
  }

  const { data } = await query
  setContacts(data || [])
  setLoading(false)
}

async function addContact() {
  if (!name) return
  const { data: { user } } = await supabase.auth.getUser()
  
  // Agency ID dhundo
  let agencyId = null
  
  // Pehle check karo kya owner hai
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id)
    .single()
  
  if (agency) {
    agencyId = agency.id
  } else {
    // Agent hai — team_members se agency dhundo
    const { data: membership } = await supabase
      .from('team_members')
      .select('agency_id')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .single()
    agencyId = membership?.agency_id || null
  }

  await supabase.from('contacts').insert({
    name, email, phone, type, status: 'new',
    user_id: user?.id,
    agency_id: agencyId  // ← yeh add kiya
  })

  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: user?.email, contactName: name, type: 'new_contact' })
  })

  setName(''); setEmail(''); setPhone(''); setShowForm(false)
  fetchContacts()
}

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    fetchContacts()
  }
  function exportToCSV() {
  const csvData = contacts.map(c => ({
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    Type: c.type,
    Status: c.status,
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

  const filtered = contacts.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || c.type === filterType
    return matchSearch && matchType
  })

  const typeColors: Record<string, string> = {
    lead: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    buyer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    seller: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
       <div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
    <p className="text-gray-500 dark:text-gray-400 mt-1">{contacts.length} total contacts</p>
  </div>
  <div className="flex gap-3">
    <button
      onClick={exportToCSV}
      disabled={contacts.length === 0}
      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium flex items-center gap-2 disabled:opacity-50"
    >
      📤 Export CSV
    </button>
    <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2">
      <span className="text-lg">+</span> Add Contact
    </button>
  </div>
</div>
        {/* Add Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">New Contact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <input className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <select className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={type} onChange={e => setType(e.target.value)}>
                <option value="lead">Lead</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">

                

              <button onClick={addContact} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium">Save Contact</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium">Cancel</button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <input className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-2">
            {['all', 'lead', 'buyer', 'seller'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${filterType === t ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
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
            <p className="text-gray-500 dark:text-gray-400 font-medium">No contacts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold rounded-full w-11 h-11 flex items-center justify-center text-lg">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-gray-400 text-xs">{c.email}</p>
                  </div>
                </div>
                {c.phone && <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">📞 {c.phone}</p>}
                <div className="flex gap-2 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${typeColors[c.type] || 'bg-gray-100 text-gray-700'}`}>{c.type}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 capitalize">{c.status}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => router.push(`/contacts/${c.id}`)} className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40">View Details</button>
                  <button onClick={() => deleteContact(c.id)} className="bg-red-50 dark:bg-red-900/20 text-red-500 px-3 py-2 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/40">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}