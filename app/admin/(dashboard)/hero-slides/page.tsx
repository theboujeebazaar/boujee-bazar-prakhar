import { getHeroSlides } from '@/actions/admin/hero'
import { HeroSlideList } from './_components/HeroSlideList'

export const metadata = {
  title: 'Hero Slides | Admin Dashboard',
}

export default async function AdminHeroSlidesPage() {
  // ✅ FIXED: Fetches the unified array from your homepage_config jsonb column
  const slides = await getHeroSlides()

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Hero Section Settings
          </h1>
          <p className="text-sm text-stone-500 mt-1 font-medium">
            Manage, arrange, and deploy the slider background images for your primary storefront homepage landing layout.
          </p>
        </div>
      </div>

      {/* ✅ FIXED: Render a single, clean full-width control dashboard pane instead of split sections */}
      <div className="max-w-4xl">
        <HeroSlideList 
          initialImages={slides} 
          title="Home Storefront Banners Collection"
        />
      </div>
    </div>
  )
}
