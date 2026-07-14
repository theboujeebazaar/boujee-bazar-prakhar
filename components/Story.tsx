'use client'

import Image from "next/image";
import Reveal from "./Reveal";
import { Sparkles } from "lucide-react"; // Replaced Tulip with a clean, modern Sparkles vector icon

export default function Story() {
  return (
    <section id="story" className="relative py-16 md:py-24 bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Placement Wrapper */}
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative max-w-[460px] mx-auto">
              {/* Image Frame Container Box */}
              <div className="relative aspect-[5/6] rounded-[24px] overflow-hidden shadow-lg border border-neutral-100">
  <Image
    // 🌟 FIXED: Added the leading forward slash '/' to point directly to your public folder root path
    src="/assets/img/pr_6.jpeg" 
    alt="The Boujee Bazaar Earring collection showcase model"
    fill
    sizes="(max-width: 768px) 90vw, 460px"
    className="object-cover object-top"
    priority
  />
</div>
              
              {/* Overlaid Experience Floating Badge */}
              <div className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 bg-white rounded-2xl shadow-md px-5 py-4 max-w-[200px] border border-neutral-100">
                {/* Updated theme typography from text-emerald to premium gold */}
                <p className="font-display font-bold text-2xl text-[#c5a880] leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
                  24k
                </p>
                <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-snug">
                  Premium PVD gold standard overlays
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Copywriting Presentation Area */}
          <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-start lg:text-left lg:py-4">
            <Reveal>
              <div className="inline-flex items-center gap-2 eyebrow justify-center text-neutral-400 uppercase tracking-widest text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                Our Story
              </div>
            </Reveal>
            
            <Reveal delay={1}>
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mt-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Curated curation,
                <br />
                worn with statement.
              </h2>
            </Reveal>
            
            {/* Jewelry-oriented Copywriting Overhaul */}
            <Reveal delay={2}>
              <p className="text-neutral-600 text-sm md:text-base mt-5 max-w-[520px] leading-relaxed">
                At <strong className="text-neutral-900 font-semibold">The Boujee Bazaar</strong>, jewelry isn't just an accessory—it's an armor of everyday luxury. We design minimal, statement accessories engineered for relentless daily use. Every premium piece starts with surgical stainless steel bases, vacuum-sealed with 18k and 24k gold overlay drapes.
              </p>
            </Reveal>
            
            <Reveal delay={3}>
              <p className="text-neutral-600 text-sm md:text-base mt-4 max-w-[520px] leading-relaxed">
                Completely waterproof, sweat-resistant, and 100% hypoallergenic. Shipped with care straight from our Indian operation centers to fashion-forward collectors nationwide.
              </p>
            </Reveal>
            
            {/* Metric Analytics Counters Blocks */}
            <Reveal delay={4} className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-4 w-full pt-4 border-t border-neutral-50">
              <div className="flex flex-col items-center lg:items-start">
                <p className="font-display font-bold text-2xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  250+
                </p>
                <p className="text-xs text-neutral-400 font-medium mt-0.5 uppercase tracking-wider">
                  Luxury Styles
                </p>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <p className="font-display font-bold text-2xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  PAN
                </p>
                <p className="text-xs text-neutral-400 font-medium mt-0.5 uppercase tracking-wider">
                  India Delivery
                </p>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <p className="font-display font-bold text-2xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  15,000+
                </p>
                <p className="text-xs text-neutral-400 font-medium mt-0.5 uppercase tracking-wider">
                  Pieces Shined
                </p>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
