// components/Features.tsx
'use client'

interface Feature {
  icon: string
  title: string
  description: string
}

export default function Features() {
  // Features from index.html
  const features: Feature[] = [
    {
      icon: 'fa-solid fa-droplet',
      title: 'ANTI-TARNISH',
      description: 'Built to last, made to shine.',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'WATERPROOF',
      description: 'Wear it anywhere, anytime.',
    },
    {
      icon: 'fa-solid fa-leaf',
      title: 'HYPOALLERGENIC',
      description: 'Gentle on your skin.',
    },
    {
      icon: 'fa-solid fa-truck-fast',
      title: 'FAST SHIPPING',
      description: 'Delivered with love.',
    },
  ]

  return (
    <section className="features">
      {features.map((feature, idx) => (
        <div key={idx}>
          {/* Feature Item - from index.html */}
          <div className="feature-item">
            <i className={`${feature.icon} feature-icon`}></i>
            <div className="feature-text">
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          </div>

          {/* Divider (not last item) - from index.html */}
          {idx < features.length - 1 && <div className="feature-divider"></div>}
        </div>
      ))}
    </section>
  )
}
