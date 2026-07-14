// components/Trust.tsx
'use client'

interface TrustBadge {
  icon: string
  label: string
}

export default function Trust() {
  // Trust badges from index.html
  const badges: TrustBadge[] = [
    { icon: 'fa-solid fa-lock', label: 'Secure Payments' },
    { icon: 'fa-solid fa-box-open', label: 'Premium Packaging' },
    { icon: 'fa-solid fa-rotate-left', label: 'Easy Returns' },
    { icon: 'fa-solid fa-gem', label: 'Authentic Quality' },
    { icon: 'fa-solid fa-truck-fast', label: 'Free Shipping' },
  ]

  return (
    <section className="trust-badges">
      {badges.map((badge, idx) => (
        <div key={idx} className="trust-item">
          <i className={badge.icon}></i>
          <span>{badge.label}</span>
        </div>
      ))}
    </section>
  )
}
