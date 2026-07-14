// 'use server'

// import { createClient } from '@/lib/supabase/server'
// import { revalidatePath } from 'next/cache'

// export async function addToCart(variantId: string, quantity: number = 1) {
//   const supabase = await createClient()

//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) {
//     return { success: false, error: 'Please log in to add items to your cart.', requiresLogin: true }
//   }

//   // Check if this variant already exists in the user's cart
//   const { data: existing } = await supabase
//     .from('cart_items')
//     .select('id, quantity')
//     .eq('user_id', user.id)
//     .eq('variant_id', variantId)
//     .single()

//   if (existing) {
//     // Update quantity
//     const newQty = existing.quantity + quantity
//     const { error } = await supabase
//       .from('cart_items')
//       .update({ quantity: newQty })
//       .eq('id', existing.id)

//     if (error) return { success: false, error: error.message }
//   } else {
//     // Insert new
//     const { error } = await supabase
//       .from('cart_items')
//       .insert([{ user_id: user.id, variant_id: variantId, quantity }])

//     if (error) return { success: false, error: error.message }
//   }

//   revalidatePath('/cart')
//   return { success: true }
// }

// export async function removeFromCart(cartItemId: string) {
//   const supabase = await createClient()

//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return { success: false, error: 'Unauthorized' }

//   const { error } = await supabase
//     .from('cart_items')
//     .delete()
//     .eq('id', cartItemId)
//     .eq('user_id', user.id)

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/cart')
//   return { success: true }
// }

// export async function updateCartQuantity(cartItemId: string, quantity: number) {
//   const supabase = await createClient()

//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return { success: false, error: 'Unauthorized' }

//   if (quantity <= 0) {
//     return removeFromCart(cartItemId)
//   }

//   const { error } = await supabase
//     .from('cart_items')
//     .update({ quantity })
//     .eq('id', cartItemId)
//     .eq('user_id', user.id)

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/cart')
//   return { success: true }
// }

// export async function getCart() {
//   const supabase = await createClient()

//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return { success: false, error: 'Not logged in', items: [] }

//   const { data, error } = await supabase
//     .from('cart_items')
//     .select(`
//       id,
//       quantity,
//       variant_id,
//       product_variants (
//         id,
//         variant_name,
//         price,
//         original_price,
//         stock_quantity,
//         is_active,
//         product_id,
//         products (
//           id,
//           name,
//           slug,
//           featured_image_url
//         )
//       )
//     `)
//     .eq('user_id', user.id)
//     .order('created_at', { ascending: false })

//   if (error) return { success: false, error: error.message, items: [] }

//   return { success: true, items: data || [] }
// }

// export async function getCartCount() {
//   const supabase = await createClient()

//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return 0

//   const { data } = await supabase
//     .from('cart_items')
//     .select('quantity')
//     .eq('user_id', user.id)

//   if (!data) return 0

//   return data.reduce((sum, item) => sum + item.quantity, 0)
// }
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Helper to extract cart data directly from secure cookies instead of database tables
async function getCookieCartArray(): Promise<any[]> {
  const cookieStore = await cookies()
  const currentCartString = cookieStore.get('boujee-cart-token')?.value
  if (!currentCartString) return []
  try {
    return JSON.parse(decodeURIComponent(currentCartString))
  } catch {
    return []
  }
}

// Helper to save data back into cookies safely
async function saveCookieCartArray(cartArray: any[]) {
  const cookieStore = await cookies()
  cookieStore.set('boujee-cart-token', encodeURIComponent(JSON.stringify(cartArray)), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // Kept alive for 7 days
    httpOnly: false, // Allows frontend JS hydration channels to read it right away
    sameSite: 'lax'
  })
}

export async function addToCart(productId: string, quantity: number = 1, productDetails?: any) {
  let cartItems = await getCookieCartArray()

  const existingItemIndex = cartItems.findIndex((item: any) => item.id === productId)
  
  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity
  } else {
    // If no details provided, create clean base schema boundaries
    cartItems.push({
      id: productId,
      cartItemId: productId + '-' + Date.now(),
      name: productDetails?.name || 'Jewelry Piece',
      price: productDetails?.price || 0,
      image: productDetails?.image || '/assets/img/placeholder.jpeg',
      quantity: quantity,
      category_name: productDetails?.category_name || 'Jewelry'
    })
  }

  await saveCookieCartArray(cartItems)
  //revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true }
}

export async function removeFromCart(cartItemId: string) {
  let cartItems = await getCookieCartArray()
  cartItems = cartItems.filter((item: any) => item.cartItemId !== cartItemId && item.id !== cartItemId)
  
  await saveCookieCartArray(cartItems)
 // revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  const cartItems = await getCookieCartArray()
  const targetItem = cartItems.find((item: any) => item.cartItemId === cartItemId || item.id === cartItemId)
  
  if (targetItem) {
    targetItem.quantity = quantity
    await saveCookieCartArray(cartItems)
  }

  //revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true }
}

export async function getCart() {
  const cartItems = await getCookieCartArray()
  
  // Maps standard properties expected by your CheckoutForm elements safely
  const formattedItems = cartItems.map((item: any) => ({
    id: item.id,
    cartItemId: item.cartItemId || item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    image_url: item.image, // Backward compatibility bridge
    quantity: item.quantity,
    variant_name: item.category_name || 'Luxury Edition'
  }))

  return { success: true, items: formattedItems }
}

export async function getCartCount() {
  const cartItems = await getCookieCartArray()
  return cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
}
