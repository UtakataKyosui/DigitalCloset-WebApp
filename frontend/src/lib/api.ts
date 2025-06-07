const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5151'

export interface ClothesItem {
  pid: string
  name: string
  description?: string
  brand: string
  category: string
  size: string
  color: string
  material?: string
  price: number
  in_stock: boolean
  stock_quantity: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Coordinate {
  pid: string
  name: string
  description?: string
  season?: string
  occasion?: string
  style?: string
  user_id: number
  is_favorite: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface User {
  pid: string
  email: string
  name: string
  created_at?: string
  updated_at?: string
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // セキュリティヘッダーを追加
    const securityHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-12345',
      'X-Client-Version': '1.0.0',
      'Accept': 'application/json',
    }
    
    const config: RequestInit = {
      headers: {
        ...securityHeaders,
        ...options.headers,
      },
      credentials: 'include', // Cookieを含める（CORS allow_credentials: trueと併用）
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // セキュリティヘッダーをチェック
      const apiVersion = response.headers.get('X-API-Version')
      if (!apiVersion) {
        console.warn('API version header missing')
      }
      
      if (!response.ok) {
        // レート制限エラーの特別処理
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.')
        }
        
        // 認証エラーの処理
        if (response.status === 401) {
          // 無効なトークンをクリア
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_pid')
          localStorage.removeItem('user_name')
          throw new Error('Authentication failed. Please login again.')
        }
        
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      
      // レスポンスデータの基本検証
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response format')
      }
      
      return data
    } catch (error) {
      // セキュリティ: 詳細なエラー情報をコンソールに出力（開発環境のみ）
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        console.error(`API request failed for ${endpoint}:`, error)
      }
      throw error
    }
  }

  // Clothes API
  async getClothes(): Promise<ClothesItem[]> {
    return this.request<ClothesItem[]>('/api/clothes')
  }

  async getClothesItem(pid: string): Promise<ClothesItem> {
    return this.request<ClothesItem>(`/api/clothes/${pid}`)
  }

  async createClothesItem(data: Omit<ClothesItem, 'pid' | 'created_at' | 'updated_at'>): Promise<ClothesItem> {
    return this.request<ClothesItem>('/api/clothes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateClothesItem(pid: string, data: Partial<Omit<ClothesItem, 'pid' | 'created_at' | 'updated_at'>>): Promise<ClothesItem> {
    return this.request<ClothesItem>(`/api/clothes/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteClothesItem(pid: string): Promise<void> {
    return this.request<void>(`/api/clothes/${pid}`, {
      method: 'DELETE',
    })
  }

  // Coordinates API
  async getCoordinates(): Promise<Coordinate[]> {
    return this.request<Coordinate[]>('/api/coordinates')
  }

  async getCoordinate(pid: string): Promise<Coordinate> {
    return this.request<Coordinate>(`/api/coordinates/${pid}`)
  }

  async createCoordinate(data: Omit<Coordinate, 'pid' | 'created_at' | 'updated_at'>): Promise<Coordinate> {
    return this.request<Coordinate>('/api/coordinates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCoordinate(pid: string, data: Partial<Omit<Coordinate, 'pid' | 'created_at' | 'updated_at'>>): Promise<Coordinate> {
    return this.request<Coordinate>(`/api/coordinates/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCoordinate(pid: string): Promise<void> {
    return this.request<void>(`/api/coordinates/${pid}`, {
      method: 'DELETE',
    })
  }

  // Auth API
  async getCurrentUser(): Promise<User> {
    // Add auth token to request
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    return this.request<User>('/api/auth/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Token-Type': 'JWT',
      },
    })
  }

  async login(email: string, password: string): Promise<{ token: string; pid: string; name: string }> {
    return this.request<{ token: string; pid: string; name: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
    // Backend returns empty response for register, but we can call login after
    await this.request<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    
    // After successful registration, login to get token
    const loginResponse = await this.login(email, password)
    return {
      token: loginResponse.token,
      user: {
        pid: loginResponse.pid,
        name: loginResponse.name,
        email: email,
      }
    }
  }

  async forgotPassword(email: string): Promise<void> {
    return this.request<void>('/api/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    return this.request<void>('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // Form submission endpoints
  async submitClothesForm(data: Omit<ClothesItem, 'pid' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string; data: ClothesItem }> {
    return this.request<{ success: boolean; message: string; data: ClothesItem }>('/api/forms/clothes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitCoordinateForm(data: Omit<Coordinate, 'pid' | 'created_at' | 'updated_at'> & { clothes_ids: number[] }): Promise<{ success: boolean; message: string; data: Coordinate }> {
    return this.request<{ success: boolean; message: string; data: Coordinate }>('/api/forms/coordinates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateClothesForm(pid: string, data: Partial<Omit<ClothesItem, 'pid' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; message: string; data: ClothesItem }> {
    return this.request<{ success: boolean; message: string; data: ClothesItem }>(`/api/forms/clothes/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateCoordinateForm(pid: string, data: Partial<Omit<Coordinate, 'pid' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; message: string; data: Coordinate }> {
    return this.request<{ success: boolean; message: string; data: Coordinate }>(`/api/forms/coordinates/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Validation API
  async getValidationRules(): Promise<any> {
    return this.request<any>('/api/validation/rules')
  }

  async getFormOptions(): Promise<any> {
    return this.request<any>('/api/validation/options')
  }

  async validateField(data: { field_name: string; value: string; form_type: string }): Promise<{ valid: boolean; errors: any[] }> {
    return this.request<{ valid: boolean; errors: any[] }>('/api/validation/field', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiService = new ApiService()
export default apiService