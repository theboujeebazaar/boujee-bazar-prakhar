'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function SimilarProducts({ similarProducts = [] }: { similarProducts: any[] }) {
  const { addToCart } = useCart()

  if (!similarProducts || similarProducts.length === 0) return null

  return (
    <div className="mt-20 pt-10 border-t border-neutral-100 w-full max-w-[1200px] mx-auto px-2">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="eyebrow justify-center inline-flex items-center gap-2 text-[#c5a880] uppercase tracking-widest text-xs font-semibold">
          <span className="h-px w-6 bg-[#c5a880]/50" />
          Explore styles
          <span className="h-px w-6 bg-[#c5a880]/50" />
        </div>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mt-3" style={{ fontFamily: 'Playfair Display, serif' }}>
          You Might Also Like
        </h2>
      </div>

      {/* ✅ FIXED: Custom premium grid layout handling precise 5-column constraints */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {similarProducts.slice(0, 5).map((p, idx) => {
          const catName = p.category_name || "Jewelry"
          const itemStrikePrice = p.originalPrice || p.oldPrice

          return (
            <div 
              key={p.id} 
              /* ✅ FIXED: Controls visibility layout dynamically per device context bounds */
              className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-neutral-100 flex flex-col transition-all duration-300 relative
                ${idx >= 2 ? 'hidden md:flex' : 'flex'} 
                ${idx >= 3 ? 'md:hidden xl:flex' : ''}
              `}
            >
              <Link href={`/shop/${p.id}`} className="relative aspect-[4/5] overflow-hidden block bg-neutral-50">
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 240px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {p.badge && (
                  <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-sm">
                    {p.badge}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-white/90 text-neutral-900 backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded shadow-xs">
                  {catName}
                </span>
              </Link>

              <div className="p-3 flex flex-col flex-1 bg-white">
                <div className="flex-1">
                  <Link href={`/shop/${p.id}`} className="hover:text-neutral-600 transition-colors">
                    <h3 className="text-xs font-semibold text-neutral-800 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                  </Link>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-sm font-bold text-neutral-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  {itemStrikePrice && (
                    <span className="text-[10px] text-neutral-400 line-through">
                      ₹{itemStrikePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Secure "Buy Now" button launcher */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, category_name: catName });
                      if (typeof window !== 'undefined') {
                        const currentItem = { id: p.id, cartItemId: p.id + '-init', name: p.name, price: p.price, image: p.image_url, quantity: 1, category_name: catName };
                        const encodedData = encodeURIComponent(JSON.stringify([currentItem]));
                        document.cookie = `boujee-cart-token=${encodedData}; path=/; max-age=604800;`;
                        localStorage.setItem('cart', JSON.stringify([currentItem]));
                        window.location.href = '/checkout';
                      }
                    }}
                    className="w-full text-center rounded-xl bg-neutral-900 text-white text-[11px] font-semibold py-2 hover:bg-neutral-800 transition-colors"
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
