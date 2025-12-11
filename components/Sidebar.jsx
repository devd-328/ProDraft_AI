'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sparkles, LayoutDashboard, Wand2, Settings, LogOut, 
  ChevronLeft, Menu
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUser, signOut } from '@/lib/supabase'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const u = await getUser()
      setUser(u)
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app', label: 'New Draft', icon: Wand2 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || ''
    if (user?.user_metadata?.full_name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">ProDraft</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.href) 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-indigo-600">{getUserInitials()}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
