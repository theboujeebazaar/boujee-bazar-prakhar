'use client'

import { useState } from 'react'
import ProductGallery from './ProductGallery'
import ProductDetailActions, { type ProductVariant } from './ProductDetailActions'

type GalleryImage = {
  image_url: string
  color_name: string | null
}

type ProductViewSectionProps = {
  product: {
    id: string
    name: string
    category_name?: string
    subcategory?: string | null
    description?: string | null
    price: number
    originalPrice?: number | null
    stock?: number
    available?: boolean
  }
  variants: ProductVariant[]
  images: GalleryImage[]
  badge?: string
  avgRating?: number
  reviewCount?: number
}

export default function ProductViewSection({ product, variants, images, badge, avgRating = 0, reviewCount = 0 }: ProductViewSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )

  // Images tagged for the selected color, plus any untagged/general images shared across colors.
  const filteredImages = images
    .filter((img) => !img.color_name || img.color_name.toLowerCase().trim() === selectedVariant?.variant_name?.toLowerCase().trim())
    .map((img) => img.image_url)

  const displayImages = filteredImages.length > 0 ? filteredImages : images.map((img) => img.image_url)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Remount the gallery on color change so its active thumbnail resets to the new image set */}
      <ProductGallery key={selectedVariant?.id || 'default'} images={displayImages} productName={product.name} badge={badge} />

      <div className="space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#c5a880] font-bold">
            {product.category_name} {product.subcategory && `• ${product.subcategory}`}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-neutral-900 mt-2 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
            {reviewCount > 0 ? (
              <>
                <div className="flex text-[#c5a880]">
                  {'★'.repeat(Math.round(avgRating))}
                  <span className="text-neutral-200">{'★'.repeat(5 - Math.round(avgRating))}</span>
                </div>
                <span className="font-semibold text-neutral-800">{avgRating.toFixed(1)} ★</span>
                <span className="text-neutral-400">({reviewCount} review{reviewCount === 1 ? '' : 's'})</span>
              </>
            ) : (
              <span className="text-neutral-400">No reviews yet</span>
            )}
            <span className="text-neutral-200">|</span>
            <span>Waterproof & Anti-Tarnish</span>
          </div>
        </div>

        <ProductDetailActions
          product={{
            id: product.id,
            name: product.name,
            image_url: displayImages[0] || '/assets/img/placeholder.jpeg',
            category_name: product.category_name,
            variants,
            price: product.price,
            originalPrice: product.originalPrice,
            stock: product.stock,
            available: product.available,
          }}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />

        {product.description && (
          <div className="font-body text-neutral-600 text-sm leading-relaxed pt-2">
            <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Secure Payment Options</span>
          <div className="flex gap-3 text-neutral-400 text-xl">
            <i className="fa-brands fa-cc-visa" title="Visa"></i>
            <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
            <i className="fa-brands fa-cc-rupay" title="Rupay"></i>
            <i className="fa-solid fa-credit-card" title="UPI & Net Banking"></i>
          </div>
        </div>
      </div>
    </div>
  )
}
