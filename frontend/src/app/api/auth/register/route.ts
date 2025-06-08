import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5150'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Registration failed', details: errorText },
        { status: response.status }
      )
    }

    // Backend returns empty response for register, so we need to login to get token
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    })

    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: 'Auto-login after registration failed' },
        { status: 500 }
      )
    }

    const loginData = await loginResponse.json()
    return NextResponse.json({
      token: loginData.token,
      user: {
        pid: loginData.pid,
        name: loginData.name,
        email: body.email,
      }
    })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}