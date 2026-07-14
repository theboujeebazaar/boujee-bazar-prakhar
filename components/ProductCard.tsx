// components/ProductCard.tsx
'use client'

import { useState } from 'react'

interface ProductCardProps {
  id?: string
  image: string
  name: string
  price: number
  rating: number
  reviewCount: number
  alt?: string
}

export default function ProductCard({
  id = 'default',
  image,
  name,
  price,
  rating,
  reviewCount,
  alt = name,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Wishlist toggle (from script.js)
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
    const btn = (e.target as HTMLElement).closest('.wishlist-btn') as HTMLElement
    if (btn) {
      const icon = btn.querySelector('i')
      if (icon) {
        if (isWishlisted) {
          icon.classList.remove('fa-solid')
          icon.classList.add('fa-regular')
          icon.style.color = ''
        } else {
          icon.classList.remove('fa-regular')
          icon.classList.add('fa-solid')
          icon.style.color = '#F5A24A'
        }
      }
    }
  }

  // Render stars
  const renderStars = () => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa-${i < Math.floor(rating) ? 'solid' : i < rating ? 'regular' : 'solid'} fa-star`}
          style={{ color: i < Math.floor(rating) ? '#FFD700' : '#ccc' }}
        ></i>
      )
    }
    return stars
  }

  return (
    <div className="product-card">
      {/* Product Image Wrapper - from index.html */}
      <div className="product-img-wrapper">
        <img src={image} alt={alt} />
        <button 
          className="wishlist-btn"
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
        >
          <i className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart`}></i>
        </button>
      </div>

      {/* Product Info - from index.html */}
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">₹{price.toLocaleString('en-IN')}</p>

        {/* Product Rating - from index.html */}
        <div className="product-rating">
          {renderStars()}
          <span>({reviewCount})</span>
        </div>
      </div>
    </div>
  )
}
