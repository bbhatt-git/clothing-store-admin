import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | The Style Zone',
  description: 'Understand the terms, guidelines, and conditions for ordering from The Style Zone online.',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          
          {/* Header Section */}
          <div className="max-w-2xl mx-auto mb-16 animate-on-scroll text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">
              THE STYLE ZONE • TERMS
            </p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display leading-[1.1]">
              Terms of <span className="text-[#FE5733]">Service.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">
              Please read these terms carefully before using The Style Zone website and making purchases.
            </p>
            <div className="mt-6 pt-6 border-t border-[#121212]/10">
              <p className="text-xs text-[#121212]/50 font-mono">Last Updated: May 29, 2026</p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Section 1 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">1. Order Placement & Acceptance</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed">
                By placing an order through The Style Zone, you confirm that you are at least 18 years old or have parental consent to make purchases. All orders are subject to product availability and our acceptance of your order.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">2. Pricing & Payment Methods</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                All prices are listed in Nepalese Rupees (Rs) and include applicable taxes. We accept eSewa, Khalti, and Cash on Delivery for payments within Nepal.
              </p>
              <ul className="space-y-2 text-xs text-[#121212]/70">
                <li>Secure payment processing through trusted gateways</li>
                <li>Price protection against unauthorized charges</li>
                <li>Cash on Delivery available for Kanchanpur district</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">3. Returns & Refunds Policy</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                We offer a 15-day return window for unworn, unwashed items in original packaging with tags attached.
              </p>
              <p className="text-xs text-[#121212]/70">
                <span className="font-bold text-[#121212]">Returnable Items:</span> Clothing, footwear, and accessories in original condition
              </p>
              <p className="text-xs text-[#121212]/70 mt-2">
                <span className="font-bold text-[#121212]">Non-Returnable:</span> Sale items, intimate apparel, and customized products
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">4. Shipping & Delivery</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                Free shipping within Kanchanpur district. Standard delivery timelines apply for other regions based on courier service availability.
              </p>
              <p className="text-xs text-[#121212]/60">
                <span className="font-bold text-[#121212]">Free Delivery Zones:</span> Bhimdatta Municipality and surrounding areas in Kanchanpur
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">5. Limitations & Liability</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed">
                The Style Zone shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Product images are representative and actual colors may vary slightly.
              </p>
            </div>

          </div>

          {/* Footer Info */}
          <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-[#121212]/10 animate-on-scroll">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#121212]/70 mb-1">This agreement is governed by the laws of Nepal.</p>
                <p className="text-xs text-[#121212]/50">For questions, contact our support team.</p>
              </div>
              <a 
                href="/contact" 
                className="bg-[#FE5733] hover:bg-[#121212] text-white px-8 py-4 shrink-0 transition-colors uppercase tracking-widest text-xs font-bold rounded-sm"
              >
                Contact Support
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
