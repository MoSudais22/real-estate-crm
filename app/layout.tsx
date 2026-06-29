'use client'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const geist = Geist({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <html lang="en">
      <body className={geist.className}>
        <nav className="bg-white border-b px-8 py-4 flex items-center gap-8 shadow-sm">
          <span className="font-bold text-lg text-blue-600">🏠 RealCRM</span>
          <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
          <Link href="/contacts" className="text-gray-600 hover:text-blue-600 font-medium">Contacts</Link>
          <Link href="/pipeline" className="text-gray-600 hover:text-blue-600 font-medium">Pipeline</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</Link>
          <button onClick={handleLogout} className="ml-auto text-sm text-red-500 hover:text-red-700">
            Logout
          </button>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}