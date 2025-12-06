'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, signOut, getUserUsage } from '@/lib/supabase'
import { Sparkles, LogOut, User, History, Zap, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const { data } = await getUserUsage(currentUser.id)
      if (data) {
        setUsage(data)
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  const totalGenerations = usage.length
  const todayGenerations = usage.filter(u => {
    const today = new Date()
    const recordDate = new Date(u.created_at)
    return recordDate.toDateString() === today.toDateString()
  }).length

  const formatLabels = {
    email: 'Email',
    social: 'Social Post',
    report: 'Report',
    summary: 'Summary'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-6 h-6" />
            <span className="text-xl font-bold text-slate-900">ProDraft AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              New Draft
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-slate-500 text-sm">Today</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{todayGenerations}</p>
            <p className="text-sm text-slate-400">generations</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-slate-500 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalGenerations}</p>
            <p className="text-sm text-slate-400">all time</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="font-medium mb-2 opacity-90">Ready to polish?</h3>
            <p className="text-sm opacity-70 mb-4">Create professional content in seconds</p>
            <Link
              href="/app"
              className="inline-flex items-center gap-1 text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Start now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          </div>

          {usage.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {usage.slice(0, 10).map((record) => (
                <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{formatLabels[record.format] || record.format}</p>
                      <p className="text-sm text-slate-400">
                        {record.input_length} chars → {record.output_length} chars
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">
                    {new Date(record.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No activity yet</p>
              <p className="text-sm text-slate-400">Start generating content to see your history</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
