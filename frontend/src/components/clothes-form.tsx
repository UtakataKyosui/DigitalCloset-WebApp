'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService, ClothesItem } from '@/lib/api'

interface ClothesFormData {
  name: string
  description: string
  brand: string
  category: string
  size: string
  color: string
  material: string
  price: string
  inStock: boolean
  stockQuantity: string
  imageUrl: string
}

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
  const [formData, setFormData] = useState<ClothesFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    brand: initialData?.brand || '',
    category: initialData?.category || '',
    size: initialData?.size || '',
    color: initialData?.color || '',
    material: initialData?.material || '',
    price: initialData?.price || '',
    inStock: initialData?.inStock ?? true,
    stockQuantity: initialData?.stockQuantity || '1',
    imageUrl: initialData?.imageUrl || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.size.trim()) newErrors.size = 'Size is required'
    if (!formData.color.trim()) newErrors.color = 'Color is required'
    
    const price = parseFloat(formData.price)
    if (!formData.price.trim() || isNaN(price) || price < 0) {
      newErrors.price = 'Valid price is required'
    }

    const quantity = parseInt(formData.stockQuantity)
    if (!formData.stockQuantity.trim() || isNaN(quantity) || quantity < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required'
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
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        size: formData.size.trim(),
        color: formData.color.trim(),
        material: formData.material.trim() || undefined,
        price: parseFloat(formData.price),
        in_stock: formData.inStock,
        stock_quantity: parseInt(formData.stockQuantity),
        image_url: formData.imageUrl.trim() || undefined,
      }

      let result: ClothesItem

      if (mode === 'edit' && clothesPid) {
        const response = await apiService.updateClothesForm(clothesPid, submitData)
        result = response.data
      } else {
        const response = await apiService.submitClothesForm(submitData)
        result = response.data
      }

      onSuccess?.(result)
      
      // Reset form if creating new item
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          brand: '',
          category: '',
          size: '',
          color: '',
          material: '',
          price: '',
          inStock: true,
          stockQuantity: '1',
          imageUrl: '',
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form'
      onError?.(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ClothesFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Edit Clothes Item' : 'Add New Clothes Item'}</CardTitle>
        <CardDescription>
          {mode === 'edit' ? 'Update the clothes item details' : 'Fill in the details for your new clothes item'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="T-shirt, Jeans, etc."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Nike, Adidas, etc."
                className={errors.brand ? 'border-red-500' : ''}
              />
              {errors.brand && <p className="text-sm text-red-500">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Tops, Bottoms, Shoes, etc."
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="S, M, L, XL, etc."
                className={errors.size ? 'border-red-500' : ''}
              />
              {errors.size && <p className="text-sm text-red-500">{errors.size}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="Red, Blue, Black, etc."
                className={errors.color ? 'border-red-500' : ''}
              />
              {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                placeholder="Cotton, Polyester, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="29.99"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                placeholder="1"
                className={errors.stockQuantity ? 'border-red-500' : ''}
              />
              {errors.stockQuantity && <p className="text-sm text-red-500">{errors.stockQuantity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description..."
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={(e) => handleInputChange('inStock', e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="inStock">In Stock</Label>
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
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Clothes Item' : 'Create Clothes Item')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}