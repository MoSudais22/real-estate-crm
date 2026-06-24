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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('lead')
  const router = useRouter()

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    setContacts(data || [])
    setLoading(false)
  }

  async function addContact() {
    if (!name) return
    await supabase.from('contacts').insert({ name, email, phone, type, status: 'new' })
    setName(''); setEmail(''); setPhone('')
    fetchContacts()
  }

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    fetchContacts()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>

      {/* Add Contact Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 flex flex-wrap gap-3">
        <input className="border p-2 rounded flex-1" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border p-2 rounded flex-1" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border p-2 rounded flex-1" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <select className="border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
          <option value="lead">Lead</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <button onClick={addContact} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Contact
        </button>
      </div>

      {/* Contacts Table */}
      {loading ? <p>Loading...</p> : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-3 border font-medium">{c.name}</td>
                <td className="p-3 border text-gray-600">{c.email}</td>
                <td className="p-3 border text-gray-600">{c.phone}</td>
                <td className="p-3 border">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{c.type}</span>
                </td>
                <td className="p-3 border">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">{c.status}</span>
                </td>
                <td className="p-3 border">
                   <button onClick={() => router.push(`/contacts/${c.id}`)} className="text-blue-500 hover:text-blue-700 text-sm mr-3">View</button>
                  <button onClick={() => deleteContact(c.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}