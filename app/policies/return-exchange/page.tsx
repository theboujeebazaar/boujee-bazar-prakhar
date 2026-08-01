import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export const metadata = {
  title: 'Return & Exchange Policy | The Boujee Bazaar',
  description: 'Learn about our 7-day returns, exchanges, and cancellations for anti-tarnish luxury jewelry.',
}

export default function ReturnExchangePolicy() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-white min-h-screen flex flex-col font-body">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-neutral-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Return & Exchange Policy
        </h1>
        
        <div className="prose prose-neutral prose-sm md:prose-base text-neutral-600 max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">1. Order Cancellation</h3>
          <p>
            Orders can be cancelled within 24 hours of placement, provided they have not been dispatched. Once an order has been shipped, cancellations are not possible.
          </p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">2. No Returns or Exchanges</h3>
          <p>
            At The Boujee Bazaar, all sales are final. We do not accept returns or exchanges on any products once they have been delivered. Please review the product description, images, and size/details carefully before placing your order.
          </p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">3. Damaged, Defective or Incorrect Items</h3>
          <p>
            If you receive a damaged, defective, or incorrect product, please contact us within 48 hours of delivery with your order number, clear photos, and an unboxing video. After verification, we'll arrange a replacement or provide an appropriate resolution.
          </p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">4. Refunds</h3>
          <p>
            Refunds are not available for change of mind, incorrect orders placed by the customer, or dissatisfaction with the product.
          </p>
          <p>Refunds will only be issued if:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The product is out of stock after payment.</li>
            <li>A replacement cannot be provided for a verified damaged or incorrect item.</li>
          </ul>
          <p>Approved refunds will be processed to the original payment method within 5–7 business days.</p>

          <h3 className="font-display font-semibold text-xl text-neutral-900 mt-8 mb-4">5. Need Help?</h3>
          <p>
            If you have any questions regarding your order, please contact us via WhatsApp or email. We're always happy to assist you.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  )
}
