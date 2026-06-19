import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Facebook, Instagram, MessageCircle } from 'lucide-react';

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-2.51V7.843a6.3 6.3 0 0 0-5.396 3.642 6.298 6.298 0 0 0 3.148 8.18 6.3 6.3 0 0 0 9.61-5.37v-6.03a8.3 8.3 0 0 0 4.77 1.512V6.89a4.775 4.775 0 0 1-1.9-.204z"/>
  </svg>
);

const DressGraphic = ({ accentColor }: { accentColor: string }) => (
  <svg className="w-full h-auto object-contain opacity-10 md:opacity-15 lg:opacity-20 select-none pointer-events-none" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 400 150 Q 250 300 200 480 C 300 500 500 500 600 480 Q 550 300 400 150 Z" fill="url(#dressGradient)" opacity="0.15" />
    <path d="M 400 150 Q 250 300 200 480 C 300 500 500 500 600 480 Q 550 300 400 150 Z" stroke="#374151" strokeWidth="2" strokeDasharray="6 6" />
    <path d="M 360 80 C 380 120 420 120 440 80 C 450 140 420 160 400 180 C 380 160 350 140 360 80 Z" fill="#1a1a1a" stroke={accentColor} strokeWidth="2" />
    <path d="M 375 160 Q 400 170 425 160 Q 400 200 375 160 Z" fill={accentColor} opacity="0.8" />
    <circle cx="300" cy="220" r="2.5" fill={accentColor} opacity="0.8" />
    <circle cx="500" cy="180" r="3.5" fill={accentColor} opacity="0.6" />
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
    if (!email) { setErrorMsg('Please enter an email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setErrorMsg('Please enter a valid email address.'); return; }
    setErrorMsg('');
    setSubscribed(true);
    setTimeout(() => { setSubscribed(false); setEmail(''); }, 4000);
  };

  return (
    <footer className="relative w-full bg-[#121212] text-white font-sans overflow-hidden">
      <div className="max-w-[1560px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="absolute right-0 bottom-0 w-[60%] max-w-[600px] pointer-events-none z-0 translate-x-8 translate-y-12">
          <DressGraphic accentColor="#FE5733" />
        </div>
        <div className="relative z-10 flex flex-col min-h-[400px] justify-between">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="max-w-md w-full">
              <h3 className="text-2xl font-black tracking-widest text-[#FE5733] mb-4 select-none uppercase font-display">The Style Zone</h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 pr-4">
                The Style Zone is your ultimate destination for premium, contemporary fashion and elegant apparel. Each piece is handpicked for those who appreciate quality and timeless style.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    placeholder="Email address"
                    className="flex-1 px-4 py-3 bg-[#121212]/50 rounded-sm text-white text-xs placeholder-stone-500 border border-stone-700 focus:border-zinc-400 outline-none transition-all"
                  />
                  <button type="submit" className="bg-[#FE5733] text-black text-xs px-6 py-3 rounded-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors">
                    Subscribe <ArrowUpRight size={16} />
                  </button>
                </div>
                {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                {subscribed && <p className="text-green-400 text-xs font-bold">You're subscribed!</p>}
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-xl">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Shop</h4>
                <ul className="space-y-3">
                  {[
                    { href: '/shop', label: 'All Collections' },
                    { href: '/shop?category=hoodies', label: 'Hoodies' },
                    { href: '/shop?category=jackets', label: 'Jackets' },
                    { href: '/shop?category=t-shirts', label: 'T-Shirts' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-xs text-white/60 hover:text-[#FE5733] transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Info</h4>
                <ul className="space-y-3">
                  {[
                    { href: '/about', label: 'Our Story' },
                    { href: '/contact', label: 'Contact Us' },
                    { href: '/orders', label: 'Track Orders' },
                    { href: '/privacy', label: 'Privacy Policy' },
                    { href: '/terms', label: 'Terms of Service' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-xs text-white/60 hover:text-[#FE5733] transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Follow</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: <Facebook className="w-4 h-4" />, label: 'Facebook', href: '#' },
                    { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', href: '#' },
                    { icon: <TikTokIcon />, label: 'TikTok', href: '#' },
                    { icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp', href: '#' },
                  ].map((s) => (
                    <a key={s.label} href={s.href} className="flex items-center gap-2 text-xs text-white/60 hover:text-[#FE5733] transition-colors">
                      {s.icon} {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              © {new Date().getFullYear()} The Style Zone. All rights reserved.
            </p>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Bhimdatta-4, Mahendranagar, Kanchanpur, Nepal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
