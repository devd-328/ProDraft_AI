'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  Sparkles, Copy, RefreshCw, Mail, Share2, FileText, AlignLeft, 
  Download, Check, User, ChevronDown, Settings,
  FileDown, FileType, LogOut, Loader2, LayoutDashboard, Wand2, Save, X
} from 'lucide-react'
import Link from 'next/link'
import { getUser, trackUsage, signOut, createDraft, getDraft, updateDraft } from '@/lib/supabase'
import { exportAsTxt, exportAsPdf } from '@/lib/export'

const formatOptions = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Professional emails' },
  { id: 'social', label: 'Social', icon: Share2, description: 'Engaging posts' },
  { id: 'report', label: 'Report', icon: FileText, description: 'Structured docs' },
  { id: 'summary', label: 'Summary', icon: AlignLeft, description: 'Key points' },
]

function AppContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialFormat = searchParams.get('format') || 'email'
  const draftId = searchParams.get('id')

  const [suggestions, setSuggestions] = useState([])
  const [format, setFormat] = useState(initialFormat)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentDraftId, setCurrentDraftId] = useState(draftId)
  const [draftTitle, setDraftTitle] = useState('')
  
  // Save Dialog State
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()
  const inputText = watch('inputText', '')

  useEffect(() => {
    async function checkUser() {
      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/login?redirect=/app')
        return
      }
      setUser(currentUser)
      setAuthLoading(false)

      // Load draft if ID exists
      if (draftId) {
        setIsLoading(true)
        const { data: draft } = await getDraft(draftId)
        if (draft) {
          setValue('inputText', draft.input_text)
          setFormat(draft.format)
          setSuggestions(draft.output_text ? JSON.parse(draft.output_text) : [])
          setDraftTitle(draft.title)
          setCurrentDraftId(draft.id)
        }
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router, draftId, setValue])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const generateDraftName = (text) => {
    if (!text) return `Draft ${new Date().toLocaleDateString()}`
    // Take first 5 words or first 40 chars
    const firstLine = text.split('\n')[0]
    const words = firstLine.split(/\s+/).slice(0, 6).join(' ')
    return words.length > 40 ? words.substring(0, 40) + '...' : words
  }

  const handleSaveClick = () => {
    if (!inputText || !user) return
    // Suggest a name if one doesn't exist, otherwise keep existing
    const suggestedName = draftTitle || generateDraftName(inputText)
    setSaveName(suggestedName)
    setShowSaveDialog(true)
  }

  const performSave = async () => {
    if (!saveName.trim()) return

    setIsSaving(true)
    const draftData = {
      user_id: user.id,
      title: saveName,
      input_text: inputText,
      output_text: JSON.stringify(suggestions),
      format: format
    }

    if (currentDraftId) {
      const { data, error } = await updateDraft(currentDraftId, draftData)
      if (!error) {
        setDraftTitle(saveName)
        // Track the update as a saved event in history
        const totalLength = suggestions.reduce((acc, str) => acc + str.length, 0)
        await trackUsage(user.id, format, saveName.length, totalLength, saveName, JSON.stringify(suggestions), true)
      } else {
        console.error("Failed to update draft:", error)
      }
    } else {
      const { data, error } = await createDraft(draftData)
      if (data && !error) {
        setCurrentDraftId(data.id)
        setDraftTitle(saveName)
        window.history.replaceState(null, '', `/app?id=${data.id}`)
        // Track the new save as a saved event in history
        const totalLength = suggestions.reduce((acc, str) => acc + str.length, 0)
        await trackUsage(user.id, format, saveName.length, totalLength, saveName, JSON.stringify(suggestions), true)
      } else {
        console.error("Failed to create draft:", error)
      }
    }
    
    setIsSaving(false)
    setShowSaveDialog(false)
  }

  const onSubmit = async (data) => {
    if (!data.inputText.trim() || !user) return

    setIsLoading(true)
    setSuggestions([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.inputText, format }),
      })

      const result = await response.json()
      
      if (response.ok) {
        // Ensure result.output is an array
        const outputArray = Array.isArray(result.output) ? result.output : [result.output]
        setSuggestions(outputArray)
        
        // Calculate total length for tracking
        const totalLength = outputArray.reduce((acc, str) => acc + str.length, 0)
        const { error: trackError } = await trackUsage(user.id, format, data.inputText.length, totalLength, data.inputText, JSON.stringify(outputArray), false) // isSaved: false
        
        if (trackError) {
          console.error("Failed to track usage:", trackError)
        }
      } else {
        setSuggestions([`Error: ${result.error}`])
      }
    } catch (error) {
      console.error('Request failed', error)
      setSuggestions(['Failed to connect to the server.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text, index) => {
    if (text) {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  const handleExport = (type) => {
    if (suggestions.length === 0) return
    
    // Export all suggestions separated by a divider
    const content = suggestions.join('\n\n' + '-'.repeat(40) + '\n\n')
    const filename = `prodraft-${format}-${Date.now()}`
    
    if (type === 'txt') {
      exportAsTxt(content, filename)
    } else {
      exportAsPdf(content, filename)
    }
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4"> {/* New container for left-aligned items */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900">ProDraft</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="px-3 py-1 bg-slate-100 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200 hidden sm:block"
            >
              Dashboard
            </Link>
          </div>

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
                <span className="hidden sm:block text-sm font-medium text-slate-700">{getDisplayName()}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
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
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Input Panel */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-900">
                  {currentDraftId ? `Editing: ${draftTitle}` : 'New Draft'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{inputText.length} characters</span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setValue('inputText', '');
                      setSuggestions([]);
                    }}
                    disabled={!inputText.trim()}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Clear Input"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>

                  {/* Save Draft Button */}
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={isSaving || !inputText.trim()}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {currentDraftId ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  {...register('inputText', { required: 'Please enter some text' })}
                  className="w-full h-40 p-3 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-slate-800 placeholder-slate-400 outline-none text-sm"
                  placeholder="Paste your rough notes, ideas, or draft here..."
                />
                {errors.inputText && (
                  <p className="text-red-500 text-xs mt-2">{errors.inputText.message}</p>
                )}
              </div>

              {/* Format Selection */}
              <div className="px-4 pb-4">
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                  Output Format
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {formatOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormat(opt.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${ 
                        format === opt.id
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Polishing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Polish Content
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-150px)]">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-slate-900">
                  {suggestions.length > 0 ? `Results (${suggestions.length})` : 'Result'}
                </h2>
                
                {suggestions.length > 0 && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export All
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="min-w-[140px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50"
                        sideOffset={5}
                      >
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded outline-none"
                          onClick={() => handleExport('txt')}
                        >
                          <FileType className="w-3.5 h-3.5" />
                          Export as TXT
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded outline-none"
                          onClick={() => handleExport('pdf')}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Export as PDF
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>

                                          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">

                                            {suggestions.length > 0 ? (

                                              <div className="flex flex-col gap-4">

                                                {suggestions.map((text, index) => (

                                                  <div 

                                                    key={index} 

                                                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group w-full"

                                                  >

                                                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">

                                                      {text}

                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-2">

                                                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">

                                                        Option {index + 1}

                                                      </span>

                                                      <button

                                                        type="button"

                                                        onClick={() => handleCopy(text, index)}

                                                        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-all ${ 

                                                          copiedIndex === index

                                                            ? 'bg-green-50 text-green-600'

                                                            : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'

                                                        }`}

                                                      >

                                                        {copiedIndex === index ? (

                                                          <>

                                                            <Check className="w-3.5 h-3.5" />

                                                            Copied

                                                          </>

                                                        ) : (

                                                          <>

                                                            <Copy className="w-3.5 h-3.5" />

                                                            Copy

                                                          </>

                                                        )}

                                                      </button>

                                                    </div>

                                                  </div>

                                                ))}

                                              </div>

                                            ) : (                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                      <Sparkles className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No results yet</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                      Enter your text and click 'Polish Content' to see 6 different variations
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </form>

        {/* Save Draft Dialog */}
        <Dialog.Root open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-50 outline-none animate-scale-in">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Save Draft
                  </Dialog.Title>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Draft Name
                    </label>
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="e.g. Q1 Marketing Plan"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performSave}
                      disabled={isSaving || !saveName.trim()}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </main>
    </div>
  )
}

function AppLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  )
}

export default function AppPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <AppContent />
    </Suspense>
  )
}
