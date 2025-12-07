import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { rateLimit, getClientId } from '@/lib/rateLimit'

const apiKey = process.env.GEMINI_API_KEY

export async function POST(req) {
  try {
    // Rate limiting
    const clientId = getClientId(req)
    const rateLimitResult = rateLimit(clientId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.` },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
          }
        }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { text, format } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      )
    }

    // Use v1 API for gemini-1.5-flash
    const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: 'v1' })
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' })

    let prompt = ''

    switch (format) {
      case 'email':
        prompt = `Rewrite the following text as a polished, professional email. Ensure clarity, correct tone, and proper formatting:\n\n${text}`
        break
      case 'social':
        prompt = `Convert the following text into an engaging social media post (suitable for Twitter/LinkedIn). Use emojis sparingly but effectively, and keep it punchy:\n\n${text}`
        break
      case 'report':
        prompt = `Format the following text into a structured, professional report. Use headings, bullet points, and clear sections where appropriate:\n\n${text}`
        break
      case 'summary':
        prompt = `Provide a concise summary of the key points from the following text:\n\n${text}`
        break
      default:
        prompt = `Polished and improve the following text:\n\n${text}`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const output = response.text()

    return NextResponse.json(
      { output },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error generating content:', error)
    
    // Provide more detailed error message
    let errorMessage = 'Failed to generate content'
    if (error instanceof Error) {
      errorMessage = error.message
      // Check for common API errors
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.'
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'API quota exceeded. Please try again later.'
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Permission denied. Please check API key permissions.'
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
