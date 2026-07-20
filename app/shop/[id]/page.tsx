// import Header from '@/components/Header'
// import Footer from '@/components/Footer'
// import ProductDetailActions from './_components/ProductDetailActions'
// import ProductGallery from './_components/ProductGallery'
// import ProductReviews from './_components/ProductReviews'
// import RecentlyViewed from './_components/RecentlyViewed'
// import Products from '@/components/Products'
// import { notFound } from 'next/navigation'
// import Link from 'next/link'
// import SimilarProducts from './_components/SimilarProducts'
// import Image from 'next/image'
// import { ChevronRight } from 'lucide-react'
// import { createClient } from "@/lib/supabase/server"

// export const metadata = {
//   title: 'Product Details | The Boujee Bazaar',
//   description: 'Minimal, luxury, anti-tarnish jewelry designed to elevate your everyday statements.',
// }

// export default async function ProductDetailPage({ params }: { params: any }) {
//   const supabase = await createClient();
//   const { id } = await params;

//   // 1. Fetch product with standard jewelry columns
//   const { data: productData } = await supabase
//     .from("products")
//     .select(`
//       id, 
//       name, 
//       price, 
//       originalPrice,
//       image,
//       images,
//       category,
//       subcategory,
//       description,
//       sizes,
//       colors,
//       tag,
//       available
//     `)
//     .eq("id", id)
//     .single();

//   if (!productData || !productData.available) notFound();

//   // Compile image list
//   let images: string[] = []
//   if (productData.images) {
//     if (Array.isArray(productData.images)) {
//       images = productData.images
//     } else if (typeof productData.images === 'string') {
//       images = productData.images.split(',').map((img: string) => img.trim())
//     }
//   }
//   if (images.length === 0 && productData.image) {
//     images = [productData.image]
//   }
//   if (images.length === 0) {
//     images = ['/assets/img/placeholder.jpeg']
//   }

//   // Build variants list from sizes if product_variants table is not used
//   let variants: any[] = []
//   if (productData.sizes) {
//     const sizeList = typeof productData.sizes === 'string' 
//       ? productData.sizes.split(',') 
//       : Array.isArray(productData.sizes) ? productData.sizes : []
    
//     variants = sizeList.map((size: string, idx: number) => ({
//       id: `${productData.id}-${size.trim()}`,
//       variant_name: size.trim(),
//       price: productData.price,
//       original_price: productData.originalPrice || null,
//       stock_quantity: 20
//     }))
//   }

//   // Fallback variant if none
//   if (variants.length === 0) {
//     variants = [{
//       id: `${productData.id}-standard`,
//       variant_name: 'Standard',
//       price: productData.price,
//       original_price: productData.originalPrice || null,
//       stock_quantity: 20
//     }]
//   }

//   // Fetch similar products
//   const { data: similarProductsData } = await supabase
//     .from("products")
//     .select("id, name, price, originalPrice, image, category, tag")
//     .eq("available", true)
//     .eq("category", productData.category)
//     .neq("id", productData.id)
//     .limit(4);

//   const similarProducts = (similarProductsData || []).map((p: any) => ({
//     id: p.id,
//     name: p.name,
//     category_id: p.category?.toLowerCase() || 'jewelry',
//     category_name: p.category || 'Jewelry',
//     image_url: p.image || "/assets/img/placeholder.jpeg",
//     price: p.price || 0,
//     originalPrice: p.originalPrice || undefined,
//     badge: p.tag || undefined,
//     rating: 5.0,
//     colorCount: p.colors ? p.colors.split(',').length : 1
//   }));

//   // Fetch Reviews (Fallback to empty)
//   const reviews: any[] = [];

//   const categoryName = productData.category || 'Jewelry';

//   return (
//     <>
//       <Header />
//       <main className="min-h-screen bg-white pt-28 pb-16 md:pt-36 md:pb-24">
//         <div className="max-w-7xl mx-auto px-5 md:px-8">

//           {/* Breadcrumbs */}
//           <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-8">
//             <Link href="/" className="hover:text-[#c5a880] transition-colors">Home</Link>
//             <ChevronRight className="w-3.5 h-3.5" />
//             <Link href="/shop" className="hover:text-[#c5a880] transition-colors">Shop</Link>
//             <ChevronRight className="w-3.5 h-3.5" />
//             <Link href={`/shop?category=${productData.category?.toLowerCase()}`} className="hover:text-[#c5a880] transition-colors capitalize">
//               {categoryName}
//             </Link>
//             <ChevronRight className="w-3.5 h-3.5" />
//             <span className="text-neutral-900 font-semibold truncate max-w-[200px]">{productData.name}</span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
//             {/* Left: Product Image Gallery */}
//             <ProductGallery images={images} productName={productData.name} badge={productData.tag} />

