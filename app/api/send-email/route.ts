import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { to, contactName, type } = await req.json()

    const subjects: Record<string, string> = {
      'new_contact': `New Contact Added: ${contactName}`,
      'follow_up': `Follow-up Reminder: ${contactName}`,
      'deal_closed': `🎉 Deal Closed: ${contactName}`,
            'team_invite': `You're invited to join ${contactName} on RealCRM!`,
    }

    const bodies: Record<string, string> = {
      'new_contact': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🏠 RealCRM</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b;">New Contact Added!</h2>
            <p style="color: #64748b;">A new contact <strong>${contactName}</strong> has been added to your CRM.</p>
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
              <p style="margin: 0; color: #1e293b;"><strong>Contact:</strong> ${contactName}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contacts" 
               style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              View Contacts →
            </a>
          </div>
        </div>
      `,
      'follow_up': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🏠 RealCRM</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b;">⏰ Follow-up Reminder</h2>
            <p style="color: #64748b;">Don&apos;t forget to follow up with <strong>${contactName}</strong>!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contacts"
               style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              View Contact →
            </a>
          </div>
        </div>
      `,
      'deal_closed': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🏠 RealCRM</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b;">🎉 Deal Closed!</h2>
            <p style="color: #64748b;">Congratulations! You closed a deal with <strong>${contactName}</strong>!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pipeline"
               style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              View Pipeline →
            </a>
          </div>
        </div>
      `,
      'team_invite': `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0;">🏠 RealCRM</h1>
    </div>
    <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
      <h2 style="color: #1e293b;">You've been invited! 🎉</h2>
      <p style="color: #64748b;">You have been invited to join <strong>${contactName}</strong> on RealCRM.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup"
         style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
        Join Team →
      </a>
    </div>
  </div>
`,
    }

 await resend.emails.send({
  from: 'RealCRM <onboarding@resend.dev>',
 to: ['sudaismuhammad57@gmail.com'], // ← yeh change karo
  subject: subjects[type] || 'RealCRM Notification',
  html: bodies[type] || '<p>Notification</p>',
})

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}