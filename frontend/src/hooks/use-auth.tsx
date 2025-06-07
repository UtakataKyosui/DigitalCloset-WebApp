'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiService } from '@/lib/api'

interface User {
  pid: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedPid = localStorage.getItem('user_pid')
        const storedName = localStorage.getItem('user_name')

        if (storedToken && storedPid && storedName) {
          setToken(storedToken)
          
          // Try to get current user info from API to verify token is still valid
          try {
            const currentUser = await apiService.getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            // Token is invalid, clear stored data
            console.warn('Stored token is invalid, clearing auth data')
            clearAuthData()
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const clearAuthData = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_pid')
    localStorage.removeItem('user_name')
    setToken(null)
    setUser(null)
  }

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('user_pid', newUser.pid)
    localStorage.setItem('user_name', newUser.name)
  }

  const logout = () => {
    clearAuthData()
  }

  const refreshUser = async () => {
    if (!token) return

    try {
      const currentUser = await apiService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
      // If refresh fails, logout user
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protecting routes that require authentication
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login page or show auth modal
      window.location.href = '/auth'
    }
  }, [auth.isLoading, auth.isAuthenticated])

  return auth
}

// Hook for checking if user is authenticated
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth()
  return { isAuthenticated, isLoading }
}