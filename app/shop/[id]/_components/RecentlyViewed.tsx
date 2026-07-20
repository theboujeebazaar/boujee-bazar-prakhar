'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext' // ✅ FIXED: Integrated cart management hook context

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string // Maps to your database field row configuration item
  category?: string
  tag?: string
}

export default function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart() // ✅ FIXED: Instantiate cart context tool hooks

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Get recently viewed list from localStorage
    const saved = localStorage.getItem('boujee-recently-viewed')
    let ids: string[] = saved ? JSON.parse(saved) : []

    // 2. Filter out current product
    const filteredIds = ids.filter(id => id !== currentProductId).slice(0, 4)

    // 3. Save current product as the first item for future visits
    const updatedIds = [currentProductId, ...ids.filter(id => id !== currentProductId)].slice(0, 8)
    localStorage.setItem('boujee-recently-viewed', JSON.stringify(updatedIds))

    if (filteredIds.length === 0) {
      setLoading(false)
      return
    }

    // 4. Fetch details of those products
    const fetchRecentlyViewed = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, originalPrice, image, category, tag')
          .in('id', filteredIds)
          .eq('available', true)

        if (error) throw error

        if (data) {
          // Sort items back to match the order of filteredIds
          const sorted = filteredIds
            .map(id => data.find(p => p.id === id))
            .filter(Boolean) as Product[]
          setProducts(sorted)
        }
      } catch (err) {
        console.error('Failed to fetch recently viewed products', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentlyViewed()
  }, [currentProductId])

  if (loading || products.length === 0) return null

  return (
    <div className="mt-20 pt-10 border-t border-neutral-100 w-full max-w-[1200px] mx-auto px-6">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="eyebrow justify-center inline-flex items-center gap-2 text-[#c5a880] uppercase tracking-widest text-xs font-semibold">
          <span className="h-px w-6 bg-[#c5a880]/50" />
          Based on your visits
          <span className="h-px w-6 bg-[#c5a880]/50" />
        </div>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mt-3" style={{ fontFamily: 'Playfair Display, serif' }}>
          Recently Viewed
        </h2>
      </div>

      {/* ✅ FIXED: Grid responsive structure matches your main catalog layout width */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => {
          const catName = p.category || "Jewelry"

          return (
            <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-neutral-100 flex flex-col transition-all duration-300 relative">
              
              <Link href={`/shop/${p.id}`} className="relative aspect-[4/5] overflow-hidden block bg-neutral-50">
                <Image
                  src={p.image || '/assets/img/placeholder.jpeg'}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                
                {/* Product badge tag info view */}
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-sm">
                    {p.tag}
                  </span>
                )}

                {/* ✅ FIXED: Added your signature absolute Boujee Gold sticker label */}
                <span className="absolute bottom-3 right-3 bg-[#c5a880] text-white backdrop-blur-xs text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md shadow-md">
                  {catName}
                </span>
              </Link>

              {/* Card Meta Content Details Footer */}
              <div className="p-3 flex flex-col flex-1 bg-white">
                <div className="flex-1">
                  <Link href={`/shop/${p.id}`} className="hover:text-neutral-600 transition-colors">
                    <h3 className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                  </Link>
                </div>

                {/* ✅ FIXED: Standardized Price baseline item spacing */}
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-neutral-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  {p.originalPrice && (
                    <span className="text-[11px] text-neutral-400 line-through">
                      ₹{p.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* ✅ FIXED: Added matching interactive functional "Buy Now" checkout action handles */}
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        image_url: p.image || '/assets/img/placeholder.jpeg',
                        category_name: catName
                      });
                      if (typeof window !== 'undefined') {
                        const currentItem = {
                          id: p.id,
                          cartItemId: p.id + '-init',
                          name: p.name,
                          price: p.price,
                          image: p.image || '/assets/img/placeholder.jpeg',
                          quantity: 1,
                          category_name: catName
                        };
                        const encodedData = encodeURIComponent(JSON.stringify([currentItem]));
                        document.cookie = `boujee-cart-token=${encodedData}; path=/; max-age=604800;`;
                        localStorage.setItem('cart', JSON.stringify([currentItem]));
                        window.location.href = '/checkout';
                      }
                    }}
                    className="w-full text-center rounded-xl bg-neutral-900 text-white text-xs font-semibold py-2.5 hover:bg-neutral-800 transition-colors flex items-center justify-center shadow-xs"
                  >
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
