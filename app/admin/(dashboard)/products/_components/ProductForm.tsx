// 'use client'

// import { useTransition, useActionState, useState } from 'react'
// import {
//   createProduct,
//   updateProduct,
//   type ActionResult,
// } from '@/actions/products'
// import Link from 'next/link'
// import { Save, ArrowLeft } from 'lucide-react'
// import type { Category, Product } from '@/types/database'

// type OtherProduct = Pick<Product, 'id' | 'name' | 'color_group_id' | 'color_name'>

// interface ProductFormProps {
//   product?: Product
//   categories: Category[]
//   otherProducts?: OtherProduct[]
// }

// export default function ProductForm({ product, categories, otherProducts = [] }: ProductFormProps) {
//   const isEditing = !!product
//   const action = isEditing ? updateProduct : createProduct

//   const [state, formAction] = useActionState<ActionResult, FormData>(
//     action,
//     {}
//   )
//   const [pending, startTransition] = useTransition()

//   // If this product already belongs to a color group, preselect a sibling
//   // from that same group as the "group with" default.
//   const currentSibling = product?.color_group_id
//     ? otherProducts.find((p) => p.color_group_id === product.color_group_id)
//     : undefined
//   const [colorHex, setColorHex] = useState(product?.color_hex || '#1E3B2E')

//   return (
//     <form
//       action={(formData) => startTransition(() => formAction(formData))}
//       className="space-y-6"
//     >
//       {isEditing && <input type="hidden" name="id" value={product.id} />}

//       {/* Error */}
//       {state.error && (
//         <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//           {state.error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
//         {/* Main column */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Basic Info */}
//           <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
//             <h2 className="text-base font-semibold text-stone-900">
//               Basic Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               {/* Name */}
//               <div>
//                 <label
//                   htmlFor="product-name"
//                   className="block text-sm font-medium text-stone-700 mb-1.5"
//                 >
//                   Product Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="product-name"
//                   name="name"
//                   type="text"
//                   required
//                   maxLength={255}
//                   defaultValue={product?.name || ''}
//                   placeholder="e.g. Premium Front Open Abaya"
//                   className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//                 />
//                 <p className="text-xs text-stone-400 mt-1.5">
//                   Slug will be auto-generated from the name.
//                 </p>
//               </div>

//               {/* Category */}
//               <div>
//                 <label
//                   htmlFor="product-category"
//                   className="block text-sm font-medium text-stone-700 mb-1.5"
//                 >
//                   Category
//                 </label>
//                 <select
//                   id="product-category"
//                   name="category_id"
//                   required
//                   defaultValue={product?.category_id || ''}
//                   className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//                 >
//                   <option value="">Select a category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Short Description */}
//             <div>
//               <label
//                 htmlFor="product-short-desc"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 Short Description
//               </label>
//               <textarea
//                 id="product-short-desc"
//                 name="short_description"
//                 rows={3}
//                 maxLength={500}
//                 defaultValue={product?.short_description || ''}
//                 placeholder="Brief one-liner about the product"
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-none"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               {/* Fabric Details */}
//               <div>
//                 <label
//                   htmlFor="product-fabric"
//                   className="block text-sm font-medium text-stone-700 mb-1.5"
//                 >
//                   Fabric Details
//                 </label>
//                 <input
//                   id="product-fabric"
//                   name="fabric"
//                   type="text"
//                   defaultValue={(product as any)?.fabric || ''}
//                   placeholder="e.g. Premium quality nida/crepe"
//                   className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//                 />
//               </div>

//               {/* Stitching Details */}
//               <div>
//                 <label
//                   htmlFor="product-stitching"
//                   className="block text-sm font-medium text-stone-700 mb-1.5"
//                 >
//                   Stitching Details
//                 </label>
//                 <input
//                   id="product-stitching"
//                   name="stitching"
//                   type="text"
//                   defaultValue={(product as any)?.stitching || ''}
//                   placeholder="e.g. Dual-reinforced seams"
//                   className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <label
//                 htmlFor="product-description"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 Full Description
//               </label>
//               <textarea
//                 id="product-description"
//                 name="description"
//                 rows={14}
//                 maxLength={5000}
//                 defaultValue={product?.description || ''}
//                 placeholder="Detailed product description..."
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-y"
//               />
//             </div>
//           </div>

//           {/* SEO */}
//           <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
//             <h2 className="text-base font-semibold text-stone-900">SEO</h2>

