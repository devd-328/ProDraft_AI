'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Sparkles, ArrowRight, Mail, Share2, FileText, AlignLeft,
  Zap, Shield, Smartphone, Clock, ChevronRight, Github,
  Twitter, CheckCircle2, Play, MousePointer, LogIn
} from 'lucide-react'

// Animated counter component
function Counter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// Animated text reveal
function AnimatedText({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return () => observer.disconnect()
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [demoInput, setDemoInput] = useState('')
  const [demoOutput, setDemoOutput] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('email')
  const [demoUsed, setDemoUsed] = useState(false)

  // Check if demo was already used (from localStorage)
  useEffect(() => {
    const used = localStorage.getItem('prodraft_demo_used')
    if (used === 'true') {
      setDemoUsed(true)
    }
  }, [])

  const exampleInput = "hey john, wanted to touch base about the project. we're running behind schedule, maybe 2 weeks. the client wants some changes to the design. can we meet tomorrow to discuss? also need to talk about budget."

  const handleDemo = async () => {
    // Check if already used
    if (demoUsed) {
      return
    }

    const textToUse = demoInput || exampleInput
    setDemoLoading(true)
    setDemoOutput('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToUse, format: selectedFormat }),
      })

      const data = await response.json()
      if (response.ok) {
        setDemoOutput(data.output)
        // Mark demo as used
        setDemoUsed(true)
        localStorage.setItem('prodraft_demo_used', 'true')
      } else {
        setDemoOutput('Demo unavailable. Please try the full app!')
      }
    } catch {
      setDemoOutput('Demo unavailable. Please try the full app!')
    } finally {
      setDemoLoading(false)
    }
  }

  const features = [
    {
      icon: Zap,
      title: 'Instant Polish',
      description: 'Transform rough ideas into professional content in seconds with AI',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: FileText,
      title: 'Multiple Formats',
      description: 'Emails, social posts, reports, summaries - all from one simple input',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your content is processed securely and never stored or shared',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Fully responsive design - use on desktop, tablet, or mobile',
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  const useCases = [
    {
      icon: Mail,
      title: 'Professionals',
      description: 'Craft polished client emails in seconds',
      example: 'Quick meeting follow-ups, project updates, proposals'
    },
    {
      icon: Share2,
      title: 'Content Creators',
      description: 'Generate engaging social media posts',
      example: 'LinkedIn updates, Twitter threads, Instagram captions'
    },
    {
      icon: FileText,
      title: 'Students & Researchers',
      description: 'Structure reports and summaries efficiently',
      example: 'Research summaries, essay outlines, study notes'
    },
    {
      icon: Zap,
      title: 'Founders & Teams',
      description: 'Communicate clearly with stakeholders',
      example: 'Investor updates, team announcements, product briefs'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Paste Your Draft',
      description: 'Drop in your rough notes, messy ideas, or quick thoughts'
    },
    {
      number: '02',
      title: 'Choose Format',
      description: 'Select email, social post, report, or summary'
    },
    {
      number: '03',
      title: 'Get Polished Content',
      description: 'Receive professional, ready-to-use content instantly'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ProDraft AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <a 
              href="#demo" 
              className="hidden sm:block text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Try Demo
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-all hover:shadow-lg hover:shadow-indigo-200"
            >
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-indigo-50/50 via-white to-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <AnimatedText>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                100% Free AI Writing Tool
              </div>
            </AnimatedText>

            <AnimatedText delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Turn Messy Notes into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600"> Polished Content</span>
              </h1>
            </AnimatedText>

            <AnimatedText delay={200}>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                AI-powered writing assistant that transforms your rough drafts into professional emails, social posts, reports, and more — in seconds.
              </p>
            </AnimatedText>

            <AnimatedText delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Polishing — It&apos;s Free
                </Link>
                <a
                  href="#demo"
                  className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-lg transition-all"
                >
                  <Play className="w-5 h-5" />
                  See Demo
                </a>
              </div>
            </AnimatedText>

            {/* Stats */}
            <AnimatedText delay={400}>
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    <Counter end={10000} suffix="+" />
                  </div>
                  <div className="text-sm text-slate-500">Drafts Polished</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    <Counter end={4} />
                  </div>
                  <div className="text-sm text-slate-500">Output Formats</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    <Counter end={100} suffix="%" />
                  </div>
                  <div className="text-sm text-slate-500">Free Forever</div>
                </div>
              </div>
            </AnimatedText>
          </div>

          {/* Hero Image/Preview */}
          <AnimatedText delay={500}>
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
              <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-sm text-slate-500">ProDraft AI</div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-500">Input</div>
                    <div className="p-4 bg-slate-50 rounded-lg text-slate-600 text-sm">
                      hey john, wanted to touch base about the project. we&apos;re running behind...
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-500">Output</div>
                    <div className="p-4 bg-indigo-50 rounded-lg text-slate-700 text-sm">
                      Dear John,<br/><br/>I hope this message finds you well. I wanted to provide you with an update regarding our project timeline...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <AnimatedText>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Everything you need to write better
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Powerful features designed to help you communicate more effectively
              </p>
            </div>
          </AnimatedText>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <AnimatedText key={feature.title} delay={index * 100}>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </AnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedText>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                How it works
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Three simple steps to transform your writing
              </p>
            </div>
          </AnimatedText>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <AnimatedText key={step.number} delay={index * 150}>
                <div className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent -translate-x-8" />
                  )}
                  <div className="text-6xl font-bold text-indigo-100 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </AnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedText>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                <Play className="w-4 h-4" />
                Live Demo
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Try it yourself
              </h2>
              <p className="text-lg text-slate-600">
                See the magic in action — no signup required
              </p>
            </div>
          </AnimatedText>

          <AnimatedText delay={200}>
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              {demoUsed && !demoOutput ? (
                /* Show signup prompt after demo is used */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    You&apos;ve used your free demo!
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Loved it? Sign up for free to get unlimited access to all features — forever free, no credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                    >
                      <LogIn className="w-5 h-5" />
                      Sign Up Free
                    </Link>
                    <Link
                      href="/app"
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                    >
                      Try Without Account
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Output Format</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'email', label: 'Email', icon: Mail },
                        { id: 'social', label: 'Social', icon: Share2 },
                        { id: 'report', label: 'Report', icon: FileText },
                        { id: 'summary', label: 'Summary', icon: AlignLeft },
                      ].map((format) => (
                        <button
                          key={format.id}
                          onClick={() => setSelectedFormat(format.id)}
                          disabled={demoUsed}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                            selectedFormat === format.id
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                          } ${demoUsed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <format.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{format.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Draft</label>
                    <textarea
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      placeholder={exampleInput}
                      disabled={demoUsed}
                      className={`w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-slate-700 placeholder-slate-400 ${demoUsed ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {demoUsed ? 'Demo already used — sign up for unlimited access!' : 'Leave empty to use example text'}
                    </p>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleDemo}
                    disabled={demoLoading || demoUsed}
                    className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${demoUsed ? 'cursor-not-allowed' : ''}`}
                  >
                    {demoLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Polishing...
                      </>
                    ) : demoUsed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Demo Used — Sign Up for More
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Polish This Text
                      </>
                    )}
                  </button>

                  {/* Output */}
                  {demoOutput && (
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 mb-3">
                        <CheckCircle2 className="w-4 h-4" />
                        Polished Result
                      </div>
                      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {demoOutput}
                      </div>
                      
                      {/* Signup CTA after output */}
                      <div className="mt-4 pt-4 border-t border-indigo-100">
                        <p className="text-sm text-slate-600 mb-3">
                          ✨ Like what you see? Get unlimited generations for free!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link
                            href="/login"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all"
                          >
                            <LogIn className="w-4 h-4" />
                            Sign Up Free
                          </Link>
                          <Link
                            href="/app"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-all"
                          >
                            Continue to App
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedText>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Perfect for everyone
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Whether you&apos;re a professional, creator, student, or founder
              </p>
            </div>
          </AnimatedText>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <AnimatedText key={useCase.title} delay={index * 100}>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <useCase.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{useCase.title}</h3>
                      <p className="text-slate-600 mb-2">{useCase.description}</p>
                      <p className="text-sm text-slate-400">{useCase.example}</p>
                    </div>
                  </div>
                </div>
              </AnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedText>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to polish your content?
                </h2>
                <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
                  Join thousands of users who write better, faster with ProDraft AI. No signup required to start.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-indigo-50 rounded-xl text-indigo-600 font-semibold text-lg transition-all hover:shadow-xl"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">ProDraft AI</span>
            </div>

            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/devd-328/ProDraft_AI" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
