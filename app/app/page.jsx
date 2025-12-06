'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { 
  Sparkles, Copy, RefreshCw, Mail, Share2, FileText, AlignLeft, 
  Download, Check, Menu, User, LogIn, ChevronDown,
  FileDown, FileType, Home, LogOut, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { getUser, trackUsage, signOut } from '@/lib/supabase'
import { exportAsTxt, exportAsPdf } from '@/lib/export'

const formatOptions = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Professional emails' },
  { id: 'social', label: 'Social', icon: Share2, description: 'Engaging posts' },
  { id: 'report', label: 'Report', icon: FileText, description: 'Structured docs' },
  { id: 'summary', label: 'Summary', icon: AlignLeft, description: 'Key points' },
]

export default function AppPage() {
  const [outputText, setOutputText] = useState('')
  const [format, setFormat] = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const inputText = watch('inputText', '')

  useEffect(() => {
    async function checkUser() {
      const currentUser = await getUser()
      if (!currentUser) {
        // Redirect to login if not authenticated
        router.push('/login?redirect=/app')
        return
      }
      setUser(currentUser)
      setAuthLoading(false)
    }
    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const onSubmit = async (data) => {
    if (!data.inputText.trim() || !user) return

    setIsLoading(true)
    setOutputText('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.inputText, format }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setOutputText(result.output)
        // Track usage
        await trackUsage(user.id, format, data.inputText.length, result.output.length)
      } else {
        setOutputText('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Request failed', error)
      setOutputText('Failed to connect to the server.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleExport = (type) => {
    if (!outputText) return
    
    const filename = `prodraft-${format}-${Date.now()}`
    
    if (type === 'txt') {
      exportAsTxt(outputText, filename)
    } else {
      exportAsPdf(outputText, filename)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ProDraft</span>
            </Link>
            <Link 
              href="/" 
              className="hidden sm:flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleSignOut()
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main App */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* User welcome */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Welcome back,</p>
            <p className="font-medium text-slate-900">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Input</h2>
                <span className="text-xs text-slate-400">{inputText.length} chars</span>
              </div>
              
              <div className="p-5">
                <textarea
                  {...register('inputText', { required: 'Please enter some text' })}
                  className="w-full h-48 sm:h-56 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-slate-800 placeholder-slate-400 outline-none text-base"
                  placeholder="Paste your rough notes, ideas, or draft here... (e.g., 'met with client, they want changes to the logo, need to send update by friday')"
                />
                {errors.inputText && (
                  <p className="text-red-500 text-sm mt-2">{errors.inputText.message}</p>
                )}
              </div>

              {/* Format Selection */}
              <div className="px-5 pb-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Output Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {formatOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormat(opt.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        format === opt.id
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <opt.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:from-indigo-300 disabled:to-indigo-300 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Polishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Polish
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Card */}
            <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Result</h2>
                
                {outputText && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="min-w-[160px] bg-white rounded-xl shadow-lg shadow-slate-200 border border-slate-100 p-1.5 z-50"
                          sideOffset={5}
                        >
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg cursor-pointer outline-none"
                            onClick={() => handleExport('txt')}
                          >
                            <FileType className="w-4 h-4" />
                            Export as TXT
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg cursor-pointer outline-none"
                            onClick={() => handleExport('pdf')}
                          >
                            <FileDown className="w-4 h-4" />
                            Export as PDF
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
              </div>

              <div className="flex-1 p-5 min-h-[300px] lg:min-h-0">
                {outputText ? (
                  <div className="h-full overflow-y-auto">
                    <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {outputText}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium mb-1">No output yet</p>
                    <p className="text-slate-400 text-sm">Enter your text and click generate to see results</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>Built with ❤️ using Next.js & Gemini AI</p>
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
