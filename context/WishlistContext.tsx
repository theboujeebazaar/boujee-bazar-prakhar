'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type WishlistItem = {
  id: string
  name: string
  price: number
  image_url: string
  category_name?: string
}

type WishlistContextType = {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  toggleWishlist: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('boujee-wishlist') || localStorage.getItem('gulshan-wishlist')
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist)
          if (Array.isArray(parsed)) {
            setWishlist(parsed)
          }
        } catch (e) {
          console.error('Failed to load wishlist from localStorage', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save wishlist to localStorage ONLY after initial load has finished
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const json = JSON.stringify(wishlist)
      localStorage.setItem('boujee-wishlist', json)
      localStorage.setItem('gulshan-wishlist', json)
    }
  }, [wishlist, isLoaded])

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id))
  }

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      }
      return [...prev, item]
    })
  }

  const isInWishlist = (id: string) => {
    return wishlist.some((i) => i.id === id)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
