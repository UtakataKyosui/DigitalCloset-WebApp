'use client'

import { useState } from 'react'
import { ClothesForm } from '@/components/clothes-form'
import { CoordinateForm } from '@/components/coordinate-form'
import { Button } from '@/components/ui/button'
import { ClothesItem, Coordinate } from '@/lib/api'

type ActiveForm = 'clothes' | 'coordinate' | null

export default function FormsPage() {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSuccess = (data: ClothesItem | Coordinate) => {
    setMessage({
      type: 'success',
      text: `Successfully ${activeForm === 'clothes' ? 'created clothes item' : 'created coordinate'}: ${data.name}`
    })
    // Auto-hide message after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  const handleError = (error: string) => {
    setMessage({
      type: 'error',
      text: `Error: ${error}`
    })
    // Auto-hide message after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Digital Closet Forms
          </h1>
          <p className="text-gray-600 mb-6">
            Create new clothes items and coordinates for your digital closet
          </p>
          
          {/* Form Selection Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setActiveForm('clothes')}
              variant={activeForm === 'clothes' ? 'default' : 'outline'}
              size="lg"
            >
              Add Clothes Item
            </Button>
            <Button
              onClick={() => setActiveForm('coordinate')}
              variant={activeForm === 'coordinate' ? 'default' : 'outline'}
              size="lg"
            >
              Create Coordinate
            </Button>
            {activeForm && (
              <Button
                onClick={() => setActiveForm(null)}
                variant="ghost"
                size="lg"
              >
                Hide Forms
              </Button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex justify-between items-center">
              <p>{message.text}</p>
              <button
                onClick={() => setMessage(null)}
                className="text-lg font-semibold hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Forms */}
        <div className="max-w-4xl mx-auto">
          {activeForm === 'clothes' && (
            <div className="mb-8">
              <ClothesForm
                onSuccess={handleSuccess}
                onError={handleError}
                mode="create"
              />
            </div>
          )}

          {activeForm === 'coordinate' && (
            <div className="mb-8">
              <CoordinateForm
                onSuccess={handleSuccess}
                onError={handleError}
                mode="create"
              />
            </div>
          )}

          {!activeForm && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Choose a form to get started
              </h3>
              <p className="text-gray-500">
                Select "Add Clothes Item" or "Create Coordinate" to begin adding items to your digital closet
              </p>
            </div>
          )}
        </div>

        {/* API Information */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">API Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Clothes Form Endpoints:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/forms/clothes</code> - Create clothes item</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">PUT /api/forms/clothes/{`{pid}`}</code> - Update clothes item</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Coordinate Form Endpoints:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/forms/coordinates</code> - Create coordinate</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">PUT /api/forms/coordinates/{`{pid}`}</code> - Update coordinate</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
            <strong>Backend URL:</strong> http://localhost:5150
          </div>
        </div>
      </div>
    </div>
  )
}