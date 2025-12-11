'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, signOut, getUserUsage, getDrafts, deleteDraft, deleteUsage, deleteAllUsage } from '@/lib/supabase'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  Sparkles, LogOut, User, History, Zap, TrendingUp, 
  ChevronRight, Loader2, Settings, LayoutDashboard,
  Mail, Share2, FileText, AlignLeft, ChevronDown, Wand2, Calendar, Trash2, Edit, Eye, X, AlertTriangle
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
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [viewHistoryItem, setViewHistoryItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null) // { id: string, type: 'draft' | 'history' | 'all-history' }
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/login?redirect=/dashboard')
        return
      }
      setUser(currentUser)

      // Load usage data
      const { data: usageData } = await getUserUsage(currentUser.id)
      if (usageData) {
        setUsage(usageData)
      }
      
      // Load drafts
      const { data: draftsData } = await getDrafts(currentUser.id)
      if (draftsData) {
        setDrafts(draftsData)
      }

      setLoading(false)
    }
    loadData()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }
  
  const proceedWithDelete = async () => {
    if (!itemToDelete) return

    if (itemToDelete.type === 'draft') {
      await deleteDraft(itemToDelete.id)
      setDrafts(drafts.filter(d => d.id !== itemToDelete.id))
    } else if (itemToDelete.type === 'history') {
      await deleteUsage(itemToDelete.id)
      setUsage(usage.filter(u => u.id !== itemToDelete.id))
    } else if (itemToDelete.type === 'all-history') {
      await deleteAllUsage(user.id)
      setUsage([])
    }
    setItemToDelete(null)
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
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-indigo-600">{getUserInitials()}</span>
                    )}
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
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-900">Welcome back, {getDisplayName()}</h1>
          <p className="text-sm text-slate-500 mt-1">What would you like to write today?</p>
        </div>

        {/* Create New Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Link 
            href="/app?format=email"
            className="group p-5 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
            <p className="text-xs text-slate-500">Draft professional emails</p>
          </Link>

          <Link 
            href="/app?format=social"
            className="group p-5 bg-white border border-slate-200 hover:border-pink-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Social Post</h3>
            <p className="text-xs text-slate-500">Create engaging content</p>
          </Link>

          <Link 
            href="/app?format=report"
            className="group p-5 bg-white border border-slate-200 hover:border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Report</h3>
            <p className="text-xs text-slate-500">Structure your documents</p>
          </Link>

          <Link 
            href="/app?format=summary"
            className="group p-5 bg-white border border-slate-200 hover:border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <AlignLeft className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Summary</h3>
            <p className="text-xs text-slate-500">Summarize key points</p>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'overview' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'saved' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Drafts
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' 
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
                      <div key={record.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 mr-2">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setViewHistoryItem(record)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: record.id, type: 'history' })}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

        {activeTab === 'saved' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Saved Drafts
              </h3>
            </div>

            {drafts.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {drafts.map((draft) => {
                  const Icon = formatIcons[draft.format] || FileText
                  return (
                    <div key={draft.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{draft.title || 'Untitled Draft'}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatLabels[draft.format]} • {new Date(draft.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/app?id=${draft.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setItemToDelete({ id: draft.id, type: 'draft' })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">No saved drafts</p>
                <p className="text-xs text-slate-400 mt-1">Save your best generations to access them later</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                All Activity
              </h3>
              {usage.length > 0 && (
                <button
                  onClick={() => setItemToDelete({ type: 'all-history' })}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>

            {usage.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {usage.map((record) => {
                  const Icon = formatIcons[record.format] || FileText
                  return (
                    <div key={record.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
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
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="text-xs text-slate-500">
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewHistoryItem(record)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete({ id: record.id, type: 'history' })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

        {/* View History Detail Modal */}
        <Dialog.Root open={!!viewHistoryItem} onOpenChange={() => setViewHistoryItem(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 z-50 outline-none animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  History Detail
                </Dialog.Title>
                <button
                  onClick={() => setViewHistoryItem(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {viewHistoryItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center gap-4 text-sm text-slate-500 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(viewHistoryItem.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {formatLabels[viewHistoryItem.format]}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Input</h4>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {viewHistoryItem.input_text || '(No input text recorded)'}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Output</h4>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {viewHistoryItem.output_text 
                        ? (
                            // Try to parse if it's JSON array from our new format
                            (() => {
                              try {
                                const parsed = JSON.parse(viewHistoryItem.output_text);
                                if (Array.isArray(parsed)) return parsed.join('\n\n---\n\n');
                                return viewHistoryItem.output_text;
                              } catch {
                                return viewHistoryItem.output_text;
                              }
                            })()
                          )
                        : '(No output text recorded)'
                      }
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Delete Confirmation Modal */}
        <Dialog.Root open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-50 outline-none animate-scale-in">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                
                <Dialog.Title className="text-lg font-semibold text-slate-900 mb-2">
                  {itemToDelete?.type === 'all-history' ? 'Clear All History' : 'Confirm Deletion'}
                </Dialog.Title>
                
                <Dialog.Description className="text-sm text-slate-500 mb-6">
                  {itemToDelete?.type === 'all-history' 
                    ? 'Are you sure you want to delete ALL history records? This action cannot be undone.'
                    : `Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`
                  }
                </Dialog.Description>

                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedWithDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                  >
                    {itemToDelete?.type === 'all-history' ? 'Clear All' : 'Delete'}
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </main>
    </div>
  )
}
