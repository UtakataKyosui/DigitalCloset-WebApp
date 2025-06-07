'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { RegisterForm } from '@/components/register-form'
import { useAuth } from '@/hooks/use-auth'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleLoginSuccess = (response: { token: string; pid: string; name: string }) => {
    login(response.token, {
      pid: response.pid,
      name: response.name,
      email: '', // We'll get this from getCurrentUser
    })
    
    setMessage({
      type: 'success',
      text: `おかえりなさい、${response.name}さん！リダイレクト中です...`
    })
    
    // Redirect to main app after successful login
    setTimeout(() => {
      router.push('/forms') // or wherever you want to redirect
    }, 1500)
  }

  const handleRegisterSuccess = (response: { token: string; user: { pid: string; name: string; email: string } }) => {
    login(response.token, response.user)
    
    setMessage({
      type: 'success',
      text: `アカウントが作成されました！ようこそ、${response.user.name}さん！`
    })
    
    // Redirect to main app after successful registration
    setTimeout(() => {
      router.push('/forms') // or wherever you want to redirect
    }, 1500)
  }

  const handleError = (error: string) => {
    setMessage({
      type: 'error',
      text: `エラーが発生しました: ${error}`
    })
    
    // Auto-hide error messages after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setMessage(null) // Clear any existing messages
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold mb-4 text-foreground">
            デジタルクローゼット
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-primary/10 border-primary/20 text-foreground' 
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            <p className="text-center">{message.text}</p>
          </div>
        )}

        {/* Forms */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onError={handleError}
              onSwitchToRegister={switchMode}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onError={handleError}
              onSwitchToLogin={switchMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            安全な認証システム powered by Loco.rs
          </p>
        </div>
      </div>
    </div>
  )
}