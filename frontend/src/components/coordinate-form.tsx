'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiService, Coordinate, ClothesItem } from '@/lib/api'

interface CoordinateFormData {
  name: string
  description: string
  occasion: string
  season: string
  style: string
  userId: string
  isFavorite: boolean
  imageUrl: string
  clothesIds: number[]
}

interface CoordinateFormProps {
  onSuccess?: (coordinate: Coordinate) => void
  onError?: (error: string) => void
  initialData?: Partial<CoordinateFormData>
  mode?: 'create' | 'edit'
  coordinatePid?: string
}

export function CoordinateForm({ 
  onSuccess, 
  onError, 
  initialData, 
  mode = 'create',
  coordinatePid 
}: CoordinateFormProps) {
  const [formData, setFormData] = useState<CoordinateFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    occasion: initialData?.occasion || '',
    season: initialData?.season || '',
    style: initialData?.style || '',
    userId: initialData?.userId || '1', // Default user ID for demo
    isFavorite: initialData?.isFavorite ?? false,
    imageUrl: initialData?.imageUrl || '',
    clothesIds: initialData?.clothesIds || [],
  })

  const [availableClothes, setAvailableClothes] = useState<ClothesItem[]>([])
  const [selectedClothes, setSelectedClothes] = useState<ClothesItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingClothes, setIsLoadingClothes] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load available clothes items
  useEffect(() => {
    const loadClothes = async () => {
      setIsLoadingClothes(true)
      try {
        const clothes = await apiService.getClothes()
        setAvailableClothes(clothes)
        
        // Set selected clothes based on initial data
        if (initialData?.clothesIds) {
          const selected = clothes.filter(item => 
            initialData.clothesIds!.includes(parseInt(item.pid))
          )
          setSelectedClothes(selected)
        }
      } catch (error) {
        console.error('Failed to load clothes:', error)
        onError?.('Failed to load clothes items')
      } finally {
        setIsLoadingClothes(false)
      }
    }

    loadClothes()
  }, [initialData?.clothesIds, onError])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    
    const userId = parseInt(formData.userId)
    if (!formData.userId.trim() || isNaN(userId) || userId <= 0) {
      newErrors.userId = 'Valid user ID is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        occasion: formData.occasion.trim() || undefined,
        season: formData.season.trim() || undefined,
        style: formData.style.trim() || undefined,
        user_id: parseInt(formData.userId),
        is_favorite: formData.isFavorite,
        image_url: formData.imageUrl.trim() || undefined,
        clothes_ids: formData.clothesIds,
      }

      let result: Coordinate

      if (mode === 'edit' && coordinatePid) {
        // For edit mode, we'll use the coordinate update endpoint
        const updateData = {
          name: submitData.name,
          description: submitData.description,
          occasion: submitData.occasion,
          season: submitData.season,
          style: submitData.style,
          is_favorite: submitData.is_favorite,
          image_url: submitData.image_url,
        }
        const response = await apiService.updateCoordinateForm(coordinatePid, updateData)
        result = response.data
      } else {
        const response = await apiService.submitCoordinateForm(submitData)
        result = response.data
      }

      onSuccess?.(result)
      
      // Reset form if creating new coordinate
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          occasion: '',
          season: '',
          style: '',
          userId: '1',
          isFavorite: false,
          imageUrl: '',
          clothesIds: [],
        })
        setSelectedClothes([])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form'
      onError?.(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CoordinateFormData, value: string | boolean | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleClothesSelection = (clothesItem: ClothesItem) => {
    const clothesId = parseInt(clothesItem.pid)
    const isSelected = formData.clothesIds.includes(clothesId)
    
    if (isSelected) {
      // Remove from selection
      const newClothesIds = formData.clothesIds.filter(id => id !== clothesId)
      const newSelectedClothes = selectedClothes.filter(item => item.pid !== clothesItem.pid)
      
      handleInputChange('clothesIds', newClothesIds)
      setSelectedClothes(newSelectedClothes)
    } else {
      // Add to selection
      const newClothesIds = [...formData.clothesIds, clothesId]
      const newSelectedClothes = [...selectedClothes, clothesItem]
      
      handleInputChange('clothesIds', newClothesIds)
      setSelectedClothes(newSelectedClothes)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Edit Coordinate' : 'Create New Coordinate'}</CardTitle>
        <CardDescription>
          {mode === 'edit' ? 'Update the coordinate details' : 'Create a new outfit coordination'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Summer Casual, Business Meeting, etc."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                type="number"
                min="1"
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                placeholder="1"
                className={errors.userId ? 'border-red-500' : ''}
              />
              {errors.userId && <p className="text-sm text-red-500">{errors.userId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Input
                id="occasion"
                value={formData.occasion}
                onChange={(e) => handleInputChange('occasion', e.target.value)}
                placeholder="Casual, Formal, Party, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) => handleInputChange('season', e.target.value)}
                placeholder="Spring, Summer, Fall, Winter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                placeholder="Minimalist, Bohemian, Classic, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of the coordinate..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite}
              onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="isFavorite">Mark as Favorite</Label>
          </div>

          {/* Clothes Selection */}
          <div className="space-y-4">
            <div>
              <Label>Select Clothes Items</Label>
              <p className="text-sm text-gray-600">Choose clothes items to include in this coordinate</p>
            </div>
            
            {selectedClothes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Items:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedClothes.map((item) => (
                    <Badge
                      key={item.pid}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleClothesSelection(item)}
                    >
                      {item.name} ({item.brand})
                      <span className="ml-1">×</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isLoadingClothes ? (
              <p>Loading available clothes...</p>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                {availableClothes.length === 0 ? (
                  <p className="text-gray-500">No clothes items available. Create some clothes first.</p>
                ) : (
                  availableClothes.map((item) => {
                    const isSelected = formData.clothesIds.includes(parseInt(item.pid))
                    return (
                      <div
                        key={item.pid}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleClothesSelection(item)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.brand} • {item.category} • {item.color}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="text-blue-600 font-medium">✓</div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {errors.submit}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoadingClothes}
            className="w-full"
          >
            {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Coordinate' : 'Create Coordinate')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}