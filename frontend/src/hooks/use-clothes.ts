"use client"

import { useState, useEffect } from 'react'
import { apiService, type ClothesItem } from '@/lib/api'

export function useClothes() {
  const [clothes, setClothes] = useState<ClothesItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClothes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getClothes()
      setClothes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clothes')
      console.error('Error fetching clothes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClothes()
  }, [])

  const createClothesItem = async (data: Omit<ClothesItem, 'pid' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem = await apiService.createClothesItem(data)
      setClothes(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create clothes item')
      throw err
    }
  }

  const updateClothesItem = async (pid: string, data: Partial<Omit<ClothesItem, 'pid' | 'created_at' | 'updated_at'>>) => {
    try {
      const updatedItem = await apiService.updateClothesItem(pid, data)
      setClothes(prev => prev.map(item => item.pid === pid ? updatedItem : item))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update clothes item')
      throw err
    }
  }

  const deleteClothesItem = async (pid: string) => {
    try {
      await apiService.deleteClothesItem(pid)
      setClothes(prev => prev.filter(item => item.pid !== pid))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete clothes item')
      throw err
    }
  }

  return {
    clothes,
    loading,
    error,
    refetch: fetchClothes,
    createClothesItem,
    updateClothesItem,
    deleteClothesItem,
  }
}