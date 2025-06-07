import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import type { 
  FormValidationRules, 
  FormOptions, 
  ValidationError,
  ValidateFieldResponse 
} from '@/types/generated/types'

interface ValidationState {
  errors: Record<string, ValidationError[]>
  isValidating: Record<string, boolean>
  isValid: boolean
}

interface UseValidationOptions {
  formType: 'clothes' | 'coordinates' | 'auth'
  debounceMs?: number
}

export function useValidation({ formType, debounceMs = 300 }: UseValidationOptions) {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    isValidating: {},
    isValid: true
  })
  
  const [rules, setRules] = useState<FormValidationRules | null>(null)
  const [options, setOptions] = useState<FormOptions | null>(null)
  const [loading, setLoading] = useState(true)

  // バリデーションルールとオプションを取得
  useEffect(() => {
    const fetchValidationData = async () => {
      try {
        const [rulesResponse, optionsResponse] = await Promise.all([
          apiService.getValidationRules(),
          apiService.getFormOptions()
        ])
        setRules(rulesResponse)
        setOptions(optionsResponse)
      } catch (error) {
        console.error('Failed to fetch validation data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchValidationData()
  }, [])

  // デバウンス用のタイマー管理
  const [timers, setTimers] = useState<Record<string, NodeJS.Timeout>>({})

  // フィールドバリデーション
  const validateField = useCallback(async (fieldName: string, value: string) => {
    // 進行中のタイマーをクリア
    if (timers[fieldName]) {
      clearTimeout(timers[fieldName])
    }

    // バリデーション中の状態を設定
    setValidationState(prev => ({
      ...prev,
      isValidating: {
        ...prev.isValidating,
        [fieldName]: true
      }
    }))

    // デバウンス処理
    const timer = setTimeout(async () => {
      try {
        const response = await apiService.validateField({
          field_name: fieldName,
          value,
          form_type: formType
        })

        setValidationState(prev => {
          const newErrors = {
            ...prev.errors,
            [fieldName]: response.errors
          }
          
          const isValid = Object.values(newErrors).every(errors => errors.length === 0)
          
          return {
            errors: newErrors,
            isValidating: {
              ...prev.isValidating,
              [fieldName]: false
            },
            isValid
          }
        })
      } catch (error) {
        console.error(`Validation failed for field ${fieldName}:`, error)
        setValidationState(prev => ({
          ...prev,
          isValidating: {
            ...prev.isValidating,
            [fieldName]: false
          }
        }))
      }
    }, debounceMs)

    setTimers(prev => ({
      ...prev,
      [fieldName]: timer
    }))
  }, [formType, debounceMs, timers])

  // フィールドエラーをクリア
  const clearFieldErrors = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors }
      delete newErrors[fieldName]
      
      const isValid = Object.values(newErrors).every(errors => errors.length === 0)
      
      return {
        ...prev,
        errors: newErrors,
        isValid
      }
    })
  }, [])

  // 全エラーをクリア
  const clearAllErrors = useCallback(() => {
    setValidationState({
      errors: {},
      isValidating: {},
      isValid: true
    })
  }, [])

  // フィールドのエラーを取得
  const getFieldErrors = useCallback((fieldName: string): ValidationError[] => {
    return validationState.errors[fieldName] || []
  }, [validationState.errors])

  // フィールドが有効かチェック
  const isFieldValid = useCallback((fieldName: string): boolean => {
    return getFieldErrors(fieldName).length === 0
  }, [getFieldErrors])

  // フィールドがバリデーション中かチェック
  const isFieldValidating = useCallback((fieldName: string): boolean => {
    return validationState.isValidating[fieldName] || false
  }, [validationState.isValidating])

  // クライアント側の即座バリデーション
  const validateFieldSync = useCallback((fieldName: string, value: string): ValidationError[] => {
    if (!rules) return []

    const fieldRules = getFieldRules(fieldName, formType, rules)
    if (!fieldRules) return []

    const errors: ValidationError[] = []

    // 必須チェック
    if (fieldRules.required && (!value || value.trim() === '')) {
      errors.push({
        field: fieldName,
        message: getRequiredMessage(fieldName),
        code: 'REQUIRED'
      })
      return errors // 必須エラーがある場合は他のチェックはスキップ
    }

    // 値が空の場合はそれ以上チェックしない
    if (!value || value.trim() === '') {
      return errors
    }

    // 最小長チェック
    if (fieldRules.min_length && value.length < fieldRules.min_length) {
      errors.push({
        field: fieldName,
        message: `${fieldRules.min_length}文字以上で入力してください`,
        code: 'MIN_LENGTH'
      })
    }

    // 最大長チェック
    if (fieldRules.max_length && value.length > fieldRules.max_length) {
      errors.push({
        field: fieldName,
        message: `${fieldRules.max_length}文字以内で入力してください`,
        code: 'MAX_LENGTH'
      })
    }

    // パターンチェック
    if (fieldRules.pattern) {
      const regex = new RegExp(fieldRules.pattern)
      if (!regex.test(value)) {
        errors.push({
          field: fieldName,
          message: getPatternMessage(fieldName),
          code: 'INVALID_FORMAT'
        })
      }
    }

    // 数値範囲チェック
    if (fieldRules.min_value !== undefined || fieldRules.max_value !== undefined) {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        if (fieldRules.min_value !== undefined && numValue < fieldRules.min_value) {
          errors.push({
            field: fieldName,
            message: `${fieldRules.min_value}以上で入力してください`,
            code: 'MIN_VALUE'
          })
        }
        if (fieldRules.max_value !== undefined && numValue > fieldRules.max_value) {
          errors.push({
            field: fieldName,
            message: `${fieldRules.max_value}以下で入力してください`,
            code: 'MAX_VALUE'
          })
        }
      } else {
        errors.push({
          field: fieldName,
          message: '有効な数値を入力してください',
          code: 'INVALID_FORMAT'
        })
      }
    }

    return errors
  }, [rules, formType])

  // クリーンアップ
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer))
    }
  }, [timers])

  return {
    // State
    errors: validationState.errors,
    isValid: validationState.isValid,
    loading,
    rules,
    options,

    // Actions
    validateField,
    validateFieldSync,
    clearFieldErrors,
    clearAllErrors,

    // Getters
    getFieldErrors,
    isFieldValid,
    isFieldValidating
  }
}

// ヘルパー関数
function getFieldRules(
  fieldName: string, 
  formType: string, 
  rules: FormValidationRules
) {
  switch (formType) {
    case 'clothes':
      return (rules.clothes as any)[fieldName]
    case 'coordinates':
      return (rules.coordinates as any)[fieldName]
    case 'auth':
      return (rules.auth as any)[fieldName]
    default:
      return null
  }
}

function getRequiredMessage(fieldName: string): string {
  const messages: Record<string, string> = {
    name: '名前は必須です',
    email: 'メールアドレスは必須です',
    password: 'パスワードは必須です',
    brand: 'ブランド名は必須です',
    category: 'カテゴリは必須です',
    size: 'サイズは必須です',
    color: '色は必須です',
    price: '価格は必須です',
    stock_quantity: '在庫数は必須です'
  }
  return messages[fieldName] || `${fieldName}は必須です`
}

function getPatternMessage(fieldName: string): string {
  const messages: Record<string, string> = {
    email: '有効なメールアドレスを入力してください',
    password: 'パスワードは大文字、小文字、数字を含む必要があります'
  }
  return messages[fieldName] || '正しい形式で入力してください'
}