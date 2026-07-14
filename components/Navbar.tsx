// components/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { itemCount } = useCart()

  // Sticky Header Blur effect (from script.js)
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar')
      if (!navbar) return

      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'
        navbar.style.background = 'rgba(255, 253, 249, 0.98)'
      } else {
        navbar.style.boxShadow = 'none'
        navbar.style.background = 'rgba(255, 253, 249, 0.95)'
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mobile Menu Toggle (from script.js)
  const toggleMobileMenu = () => {
    const navLinks = document.getElementById('navLinks')
    const mobileMenuBtn = document.getElementById('mobileMenuBtn')
    
    if (navLinks && mobileMenuBtn) {
      navLinks.classList.toggle('active')
      const icon = mobileMenuBtn.querySelector('i')
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.classList.remove('fa-bars')
          icon.classList.add('fa-xmark')
        } else {
          icon.classList.remove('fa-xmark')
          icon.classList.add('fa-bars')
        }
      }
    }
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      {/* Announcement Bar - from index.html */}
      <div className="announcement-bar">
        <span>✨</span> FREE SHIPPING ON ALL ORDERS ABOVE ₹1499 <span>✨</span>
      </div>

      {/* Navigation - from index.html */}
      <header className="navbar" id="navbar">
        <button 
          className="mobile-menu-btn" 
          aria-label="Menu" 
          id="mobileMenuBtn"
          onClick={toggleMobileMenu}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div className="nav-links" id="navLinks">
          <a href="/">Home</a>
          <a href="/shop">Shop</a>
          {/* <a href="/collections">Collections</a> */}
          <a href="/about">About Us</a>
        </div>

        <div className="logo">
          <div className="logo-top" style={{ fontWeight: 650 }}>
            the <span className="highlight"> boujee</span>
          </div>
          <div className="logo-bottom">bazaar<span className="highlight">.</span></div>
        </div>

        <div className="nav-icons">
          <button aria-label="Search">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <button aria-label="Account">
            <i className="fa-regular fa-user"></i>
          </button>
          <button aria-label="Wishlist" className="icon-badge">
            <i className="fa-regular fa-heart"></i>
            <span className="badge">0</span>
          </button>
          <button aria-label="Cart" className="icon-badge">
            <i className="fa-solid fa-bag-shopping"></i>
            <span className="badge">{itemCount}</span>
          </button>
        </div>
      </header>
    </>
  )
}