//             {/* Right: Product Details & Purchase Form */}
//             <div className="space-y-8">
//               <div>
//                 <span className="text-xs uppercase tracking-widest text-[#c5a880] font-bold">
//                   {categoryName} {productData.subcategory && `• ${productData.subcategory}`}
//                 </span>
//                 <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-neutral-900 mt-2 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
//                   {productData.name}
//                 </h1>
                
//                 <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
//                   <div className="flex text-[#c5a880]">★★★★★</div>
//                   <span className="font-semibold text-neutral-800">5.0 ★</span>
//                   <span className="text-neutral-200">|</span>
//                   <span>Waterproof & Anti-Tarnish</span>
//                 </div>
//               </div>

//               {/* Purchase Actions client-side wrapper (includes dynamic price and Add to cart) */}
//               <ProductDetailActions 
//                 product={{
//                   id: productData.id,
//                   name: productData.name,
//                   image_url: images[0],
//                   category_name: categoryName,
//                   variants: variants
//                 }}
//               />

//               {productData.description && (
//                 <div className="font-body text-neutral-600 text-sm leading-relaxed pt-2">
//                   <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
//                   <p className="whitespace-pre-wrap">{productData.description}</p>
//                 </div>
//               )}

//               {/* Secure Checkout Trust Badge */}
//               <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
//                 <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Secure Payment Options</span>
//                 <div className="flex gap-3 text-neutral-400 text-xl">
//                   <i className="fa-brands fa-cc-visa" title="Visa"></i>
//                   <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
//                   <i className="fa-brands fa-cc-rupay" title="Rupay"></i>
//                   <i className="fa-solid fa-credit-card" title="UPI & Net Banking"></i>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Similar Products */}
//           {/* Similar Products */}
// {similarProducts.length > 0 && (
//   <div className="mt-20 pt-10 border-t border-neutral-100 w-full max-w-[1200px] mx-auto px-6">
//     <div className="text-center max-w-xl mx-auto mb-10">
//       <div className="eyebrow justify-center inline-flex items-center gap-2 text-[#c5a880] uppercase tracking-widest text-xs font-semibold">
//         <span className="h-px w-6 bg-[#c5a880]/50" />
//         Explore styles
//         <span className="h-px w-6 bg-[#c5a880]/50" />
//       </div>
//       <h2 className="text-3xl font-display font-bold text-neutral-900 mt-3" style={{ fontFamily: 'Playfair Display, serif' }}>
//         You Might Also Like
//       </h2>
//     </div>

//     {/* Aligned Grid layout configuration matching your core product display metrics */}
//     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
//       {similarProducts.map((p) => {
//         // Resolve dynamic strings cleanly matching your main shop layout card logic
//         const catName = p.category_name || "Jewelry"
//         const itemStrikePrice = p.originalPrice || p.oldPrice
        
//         // Safety check evaluation if wishlist state handlers exist in this context page view
//         const favorited = typeof isInWishlist === 'function' ? isInWishlist(p.id) : false

//         return (
//           <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-neutral-100 flex flex-col transition-all duration-300 relative">
            
//             {/* ✅ FIXED: Re-introduced Wishlist Heart Icon Toggle Button */}
//             {typeof handleWishlistToggle === 'function' && (
//               <button
//                 onClick={(e) => handleWishlistToggle(p, e)}
//                 className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-neutral-600 shadow-sm transition-all"
//                 title="Save to wishlist"
//               >
//                 <i className={`fa-heart text-sm ${favorited ? "fa-solid text-red-500 animate-heartbeat" : "fa-regular"}`}></i>
//               </button>
//             )}

//             {/* Media Frame Anchor Asset Container */}
//             <Link href={`/shop/${p.id}`} className="relative aspect-[4/5] overflow-hidden block bg-neutral-50">
//               <Image
//                 src={p.image_url}
//                 alt={p.name}
//                 fill
//                 sizes="(max-width: 768px) 50vw, 320px"
//                 className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
//               />
              
