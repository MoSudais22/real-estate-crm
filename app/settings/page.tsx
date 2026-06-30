'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setEmail(user?.email || '')
    setFullName(user?.user_metadata?.full_name || '')
  }

  async function updateProfile() {
    setLoading(true)
    setMessage('')
    setError('')
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Profile updated successfully!')
    }
    setLoading(false)
  }

  async function updatePassword() {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters!')
      return
    }
    setLoading(true)
    setMessage('')
    setError('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-xl mb-6 text-sm">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold rounded-full w-16 h-16 flex items-center justify-center text-2xl">
              {fullName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{fullName || 'Agent'}</p>
              <p className="text-gray-400 text-sm">{email}</p>
            </div>
          </div>

          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Full Name</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Email Address</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                value={email}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <button
              onClick={updateProfile}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">New Password</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min 6 characters"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Confirm New Password</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repeat password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              onClick={updatePassword}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}