'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateProductVariant, bulkCreateProductVariants, deleteProductVariant } from '@/actions/products'

type Variant = {
  id: string
  product_id: string
  variant_name: string
  stock_quantity: number
  is_active: boolean
}

export function ProductVariantsEditor({
  productId,
  variants,
  colorSwatches,
}: {
  productId: string
  variants: Variant[]
  colorSwatches?: string | null
}) {
  const [isPending, startTransition] = useTransition()

  // The colors here always mirror the "Product Colors" chip list above —
  // this section is just for setting each color's stock (price is shared, set once above).
  const productColors = (() => {
    if (!colorSwatches) return []
    try {
      const parsed = JSON.parse(colorSwatches) as { name: string; hex: string }[]
      if (Array.isArray(parsed)) {
        return parsed.map((c) => ({ name: c.name.trim(), hex: c.hex || '#c5a880' })).filter((c) => c.name)
      }
    } catch (e) { }
    return []
  })()

  const findVariant = (name: string) =>
    variants.find((v) => v.variant_name.toLowerCase().trim() === name.toLowerCase().trim())

  const [edits, setEdits] = useState<Record<string, { stock: string; active: boolean }>>({})

  const getRow = (name: string) => {
    if (edits[name]) return edits[name]
    const v = findVariant(name)
    return { stock: v ? String(v.stock_quantity) : '0', active: v ? v.is_active : true }
  }

  const updateRow = (name: string, field: 'stock' | 'active', value: string | boolean) => {
    setEdits((prev) => ({
      ...prev,
      [name]: { ...getRow(name), [field]: value },
    }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const toCreate: { variant_name: string; stock_quantity: number; is_active: boolean }[] = []
      const updates: Promise<unknown>[] = []

      for (const c of productColors) {
        const row = getRow(c.name)
        const existing = findVariant(c.name)
        const stockQuantity = parseInt(row.stock || '0', 10)
        if (existing) {
          const fd = new FormData()
          fd.append('id', existing.id)
          fd.append('product_id', productId)
          fd.append('variant_name', c.name)
          fd.append('stock_quantity', String(stockQuantity))
          if (row.active) fd.append('is_active', 'on')
          updates.push(updateProductVariant({}, fd))
        } else {
          toCreate.push({ variant_name: c.name, stock_quantity: stockQuantity, is_active: row.active })
        }
      }

      if (toCreate.length > 0) {
        updates.push(bulkCreateProductVariants(productId, toCreate))
      }

      // Clean up stock rows for colors removed from Product Colors above, so they
      // don't linger as stale/purchasable options on the storefront.
      const currentNames = new Set(productColors.map((c) => c.name.toLowerCase().trim()))
      const orphaned = variants.filter((v) => !currentNames.has(v.variant_name.toLowerCase().trim()))
      for (const o of orphaned) {
        updates.push(deleteProductVariant(o.id, productId))
      }

      await Promise.all(updates)
      setEdits({})
    })
  }

  if (productColors.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Color Options</h3>
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-sm font-semibold text-gray-600">Add colors in Product Colors above first.</p>
          <p className="text-sm text-gray-500 mt-2">Stock for each color can be set here once they exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Color Options</h3>
          <p className="text-xs text-gray-500 mt-1">Set stock for each color. Price is shared from Basic Information above.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Stock
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Color</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {productColors.map((c) => {
              const row = getRow(c.name)
              return (
                <tr key={c.name} className="hover:bg-gray-50/50 transition-colors">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-bold text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      value={row.stock}
                      onChange={(e) => updateRow(c.name, 'stock', e.target.value)}
                      className="w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-1.5 border"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={(e) => updateRow(c.name, 'active', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                    </label>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
