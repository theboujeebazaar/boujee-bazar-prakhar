'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createHeroSlide, deleteHeroSlide, updateHeroSlidesArray } from '@/actions/admin/hero' 
import { Trash2, Plus, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

interface HeroImageItem {
  url: string
  label?: string
}

export function HeroSlideList({ 
  initialImages = [], 
  title = 'Hero Slider Images'
}: { 
  initialImages: HeroImageItem[] | string[] | any, 
  title?: string
}) {
  const normalizedSlides: HeroImageItem[] = Array.isArray(initialImages)
    ? initialImages.map((img: any) => typeof img === 'string' ? { url: img } : { url: img.url || img.image || '' })
    : []

  const [slides, setSlides] = useState<HeroImageItem[]>(normalizedSlides)
  const [isPending, startTransition] = useTransition()

  const saveToDatabase = (updatedSlides: HeroImageItem[]) => {
    startTransition(async () => {
      const res = await updateHeroSlidesArray(updatedSlides)
      if (res.success) {
        setSlides(updatedSlides)
      } else {
        alert(res.error || 'Failed to update configurations')
      }
    })
  }

  // ✅ FIXED: Processes batch events when uploading multiple files concurrently
  const handleUploadSuccess = (result: any) => {
    // Check if the event contains multiple batch assets or a single file info object
    const newImages = result?.info?.files 
      ? result.info.files.map((f: any) => ({ url: f.uploadInfo?.secure_url || f.secure_url }))
      : [{ url: result.info.secure_url }]

    const filteredNewImages = newImages.filter((img: any) => img.url)
    
    if (filteredNewImages.length === 0) return

    // Limit total combined items to your maximum 6 slider slots rule
    const combinedSlides = [...slides, ...filteredNewImages].slice(0, 6)
    
    saveToDatabase(combinedSlides)
  }

  const handleDelete = (urlToRemove: string) => {
    if (!confirm('Are you sure you want to remove this background image?')) return
    
    startTransition(async () => {
      const res = await deleteHeroSlide(urlToRemove) 
      if (res.success) {
        setSlides(slides.filter(s => s.url !== urlToRemove))
      } else {
        alert(res.error || "Failed to remove asset")
      }
    }) 
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return
    const updated = [...slides]
    const [movedItem] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, movedItem)
    saveToDatabase(updated)
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-stone-400" />
          <h2 className="text-base font-bold text-stone-900" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h2>
        </div>
        
        {slides.length < 6 ? (
          <CldUploadWidget 
            signatureEndpoint="/api/cloudinary/sign"
            /* ✅ FIXED: Updated maxFiles restriction and enabled multiple selection flag queues */
            options={{
              maxFiles: 6 - slides.length, // Dynamic calculation prevents exceeding your 6-slide max limit
              multiple: true,              // 💡 Key parameter: Allows users to hold Shift/Ctrl to select multiple files from their PC
              resourceType: "image",
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"]
            }}
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-stone-950 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Upload Images
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <span className="text-xs font-semibold text-[#c5a880] bg-[#FBF7F0] px-3 py-1 rounded-full border border-[#c5a880]/30">
            Maximum 6 images reached
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 mb-6 leading-relaxed font-medium">
        Select and upload up to {6 - slides.length} more marketplace banner images simultaneously.
      </p>

      {/* Rest of your loop slider mapping view remains exactly the same... */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
            <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-900">No Hero Images Uploaded</p>
            <p className="text-xs text-stone-400 mt-1 font-medium">Click Upload Images to establish your marketplace banners.</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div 
              key={index} 
              className="flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md hover:shadow-stone-100 transition-all duration-200"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex flex-col items-center gap-0.5 text-stone-400 bg-stone-50 border border-stone-100 rounded-lg p-1">
                  <button 
                    type="button"
                    disabled={index === 0 || isPending}
                    onClick={() => moveItem(index, index - 1)}
                    className="hover:text-[#c5a880] disabled:opacity-20 transition-colors p-0.5"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-16 w-24 shrink-0 rounded-lg overflow-hidden relative bg-stone-100 border border-stone-200">
                  <img
                    src={slide.url}
                    alt={`Hero Banner Node ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900">Banner Position #{index + 1}</p>
                  <p className="text-xs text-stone-400 truncate mt-0.5 font-medium">
                    {slide.url.split('/').pop()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(slide.url)}
                    disabled={isPending}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isPending && (
        <div className="mt-4 flex items-center justify-center text-xs font-bold text-stone-500 gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-[#c5a880]" />
          Updating live homepage configuration schema...
        </div>
      )}
    </div>
  )
}
