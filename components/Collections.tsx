// components/Collections.tsx
'use client'

export default function Collections() {
  // Collections data from index.html
  const collections = [
    {
      name: 'Rings',
      image: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Earrings',
      image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Necklaces',
      image: 'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Bracelets',
      image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Anklets',
      image: 'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Pendants',
      image: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Chains',
      image: 'https://images.pexels.com/photos/5409664/pexels-photo-5409664.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Sets',
      image: 'https://images.pexels.com/photos/837265/pexels-photo-837265.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]

  return (
    <section className="collections">
      {/* Section Title - from index.html */}
      <h2 className="section-title">
        SHOP BY <span className="highlight-text">COLLECTION</span> ✨
      </h2>

      {/* Collection Grid - from index.html */}
      <div className="collection-grid">
        {collections.map((collection) => (
          <div key={collection.name} className="collection-item">
            <div className="collection-img">
              <img
                src={collection.image}
                alt={collection.name}
              />
            </div>
            <span>{collection.name}</span>
          </div>
        ))}

        {/* Gift Icon Item - from index.html */}
        <div className="collection-item">
          <div className="collection-img">
            <i className="fa-solid fa-gift gift-icon"></i>
          </div>
          <span>Boujee Bits</span>
        </div>
      </div>

      {/* View All Button - from index.html */}
      <div className="view-all-container">
        <button className="btn-secondary">
          VIEW ALL COLLECTIONS <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  )
}
