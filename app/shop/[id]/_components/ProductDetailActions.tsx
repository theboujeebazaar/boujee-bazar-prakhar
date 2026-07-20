'use client'

import React, { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import { SITE } from '@/lib/data'
import { ShoppingBag, CreditCard, Plus, Minus } from 'lucide-react'

export type ProductVariant = {
  id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
}

type ProductItem = {
  id: string
  name: string
  image_url: string | string[] // ✅ Fixed type to safely support string or array formats
  category_name?: string
  variants: ProductVariant[]
}

export default function ProductDetailActions({ product }: { product: ProductItem }) {
  const { addToCart, cart } = useCart()
  const { showToast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  )

  const currentPrice = selectedVariant ? selectedVariant.price : 0
  const currentoriginalPrice = selectedVariant ? selectedVariant.original_price : null

  const cartItemId = `${product.id}-${selectedVariant?.id || 'default'}`
  const cartItem = cart.find(item => item.cartItemId === cartItemId)
  const currentQty = cartItem ? cartItem.quantity : 0

  // ✅ Clean helper resolves array states vs single image strings safely from page.tsx props
  const resolvedImageUrl = Array.isArray(product.image_url) 
    ? product.image_url[0] 
    : (product.image_url || '/assets/img/placeholder.jpeg')

  const handleAdd = () => {
    if (product.variants.length > 0 && !selectedVariant) {
      showToast("Please select a size/variant first.", "error")
      return
    }

    if (selectedVariant && selectedVariant.stock_quantity < quantity) {
      showToast("Not enough stock available for this variant.", "error")
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        image_url: resolvedImageUrl, // ✅ Passed the safely resolved image string link here
        category_name: product.category_name,
        variant_id: selectedVariant?.id,
        variant_name: selectedVariant?.variant_name
      })
    }
    showToast(`${quantity} × ${product.name} added to cart successfully!`, "success")
  }

  const handleBuyNow = () => {
    handleAdd()
    router.push('/checkout')
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Dynamic Price Display */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-baseline gap-3">
          {/* ✅ FIXED: Changed text color from text-emerald to neutral-900 */}
          <span className="font-semibold text-3xl text-neutral-900">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {currentoriginalPrice && (
            <span className="text-neutral-400 text-lg line-through font-medium">
              ₹{currentoriginalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      {product.variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[13px] uppercase tracking-widest font-bold text-neutral-800">Select Size / Variant</span>
            {selectedVariant && (
              /* ✅ FIXED: Swapped color to elegant neutral text layouts */
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {selectedVariant.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock_quantity <= 0}
                /* ✅ FIXED: Changed colors from green highlights to your signature Boujee Gold border theme style */
                className={`relative min-w-[3.5rem] h-12 px-5 rounded-xl text-[14px] font-bold flex items-center justify-center transition-all duration-300 border-2 overflow-hidden ${
                  selectedVariant?.id === variant.id
                    ? "border-[#c5a880] text-[#c5a880] bg-[#FBF7F0] shadow-xs scale-[1.01]"
                    : "border-neutral-200 text-neutral-800 hover:border-[#c5a880]/60 hover:bg-[#FBF7F0]/40"
                } ${variant.stock_quantity <= 0 ? "opacity-30 cursor-not-allowed bg-neutral-50 text-neutral-400 border-neutral-200 line-through" : ""}`}
              >
                {variant.variant_name}
                {selectedVariant?.id === variant.id && (
                  /* ✅ FIXED: Accent indicator badge tag changed to signature Boujee Gold color token */
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#c5a880] rounded-bl-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions Section Panel */}
      <div className="space-y-5 pt-4 border-t border-neutral-100">
        {/* Info text if in cart */}
        {currentQty > 0 && (
          <div className="flex">
            {/* ✅ FIXED: Swapped out green pills for an elegant neutral cream status badge tag sticker */}
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 bg-[#FBF7F0] border border-neutral-200/60 px-3.5 py-1.5 rounded-lg shadow-2xs">
              {currentQty} currently in your cart
            </span>
          </div>
        )}

        {/* Quantity Control Buttons Row */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] uppercase tracking-widest font-bold text-neutral-800">Quantity</span>
          {/* ✅ FIXED: Restyled layout frame wrapper to match minimalist boutique standards */}
          <div className="flex items-center border border-neutral-200 bg-white rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2 hover:text-[#c5a880] text-neutral-500 transition-colors rounded-lg hover:bg-neutral-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 font-bold text-neutral-900 text-sm w-8 text-center select-none">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="p-2 hover:text-[#c5a880] text-neutral-500 transition-colors rounded-lg hover:bg-neutral-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Checkout CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* ✅ FIXED: Swapped green block for solid, high-contrast premium charcoal black boutique button style */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.variants.length > 0 && !selectedVariant}
            className="w-full py-3.5 px-6 bg-neutral-950 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>

          {/* ✅ FIXED: Swapped green outline button for an upscale minimalist gold outline theme accent button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.variants.length > 0 && !selectedVariant}
            className="w-full py-3.5 px-6 border-2 border-[#c5a880] text-[#c5a880] font-semibold rounded-xl bg-white hover:bg-[#FBF7F0] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            <CreditCard className="w-4 h-4" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
