import React from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDock from '@/components/MobileDock';
import { Target, Eye, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <main className="flex-grow py-16 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">THE STYLE ZONE • MAHENDRANAGAR</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#121212] font-display leading-[1.1]">
              Our Archival <span className="text-[#FE5733]">Story.</span>
            </h1>
            <p className="text-sm opacity-70 mt-4 leading-relaxed font-sans">
              The Style Zone is a fashion boutique in Bhimdatta Municipality (Mahendranagar), Kanchanpur, Nepal. We sell clothes, hoodies, jackets, and accessories online and in our physical store.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="aspect-[4/3] rounded-[4px] overflow-hidden bg-[#121212]/10 relative shadow-sm">
              <img src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Our boutique" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl md:text-3xl font-bold uppercase tracking-tight font-display text-[#121212]">Real Inventory, Real Products</h3>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed font-sans">
                The Style Zone connects directly to our WooCommerce store system. Every product you see online is actually in stock at our Mahendranagar shop. No fake listings, no placeholder images — just real clothes you can buy and wear.
              </p>
              <p className="text-xs md:text-sm text-[#121212]/70 leading-relaxed font-sans">
                We offer hoodies, jackets, t-shirts, and fashion accessories with different sizes and colors. Our inventory updates automatically so you always see what's available right now.
              </p>
            </div>
          </div>

          <div className="border-t border-[#121212]/10 pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: <Target className="w-8 h-8 text-[#FE5733]" />, title: 'Direct from Source', desc: 'We source our products directly to keep prices reasonable and quality high. No middlemen, just good clothes at fair prices.' },
              { icon: <Eye className="w-8 h-8 text-[#FE5733]" />, title: 'Quality Checked', desc: 'Every item is checked at our Gali No. 2 shop before it goes online. We make sure sizes are right and clothes are in good condition.' },
              { icon: <Heart className="w-8 h-8 text-[#FE5733]" />, title: 'Local Service', desc: 'Visit our shop in Mahendranagar to try clothes before buying. We\'re here to help you find the right fit and style.' },
            ].map(v => (
              <div key={v.title} className="space-y-3 p-6 bg-white border border-[#121212]/5 rounded-[4px]">
                {v.icon}
                <h4 className="text-lg font-bold uppercase tracking-tight font-display text-[#121212]">{v.title}</h4>
                <p className="text-xs text-[#121212]/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#121212] text-[#F5F5F0] p-8 md:p-12 rounded-[4px] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-sm">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold text-[#FE5733] uppercase tracking-wider font-mono">VISIT OUR SHOP</p>
              <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter font-display">Find us in Mahendranagar</h4>
              <p className="text-xs md:text-sm text-[#F5F5F0]/70 leading-relaxed">
                Come to our store to see the clothes in person, try different sizes, and get help from our staff. We're located at Gali No. 2 near Madan Chowk in Bhimdatta Municipality.
              </p>
            </div>
            <Link href="/contact" className="bg-[#FE5733] hover:bg-white hover:text-[#121212] text-white px-8 py-4 shrink-0 transition-colors uppercase tracking-widest text-xs font-bold rounded-sm">
              Get Directions
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
