'use client'

import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService } from '@/lib/api'
import { registerSchema, type RegisterFormData } from '@/lib/schemas'
import { useActionState } from 'react'

interface RegisterFormProps {
  onSuccess?: (response: { token: string; user: { pid: string; name: string; email: string } }) => void
  onError?: (error: string) => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onError, onSwitchToLogin }: RegisterFormProps) {
  const [lastResult, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const submission = parseWithZod(formData, { schema: registerSchema })

    if (submission.status !== 'success') {
      return submission.reply()
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: submission.value.email.trim(),
          password: submission.value.password,
          name: submission.value.name.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '登録に失敗しました')
      }

      const data = await response.json()
      
      // Store token in localStorage for persistence
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_pid', data.user.pid)
      localStorage.setItem('user_name', data.user.name)
      
      onSuccess?.(data)
      
      return submission.reply({ resetForm: true })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登録に失敗しました'
      onError?.(errorMessage)
      return submission.reply({
        formErrors: [errorMessage]
      })
    }
  }, undefined)

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">新規登録</CardTitle>
        <CardDescription className="text-center">
          アカウント情報を入力してください
        </CardDescription>
      </CardHeader>
      
      <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={fields.name.id}>お名前</Label>
            <Input
              key={fields.name.key}
              id={fields.name.id}
              name={fields.name.name}
              type="text"
              defaultValue={fields.name.initialValue}
              placeholder="山田太郎"
              className={fields.name.errors ? 'border-red-500' : ''}
              disabled={isPending}
            />
            {fields.name.errors && (
              <p className="text-sm text-red-500">{fields.name.errors[0]}</p>
            )}
          </div>

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
              placeholder="安全なパスワードを選択"
              className={fields.password.errors ? 'border-red-500' : ''}
              disabled={isPending}
            />
            {fields.password.errors && (
              <p className="text-sm text-red-500">{fields.password.errors[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.password_confirmation.id}>パスワード確認</Label>
            <Input
              key={fields.password_confirmation.key}
              id={fields.password_confirmation.id}
              name={fields.password_confirmation.name}
              type="password"
              defaultValue={fields.password_confirmation.initialValue}
              placeholder="パスワードを再入力"
              className={fields.password_confirmation.errors ? 'border-red-500' : ''}
              disabled={isPending}
            />
            {fields.password_confirmation.errors && (
              <p className="text-sm text-red-500">{fields.password_confirmation.errors[0]}</p>
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
            {isPending ? 'アカウント作成中...' : 'アカウント作成'}
          </Button>
          
          {onSwitchToLogin && (
            <div className="text-center">
              <div className="text-sm text-gray-600">
                すでにアカウントをお持ちですか？{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-500"
                  onClick={onSwitchToLogin}
                >
                  ログイン
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}