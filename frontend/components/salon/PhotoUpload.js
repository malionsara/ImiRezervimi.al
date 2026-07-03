// frontend/components/salon/PhotoUpload.js
// Photo upload component for salon registration

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { showToast } from '../ToastProvider'

export default function PhotoUpload({ photos = [], onChange, maxPhotos = 5 }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast.warning('Ju lutemi zgjidhni vetëm foto (JPG, PNG, WebP)')
        return false
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.warning('Fotoja duhet të jetë më e vogël se 5MB')
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    // Check if we exceed max photos
    if (photos.length + validFiles.length > maxPhotos) {
      showToast.warning(`Mund të ngarkoni maksimumi ${maxPhotos} foto`)
      return
    }

    setUploading(true)

    // Convert files to base64 for preview (in a real app, you'd upload to Supabase Storage)
    const newPhotos = []
    let processed = 0

    validFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPhotos.push({
          id: Date.now() + index,
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        })
        
        processed++
        if (processed === validFiles.length) {
          onChange([...photos, ...newPhotos])
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files)
  }

  const handleRemovePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId)
    onChange(updatedPhotos)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-red-400 bg-accent-soft/60' 
            : 'border-linen hover:border-red-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*"
          multiple
          className="hidden"
        />
        
        <div className="space-y-2">
          <Camera size={36} strokeWidth={1.5} className="text-clay/70 mx-auto" aria-hidden="true" />
          <div>
            <p className="text-lg font-medium text-ink">
              {uploading ? 'Po ngarkohen...' : 'Ngarko foto të sallonit'}
            </p>
            <p className="text-sm text-clay">
              Tërhiq fotot këtu ose kliko për të zgjedhur
            </p>
          </div>
          <div className="text-xs text-clay/70">
            JPG, PNG, WebP deri në 5MB • Maksimumi {maxPhotos} foto
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-ink mb-3">
            Foto të ngarkuara ({photos.length}/{maxPhotos})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-sand">
                  <Image
                    src={photo.preview}
                    alt={`Salon photo ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Photo info */}
                <div className="mt-2">
                  <p className="text-xs text-clay truncate">{photo.name}</p>
                  <p className="text-xs text-clay/70">{formatFileSize(photo.size)}</p>
                </div>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePhoto(photo.id)
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-accent text-white rounded-full text-xs hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
                
                {/* Primary photo indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-success text-white text-xs px-2 py-1 rounded">
                    Kryesore
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-3">
        <div className="flex items-start">
          
          <div className="text-sm text-accent-strong">
            <p className="font-medium mb-1">Këshilla për foto më të mira:</p>
            <ul className="text-xs space-y-1">
              <li>• Përdorni foto me cilësi të lartë dhe dritë të mirë</li>
              <li>• Fotoja e parë do të jetë foto kryesore</li>
              <li>• Tregoni atmosferën dhe shërbimet e sallonit</li>
              <li>• Shmangni foto me persona pa leje</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}