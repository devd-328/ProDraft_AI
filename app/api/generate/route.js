import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
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

    const groq = new Groq({ apiKey })
    
    let systemPrompt = "You are a professional writing assistant. Polish and improve the user's text. Provide 6 distinct and improved variations of the text. Return strictly a JSON object with the format { \"suggestions\": [\"variation 1\", \"variation 2\", ...] }."
    
    // Add specific instructions based on format
    switch(format) {
      case 'email':
        systemPrompt += " Format them as professional emails."
        break
      case 'social':
        systemPrompt += " Format them as engaging social media posts with appropriate hashtags."
        break
      case 'report':
        systemPrompt += " Format them as structured report sections."
        break
      case 'summary':
        systemPrompt += " Create concise summaries."
        break
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{ \"suggestions\": [] }"
    let suggestions = []
    
    try {
      const parsed = JSON.parse(content)
      suggestions = parsed.suggestions || []
    } catch (e) {
      console.error("Failed to parse JSON response", e)
      // Fallback: try to just return the content as a single suggestion if parsing fails
      suggestions = [content]
    }

    return NextResponse.json(
      { output: suggestions }, // output is now an array
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