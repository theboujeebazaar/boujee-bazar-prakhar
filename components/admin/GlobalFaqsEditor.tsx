'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react'
import { addGlobalFaq, updateGlobalFaq, deleteGlobalFaq, updateGlobalFaqOrders } from '@/actions/global_faqs'

type Faq = {
  id: string
  question: string
  answer: string
  display_order: number
}

export function GlobalFaqsEditor({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addGlobalFaq(formData)
    if (res.success && res.data) {
      setFaqs([...faqs, res.data])
      setIsAdding(false)
    } else {
      alert('Error adding FAQ')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this global FAQ?')) return
    setLoading(true)
    const res = await deleteGlobalFaq(id)
    if (res.success) {
      setFaqs(faqs.filter(f => f.id !== id))
    } else {
      alert('Error deleting FAQ')
    }
    setLoading(false)
  }

  async function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateGlobalFaq(id, formData)
    if (res.success && res.data) {
      setFaqs(faqs.map(f => f.id === id ? res.data : f))
      alert('Saved!')
    } else {
      alert('Error updating FAQ')
    }
    setLoading(false)
  }

  const moveUp = async (index: number) => {
    if (index === 0) return
    const newFaqs = [...faqs]
    const temp = newFaqs[index].display_order
    newFaqs[index].display_order = newFaqs[index - 1].display_order
    newFaqs[index - 1].display_order = temp
    newFaqs.sort((a, b) => a.display_order - b.display_order)
    setFaqs(newFaqs)
    
    await updateGlobalFaqOrders([
      { id: newFaqs[index].id, display_order: newFaqs[index].display_order },
      { id: newFaqs[index - 1].id, display_order: newFaqs[index - 1].display_order }
    ])
  }

  const moveDown = async (index: number) => {
    if (index === faqs.length - 1) return
    const newFaqs = [...faqs]
    const temp = newFaqs[index].display_order
    newFaqs[index].display_order = newFaqs[index + 1].display_order
    newFaqs[index + 1].display_order = temp
    newFaqs.sort((a, b) => a.display_order - b.display_order)
    setFaqs(newFaqs)

    await updateGlobalFaqOrders([
      { id: newFaqs[index].id, display_order: newFaqs[index].display_order },
      { id: newFaqs[index + 1].id, display_order: newFaqs[index + 1].display_order }
    ])
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header Panel Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Global FAQs
          </h2>
          <p className="mt-1 text-sm text-stone-500 font-medium">
            These FAQs will appear across product showcases configured to use your master list.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          /* ✅ FIXED: Swapped generic indigo for premium high-contrast stone black button design */
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stone-800 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Global FAQ
        </button>
      </div>

      {/* Editor Cards Container Stack */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <form 
            key={faq.id} 
            onSubmit={(e) => handleUpdate(faq.id, e)} 
            /* ✅ FIXED: Shifted card wrapper frame to premium stone layout borders and crisp background */
            className="relative flex flex-col sm:flex-row items-stretch gap-4 p-5 border border-stone-200/80 rounded-xl bg-white hover:shadow-md hover:shadow-stone-100 transition-all duration-300"
          >
            {/* Sorting Up/Down Chevron Buttons */}
            <div className="flex sm:flex-col items-center justify-center gap-1 bg-stone-50 border border-stone-100 rounded-lg p-1 sm:px-2 flex-shrink-0 self-start sm:self-center">
              <button 
                type="button" 
                onClick={() => moveUp(index)} 
                disabled={index === 0} 
                className="p-1 text-stone-400 hover:text-[#c5a880] disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
                title="Move Row Up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-stone-400 select-none px-1">
                {index + 1}
              </span>
              <button 
                type="button" 
                onClick={() => moveDown(index)} 
                disabled={index === faqs.length - 1} 
                className="p-1 text-stone-400 hover:text-[#c5a880] disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
                title="Move Row Down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            {/* Content Field Inputs */}
            <div className="flex-1 space-y-3.5">
              <div>
                <input
                  type="text"
                  name="question"
                  defaultValue={faq.question}
                  placeholder="Enter the question text..."
                  /* ✅ FIXED: Swapped indigo ring for elegant brand signature gold [#c5a880] */
                  className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 text-sm font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                  required
                />
              </div>
              <div>
                <textarea
                  name="answer"
                  rows={2}
                  defaultValue={faq.answer}
                  placeholder="Provide the answer details..."
                  /* ✅ FIXED: Swapped indigo ring for elegant brand signature gold [#c5a880] */
                  className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-700 text-sm font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all resize-none"
                  required
                />
              </div>
            </div>

            {/* Row Actions Panel */}
            <div className="flex sm:flex-col items-center justify-end sm:justify-center gap-2 pt-2 sm:pt-0 border-t border-dashed border-stone-100 sm:border-t-0 sm:pl-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-200 transition-all w-full sm:w-auto justify-center"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-red-600 border border-stone-200 hover:bg-red-50 hover:border-red-200 transition-all w-full sm:w-auto justify-center"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </form>
        ))}

        {/* Inline In-Place Add New FAQ Drawer Component */}
        {isAdding && (
          <form 
            onSubmit={handleAdd} 
            /* ✅ FIXED: Shifted insertion tray card frame to cream luxury gold accenting boundaries */
            className="relative flex flex-col md:flex-row items-start gap-4 p-6 border-2 border-dashed border-[#c5a880]/60 rounded-xl bg-[#FBF7F0]/40 animation-fadeIn duration-200"
          >
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Question
                </label>
                <input
                  type="text"
                  name="question"
                  placeholder="e.g. Is your gold jewelry tarnish-free?"
                  className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Answer
                </label>
                <textarea
                  name="answer"
                  rows={2}
                  placeholder="e.g. Yes, all our collections utilize premium 18k vacuum plating tech which makes them 100% waterproof."
                  className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] transition-all resize-none"
                  required
                />

              </div>
            </div>
            <div className="flex flex-col gap-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors w-full md:w-28"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