//             <div>
//               <label
//                 htmlFor="seo-title"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 SEO Title
//               </label>
//               <input
//                 id="seo-title"
//                 name="seo_title"
//                 type="text"
//                 maxLength={60}
//                 defaultValue={product?.seo_title || ''}
//                 placeholder="Custom title for search engines"
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="seo-description"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 SEO Description
//               </label>
//               <textarea
//                 id="seo-description"
//                 name="seo_description"
//                 rows={5}
//                 maxLength={160}
//                 defaultValue={product?.seo_description || ''}
//                 placeholder="Meta description for search results"
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-y"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Sidebar column */}
//         <div className="lg:col-span-1 space-y-6">
//           {/* Status */}
//           <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
//             <h2 className="text-base font-semibold text-stone-900">Status</h2>

//             {/* Badge / Tag */}
//             <div>
//               <label
//                 htmlFor="product-badge"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 Badge / Tag
//               </label>
//               <select
//                 id="product-badge"
//                 name="badge"
//                 defaultValue={product?.badge || ''}
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//               >
//                 <option value="">No badge</option>
//                 <option value="New">New</option>
//                 <option value="Hot">Hot</option>
//                 <option value="Bestseller">Bestseller</option>
//                 <option value="Premium">Premium</option>
//                 <option value="Popular">Popular</option>
//                 <option value="Luxe">Luxe</option>
//                 <option value="Handcrafted">Handcrafted</option>
//               </select>
//               <p className="text-xs text-stone-400 mt-1.5">
//                 Shown as a small tag on the product card in the storefront.
//               </p>
//             </div>

//             {/* Active Status */}
//             <div className="flex items-center gap-3">
//               <input
//                 id="product-active"
//                 name="is_active"
//                 type="checkbox"
//                 defaultChecked={product?.is_active ?? true}
//                 className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
//               />
//               <label
//                 htmlFor="product-active"
//                 className="text-sm font-medium text-stone-700"
//               >
//                 Active — visible in the store
//               </label>
//             </div>

//             {/* Featured Status */}
//             <div className="flex items-center gap-3">
//               <input
//                 id="product-featured"
//                 name="is_featured"
//                 type="checkbox"
//                 defaultChecked={product?.is_featured ?? false}
//                 className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
//               />
//               <label
//                 htmlFor="product-featured"
//                 className="text-sm font-medium text-stone-700"
//               >
//                 Featured — highlight on homepage
//               </label>
//             </div>
//           </div>

//           {/* Color Variant */}
//           <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
//             <h2 className="text-base font-semibold text-stone-900">Color Variant</h2>
//             <p className="text-xs text-stone-400 -mt-3">
//               Link this product to another color of the same design so shoppers
//               see them as color options on one product page.
//             </p>

//             <div>
//               <label
//                 htmlFor="product-color-name"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 Color Name
//               </label>
//               <input
//                 id="product-color-name"
//                 name="color_name"
//                 type="text"
//                 maxLength={60}
//                 defaultValue={product?.color_name || ''}
//                 placeholder="e.g. Emerald Green"
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="product-color-hex"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 Swatch Color
//               </label>
//               <div className="flex items-center gap-2.5">
//                 <input
//                   id="product-color-hex"
//                   type="color"
//                   value={colorHex}
//                   onChange={(e) => setColorHex(e.target.value)}
//                   className="w-11 h-11 rounded-lg border border-stone-200 cursor-pointer shrink-0 p-0.5"
//                 />
//                 <input
//                   name="color_hex"
//                   type="text"
//                   value={colorHex}
//                   onChange={(e) => setColorHex(e.target.value)}
//                   maxLength={7}
//                   className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="product-group-with"
//                 className="block text-sm font-medium text-stone-700 mb-1.5"
//               >
//                 Group With
//               </label>
//               <select
//                 id="product-group-with"
//                 name="group_with"
//                 defaultValue={currentSibling?.id || ''}
//                 className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
//               >
//                 <option value="">Standalone — no color group</option>
//                 {otherProducts.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name}
//                     {p.color_name ? ` (${p.color_name})` : ''}
//                   </option>
//                 ))}
//               </select>
//               <p className="text-xs text-stone-400 mt-1.5">
//                 Pick any product that's already this design in another color —
//                 they'll all be linked as one color group automatically.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex items-center justify-between">
//         <Link
//           href="/admin/products"
//           className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Products
//         </Link>
//         <button
//           type="submit"
//           disabled={pending}
//           className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
//         >
//           {pending ? (
//             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//           ) : (
//             <Save className="w-4 h-4" />
//           )}
//           {isEditing ? 'Update Product' : 'Create Product'}
//         </button>
//       </div>
//     </form>
//   )
// }
'use client'
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { useTransition, useActionState, useState } from 'react'
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from '@/actions/products'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'

