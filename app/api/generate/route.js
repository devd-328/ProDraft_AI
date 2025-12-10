import { NextResponse } from 'next/server'
import { GroqAPI } from '@groq/api';
import { rateLimit, getClientId } from '@/lib/rateLimit'

const apiKey = process.env.GROQ_API_KEY

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
        { error: 'Groq API key not configured' },
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

    const groqAI = new GroqAPI(apiKey)
    const prompt = `Polish and improve the following text:\n\n${text}`
    const result = await groqAI.generate(prompt)

    return NextResponse.json(
      { output: result },
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
        errorMessage = 'Invalid API key. Please check your GROQ_API_KEY.'
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
