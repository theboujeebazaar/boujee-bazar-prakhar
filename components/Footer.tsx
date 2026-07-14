// import Image from "next/image";
// import { navLinks, SITE } from "@/lib/data";
// import BotanicalDivider from "./BotanicalDivider";

// export default function Footer() {
//   return (
//     <footer className="relative bg-emerald-deep pt-4">
//       <BotanicalDivider tone="gold" />
//       <div className="max-w-wrap mx-auto px-5 md:px-8 pb-10 pt-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr] gap-10 lg:gap-8">
//           {/* Column 1: Brand Info */}
//           <div>
//             <div className="flex items-center gap-2.5">
//               <Image
//                 src="/logo-light.webp"
//                 alt="Gulshan Modest logo"
//                 width={48}
//                 height={48}
//                 className="h-12 w-12 object-contain"
//               />
//               <span className="font-display font-semibold text-lg text-cream">
//                 Gulshan Modest
//               </span>
//             </div>
//             <p className="text-cream/60 text-sm mt-4 max-w-xs leading-relaxed">
//               Modest fashion with botanical detailing, premium fabric and
//               timeless silhouettes — designed in Delhi NCR, shipped pan-India.
//             </p>
//           </div>

//           {/* Column 2: Explore */}
//           <div>
//             <h4 className="font-display font-semibold text-cream text-sm tracking-wide uppercase">
//               Explore
//             </h4>
//             <ul className="mt-4 space-y-2.5">
//               {navLinks.map((link) => (
//                 <li key={link.href}>
//                   <a
//                     href={link.href}
//                     className="text-cream/65 text-sm hover:text-gold-light transition-colors"
//                   >
//                     {link.label}
//                   </a>
//                 </li>
//               ))}
//               <li>
//                 <a href="/about" className="text-cream/65 text-sm hover:text-gold-light transition-colors">
//                   About Us
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Column 3: Legal & Policies */}
//           <div>
//             <h4 className="font-display font-semibold text-cream text-sm tracking-wide uppercase">
//               Legal & Policies
//             </h4>
//             <ul className="mt-4 space-y-2.5">
//               <li>
//                 <a href="/policies/privacy" className="text-cream/65 text-sm hover:text-gold-light transition-colors">
//                   Privacy Policy
//                 </a>
//               </li>
//               <li>
//                 <a href="/policies/terms" className="text-cream/65 text-sm hover:text-gold-light transition-colors">
//                   Terms & Conditions
//                 </a>
//               </li>
//               <li>
//                 <a href="/policies/refund" className="text-cream/65 text-sm hover:text-gold-light transition-colors">
//                   Refund & Cancellation
//                 </a>
//               </li>
//               <li>
//                 <a href="/policies/shipping" className="text-cream/65 text-sm hover:text-gold-light transition-colors">
//                   Shipping & Delivery
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Column 4: Contact */}
//           <div>
//             <h4 className="font-display font-semibold text-cream text-sm tracking-wide uppercase">
//               Contact
//             </h4>
//             <ul className="mt-4 space-y-2.5 text-sm text-cream/65">
//               <li>
//                 <a href={`mailto:${SITE.email}`} className="hover:text-gold-light transition-colors break-all">
//                   {SITE.email}
//                 </a>
//               </li>
//               <li>
//                 <a href={`tel:${SITE.phoneHref}`} className="hover:text-gold-light transition-colors">
//                   {SITE.phone}
//                 </a>
//               </li>
//               <li>{SITE.city}</li>
//             </ul>
//           </div>
//         </div>

//         <div className="mt-10 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3">
//           <p className="text-cream/45 text-xs">
//             © {new Date().getFullYear()} Gulshan Modest. All rights reserved.
//           </p>
//           <p className="text-cream/45 text-xs">
//             Crafted with care, garden by garden.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }
"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-top">the<span className="highlight">boujee</span></div>
            <div className="logo-bottom">bazaar<span className="highlight">.</span></div>
          </div>
          <p style={{ marginTop: "15px" }}>Minimal jewelry for the <br />maximal you. ✨</p>
          <div className="social-icons" style={{ marginTop: "15px", display: "flex", gap: "15px" }}>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-pinterest-p"></i></a>
            <a href="#"><i className="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>SHOP</h4>
          <ul>
            <li><a href="/shop">All Products</a></li>
            <li><a href="#">Rings</a></li>
            <li><a href="#">Earrings</a></li>
            <li><a href="#">Necklaces</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>HELP</h4>
          <ul>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Shipping & Delivery</a></li>
            <li><a href="#">Returns & Exchanges</a></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>NEWSLETTER</h4>
          <p>Be the first to know about new arrivals!</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit"><i className="fa-solid fa-arrow-right"></i></button>
          </form>
          <div className="payment-icons" style={{ marginTop: "20px", display: "flex", gap: "10px", fontSize: "1.5rem", color: "#666" }}>
            <i className="fa-brands fa-cc-visa"></i>
            <i className="fa-brands fa-cc-mastercard"></i>
            <i className="fa-brands fa-cc-amex"></i>
            <i className="fa-brands fa-cc-paypal"></i>
          </div>
        </div>
      </div>
      <div className="footer-bottom" style={{ borderTop: "1px solid #eee", marginTop: "40px", paddingTop: "20px", textAlign: "center", fontSize: "0.9rem", color: "#999" }}>
        <p>&copy; {new Date().getFullYear()} The Boujee Bazaar. All rights reserved.</p>
      </div>
    </footer>
  );
}
