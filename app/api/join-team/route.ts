import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json()

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ user_id: userId, status: 'active' })
      .eq('email', email)
      .eq('status', 'pending')
      .select()

    return NextResponse.json({ data, error })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join team' }, { status: 500 })
  }
}