'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Home, ArrowLeft, ShoppingBag, Package } from 'lucide-react';

export default function NotFound() {
  const [floatingItems, setFloatingItems] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    setFloatingItems(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        delay: i * 0.2,
      }))
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] overflow-hidden relative">
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className="absolute opacity-10 pointer-events-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animation: `float 6s ease-in-out infinite ${item.delay}s`,
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
          <div className="relative">
            <h1 className="text-[120px] md:text-[180px] font-black text-[#FE5733] leading-none relative select-none">
              <span
                className="inline-block animate-bounce"
                style={{ animationDuration: '2s' }}
              >
                4
              </span>
              <span
                className="inline-block animate-pulse"
                style={{ animationDuration: '1.5s' }}
              >
                0
              </span>
              <span
                className="inline-block animate-bounce"
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              >
                4
              </span>
            </h1>
            <div className="absolute inset-0 blur-3xl bg-[#FE5733]/20 -z-10 scale-150" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-[#121212] uppercase tracking-wider mb-4">
            Page Not Found
          </h2>
          <p className="text-sm md:text-base text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
            Oops! The page you&apos;re looking for seems to have wandered off
            into the fashion void. Let&apos;s get you back to style.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group bg-[#FE5733] hover:bg-[#e04825] text-white rounded-[4px] font-bold h-12 px-8 text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FE5733]/20 hover:shadow-xl hover:shadow-[#FE5733]/30 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group bg-[#121212] hover:bg-stone-800 text-white rounded-[4px] font-bold h-12 px-8 text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>

          <div className="mt-12">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#FE5733] to-transparent w-64 mx-auto" />
          </div>

          <div className="mt-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest">
              Error Code: 404 • Page Missing
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
