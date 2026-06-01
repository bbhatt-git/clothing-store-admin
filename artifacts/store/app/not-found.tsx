'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Home, ArrowLeft, ShoppingBag, Package } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(true);
  const [floatingItems, setFloatingItems] = useState<Array<{id: number, x: number, y: number, delay: number}>>(() => 
    Array.from({length: 6}, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      delay: i * 0.2
    }))
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] overflow-hidden relative">
      {/* Floating Background Elements */}
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className={`absolute opacity-10 transition-all duration-1000 ${mounted ? 'translate-y-0' : 'translate-y-20'}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}s`,
            animation: `float 6s ease-in-out infinite ${item.delay}s`
          }}
        >
          {item.id % 2 === 0 ? (
            <ShoppingBag className="w-16 h-16 text-[#FE5733]" />
          ) : (
            <Package className="w-16 h-16 text-[#121212]" />
          )}
        </div>
      ))}

      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 Text with Glitch Effect */}
          <div className={`relative transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <h1 className="text-[120px] md:text-[180px] font-black text-[#FE5733] leading-none relative">
              <span className="inline-block animate-bounce" style={{animationDuration: '2s'}}>4</span>
              <span className="inline-block animate-pulse" style={{animationDuration: '1.5s'}}>0</span>
              <span className="inline-block animate-bounce" style={{animationDuration: '2s', animationDelay: '0.5s'}}>4</span>
            </h1>
            {/* Shadow/Glow Effect */}
            <div className="absolute inset-0 blur-3xl bg-[#FE5733]/20 -z-10 scale-150" />
          </div>

          {/* Animated Message with Slide-in */}
          <div className={`transition-all duration-700 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl md:text-3xl font-black text-[#121212] uppercase tracking-wider mb-4">
              Page Not Found
            </h2>
            <p className="text-sm md:text-base text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
              Oops! The page you&apos;re looking for seems to have wandered off into the fashion void. Let&apos;s get you back to style.
            </p>
          </div>

          {/* Animated Buttons with Stagger */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 ease-out delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link 
              href="/" 
              className="group bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] font-bold h-12 px-8 text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FE5733]/20 hover:shadow-xl hover:shadow-[#FE5733]/30 hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Go Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="group bg-[#121212] hover:bg-stone-800 text-white rounded-[4px] font-bold h-12 px-8 text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>

          {/* Animated Decorative Line */}
          <div className={`mt-12 transition-all duration-700 ease-out delay-700 ${mounted ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#FE5733] to-transparent w-64 mx-auto" />
          </div>

          {/* Animated Subtle Text */}
          <div className={`mt-6 transition-all duration-700 ease-out delay-900 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-xs text-stone-400 uppercase tracking-widest">
              Error Code: 404 • Page Missing
            </p>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
