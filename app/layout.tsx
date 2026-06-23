import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Real Estate CRM',
  description: 'CRM for real estate agents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {/* Navbar */}
        <nav className="bg-white border-b px-8 py-4 flex items-center gap-8 shadow-sm">
          <span className="font-bold text-lg text-blue-600">🏠 RealCRM</span>
          <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
          <Link href="/contacts" className="text-gray-600 hover:text-blue-600 font-medium">Contacts</Link>
          <Link href="/pipeline" className="text-gray-600 hover:text-blue-600 font-medium">Pipeline</Link>
        </nav>

        {/* Page content */}
        <main>{children}</main>
      </body>
    </html>
  )
}