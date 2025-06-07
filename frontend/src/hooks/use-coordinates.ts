"use client"

import { useState, useEffect } from 'react'
import { apiService, type Coordinate } from '@/lib/api'

export function useCoordinates() {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoordinates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getCoordinates()
      setCoordinates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coordinates')
      console.error('Error fetching coordinates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoordinates()
  }, [])

  const createCoordinate = async (data: Omit<Coordinate, 'pid' | 'created_at' | 'updated_at'>) => {
    try {
      const newCoordinate = await apiService.createCoordinate(data)
      setCoordinates(prev => [...prev, newCoordinate])
      return newCoordinate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coordinate')
      throw err
    }
  }

  const updateCoordinate = async (pid: string, data: Partial<Omit<Coordinate, 'pid' | 'created_at' | 'updated_at'>>) => {
    try {
      const updatedCoordinate = await apiService.updateCoordinate(pid, data)
      setCoordinates(prev => prev.map(coord => coord.pid === pid ? updatedCoordinate : coord))
      return updatedCoordinate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coordinate')
      throw err
    }
  }

  const deleteCoordinate = async (pid: string) => {
    try {
      await apiService.deleteCoordinate(pid)
      setCoordinates(prev => prev.filter(coord => coord.pid !== pid))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coordinate')
      throw err
    }
  }

  return {
    coordinates,
    loading,
    error,
    refetch: fetchCoordinates,
    createCoordinate,
    updateCoordinate,
    deleteCoordinate,
  }
}