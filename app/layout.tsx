'use client'

import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const geist = Geist({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/', icon: '🏠', label: 'Dashboard' },
    { href: '/contacts', icon: '👥', label: 'Contacts' },
    { href: '/pipeline', icon: '📊', label: 'Pipeline' },
    { href: '/pricing', icon: '⭐', label: 'Pricing' },
  ]

  return (
    <html lang="en">
      <body className={geist.className}>
        {isAuthPage ? (
          // Auth pages — no sidebar
          <main>{children}</main>
        ) : (
          <div className="flex min-h-screen bg-gray-50">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col fixed h-full">

              {/* Logo */}
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-blue-600">🏠 RealCRM</h1>
                <p className="text-xs text-gray-400 mt-1">Real Estate Management</p>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Bottom — Logout */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
                >
                  <span className="text-lg">🚪</span>
                  Logout
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
              {children}
            </main>

          </div>
        )}
      </body>
    </html>
  )
}