'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Plus, X, Star, Loader2 } from 'lucide-react'
import { addProductImage, deleteProductImage, setFeaturedImage, updateProductImageColor } from '@/actions/products'
import Image from 'next/image'

export function ProductImagesEditor({
  product,
  images = [],
}: {
  product: any
  images: any[]
}) {
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('All')

  // Cloudinary's onSuccess callback can fire after the admin has switched tabs,
  // so a ref (not just state) keeps the upload tagged to whichever color was active when it started.
  const activeTabRef = useRef(activeTab)
  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  // Use your real database image fallback references
  const currentFeatured = product?.image || product?.featured_image_url
  const activeImages = images.length > 0 ? images : product?.images ? product.images.map((url: string, i: number) => ({ id: String(i), image_url: url })) : []

  // Derive color tabs from product.color_swatches (the "Product Colors" chip list), JSON: [{name, hex}]
  const productColors = (() => {
    if (!product?.color_swatches) return []
    try {
      const parsed = JSON.parse(product.color_swatches) as { name: string; hex: string }[]
      if (Array.isArray(parsed)) {
        return parsed.map((c) => ({ name: c.name.trim(), hex: c.hex || '#c5a880' })).filter((c) => c.name)
      }
    } catch (e) { }
    return []
  })()

  const displayedImages = activeImages.filter((img: any) => {
    if (activeTab === 'All') return true
    return img.color_name?.toLowerCase().trim() === activeTab.toLowerCase().trim()
  })

  const handleUploadSuccess = (result: any) => {
    setUploading(false)
    if (result.info && result.info.secure_url) {
      const currentTab = activeTabRef.current
      const uploadColor = currentTab === 'All' ? null : currentTab
      startTransition(async () => {
        try {
          await addProductImage(product.id, result.info.secure_url, uploadColor)
        } catch (e) {
          console.error("Image uploaded to Cloudinary, database save bypassed.")
        }
      })
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-stone-900">Product Images</h3>
          <p className="text-xs text-stone-400 mt-0.5">Manage premium jewelry media elements via Cloudinary</p>
        </div>
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={handleUploadSuccess}
          onOpen={() => setUploading(true)}
          options={{ multiple: true, maxFiles: 5 }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={uploading || isPending}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {uploading || isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Upload Image
            </button>
          )}
        </CldUploadWidget>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('All')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'All' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
        >
          All ({activeImages.length})
        </button>

        {productColors.map((colorObj) => {
          const count = activeImages.filter((img: any) => img.color_name?.toLowerCase().trim() === colorObj.name.toLowerCase().trim()).length
          return (
            <button
              key={colorObj.name}
              type="button"
              onClick={() => setActiveTab(colorObj.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === colorObj.name ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
            >
              <span className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-sm" style={{ backgroundColor: colorObj.hex }} />
              <span>{colorObj.name} ({count})</span>
            </button>
          )
        })}
      </div>

      {activeTab !== 'All' && (
        <div className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-xl p-3 font-medium">
          Uploading images while on the <strong className="text-stone-900">{activeTab}</strong> tab will automatically set their color tag to <strong className="text-stone-900">{activeTab}</strong>.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {displayedImages.map((img: any, idx: number) => {
          const isFeatured = currentFeatured === img.image_url || (!currentFeatured && activeImages[0]?.id === img.id)
          return (
            <div
              key={img.id || idx}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isFeatured ? 'border-[#c5a880]' : 'border-stone-200'
                }`}
            >
              <Image src={img.image_url} alt="Jewelry showcase thumbnail" fill className="object-cover" />

              {/* Delete — always visible, not hover-only, so it works on touch/mobile too */}
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Remove this photo from image arrays?')) {
                    startTransition(async () => { await deleteProductImage(img.id, product.id) })
                  }
                }}
                disabled={isPending}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Bottom control bar — always visible, not hover-only */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent pt-8 pb-2 px-2 flex flex-col items-center gap-1.5">
                {productColors.length > 0 && (
                  <select
                    value={img.color_name || ''}
                    onChange={(e) => {
                      startTransition(async () => {
                        await updateProductImageColor(img.id, product.id, e.target.value || null)
                      })
                    }}
                    disabled={isPending}
                    className="w-full text-[10px] font-semibold text-stone-800 bg-white/95 rounded-md px-1.5 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-[#c5a880]"
                  >
                    <option value="">General (all colors)</option>
                    {productColors.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
                {!isFeatured && (
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(async () => { await setFeaturedImage(product.id, img.image_url) })
                    }}
                    disabled={isPending}
                    className="px-3 py-1.5 text-xs font-medium text-stone-900 bg-white rounded-full hover:bg-stone-50 transition-colors"
                  >
                    Set as Featured
                  </button>
                )}
                {isFeatured && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#7c6243] bg-[#fdfaf4] border border-[#c5a880]/30 rounded-full">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Cover Photo
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {displayedImages.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-xl bg-stone-50">
            <p className="text-sm text-stone-500">
              {activeImages.length === 0 ? 'No gallery images connected yet' : `No images uploaded for "${activeTab}" yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
