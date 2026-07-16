// import { createClient } from '@/lib/supabase/server'
// import Link from 'next/link'
// import { Plus, Package } from 'lucide-react'
// import type { Metadata } from 'next'
// import ProductRow from './_components/ProductRow'

// export const metadata: Metadata = {
//   title: 'Products',
// }

// export default async function ProductsPage() {
//   const supabase = await createClient()

//   const { data: products } = await supabase
//     .from('products')
//     .select('*, categories(name)')
//     .order('created_at', { ascending: false })

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-stone-900">Products</h1>
//           <p className="text-stone-500 text-sm mt-0.5">
//             Manage your product catalog
//           </p>
//         </div>
//         <Link
//           href="/admin/products/new"
//           className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
//         >
//           <Plus className="w-4 h-4" />
//           Add Product
//         </Link>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
//         {!products || products.length === 0 ? (
//           <div className="p-12 text-center">
//             <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
//             <p className="text-stone-500 text-sm">No products yet</p>
//             <p className="text-stone-400 text-xs mt-1">
//               Create your first product to get started.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-stone-50/50">
//                   <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
//                     Product
//                   </th>
//                   <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
//                     Category
//                   </th>
//                   <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
//                     Badge
//                   </th>
//                   <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
//                     Status
//                   </th>
//                   <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
//                     Created
//                   </th>
//                   <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-stone-100">
//                 {products.map((product) => (
//                   <ProductRow key={product.id} product={product} />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import { createAdminClient } from '@/lib/supabase/admin' // 🌟 FIXED: Master superuser bypasses RLS blocks completely
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import type { Metadata } from 'next'
import ProductRow from './_components/ProductRow'

export const metadata: Metadata = {
  title: 'Products | The Boujee Bazaar Admin',
}

export default async function ProductsPage() {
  const supabaseAdmin = createAdminClient()

  // 1. ✅ FETCHES ALL COLUMNS CLEANLY ACCORDING TO YOUR EXACT DATABASE KEYS
  const { data: rawProducts, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase catalog hydration fault:", error.message)
  }

  // 2. Data Sanitizer: Normalizes your columns to prevent child rendering crashes
  const products = (rawProducts || []).map((p: any) => ({
    ...p,
    // Maps your text 'category' column so the UI displays it cleanly
    category_name: p.category || 'Jewelry',
    // Maps your 'available' boolean to the status column checks
    is_active: p.available ?? true,
    // Maps your 'tag' column to the badge display
    badge: p.tag || undefined,
    // Maps your 'image' column so the sub-row thumbnail can render preview photos
    featured_image_url: p.image || '/assets/img/placeholder.jpeg',
    // Injects explicit fallbacks for your newly appended table columns
    is_new_arrival: p.is_new_arrival ?? false,
    is_best_seller: p.is_best_seller ?? false
  }))

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Playfair Display, serif' }}>Products</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage your minimal & luxury jewelry catalog and curated homepage drops.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl shadow-md hover:bg-neutral-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Table grid layout container */}
      <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No products found inside your Supabase table</p>
            <p className="text-stone-400 text-xs mt-1">
              Add rows to your products table in Supabase to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-600 text-xs font-semibold">
                  <th className="px-6 py-3.5 tracking-wider uppercase">
                    Product
                  </th>
                  {/* 🌟 FIXED: Added columns to perfectly match the placement of checkboxes in ProductRow */}
                  <th className="px-6 py-3.5 tracking-wider uppercase text-center">
                    New Arrival
                  </th>
                  <th className="px-6 py-3.5 tracking-wider uppercase text-center">
                    Best Seller
                  </th>
              
                  <th className="px-6 py-3.5 tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3.5 tracking-wider uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3.5 tracking-wider uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
