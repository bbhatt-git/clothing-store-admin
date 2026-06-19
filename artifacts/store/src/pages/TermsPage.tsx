import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">THE STYLE ZONE • TERMS</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display leading-[1.1]">
              Terms of <span className="text-[#FE5733]">Service.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">Please read these terms carefully before using our website and making purchases.</p>
            <div className="mt-6 pt-6 border-t border-[#121212]/10">
              <p className="text-xs text-[#121212]/50 font-mono">Last Updated: May 29, 2026</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { title: '1. Order Placement & Acceptance', content: 'By placing an order through The Style Zone, you confirm that you are at least 18 years old or have parental consent. All orders are subject to product availability and our acceptance.' },
              { title: '2. Pricing & Payment Methods', content: 'All prices are listed in Nepalese Rupees (Rs) and include applicable taxes. We accept eSewa, Khalti, and Cash on Delivery for payments within Nepal. Secure payment processing through trusted gateways.' },
              { title: '3. Shipping & Delivery', content: 'We offer delivery within Kanchanpur district. Delivery times are typically 1-3 business days. Cash on Delivery is available for all areas we serve.' },
              { title: '4. Returns & Exchanges', content: 'We accept returns within 7 days of delivery if the product is unused and in its original condition. To initiate a return, contact us with your order number and reason for return.' },
              { title: '5. Product Authenticity', content: 'All products sold at The Style Zone are 100% authentic. We source our products directly and inspect each item before listing it online.' },
              { title: '6. Governing Law', content: 'These terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Kanchanpur, Nepal.' },
            ].map(s => (
              <div key={s.title} className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8">
                <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">{s.title}</h2>
                <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
