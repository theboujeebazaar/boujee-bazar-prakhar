// components/Instagram.tsx
'use client'

interface IGItem {
  image: string
  alt: string
}

export default function Instagram() {
  // IG items from index.html
  const igItems: IGItem[] = [
    { image: 'assets/img/demos_insta/demo_1.jpeg', alt: 'IG 1' },
    { image: 'assets/img/demos_insta/demo_2.jpeg', alt: 'IG 2' },
    { image: 'assets/img/demos_insta/demo_3.jpeg', alt: 'IG 3' },
    { image: 'assets/img/demos_insta/demo_4.jpeg', alt: 'IG 4' },
    { image: 'assets/img/demos_insta/demo_5.jpeg', alt: 'IG 5' },
    { image: 'assets/img/demos_insta/demo_6.jpeg', alt: 'IG 6' },
  ]

  return (
    <section className="instagram-gallery">
      {/* Section Title - from index.html */}
      <h2 className="section-title text-center">
        JOIN THE <span className="highlight-text">CLUB</span> ✨
      </h2>
      <p className="text-center" style={{ marginBottom: '30px' }}>
        Tag @theboujeebazaar to be featured
      </p>

      {/* Instagram Marquee - from index.html */}
      <div className="ig-marquee">
        <div className="ig-track">
          {/* Original Items */}
          {igItems.map((item, idx) => (
            <div key={idx} className="ig-item">
              <img src={item.image} alt={item.alt} />
              <div className="ig-overlay">
                <i className="fa-brands fa-instagram"></i>
              </div>
            </div>
          ))}

          {/* Duplicated Items for Infinite Loop - from index.html */}
          {igItems.map((item, idx) => (
            <div key={`dup-${idx}`} className="ig-item">
              <img src={item.image} alt={item.alt} />
              <div className="ig-overlay">
                <i className="fa-brands fa-instagram"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow Button - from index.html */}
      <div className="view-all-container" style={{ marginTop: '30px' }}>
        <button className="btn-secondary">
          FOLLOW US <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  )
}
