// =====================================================
// PRIME MOTORS — src/services/inventory.js
// Supabase only. Admin-only fields excluded from public queries.
// =====================================================
import { supabase } from './supabase.js'
import { compressImages } from '../components/imageCompressor.js'

const PUBLIC_COLS = 'id,brand,model,year,price,km,fuel,trans,color,owner,images,status,created_at'

export async function fetchCars() {
  const { data, error } = await supabase
    .from('cars').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchAvailableCars() {
  const { data, error } = await supabase
    .from('cars').select(PUBLIC_COLS)
    .eq('status', 'available').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchAvailableCount() {
  const { count, error } = await supabase
    .from('cars').select('*', { count: 'exact', head: true }).eq('status', 'available')
  if (error) throw error
  return count || 0
}

export async function fetchCarById(id) {
  const { data, error } = await supabase
    .from('cars').select(PUBLIC_COLS).eq('id', id).single()
  if (error) throw error
  return data
}

export async function createCar(carData, imageFiles = []) {
  // Compress before upload
  if (imageFiles.length) imageFiles = await compressImages(imageFiles)
  const { data: inserted, error } = await supabase
    .from('cars').insert([{ ...carData, images: [], status: 'available' }])
    .select().single()
  if (error) throw error
  const urls = await uploadImages(imageFiles, inserted.id)
  if (urls.length) {
    const { data, error: e2 } = await supabase
      .from('cars').update({ images: urls }).eq('id', inserted.id).select().single()
    if (e2) throw e2
    return data
  }
  return inserted
}

export async function updateCar(id, carData, imageFiles = []) {
  let urls = carData.images || []
  if (imageFiles.length) {
    imageFiles = await compressImages(imageFiles)
    await deleteStorageImages(id)
    urls = await uploadImages(imageFiles, id)
  }
  const { data, error } = await supabase
    .from('cars').update({ ...carData, images: urls, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCar(id) {
  await deleteStorageImages(id)
  const { error } = await supabase.from('cars').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function markCarSold(id) {
  const { data, error } = await supabase
    .from('cars').update({ status: 'sold', updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

async function uploadImages(files, carId) {
  if (!files?.length) return []
  const urls = []
  for (const file of files) {
    if (!(file instanceof File)) continue
    const ext = file.name.split('.').pop()
    const path = `${carId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('car-images')
      .upload(path, file, { contentType: file.type })
    if (error) { console.error(error); continue }
    const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(path)
    urls.push(publicUrl)
  }
  return urls
}

async function deleteStorageImages(carId) {
  try {
    const { data } = await supabase.storage.from('car-images').list(`${carId}`)
    if (data?.length) await supabase.storage.from('car-images')
      .remove(data.map(f => `${carId}/${f.name}`))
  } catch {}
}
