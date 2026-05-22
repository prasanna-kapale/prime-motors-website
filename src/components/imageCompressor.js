// =====================================================
// PRIME MOTORS — src/components/imageCompressor.js
// Client-side image compression before Supabase upload
// Uses canvas API — no dependencies
// =====================================================

const MAX_WIDTH  = 1280  // px
const MAX_HEIGHT = 1280  // px
const QUALITY    = 0.82  // WebP/JPEG quality
const MAX_SIZE_MB = 1.5  // skip compression if already under this

/**
 * Compress a File before upload.
 * Returns a new File (WebP preferred, JPEG fallback).
 */
export async function compressImage(file) {
  // Skip non-images or already small files
  if (!file.type.startsWith('image/')) return file
  if (file.size < MAX_SIZE_MB * 1024 * 1024) {
    // Still resize if dimensions are huge
    const img = await loadImage(file)
    if (img.width <= MAX_WIDTH && img.height <= MAX_HEIGHT) return file
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions keeping aspect ratio
      let { width, height } = img
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP first, fall back to JPEG
      const tryWebP = canvas.toDataURL('image/webp', QUALITY)
      const isWebPSupported = tryWebP.startsWith('data:image/webp')

      const mimeType = isWebPSupported ? 'image/webp' : 'image/jpeg'
      const ext      = isWebPSupported ? 'webp' : 'jpg'

      canvas.toBlob(blob => {
        if (!blob) { resolve(file); return }

        // Only use compressed version if it's actually smaller
        if (blob.size >= file.size) { resolve(file); return }

        const baseName = file.name.replace(/\.[^.]+$/, '')
        const newFile  = new File([blob], `${baseName}.${ext}`, {
          type: mimeType, lastModified: Date.now(),
        })

        console.log(`Compressed: ${(file.size/1024).toFixed(0)}KB → ${(newFile.size/1024).toFixed(0)}KB (${ext})`)
        resolve(newFile)
      }, mimeType, QUALITY)
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

/** Compress multiple files in parallel */
export async function compressImages(files) {
  return Promise.all(files.map(f => compressImage(f)))
}

function loadImage(file) {
  return new Promise(resolve => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.src = url
  })
}
