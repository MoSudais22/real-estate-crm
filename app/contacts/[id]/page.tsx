'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

type Contact = {
  id: string
  name: string
  email: string
  phone: string
  type: string
  status: string
}

type Activity = {
  id: string
  type: string
  body: string
  created_at: string
}

export default function ContactDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityType, setActivityType] = useState('note')
  const [body, setBody] = useState('')

  useEffect(() => {
    fetchContact()
    fetchActivities()
  }, [])

  async function fetchContact() {
    const { data } = await supabase.from('contacts').select('*').eq('id', id).single()
    setContact(data)
  }

  async function fetchActivities() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', id)
      .order('created_at', { ascending: false })
    setActivities(data || [])
  }

  async function addActivity() {
    if (!body) return
    await supabase.from('activities').insert({ contact_id: id, type: activityType, body })
    setBody('')
    fetchActivities()
  }

  const typeIcon: Record<string, string> = {
    note: '📝',
    call: '📞',
    email: '✉️',
  }

  if (!contact) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back button */}
      <button onClick={() => router.push('/contacts')} className="text-blue-600 hover:underline mb-6 block">
        ← Back to Contacts
      </button>

      {/* Contact Info */}
      <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">{contact.name}</h1>
        <p className="text-gray-500 mb-3">{contact.email} · {contact.phone}</p>
        <div className="flex gap-2">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{contact.type}</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{contact.status}</span>
        </div>
      </div>

      {/* Add Activity */}
      <div className="bg-gray-50 border rounded-xl p-6 mb-8">
        <h2 className="font-bold mb-4">Log Activity</h2>
        <div className="flex gap-3 mb-3">
          {['note', 'call', 'email'].map(t => (
            <button
              key={t}
              onClick={() => setActivityType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activityType === t ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              {typeIcon[t]} {t}
            </button>
          ))}
        </div>
        <textarea
          className="border p-3 rounded-lg w-full mb-3 h-24"
          placeholder={`Write a ${activityType}...`}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <button onClick={addActivity} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Activity
        </button>
      </div>

      {/* Activities List */}
      <h2 className="font-bold mb-4">Activity History</h2>
      {activities.length === 0 && <p className="text-gray-400">No activities yet</p>}
      <div className="flex flex-col gap-3">
        {activities.map(a => (
          <div key={a.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span>{typeIcon[a.type]}</span>
              <span className="font-medium capitalize text-sm">{a.type}</span>
              <span className="text-gray-400 text-xs ml-auto">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}