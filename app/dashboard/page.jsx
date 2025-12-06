'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, signOut, getUserUsage } from '@/lib/supabase'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { 
  Sparkles, LogOut, User, History, Zap, TrendingUp, 
  ChevronRight, Loader2, Settings, LayoutDashboard,
  Mail, Share2, FileText, AlignLeft, ChevronDown, Wand2, Calendar
} from 'lucide-react'
import Link from 'next/link'

const formatIcons = {
  email: Mail,
  social: Share2,
  report: FileText,
  summary: AlignLeft
}

const formatLabels = {
  email: 'Email',
  social: 'Social Post',
  report: 'Report',
  summary: 'Summary'
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/login?redirect=/dashboard')
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

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || ''
    if (user?.user_metadata?.full_name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  const thisWeekGenerations = usage.filter(u => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return new Date(u.created_at) >= weekAgo
  }).length

  // Format distribution for stats
  const formatDistribution = usage.reduce((acc, u) => {
    acc[u.format] = (acc[u.format] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">ProDraft</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              New Draft
            </Link>

            {/* User Menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600">{getUserInitials()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[200px] bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 p-1.5 z-50"
                  sideOffset={8}
                  align="end"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-medium text-slate-900">{getDisplayName()}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg outline-none"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenu.Item>
                  
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg outline-none"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                  
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg outline-none"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Welcome back, {getDisplayName()}</h1>
          <p className="text-sm text-slate-500 mt-1">Here's your content polishing activity</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'overview' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'history' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  Today
                </div>
                <p className="text-2xl font-bold text-slate-900">{todayGenerations}</p>
                <p className="text-xs text-slate-400 mt-0.5">generations</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  This Week
                </div>
                <p className="text-2xl font-bold text-slate-900">{thisWeekGenerations}</p>
                <p className="text-xs text-slate-400 mt-0.5">generations</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Total
                </div>
                <p className="text-2xl font-bold text-slate-900">{totalGenerations}</p>
                <p className="text-xs text-slate-400 mt-0.5">all time</p>
              </div>

              <div className="bg-indigo-600 rounded-xl p-4 text-white">
                <p className="text-xs font-medium opacity-80 mb-2">Ready to create?</p>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Start polishing <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Format Distribution */}
            {Object.keys(formatDistribution).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Content Types</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(formatDistribution).map(([format, count]) => {
                    const Icon = formatIcons[format] || FileText
                    return (
                      <div key={format} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{count}</p>
                          <p className="text-xs text-slate-500">{formatLabels[format]}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  Recent Activity
                </h3>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all
                </button>
              </div>

              {usage.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {usage.slice(0, 5).map((record) => {
                    const Icon = formatIcons[record.format] || FileText
                    return (
                      <div key={record.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{formatLabels[record.format]}</p>
                            <p className="text-xs text-slate-400">
                              {record.input_length} → {record.output_length} chars
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">No activity yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start generating content to see your history</p>
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    Create your first draft
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                All Activity
              </h3>
            </div>

            {usage.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {usage.map((record) => {
                  const Icon = formatIcons[record.format] || FileText
                  return (
                    <div key={record.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{formatLabels[record.format]}</p>
                          <p className="text-xs text-slate-400">
                            {record.input_length} characters → {record.output_length} characters
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">No activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Start generating content to see your history</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
