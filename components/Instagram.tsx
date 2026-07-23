// components/Instagram.tsx
'use client'

interface IGItem {
  image: string
  alt: string
}

export default function Instagram() {
  const instaUrl = "https://www.instagram.com/the_boujeebazaar/"

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
    <section className="w-full py-16 md:py-20 bg-white overflow-hidden relative instagram-gallery">
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-12">
        <div className="flex flex-col items-center justify-center mb-12">
          <h2 className="text-[22px] md:text-[27px] font-[800] tracking-[2px] flex flex-wrap items-center justify-center gap-x-[10px] text-neutral-900 font-['Poppins'] uppercase text-center">
            JOIN THE <span className="text-[#f5a24a] italic font-['Playfair_Display']">CLUB</span> ✨
          </h2>
          <p className="text-center mt-2 text-neutral-500">
            Tag <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-neutral-800 hover:text-[#c5a880] transition-colors">@the_boujeebazaar</a> to be featured
          </p>
        </div>

        {/* Instagram Marquee */}
        <div className="ig-marquee">
          <div className="ig-track">
            {/* Original Items */}
            {igItems.map((item, idx) => (
              <a href={instaUrl} target="_blank" rel="noopener noreferrer" key={idx} className="ig-item block">
                <img src={item.image} alt={item.alt} />
                <div className="ig-overlay">
                  <i className="fa-brands fa-instagram"></i>
                </div>
              </a>
            ))}

            {/* Duplicated Items for Infinite Loop */}
            {igItems.map((item, idx) => (
              <a href={instaUrl} target="_blank" rel="noopener noreferrer" key={`dup-${idx}`} className="ig-item block">
                <img src={item.image} alt={item.alt} />
                <div className="ig-overlay">
                  <i className="fa-brands fa-instagram"></i>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Follow Button */}
        <div className="flex justify-center mt-12">
          <a
            href={instaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-[#fffdf9] border-2 border-neutral-900 text-neutral-900 font-bold text-[13px] tracking-widest uppercase hover:bg-[#fce1bf] hover:border-[#fce1bf] transition-colors inline-flex items-center gap-3 rounded-full shadow-sm hover:shadow-md"
          >
            FOLLOW US <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
  )
}
