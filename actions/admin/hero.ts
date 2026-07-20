// 'use server'

// import { createClient } from '@/lib/supabase/server'
// import { revalidatePath } from 'next/cache'

// async function checkAdminAuth(supabase: any) {
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return false

//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('role')
//     .eq('id', user.id)
//     .single()

//   return profile?.role === 'admin'
// }

// export async function getHeroSlides() {
//   const supabase = await createClient()
  
//   const { data } = await supabase
//     .from('hero_slides')
//     .select('*')
//     .order('display_order', { ascending: true })
//     .order('created_at', { ascending: true })

//   return data || []
// }

// export async function createHeroSlide(imageUrl: string, position: 'left' | 'right' = 'right') {
//   const supabase = await createClient()
//   const isAdmin = await checkAdminAuth(supabase)
//   if (!isAdmin) return { success: false, error: 'Unauthorized' }

//   // Check limit per position
//   const { count } = await supabase
//     .from('hero_slides')
//     .select('*', { count: 'exact', head: true })
//     .eq('position', position)

//   if (count && count >= 5) {
//     return { success: false, error: `Maximum 5 slides allowed for the ${position} side.` }
//   }

//   const { error } = await supabase
//     .from('hero_slides')
//     .insert([{
//       id: crypto.randomUUID(),
//       image_url: imageUrl,
//       is_active: true,
//       display_order: count || 0,
//       position: position
//     }])

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/', 'layout')
//   revalidatePath('/admin/hero-slides')
//   return { success: true }
// }

// export async function deleteHeroSlide(id: string) {
//   const supabase = await createClient()
//   const isAdmin = await checkAdminAuth(supabase)
//   if (!isAdmin) return { success: false, error: 'Unauthorized' }

//   const { error } = await supabase
//     .from('hero_slides')
//     .delete()
//     .eq('id', id)

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/', 'layout')
//   revalidatePath('/admin/hero-slides')
//   return { success: true }
// }

// export async function toggleHeroSlideStatus(id: string, isActive: boolean) {
//   const supabase = await createClient()
//   const isAdmin = await checkAdminAuth(supabase)
//   if (!isAdmin) return { success: false, error: 'Unauthorized' }

//   const { error } = await supabase
//     .from('hero_slides')
//     .update({ is_active: isActive })
//     .eq('id', id)

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/', 'layout')
//   revalidatePath('/admin/hero-slides')
//   return { success: true }
// }
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Keeps your secure administrative validation logic safe
async function checkAdminAuth(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

/**
 * 💡 UPDATED: Fetches your hero images directly out of the homepage_config row
 */
export async function getHeroSlides() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('homepage_config')
    .select('hero_images')
    .eq('id', 'main')
    .single()

  if (error || !data) return []
  return data.hero_images || []
}

/**
 * 💡 UPDATED: Replaces the old left/right query structure. Pushes a new uploaded image 
 * string or object right into your JSONB column array.
 */
export async function createHeroSlide(imageUrl: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Fetch your existing array data
  const { data: currentConfig } = await supabase
    .from('homepage_config')
    .select('hero_images')
    .eq('id', 'main')
    .single()

  const currentImages = Array.isArray(currentConfig?.hero_images) 
    ? currentConfig.hero_images 
    : []

  // 2. Enforce your maximum 6 slider item size constraint limit
  if (currentImages.length >= 6) {
    return { success: false, error: 'Maximum 6 slider image slots reached.' }
  }

  // 3. Append the new asset payload
  const updatedImages = [...currentImages, { url: imageUrl, label: `Slide ${currentImages.length + 1}` }]

  // 4. Update the single 'main' database configuration row mapping
  const { error } = await supabase
    .from('homepage_config')
    .upsert({
      id: 'main',
      hero_images: updatedImages,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) return { success: false, error: error.message }

  // Clear caches instantly so both administration and user interfaces reflect changes
  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

/**
 * 💡 NEW FEATURE ACTION: Allows re-saving the entire reordered or stripped 
 * list array directly from your client component.
 */
export async function updateHeroSlidesArray(updatedImagesArray: any[]) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('homepage_config')
    .upsert({
      id: 'main',
      hero_images: updatedImagesArray,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

/**
 * 💡 UPDATED: Removes a specific element out of the JSONB array by matching its URL path
 */
export async function deleteHeroSlide(urlToRemove: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Fetch current live arrays
  const { data: currentConfig } = await supabase
    .from('homepage_config')
    .select('hero_images')
    .eq('id', 'main')
    .single()

  const currentImages: any[] = Array.isArray(currentConfig?.hero_images) 
    ? currentConfig.hero_images 
    : []

  // 2. Filter out the image element target
  const updatedImages = currentImages.filter((img: any) => {
    const url = typeof img === 'string' ? img : (img.url || img.image)
    return url !== urlToRemove
  })

  // 3. Upsert clean dataset array back
  const { error } = await supabase
    .from('homepage_config')
    .upsert({
      id: 'main',
      hero_images: updatedImages,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}
