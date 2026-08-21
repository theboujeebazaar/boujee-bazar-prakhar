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
  stock_quantity: number
  color_hex?: string
}

type ProductItem = {
  id: string
  name: string
  image_url: string | string[] // ✅ Fixed type to safely support string or array formats
  category_name?: string
  variants: ProductVariant[]
  price: number
  originalPrice?: number | null
  stock?: number
  available?: boolean
}

type ProductDetailActionsProps = {
  product: ProductItem
  selectedVariant?: ProductVariant | null
  onSelectVariant?: (variant: ProductVariant) => void
}

export default function ProductDetailActions({ product, selectedVariant: controlledVariant, onSelectVariant }: ProductDetailActionsProps) {
  const { addToCart, cart } = useCart()
  const { showToast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [internalVariant, setInternalVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  )

  // Color selection can be driven by a parent (so it can also swap the gallery images) or managed locally.
  const selectedVariant = onSelectVariant ? controlledVariant ?? null : internalVariant
  const setSelectedVariant = onSelectVariant || setInternalVariant

  const isSelectedVariantSoldOut = selectedVariant ? selectedVariant.stock_quantity <= 0 : false
  const isProductSoldOut = (product.available !== undefined && product.available === false) || (typeof product.stock === 'number' && product.stock <= 0)
  const productSoldOut = isProductSoldOut || isSelectedVariantSoldOut

  // Price is a single product-level value shared across all colors — only stock varies by color.
  const currentPrice = product.price
  const currentoriginalPrice = product.originalPrice ?? null

  const maxQty = selectedVariant && selectedVariant.stock_quantity > 0
    ? selectedVariant.stock_quantity
    : typeof product.stock === 'number' && product.stock > 0
      ? product.stock
      : 999

  const cartItemId = `${product.id}-${selectedVariant?.id || 'default'}`
  const cartItem = cart.find(item => item.cartItemId === cartItemId)
  const currentQty = cartItem ? cartItem.quantity : 0

  // ✅ Clean helper resolves array states vs single image strings safely from page.tsx props
  const resolvedImageUrl = Array.isArray(product.image_url)
    ? product.image_url[0]
    : (product.image_url || '/assets/img/placeholder.jpeg')

  const handleAdd = () => {
    if (productSoldOut) {
      showToast("This piece is sold out.", "error")
      return
    }

    if (product.variants.length > 0 && !selectedVariant) {
      showToast("Please select a color first.", "error")
      return
    }

    if (selectedVariant && selectedVariant.stock_quantity < quantity) {
      showToast("Not enough stock available for this color.", "error")
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
        variant_name: selectedVariant?.variant_name,
        variant_color_hex: selectedVariant?.color_hex
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
        {productSoldOut ? (
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
            Sold Out
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            In Stock
          </span>
        )}
      </div>

      {/* Variant Selector */}
      {product.variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[13px] uppercase tracking-widest font-bold text-neutral-800">Select Color</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock_quantity <= 0}
                /* ✅ FIXED: Changed colors from green highlights to your signature Boujee Gold border theme style */
                className={`relative min-w-[3.5rem] h-12 pl-3.5 pr-5 rounded-xl text-[14px] font-bold flex items-center gap-2 justify-center transition-all duration-300 border-2 overflow-hidden ${selectedVariant?.id === variant.id
                    ? "border-[#c5a880] text-[#c5a880] bg-[#FBF7F0] shadow-xs scale-[1.01]"
                    : "border-neutral-200 text-neutral-800 hover:border-[#c5a880]/60 hover:bg-[#FBF7F0]/40"
                  } ${variant.stock_quantity <= 0 ? "opacity-30 cursor-not-allowed bg-neutral-50 text-neutral-400 border-neutral-200 line-through" : ""}`}
              >
                {variant.color_hex && (
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: variant.color_hex }}
                  />
                )}
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

        {productSoldOut ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              Sold Out
            </span>
            <p className="mt-2.5 text-sm text-neutral-500 leading-relaxed">
              This piece is currently sold out. Keep an eye on our new drops or
              reach out to us on WhatsApp to be notified when it's back.
            </p>
          </div>
        ) : (
          <>
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
                  onClick={() => setQuantity(q => Math.min(q + 1, maxQty))}
                  disabled={quantity >= maxQty}
                  className="p-2 hover:text-[#c5a880] text-neutral-500 transition-colors rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {maxQty < 999 && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${maxQty <= 5
                    ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                    : "bg-neutral-50 text-neutral-600 border border-neutral-200/60"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${maxQty <= 5 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    }`} />
                  {maxQty <= 5 ? `Only ${maxQty} left in stock` : `${maxQty} available in stock`}
                </span>
              )}
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
                className="w-full py-3.5 px-6 border-2 border-[#a68860] text-white bg-[#a68860] hover:bg-[#917551] hover:border-[#917551] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm rounded-xl"
              >
                <CreditCard className="w-4 h-4" /> Buy Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
