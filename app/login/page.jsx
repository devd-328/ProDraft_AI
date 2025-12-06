'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { signIn, signUp, signInWithGoogle, getUser } from '@/lib/supabase'
import { Sparkles, Mail, Lock, Loader2, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/app'

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm()
  const password = watch('password')

  useEffect(() => {
    async function checkAuth() {
      const user = await getUser()
      if (user) {
        router.push(redirectTo)
      } else {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router, redirectTo])

  useEffect(() => {
    reset()
    setError('')
    setSuccess('')
  }, [isSignUp, reset])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Failed to sign in with Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        if (data.password !== data.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        const { error, data: authData } = await signUp(data.email, data.password, data.fullName)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Account created! Check your email to confirm your account.')
          reset()
        }
      } else {
        const { error } = await signIn(data.email, data.password)
        if (error) {
          setError(error.message)
        } else {
          router.push(redirectTo)
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">ProDraft</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-slate-900 mb-1">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-slate-500 text-sm">
                {isSignUp ? 'Start polishing content for free' : 'Sign in to continue'}
              </p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm mb-4"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Full Name - Sign Up Only */}
              {isSignUp && (
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      {...register('fullName', {
                        required: isSignUp ? 'Name is required' : false,
                      })}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                      placeholder="Full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email'
                      }
                    })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                    placeholder="Email address"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Min 6 characters'
                      }
                    })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password - Sign Up Only */}
              {isSignUp && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: isSignUp ? 'Confirm password' : false,
                        validate: value => value === password || 'Passwords must match'
                      })}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 text-green-600 text-xs p-3 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create account' : 'Sign in'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-5 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-xs text-slate-400">
            Free forever • No credit card required
          </p>
        </div>
      </main>
    </div>
  )
}
