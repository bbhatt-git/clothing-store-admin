/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { readDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import HeroClient from '@/components/HeroClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Style Zone • Fashion Boutique in Mahendranagar, Kanchanpur',
  description: 'Shop trendy clothes, hoodies, jackets, and fashion accessories at The Style Zone boutique in Mahendranagar, Kanchanpur. Quality apparel with COD delivery across Nepal.',
  keywords: ['fashion boutique', 'clothing store', 'Mahendranagar', 'Kanchanpur', 'Nepal', 'hoodies', 'jackets', 't-shirts', 'online shopping', 'COD delivery'],
};

export default async function HomePage() {
  const db = await readDb();

  const allProducts = db.products || [];

  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const featuredProducts = allProducts.filter(p => p.is_featured).slice(0, 4);
  const bestsellers = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(4, 8);

  // Build category links from real WooCommerce category slugs
  const categories = db.categories.filter(c => c.is_active && c.count > 0).slice(0, 4);

  return (
    <div className="flex flex-col bg-[#F5F5F0] text-[#121212] font-sans">
      <Navbar />

      <main>

        {/* HERO SECTION */}
        <HeroClient featuredProducts={featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 4)} allProducts={allProducts} />

        {/* Bento Grid Categories */}
        <section className="py-8 md:py-12 px-6 md:px-10 bg-[#F5F5F0]">
          <div className="max-w-[1560px] mx-auto">
            <div className="mb-8 md:mb-10">
              <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">
                EXPLORE • COLLECTIONS
              </p>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#121212] font-display">
                Shop by <span className="text-[#FE5733]">Category.</span>
              </h2>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 1).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="group relative col-span-2 row-span-2 bg-[#121212] rounded-[4px] overflow-hidden aspect-square md:aspect-auto min-h-[300px]"
                  >
                    <div className="absolute inset-0">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white font-display mb-1">{cat.name}</h3>
                      <p className="text-xs text-white/70">{cat.count} products</p>
                    </div>
                  </Link>
                ))}
                {categories.slice(1, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="group relative bg-white border border-[#121212]/5 rounded-[4px] overflow-hidden aspect-square"
                  >
                    <div className="absolute inset-0">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <h3 className="text-lg font-black uppercase tracking-tighter text-white font-display">{cat.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/shop" className="group relative col-span-2 row-span-2 bg-[#121212] rounded-[4px] overflow-hidden aspect-square md:aspect-auto min-h-[300px]">
                  <div className="absolute inset-0">
                    <img src="https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg" alt="Shop All" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white font-display mb-1">All Products</h3>
                    <p className="text-xs text-white/70">Browse everything</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-8 md:py-14 px-6 md:px-10">
          <div className="max-w-[1560px] mx-auto">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">JUST DROPPED</p>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#121212] font-display">
                  New <span className="text-[#FE5733]">Arrivals.</span>
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-[#121212]/50 hover:text-[#FE5733] transition-colors hidden md:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        {bestsellers.length > 0 && (
          <section className="py-8 md:py-14 px-6 md:px-10 bg-[#121212]">
            <div className="max-w-[1560px] mx-auto">
              <div className="flex items-end justify-between mb-8 md:mb-10">
                <div>
                  <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">CROWD FAVORITES</p>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white font-display">
                    Best <span className="text-[#FE5733]">Sellers.</span>
                  </h2>
                </div>
                <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#FE5733] transition-colors hidden md:block">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {bestsellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
