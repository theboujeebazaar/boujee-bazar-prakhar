import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Shipping & Delivery Policy | The Boujee Bazaar',
}

export default function ShippingPolicy() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-white min-h-screen flex flex-col font-body">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-neutral-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Shipping & Delivery Policy</h1>
        
        <div className="prose prose-neutral prose-sm md:prose-base text-neutral-600 max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">Processing Time</h3>
          <p>
            All orders are processed within 2–3 business days. Personalized or custom orders may require an additional 5–7 business days before dispatch.
          </p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">Shipping Timelines</h3>
          <p>
            We ship across India from our studio in Kolkata, West Bengal.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Kolkata:</strong> 1–2 business days after dispatch.</li>
            <li><strong>West Bengal:</strong> 2–4 business days after dispatch.</li>
            <li><strong>Metro Cities:</strong> 3–5 business days after dispatch.</li>
            <li><strong>Rest of India:</strong> 5–7 business days after dispatch.</li>
          </ul>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">Shipping Charges</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Free shipping on all prepaid orders above ₹1,499.</li>
            <li>A flat shipping fee of ₹70 applies to orders below ₹1,499.</li>
          </ul>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">Tracking Your Order</h3>
          <p>
            Once your order has been dispatched, you'll receive a tracking link via email and WhatsApp. Please allow up to 24 hours for the tracking information to update.
          </p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">Delivery Delays</h3>
          <p>
            While we strive to deliver every order on time, delivery may occasionally be delayed due to weather conditions, public holidays, or courier-related issues. We appreciate your patience and understanding.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
