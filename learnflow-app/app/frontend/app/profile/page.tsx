'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { userAPI } from '@/lib/api'
import { auth } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, setUser: setAuthUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/auth/login')
        return
      }

      try {
        const profile = await userAPI.getProfile()
        setFormData({
          name: profile.name || '',
          phone: profile.phone || '',
          address: profile.address || '',
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await userAPI.updateProfile(formData)
      if (authUser) {
        setAuthUser({ ...authUser, name: formData.name })
      }
      setEditing(false)
      setMessage('Profile updated successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    auth.logout()
    logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container-wide py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-8">
            My Profile
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <User className="text-orange-600" size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {authUser?.name || formData.name || 'User'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{authUser?.email}</p>
              </div>
            </div>

            {!editing ? (
              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-center gap-4">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Full Name
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formData.name || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <Mail className="text-gray-400" size={20} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Email
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {authUser?.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Phone
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formData.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <MapPin className="text-gray-400 mt-1" size={20} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Address
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap">
                      {formData.address || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-6 flex gap-4">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 transition"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