//               {/* ✅ FIXED: Re-introduced Absolute Corner Badge if tracking a sale or hot element */}
//               {p.badge && (
//                 <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-sm">
//                   {p.badge}
//                 </span>
//               )}

//               {/* ✅ FIXED: Added your signature Boujee Gold absolute category label sticker */}
//               <span className="absolute bottom-3 right-3 bg-[#c5a880] text-white backdrop-blur-xs text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md shadow-md">
//                 {catName}
//               </span>
//             </Link>

//             {/* Meta Info Frame Content Footer Block */}
//             <div className="p-3 flex flex-col flex-1 bg-white">
//               <div className="flex-1">
//                 <Link href={`/shop/${p.id}`} className="hover:text-neutral-600 transition-colors">
//                   <h3 className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug">
//                     {p.name}
//                   </h3>
//                 </Link>
//                 {p.colorCount && p.colorCount > 1 && (
//                   <p className="mt-1 text-[11px] font-medium text-[#c5a880]">
//                     {p.colorCount} tones available
//                   </p>
//                 )}
//               </div>

//               {/* ✅ FIXED: Standardized Price Row Display Element baseline */}
//               <div className="mt-3 flex items-baseline gap-1.5">
//                 <span className="text-sm font-bold text-neutral-900">
//                   ₹{p.price.toLocaleString('en-IN')}
//                 </span>
//                 {itemStrikePrice && (
//                   <span className="text-[11px] text-neutral-400 line-through">
//                     ₹{itemStrikePrice.toLocaleString('en-IN')}
//                   </span>
//                 )}
//               </div>

//               {/* ✅ FIXED: Added your high-contrast "Buy Now" checkout button handle drawer */}
//               {typeof addToCart === 'function' && (
//                 <div className="mt-3 space-y-2">
//                   <button
//                     onClick={async () => {
//                       addToCart({
//                         id: p.id,
//                         name: p.name,
//                         price: p.price,
//                         image_url: p.image_url,
//                         category_name: catName
//                       });
//                       if (typeof window !== 'undefined') {
//                         const currentItem = {
//                           id: p.id,
//                           cartItemId: p.id + '-init',
//                           name: p.name,
//                           price: p.price,
//                           image: p.image_url,
//                           quantity: 1,
//                           category_name: catName
//                         };
//                         const encodedData = encodeURIComponent(JSON.stringify([currentItem]));
//                         document.cookie = `boujee-cart-token=${encodedData}; path=/; max-age=604800;`;
//                         localStorage.setItem('cart', JSON.stringify([currentItem]));
//                         window.location.href = '/checkout';
//                       }
//                     }}
//                     className="w-full text-center rounded-xl bg-neutral-900 text-white text-xs font-semibold py-2.5 hover:bg-neutral-800 transition-colors flex items-center justify-center shadow-xs"
//                   >
//                     Buy now
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   </div>
// )}


//           {/* Recently Viewed Products */}
//           <RecentlyViewed currentProductId={productData.id} />

//         </div>
//       </main>
//       <Footer />
//     </>
//   )
// }
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetailActions from './_components/ProductDetailActions'
import ProductGallery from './_components/ProductGallery'
import ProductReviews from './_components/ProductReviews'
import RecentlyViewed from './_components/RecentlyViewed'
import SimilarProducts from './_components/SimilarProducts' // ✅ Ensure clean client reference
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: 'Product Details | The Boujee Bazaar',
  description: 'Minimal, luxury, anti-tarnish jewelry designed to elevate your everyday statements.',
}

