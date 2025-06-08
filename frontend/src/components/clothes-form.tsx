'use client'

import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService, ClothesItem } from '@/lib/api'
import { clothesSchema, type ClothesFormData } from '@/lib/schemas'
import { useActionState } from 'react'

interface ClothesFormProps {
  onSuccess?: (clothes: ClothesItem) => void
  onError?: (error: string) => void
  initialData?: Partial<ClothesFormData>
  mode?: 'create' | 'edit'
  clothesPid?: string
}

export function ClothesForm({ 
  onSuccess, 
  onError, 
  initialData, 
  mode = 'create',
  clothesPid 
}: ClothesFormProps) {
  const [lastResult, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const submission = parseWithZod(formData, { schema: clothesSchema })

    if (submission.status !== 'success') {
      return submission.reply()
    }

    try {
      const submitData = {
        name: submission.value.name.trim(),
        brand: submission.value.brand.trim(),
        category: submission.value.category.trim(),
        size: submission.value.size.trim(),
        color: submission.value.color.trim(),
        material: submission.value.material?.trim() || undefined,
        price: submission.value.price || undefined,
        stock: submission.value.stock || undefined,
      }

      let result: ClothesItem

      if (mode === 'edit' && clothesPid) {
        const response = await fetch(`/api/forms/clothes/${clothesPid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '更新に失敗しました')
        }
        
        const data = await response.json()
        result = data.data
      } else {
        const response = await fetch('/api/forms/clothes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '作成に失敗しました')
        }
        
        const data = await response.json()
        result = data.data
      }

      onSuccess?.(result)
      
      return submission.reply({ resetForm: mode === 'create' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'フォームの送信に失敗しました'
      onError?.(errorMessage)
      return submission.reply({
        formErrors: [errorMessage]
      })
    }
  }, undefined)

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: clothesSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: initialData,
  })

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'edit' ? '洋服編集' : '洋服登録'}</CardTitle>
        <CardDescription>
          {mode === 'edit' ? '洋服の詳細を更新してください' : '新しい洋服の詳細を入力してください'}
        </CardDescription>
      </CardHeader>
      
      <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={fields.name.id}>商品名 *</Label>
              <Input
                key={fields.name.key}
                id={fields.name.id}
                name={fields.name.name}
                defaultValue={fields.name.initialValue}
                placeholder="Tシャツ、ジーンズなど"
                className={fields.name.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.name.errors && (
                <p className="text-sm text-red-500">{fields.name.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.brand.id}>ブランド *</Label>
              <Input
                key={fields.brand.key}
                id={fields.brand.id}
                name={fields.brand.name}
                defaultValue={fields.brand.initialValue}
                placeholder="ナイキ、アディダスなど"
                className={fields.brand.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.brand.errors && (
                <p className="text-sm text-red-500">{fields.brand.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.category.id}>カテゴリ *</Label>
              <Input
                key={fields.category.key}
                id={fields.category.id}
                name={fields.category.name}
                defaultValue={fields.category.initialValue}
                placeholder="トップス、ボトムス、シューズなど"
                className={fields.category.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.category.errors && (
                <p className="text-sm text-red-500">{fields.category.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.size.id}>サイズ *</Label>
              <Input
                key={fields.size.key}
                id={fields.size.id}
                name={fields.size.name}
                defaultValue={fields.size.initialValue}
                placeholder="S、M、L、XLなど"
                className={fields.size.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.size.errors && (
                <p className="text-sm text-red-500">{fields.size.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.color.id}>色 *</Label>
              <Input
                key={fields.color.key}
                id={fields.color.id}
                name={fields.color.name}
                defaultValue={fields.color.initialValue}
                placeholder="赤、青、黒など"
                className={fields.color.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.color.errors && (
                <p className="text-sm text-red-500">{fields.color.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.material.id}>素材</Label>
              <Input
                key={fields.material.key}
                id={fields.material.id}
                name={fields.material.name}
                defaultValue={fields.material.initialValue}
                placeholder="コットン、ポリエステルなど"
                disabled={isPending}
              />
              {fields.material.errors && (
                <p className="text-sm text-red-500">{fields.material.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.price.id}>価格</Label>
              <Input
                key={fields.price.key}
                id={fields.price.id}
                name={fields.price.name}
                type="number"
                step="0.01"
                min="0"
                defaultValue={fields.price.initialValue}
                placeholder="2999"
                className={fields.price.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.price.errors && (
                <p className="text-sm text-red-500">{fields.price.errors[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.stock.id}>在庫数</Label>
              <Input
                key={fields.stock.key}
                id={fields.stock.id}
                name={fields.stock.name}
                type="number"
                min="0"
                defaultValue={fields.stock.initialValue}
                placeholder="1"
                className={fields.stock.errors ? 'border-red-500' : ''}
                disabled={isPending}
              />
              {fields.stock.errors && (
                <p className="text-sm text-red-500">{fields.stock.errors[0]}</p>
              )}
            </div>
          </div>

          {form.errors && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {form.errors[0]}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (mode === 'edit' ? '更新中...' : '作成中...') : (mode === 'edit' ? '洋服を更新' : '洋服を登録')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}