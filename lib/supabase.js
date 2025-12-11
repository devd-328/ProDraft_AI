import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only if we have the required env vars (handles build time)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Auth helpers
export async function signUp(email, password, fullName = '') {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export async function signIn(email, password) {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signInWithGoogle() {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/app`,
    },
  })
  return { data, error }
}

export async function signOut() {
  if (!supabase) return { error: null }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Usage tracking
export async function trackUsage(userId, format, inputLength, outputLength, inputText = null, outputText = null) {
  if (!supabase) return { error: null }
  const payload = {
    user_id: userId,
    format,
    input_length: inputLength,
    output_length: outputLength,
    created_at: new Date().toISOString(),
  }
  
  // Only add text fields if they are provided (handling backward compatibility or privacy)
  if (inputText) payload.input_text = inputText
  if (outputText) payload.output_text = outputText

  const { error } = await supabase.from('usage').insert(payload)
  return { error }
}

export async function getUserUsage(userId) {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return { data, error }
}

export async function getUserUsageCount(userId) {
  if (!supabase) return { count: 0, error: null }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count, error } = await supabase
    .from('usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
  
  return { count: count || 0, error }
}

export async function deleteUsage(id) {
  if (!supabase) return { error: null }
  const { error } = await supabase
    .from('usage')
    .delete()
    .eq('id', id)
  return { error }
}

export async function deleteAllUsage(userId) {
  if (!supabase) return { error: null }
  const { error } = await supabase
    .from('usage')
    .delete()
    .eq('user_id', userId)
  return { error }
}

// --- CRUD Operations for Drafts ---

// Create
export async function createDraft(draft) {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase
    .from('drafts')
    .insert([{
      ...draft,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()
  return { data, error }
}

// Read (List)
export async function getDrafts(userId) {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return { data, error }
}

// Read (Single)
export async function getDraft(id) {
  if (!supabase) return { data: null, error: null }
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

// Update
export async function updateDraft(id, updates) {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase
    .from('drafts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// Delete
export async function deleteDraft(id) {
  if (!supabase) return { error: null }
  const { error } = await supabase
    .from('drafts')
    .delete()
    .eq('id', id)
  return { error }
}

// --- Storage Operations ---

export async function uploadAvatar(userId, file) {
  if (!supabase) return { url: null, error: { message: 'Supabase not configured' } }
  
  // Create a unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  // Upload to 'avatars' bucket
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  // Get public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return { url: data.publicUrl, error: null }
}
