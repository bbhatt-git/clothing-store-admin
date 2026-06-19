'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Facebook, Instagram, MessageCircle } from 'lucide-react';

// TikTok Icon SVG
const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-2.51V7.843a6.3 6.3 0 0 0-5.396 3.642 6.298 6.298 0 0 0 3.148 8.18 6.3 6.3 0 0 0 9.61-5.37v-6.03a8.3 8.3 0 0 0 4.77 1.512V6.89a4.775 4.775 0 0 1-1.9-.204z"/>
  </svg>
);

// Premium Dress Graphic SVG
const DressGraphic = ({ accentColor }: { accentColor: string }) => (
  <svg 
    className="w-full h-auto object-contain opacity-10 md:opacity-15 lg:opacity-20 select-none pointer-events-none transition-all duration-700 transform hover:scale-105"
    viewBox="0 0 800 500" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M 400 150 Q 250 300 200 480 C 300 500 500 500 600 480 Q 550 300 400 150 Z" fill="url(#dressGradient)" opacity="0.15" />
    <path d="M 400 150 Q 250 300 200 480 C 300 500 500 500 600 480 Q 550 300 400 150 Z" stroke="#374151" strokeWidth="2" strokeDasharray="6 6" />
    <path d="M 380 180 Q 200 350 150 450 Q 250 490 350 490" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
    <path d="M 420 180 Q 600 350 650 450 Q 550 490 450 490" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
    <path d="M 360 80 C 380 120 420 120 440 80 C 450 140 420 160 400 180 C 380 160 350 140 360 80 Z" fill="#1a1a1a" stroke={accentColor} strokeWidth="2" />
    <path d="M 360 80 Q 400 100 440 80" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
    <path d="M 375 160 Q 400 170 425 160 Q 400 200 375 160 Z" fill={accentColor} opacity="0.8" />
    <path d="M 390 170 Q 300 350 280 480" stroke={accentColor} strokeWidth="1" opacity="0.6" />
    <path d="M 410 170 Q 500 350 520 480" stroke={accentColor} strokeWidth="1" opacity="0.6" />
    <path d="M 400 180 Q 400 350 420 485" stroke="#4b5563" strokeWidth="1.5" opacity="0.5" />
    <path d="M 395 250 Q 350 380 320 485" stroke="#4b5563" strokeWidth="1.5" opacity="0.4" />
    <path d="M 405 250 Q 450 380 480 485" stroke="#4b5563" strokeWidth="1.5" opacity="0.4" />
    <circle cx="300" cy="220" r="2.5" fill={accentColor} opacity="0.8" />
    <circle cx="500" cy="180" r="3.5" fill={accentColor} opacity="0.6" />
    <circle cx="230" cy="350" r="1.5" fill={accentColor} opacity="0.9" />
    <circle cx="580" cy="380" r="2.5" fill={accentColor} opacity="0.7" />
    <circle cx="400" cy="380" r="2" fill={accentColor} opacity="0.5" />
    <circle cx="400" cy="280" r="200" stroke="#2d2d2d" strokeWidth="1" opacity="0.4" />
    <defs>
      <linearGradient id="dressGradient" x1="400" y1="150" x2="400" y2="480" gradientUnits="userSpaceOnUse">
        <stop stopColor={accentColor} />
        <stop offset="1" stopColor="#121212" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4000);
  };

  return (
    <footer className="relative w-full bg-[#121212] text-white font-sans overflow-hidden">
      <div className="max-w-[1560px] mx-auto px-6 md:px-10 py-12 md:py-16">
        
        {/* Background Dress Graphic */}
        <div className="absolute right-0 bottom-0 w-[60%] max-w-[600px] pointer-events-none z-0 translate-x-8 translate-y-12 md:translate-x-16 md:translate-y-8 lg:translate-y-4">
          <DressGraphic accentColor="#FE5733" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col min-h-[400px] justify-between">
          
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            
            {/* Left Column: Brand Statement & Form */}
            <div className="max-w-md w-full">
              <h3 className="text-2xl font-black tracking-widest text-[#FE5733] mb-4 select-none uppercase font-display">
                The Style Zone
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 pr-4">
                The Style Zone is your ultimate destination for premium, contemporary fashion and elegant apparel. Each piece is handpicked for those who appreciate quality and timeless style.
              </p>
              
              {/* Subscription Form */}
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Email address" 
                      className="w-full px-4 py-3 bg-[#121212]/50 rounded-sm text-white text-xs placeholder-stone-500 border border-stone-700 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-[#121212] outline-none transition-all duration-200 ease-in-out"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-[#FE5733] text-black text-xs px-6 py-3 rounded-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
                  >
                    Subscribe <ArrowUpRight size={16} />
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-red-400 text-xs mt-1 ml-1 animate-pulse">{errorMsg}</p>
                )}
              </form>
              
              {/* Success Message */}
              {subscribed && (
                <div className="mt-4 p-3 rounded-sm bg-[#FE5733]/10 border border-[#FE5733]/30 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FE5733]/20 text-[#FE5733] flex items-center justify-center font-bold text-xs">✓</span>
                  <p className="text-xs text-[#FE5733]">Welcome to the Style Zone circle!</p>
                </div>
              )}
            </div>

            {/* Right Column: Links & Social Connectors */}
            <div className="flex flex-col items-start lg:items-end gap-8 w-full lg:w-auto">
              
              {/* Navigation Links */}
              <nav className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-medium text-white/60">
                {[
                  { href: '/shop', label: 'Shop Collection' },
                  { href: '/about', label: 'Our Story' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/wishlist', label: 'Wishlist' }
                ].map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className="hover:text-[#FE5733] transition-colors duration-200 relative group py-1 uppercase tracking-wider whitespace-nowrap"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FE5733] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>

              {/* Social Buttons */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Facebook size={16} />, label: 'Facebook', href: 'https://www.facebook.com/sanbi.bist.2025' },
                  { icon: <Instagram size={16} />, label: 'Instagram', href: '#' },
                  { icon: <TikTokIcon />, label: 'TikTok', href: 'https://www.tiktok.com/@sanbibista/video' },
                  { icon: <MessageCircle size={16} />, label: 'WhatsApp', href: 'https://wa.me/9865900094' }
                ].map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-10 h-10 rounded-full bg-[#121212]/50 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-[#FE5733] hover:border-transparent hover:bg-zinc-800 transition-all duration-300 relative group"
                  >
                    <div className="absolute inset-0 rounded-full scale-0 group-hover:scale-100 bg-[#FE5733]/20 transition-all duration-300 z-0"></div>
                    <span className="relative z-10 transition-colors duration-300">
                      {item.icon}
                    </span>
                  </a>
                ))}
              </div>

            </div>
          </div>

          {/* Bottom Section: Legal & Brand Text */}
          <div className="mt-16 lg:mt-20">
            
            {/* Copyright and Legal Line */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/40 mb-6 relative z-10 uppercase tracking-wider">
              <span className="text-center md:text-left font-medium">
                © {new Date().getFullYear()} The Style Zone. All Rights Reserved.
              </span>
              <div className="flex gap-6">
                {[
                  { href: '/terms', label: 'Terms' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/contact', label: 'Support' }
                ].map((legal) => (
                  <Link key={legal.href} href={legal.href} className="hover:text-white transition-colors whitespace-nowrap">
                    {legal.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Separator */}
            <hr className="border-[#121212]/20 mb-6 relative z-10" />

            {/* Large Brand Text */}
            <div className="relative w-full overflow-hidden flex items-end select-none pointer-events-none">
              <h2 
                className="text-[13vw] md:text-[12vw] lg:text-[8rem] font-extrabold leading-[0.78] tracking-widest text-transparent bg-clip-text whitespace-nowrap uppercase font-display"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #FE5733, #121212)',
                  letterSpacing: '0.02em'
                }}
              >
                STYLE ZONE
              </h2>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}
