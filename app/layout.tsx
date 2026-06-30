'use client'

import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ThemeProvider, useTheme } from 'next-themes'

const geist = Geist({ subsets: ['latin'] })

function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/', icon: '🏠', label: 'Dashboard' },
    { href: '/contacts', icon: '👥', label: 'Contacts' },
    { href: '/pipeline', icon: '📊', label: 'Pipeline' },
    { href: '/tasks', icon: '✅', label: 'Tasks' },
    { href: '/analytics', icon: '📈', label: 'Analytics' },
  
    { href: '/pricing', icon: '⭐', label: 'Pricing' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
      { href: '/team', icon: '🏢', label: 'Team' },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm flex flex-col fixed h-full">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
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
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-all"
        >
          <span className="text-lg">
            {mounted ? (theme === 'dark' ? '☀️' : '🌙') : '🌙'}
          </span>
          {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Dark Mode'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup' ||
    pathname === '/reset-password' || pathname === '/update-password'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {isAuthPage ? (
            <main>{children}</main>
          ) : (
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
              <Sidebar />
              <main className="flex-1 ml-64">
                {children}
              </main>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}