export default async function ProductDetailPage({ params }: { params: any }) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch main product details
  const { data: productData } = await supabase
    .from("products")
    .select(`id, name, price, originalPrice, image, images, category, subcategory, description, sizes, colors, tag, available`)
    .eq("id", id)
    .single();

  if (!productData || !productData.available) notFound();

  // Compile image list array cleanly
  let images: string[] = []
  if (productData.images) {
    if (Array.isArray(productData.images)) {
      images = productData.images
    } else if (typeof productData.images === 'string') {
      images = productData.images.split(',').map((img: string) => img.trim())
    }
  }
  if (images.length === 0 && productData.image) images = [productData.image]
  if (images.length === 0) images = ['/assets/img/placeholder.jpeg']

  // Compile variants list configuration
  let variants: any[] = []
  if (productData.sizes) {
    const sizeList = typeof productData.sizes === 'string' 
      ? productData.sizes.split(',') 
      : Array.isArray(productData.sizes) ? productData.sizes : []
    variants = sizeList.map((size: string) => ({
      id: `${productData.id}-${size.trim()}`,
      variant_name: size.trim(),
      price: productData.price,
      original_price: productData.originalPrice || null,
      stock_quantity: 20
    }))
  }
  if (variants.length === 0) {
    variants = [{ id: `${productData.id}-standard`, variant_name: 'Standard', price: productData.price, original_price: productData.originalPrice || null, stock_quantity: 20 }]
  }

  // =========================================================
  // 🌟 DYNAMIC FILLER STRATEGY FOR EXACTLY 5 DESKTOP CARDS
  // =========================================================
  
  // A. Fetch highly targeted similar category items (Pulling up to 5)
  const { data: directSimilarData } = await supabase
    .from("products")
    .select("id, name, price, originalPrice, image, category, tag, colors")
    .eq("available", true)
    .eq("category", productData.category)
    .neq("id", productData.id)
    .limit(5);

  let mergedProductsRaw = directSimilarData || [];

  // B. Fallback Fill-in Query: If similar items are fewer than 5, pull global products to fill up the slots
  if (mergedProductsRaw.length < 5) {
    const neededCount = 5 - mergedProductsRaw.length;
    const existingIds = [productData.id, ...mergedProductsRaw.map(p => p.id)];

    const { data: fillerData } = await supabase
      .from("products")
      .select("id, name, price, originalPrice, image, category, tag, colors")
      .eq("available", true)
      .not("id", "in", `(${existingIds.join(',')})`)
      .limit(neededCount);

    if (fillerData) {
      mergedProductsRaw = [...mergedProductsRaw, ...fillerData];
    }
  }

  // Map backend properties into your clean frontend card object format
  const finalSimilarProducts = mergedProductsRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    category_id: p.category?.toLowerCase() || 'jewelry',
    category_name: p.category || 'Jewelry',
    image_url: p.image || "/assets/img/placeholder.jpeg",
    price: p.price || 0,
    originalPrice: p.originalPrice || undefined,
    badge: p.tag || undefined,
    rating: 5.0,
    colorCount:p.colors 
  ? (Array.isArray(p.colors) 
      ? p.colors.length 
      : typeof p.colors === 'string' 
        ? p.colors.split(',').length 
        : 1)
  : 1
  }));

  const categoryName = productData.category || 'Jewelry';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          
          {/* Breadcrumbs Section */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-8">
            <Link href="/" className="hover:text-[#c5a880] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-[#c5a880] transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/shop?category=${productData.category?.toLowerCase()}`} className="hover:text-[#c5a880] transition-colors capitalize">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-semibold truncate max-w-[200px]">{productData.name}</span>
          </div>

          {/* Product Gallery & Details Form Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <ProductGallery images={images} productName={productData.name} badge={productData.tag} />

            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#c5a880] font-bold">
                  {categoryName} {productData.subcategory && `• ${productData.subcategory}`}
                </span>
                <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-neutral-900 mt-2 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {productData.name}
                </h1>
                <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
                  <div className="flex text-[#c5a880]">★★★★★</div>
                  <span className="font-semibold text-neutral-800">5.0 ★</span>
                  <span className="text-neutral-200">|</span>
                  <span>Waterproof & Anti-Tarnish</span>
                </div>
              </div>

              <ProductDetailActions 
                product={{ id: productData.id, name: productData.name, image_url: images[0], category_name: categoryName, variants: variants }}
              />

              {productData.description && (
                <div className="font-body text-neutral-600 text-sm leading-relaxed pt-2">
                  <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
                  <p className="whitespace-pre-wrap">{productData.description}</p>
                </div>
              )}

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Secure Payment Options</span>
                <div className="flex gap-3 text-neutral-400 text-xl">
                  <i className="fa-brands fa-cc-visa" title="Visa"></i>
                  <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
                  <i className="fa-brands fa-cc-rupay" title="Rupay"></i>
                  <i className="fa-solid fa-credit-card" title="UPI & Net Banking"></i>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ✅ RENDER DYNAMIC RE-RESTYLED SIMILAR PRODUCTS CLIENT COMPONENT */}
          {/* ========================================================= */}
          <SimilarProducts similarProducts={finalSimilarProducts} />

          {/* Recently Viewed Component Track Layout */}
          <RecentlyViewed currentProductId={productData.id} />
        </div>
      </main>
      <Footer />
    </>
  )
}
