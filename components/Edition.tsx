'use client'

import { useRouter } from 'next/navigation'

interface LimitedEditionProps {
  // ✅ Accepts your standalone database banner string prop (desktop)
  bannerUrl?: string
  // ✅ Optional separate image for mobile viewports (different aspect ratio than desktop)
  mobileBannerUrl?: string
}

export default function LimitedEdition({ bannerUrl, mobileBannerUrl }: LimitedEditionProps) {
  const router = useRouter()

  const handleNavigation = () => {
    router.push('/shop?collection=celestial')
  }

  // Fallback to local asset if database value isn't loaded or configured yet
  const resolvedDesktopImage = bannerUrl || '/assets/img/demos_insta/demo_9.jpeg'
  // Falls back to the desktop image when no dedicated mobile image has been uploaded
  const resolvedMobileImage = mobileBannerUrl || resolvedDesktopImage

  return (
    <section className="celestial-banner select-none">
      <button
        type="button"
        onClick={handleNavigation}
        className="celestial-banner-trigger"
        aria-label="Shop the Celestial Collection"
      >
        <picture>
          <source media="(max-width: 768px)" srcSet={resolvedMobileImage} />
          <img
            src={resolvedDesktopImage}
            alt="Celestial Collection - Limited Edition Jewelry"
            loading="lazy"
            className="celestial-banner-img"
          />
        </picture>
      </button>
    </section>
  )
}
