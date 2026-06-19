import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">THE STYLE ZONE • PRIVACY</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display leading-[1.1]">
              Privacy <span className="text-[#FE5733]">Policy.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">Your privacy matters. We're committed to protecting your personal information.</p>
            <div className="mt-6 pt-6 border-t border-[#121212]/10">
              <p className="text-xs text-[#121212]/50 font-mono">Last Updated: May 29, 2026</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { title: '1. Information We Collect', content: 'We collect information you provide directly when you interact with our services, including your name, email address, phone number, shipping address, and payment details. We also collect technical data: IP address, device type, browser information, and session data for analytics and security purposes.' },
              { title: '2. Data Security', content: 'We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, or disclosure. This includes SSL/TLS encryption for all data transmissions, secure payment gateways (no raw card data storage), and regular security audits.' },
              { title: '3. How We Use Your Information', content: 'We use collected information to process your orders, send order confirmations and updates, improve our products and services, communicate promotional offers (with your consent), and comply with legal obligations.' },
              { title: '4. Data Retention', content: 'We retain your personal data for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law. Order data is retained for 7 years for accounting purposes.' },
              { title: '5. Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at info@thestylezone.com.np. We will respond within 30 days.' },
              { title: '6. Contact Us', content: 'If you have any questions about this Privacy Policy, please contact us at: The Style Zone, Street No. 2, Bhimdatta-4, Mahendranagar, Kanchanpur, Nepal. Email: info@thestylezone.com.np | Phone: +977 984-8123456' },
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
