// Simple in-memory rate limiter for serverless functions
// For production, consider using Redis or Supabase

const store = {}

const RATE_LIMIT = 20 // requests per window
const WINDOW_MS = 60 * 1000 // 1 minute window

export function rateLimit(identifier) {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  // Initialize if not exists
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + WINDOW_MS,
    }
  }

  const entry = store[key]
  const remaining = Math.max(0, RATE_LIMIT - entry.count)
  const resetIn = Math.max(0, Math.ceil((entry.resetTime - now) / 1000))

  if (entry.count >= RATE_LIMIT) {
    return { success: false, remaining: 0, resetIn }
  }

  entry.count++
  return { success: true, remaining: remaining - 1, resetIn }
}

// Helper to get client identifier from request
export function getClientId(req) {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'anonymous'
}
