import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | The Style Zone',
  description: 'Learn how we collect, store, and safeguard your personal information when using our website.',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          
          {/* Header Section */}
          <div className="max-w-2xl mx-auto mb-16 animate-on-scroll text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">
              THE STYLE ZONE • PRIVACY
            </p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display leading-[1.1]">
              Privacy <span className="text-[#FE5733]">Policy.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">
              Your privacy matters. We&apos;re committed to protecting your personal information and being transparent about how we use it.
            </p>
            <div className="mt-6 pt-6 border-t border-[#121212]/10">
              <p className="text-xs text-[#121212]/50 font-mono">Last Updated: May 29, 2026</p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Section 1 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">1. Information We Collect</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                We collect information you provide directly when you interact with our services, including your name, email address, phone number, shipping address, and payment details.
              </p>
              <p className="text-xs text-[#121212]/60">
                <span className="font-bold text-[#121212]">Technical Data:</span> IP address, device type, browser information, and session data for analytics and security purposes.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">2. Data Security</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, or disclosure.
              </p>
              <ul className="space-y-2 text-xs text-[#121212]/70">
                <li>SSL/TLS encryption for all data transmissions</li>
                <li>Secure payment gateways (no raw card data storage)</li>
                <li>Regular security audits and system updates</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">3. How We Use Your Information</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                Your information helps us process orders, improve our services, and provide relevant communication about your purchases.
              </p>
              <p className="text-xs text-[#121212]/70">
                <span className="font-bold text-[#121212]">Order Processing:</span> Payment, shipping, and customer service
              </p>
              <p className="text-xs text-[#121212]/70 mt-2">
                <span className="font-bold text-[#121212]">Communication:</span> Order updates and support (with consent)
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">4. Cookies & Tracking</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed mb-4">
                We use cookies to maintain your shopping cart, remember preferences, and analyze site traffic to improve your experience.
              </p>
              <p className="text-xs text-[#121212]/60">
                <span className="font-bold text-[#121212]">Essential Cookies:</span> Required for basic functionality including checkout and cart management.
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-white border border-[#121212]/5 rounded-[4px] p-6 md:p-8 animate-on-scroll">
              <h2 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212] mb-4">5. Your Privacy Rights</h2>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed">
                You have the right to access, correct, or delete your personal information. Contact us to exercise these rights or opt-out of marketing communications.
              </p>
            </div>

          </div>

          {/* Contact Section */}
          <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-[#121212]/10 animate-on-scroll">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#121212]/70 mb-1">Have questions about your privacy?</p>
                <p className="text-xs text-[#121212]/50">Our team is here to help.</p>
              </div>
              <a 
                href="/contact" 
                className="bg-[#FE5733] hover:bg-[#121212] text-white px-8 py-4 shrink-0 transition-colors uppercase tracking-widest text-xs font-bold rounded-sm"
              >
                Contact Us
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
