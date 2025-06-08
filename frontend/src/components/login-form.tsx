'use client'

import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginFormData } from '@/lib/schemas'
import { useActionState } from 'react'

interface LoginFormProps {
  onSuccess?: (response: { token: string; pid: string; name: string }) => void
  onError?: (error: string) => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onError, onSwitchToRegister }: LoginFormProps) {
  const [lastResult, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const submission = parseWithZod(formData, { schema: loginSchema })

    if (submission.status !== 'success') {
      return submission.reply()
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: submission.value.email.trim(),
          password: submission.value.password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ログインに失敗しました')
      }

      const data = await response.json()
      
      // Store token in localStorage for persistence
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_pid', data.pid)
      localStorage.setItem('user_name', data.name)
      
      onSuccess?.(data)
      
      return submission.reply({ resetForm: true })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました'
      onError?.(errorMessage)
      return submission.reply({
        formErrors: [errorMessage]
      })
    }
  }, undefined)

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">ログイン</CardTitle>
        <CardDescription className="text-center">
          メールアドレスとパスワードを入力してください
        </CardDescription>
      </CardHeader>
      
      <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={fields.email.id}>メールアドレス</Label>
            <Input
              key={fields.email.key}
              id={fields.email.id}
              name={fields.email.name}
              type="email"
              defaultValue={fields.email.initialValue}
              placeholder="example@example.com"
              className={fields.email.errors ? 'border-red-500' : ''}
              disabled={isPending}
            />
            {fields.email.errors && (
              <p className="text-sm text-red-500">{fields.email.errors[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.password.id}>パスワード</Label>
            <Input
              key={fields.password.key}
              id={fields.password.id}
              name={fields.password.name}
              type="password"
              defaultValue={fields.password.initialValue}
              placeholder="パスワードを入力"
              className={fields.password.errors ? 'border-red-500' : ''}
              disabled={isPending}
            />
            {fields.password.errors && (
              <p className="text-sm text-red-500">{fields.password.errors[0]}</p>
            )}
          </div>

          {form.errors && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">
              {form.errors[0]}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'ログイン中...' : 'ログイン'}
          </Button>
          
          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="link"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={() => {/* TODO: Implement forgot password */}}
            >
              パスワードをお忘れですか？
            </Button>
            
            {onSwitchToRegister && (
              <div className="text-sm text-gray-600">
                アカウントをお持ちでない方は{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-500"
                  onClick={onSwitchToRegister}
                >
                  新規登録
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}