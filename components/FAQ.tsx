'use client'

import { useState } from 'react'

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQProps {
  initialFaqs?: FAQItem[]
}

export default function FAQ({ initialFaqs = [] }: FAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Hardcoded premium backup configurations if the database table returns empty
  const fallbackFaqs: FAQItem[] = [
    {
      id: 'f1',
      question: 'Is the jewelry waterproof?',
      answer: 'Yes! Our pieces are designed to withstand everyday wear, including water exposure. However, for maximum longevity, we recommend avoiding harsh chemicals.',
    },
    {
      id: 'f2',
      question: 'Is it anti-tarnish?',
      answer: 'Absolutely. We use high-quality PVD plating which makes our jewelry highly resistant to tarnishing and fading.',
    },
    {
      id: 'f3',
      question: 'What is your shipping time?',
      answer: 'Standard shipping takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery.',
    },
  ]

  const faqs = initialFaqs.length > 0 ? initialFaqs : fallbackFaqs

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="w-full py-16 md:py-20 bg-[#faf8f5] overflow-hidden relative faq-section">
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Section Title - Updated to Boujee Bazaar Luxury Palette */}
        <div className="flex flex-col items-center justify-center mb-12">
          <h2 className="text-[22px] md:text-[27px] font-[800] tracking-[2px] flex flex-wrap items-center justify-center gap-x-[10px] text-neutral-900 font-['Poppins'] uppercase text-center">
            FREQUENTLY ASKED <span className="text-[#c5a880] italic font-['Playfair_Display'] capitalize">QUESTIONS</span> ✨
          </h2>
        </div>

        {/* FAQ Container */}
        <div className="faq-container space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = expandedIndex === idx
            return (
              <div 
                key={faq.id || idx} 
                className="faq-item border border-neutral-200/60 rounded-xl bg-white overflow-hidden transition-all duration-300"
              >
                {/* FAQ Question Button */}
                <button
                  type="button"
                  className={`faq-question w-full flex items-center justify-between text-left px-5 py-4 text-base font-semibold text-neutral-800 hover:text-[#c5a880] transition-colors focus:outline-none ${isOpen ? 'active text-[#c5a880]' : ''}`}
                  onClick={() => toggleFAQ(idx)}
                >
                  <span className="pr-4">{faq.question}</span>
                  <i
                    className="fa-solid fa-chevron-down text-sm"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  ></i>
                </button>

                {/* FAQ Answer Content View with clean height transitions */}
                <div
                  className="faq-answer-wrapper transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                  }}
                >
                  <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-neutral-600 font-medium border-t border-neutral-50/50">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
