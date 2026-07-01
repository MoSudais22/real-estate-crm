import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type Role = 'owner' | 'agent' | 'loading'

export function useRole() {
  const [role, setRole] = useState<Role>('loading')
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkRole()
  }, [])

  async function checkRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)

    // Check karo kya yeh user kisi agency ka owner hai
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agency) {
      setRole('owner')
      setAgencyId(agency.id)
    } else {
      // Agent hai — uski agency dhundo team_members se
      const { data: membership } = await supabase
        .from('team_members')
        .select('agency_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setRole('agent')
      setAgencyId(membership?.agency_id || null)
    }
  }

  return { role, agencyId, userId }
}