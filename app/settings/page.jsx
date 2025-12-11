'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, signOut, supabase, uploadAvatar } from '@/lib/supabase'
import { 
  Sparkles, User, Mail, Lock, Save, Loader2, 
  ChevronLeft, Check, Eye, EyeOff, AlertCircle, LogOut, Camera, Upload
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/login?redirect=/settings')
        return
      }
      setUser(currentUser)
      setFullName(currentUser.user_metadata?.full_name || '')
      setAvatarUrl(currentUser.user_metadata?.avatar_url || '')
      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)')
      return
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Image size should be less than 2MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { url, error } = await uploadAvatar(user.id, file)
      if (error) throw error
      
      if (url) {
        setAvatarUrl(url)
        // Auto-save the new avatar URL to profile
        await supabase.auth.updateUser({
          data: { avatar_url: url }
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to upload avatar. Ensure "avatars" bucket exists.')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarUrl
        }
      })
      
      if (error) throw error
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    
    setChangingPassword(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/app" 
              className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
          </div>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Profile Information
            </h2>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-5 space-y-6">
            
            {/* Avatar Preview & Upload */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 relative">
                  {uploading ? (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  ) : null}
                  
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : ''}`}
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">
                      {(fullName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900">{fullName || 'User'}</h3>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1"
                >
                  <Upload className="w-3 h-3" />
                  Upload new picture
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              Change Password
            </h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                placeholder="Confirm new password"
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                <Check className="w-4 h-4" />
                Password changed successfully!
              </div>
            )}
            
            <button
              type="submit"
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </section>

        {/* Sign Out */}
        <div className="flex justify-end">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}