interface ProductFormProps {
  product?: any
  categories: any[]
  otherProducts?: any[]
}

export default function ProductForm({ product, categories, otherProducts = [] }: ProductFormProps) {
  const isEditing = !!product
  const action = isEditing ? updateProduct : createProduct
  const [imageUrl, setImageUrl] = useState(product?.image || "");
const [isUploading, setIsUploading] = useState(false);
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {}
  )
  const [pending, startTransition] = useTransition()

  // Preselect color swatch defaults safely
  const currentSibling = product?.color_group_id
    ? otherProducts.find((p) => p.color_group_id === product.color_group_id)
    : undefined
  const [colorHex, setColorHex] = useState(product?.color_hex || '#c5a880')

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="space-y-6"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {isEditing && <input type="hidden" name="id" value={product.id} />}

      {/* Real-time Validation Error Banner */}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Action Toolbar Header */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-stone-800 to-stone-900 text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-95 transition-all"
        >
          {pending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? 'Update Piece' : 'Save Jewelry Piece'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Main specifications fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Profile */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Basic Jewelry Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Name */}
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Jewelry Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  required
                  maxLength={255}
                  defaultValue={product?.name || ''}
                  placeholder="e.g. Celestial Droplet Pendant"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Collection Category
                </label>
                <select
                  id="product-category"
                  name="category" // Maps straight to your text column named 'category'
                  required
                  defaultValue={product?.category || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="product-sku" className="block text-sm font-medium text-stone-700 mb-1.5">Item SKU</label>
                <input
                  id="product-sku"
                  name="sku"
                  type="text"
                  defaultValue={product?.sku || ''}
                  placeholder="e.g. BB-RNG-CEL-001"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
              <div>
                <label htmlFor="product-stock" className="block text-sm font-medium text-stone-700 mb-1.5">Warehouse Stock</label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? 10}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  defaultValue={product?.price || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
              <div>
                <label htmlFor="product-orig-price" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Original Strike Price (₹)
                </label>
                <input
                  id="product-orig-price"
                  name="originalPrice" // Maps cleanly to your camelCase field 'originalPrice'
                  type="number"
                  min="0"
                  defaultValue={product?.originalPrice || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Composition & Care specs */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Jewelry Composition & Care Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="product-fabric" className="block text-sm font-medium text-stone-700 mb-1.5">Material Base & Plating</label>
                <input
                  id="product-fabric"
                  name="fabric_info" // Maps to 'fabric_info' column shape
                  type="text"
                  defaultValue={product?.fabric_info || ''}
                  placeholder="e.g. 18k Gold Plated Surgical Steel"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
              <div>
                <label htmlFor="product-stitching" className="block text-sm font-medium text-stone-700 mb-1.5">Cleaning Instructions</label>
                <input
                  id="product-stitching"
                  name="washing_instructions" // Maps to 'washing_instructions' column shape
                  type="text"
                  defaultValue={product?.washing_instructions || ''}
                  placeholder="e.g. Waterproof. Wipe dry with microfiber cloth."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="product-description" className="block text-sm font-medium text-stone-700 mb-1.5">Full Description</label>
              <textarea
                id="product-description"
                name="description"
                rows={8}
                maxLength={5000}
                defaultValue={product?.description || ''}
                placeholder="Detailed catalog text copy..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all resize-y"
              />
            </div>
          </div> 

          {/* Section C: Search Engine Optimization (SEO) */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">SEO Configurations</h2>
            <div>
              <label htmlFor="seo-title" className="block text-sm font-medium text-stone-700 mb-1.5">
                SEO Meta Title
              </label>
              <input
                id="seo-title"
                name="seo_title" // Maps cleanly to your 'seo_title' database column
                type="text"
                maxLength={60}
                defaultValue={product?.seo_title || ''}
                placeholder="Custom title tag for search engine result cards"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
              />
            </div>
            <div>
              <label htmlFor="seo-description" className="block text-sm font-medium text-stone-700 mb-1.5">
                SEO Meta Description
              </label>
              <textarea
                id="seo-description"
                name="seo_description" // Maps cleanly to your 'seo_description' database column
                rows={4}
                maxLength={160}
                defaultValue={product?.seo_description || ''}
                placeholder="Custom metadata summary snippets for Google results..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media uploads & visibility switch panels */}
        <div className="space-y-6">
          
          {/* Section D: Catalog Cover Media Placement */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-4">
            <h2 className="text-base font-semibold text-stone-900">Catalog Media</h2>
            <div>
              <label htmlFor="product-image" className="block text-sm font-medium text-stone-700 mb-1.5">
                Image Upload 
              </label>
              <input
  type="hidden"
  name="image"
  value={imageUrl}
/>

{imageUrl ? (
  <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden border">
    <Image
      src={imageUrl}
      alt="Product"
      fill
      className="object-cover"
    />

    <button
      type="button"
      onClick={() => setImageUrl("")}
      className="absolute top-2 right-2 bg-white rounded-full p-2"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
) : (
  <CldUploadWidget
    signatureEndpoint="/api/cloudinary/sign"
    options={{
      maxFiles: 1,
      resourceType: "image",
      clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
    }}
    onOpen={() => setIsUploading(true)}
    onSuccess={(result: any) => {
      setImageUrl(result.info.secure_url);
      setIsUploading(false);
    }}
    onError={() => setIsUploading(false)}
  >
    {({ open }) => (
      <button
        type="button"
        onClick={() => open()}
        disabled={isUploading}
        className="w-full max-w-sm aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center"
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <ImageIcon className="w-7 h-7" />
            <span>Upload Product Image</span>
          </>
        )}
      </button>
    )}
  </CldUploadWidget>
)}
            </div>
            {product?.image && (
              <div className="border rounded-xl overflow-hidden aspect-square relative bg-stone-50 mt-2">
                <img src={product.image} alt="Upload preview thumbnail" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Section E: Visibility Controls & Status Badges */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Visibility & Status Badges</h2>
            
            {/* Storefront Promo Tag */}
            <div>
              <label htmlFor="product-badge" className="block text-sm font-medium text-stone-700 mb-1.5">
                Storefront Tag Badge
              </label>
              <select
                id="product-badge"
                name="tag" // Maps straight to your text column field named 'tag'
                defaultValue={product?.tag || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
              >
                <option value="">No Badge</option>
                <option value="New">New</option>
                <option value="Hot">Hot</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Premium">Premium</option>
                <option value="Popular">Popular</option>
                <option value="Luxe">Luxe</option>
                <option value="Handcrafted">Handcrafted</option>
              </select>
            </div>

            {/* Availability Checks */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <input
                  id="product-active"
                  name="available" // Maps straight to your column boolean toggle named 'available'
                  type="checkbox"
                  value="true"
                  defaultChecked={product?.available !== false}
                  className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-[#c5a880]"
                />
                <label htmlFor="product-active" className="text-sm font-medium text-stone-700 cursor-pointer select-none">
                  Active — Publish straight onto store pages
                </label>
              </div>

              {/* Homepage Grid Feature Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  id="product-featured"
                  name="is_featured" // Maps your homepage selection criteria rules safely
                  type="checkbox"
                  value="true"
                  defaultChecked={product?.is_featured ?? false}
                  className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-[#c5a880]"
                />
                <label htmlFor="product-featured" className="text-sm font-medium text-stone-700 cursor-pointer select-none">
                  Featured — Place inside homepage product list
                </label>
              </div>
            </div>
          </div>

          {/* Section F: Metal Tone Variations */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Metal Tone Variations</h2>
            <div>
              <label htmlFor="product-color-name" className="block text-sm font-medium text-stone-700 mb-1.5">
                Color / Tone Title
              </label>
              <input
                id="product-color-name"
                name="colors" // Maps straight to your 'colors' text column parameter row layout
                type="text"
                maxLength={60}
                defaultValue={product?.colors || ''}
                placeholder="e.g. 18k Rose Gold, Polished Silver"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
              />
            </div>
            
            {/* Color Swatch Picker Wrapper */}
            <div>
              <label htmlFor="product-color-hex" className="block text-sm font-medium text-stone-700 mb-1.5">
                Swatch Tone Color
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  id="product-color-hex"
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-11 h-11 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                />
                <input
                  name="color_hex"
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  maxLength={7}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                />
              </div>
            </div>

            {/* Optional Color Variant Sibling Sorter Group */}
            <div>
              <label htmlFor="product-group-with" className="block text-sm font-medium text-stone-700 mb-1.5">
                Group With Sibling Design
              </label>
              <select
                id="product-group-with"
                name="group_with"
                defaultValue={currentSibling?.id || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
              >
                <option value="">Standalone — no color group</option>
                {otherProducts.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.colors ? `(${p.colors})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}