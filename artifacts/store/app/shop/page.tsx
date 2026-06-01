import React from 'react';
import { readDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopClient from './ShopClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop All Collections | The Style Zone',
  description: 'Explore our complete collection of trendy clothes, hoodies, jackets, and fashion accessories. 100% authentic products with COD delivery across Nepal.',
  keywords: ['shop', 'clothing collection', 'fashion', 'hoodies', 'jackets', 't-shirts', 'accessories', 'online shopping'],
  openGraph: {
    title: 'Shop All Collections | The Style Zone',
    description: 'Explore our complete collection of trendy clothes, hoodies, jackets, and fashion accessories.',
    type: 'website',
  },
};

export default async function ShopPage() {
  const db = await readDb();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      <main className="flex-grow px-6 md:px-10 pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="max-w-[1560px] mx-auto">
          
          {/* Page Title */}
          <div className="mb-8 md:mb-12">
            <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">
              THE STYLE ZONE • COLLECTION
            </p>
            <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-[#121212] font-display">
              All <span className="text-[#FE5733]">Collections.</span>
            </h1>
            <p className="text-sm opacity-60 max-w-xl mt-2 leading-relaxed">
              Explore 100% authentic curated apparel synced directly from our WooCommerce store. Filter by category, price, size, and color below.
            </p>
          </div>

          <ShopClient initialProducts={db.products} />

        </div>
      </main>

      <Footer />
    </div>
  );
}
