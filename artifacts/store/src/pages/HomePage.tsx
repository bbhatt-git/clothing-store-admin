import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroClient from '@/components/HeroClient';
import ProductCard from '@/components/ProductCard';
import MobileDock from '@/components/MobileDock';
import { Link } from 'wouter';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Product {
  id: string; name: string; slug: string; brand: string;
  base_price: number; sale_price: number | null; discount_pct: number;
  images: string[]; rating_avg: number; rating_count: number; stock_total: number;
  is_active: boolean; is_featured: boolean; created_at: string;
  description: string; short_description?: string;
  categories: string[]; colors: string[]; sizes: string[];
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/products`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setProducts(data.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = products.filter(p => p.is_featured);
  const newArrivals = [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  const onSale = products.filter(p => p.sale_price !== null).slice(0, 4);

  const features = [
    { icon: <Truck className="w-6 h-6" />, title: 'Free Delivery', desc: 'On all orders in Kanchanpur district' },
    { icon: <RotateCcw className="w-6 h-6" />, title: 'Easy Returns', desc: '7-day hassle-free return policy' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: '100% Authentic', desc: 'All products are quality checked' },
    { icon: <Headphones className="w-6 h-6" />, title: '24/7 Support', desc: 'Chat with us anytime for help' },
  ];

  const categories = [
    { name: 'Hoodies', slug: 'hoodies', img: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { name: 'Jackets', slug: 'jackets', img: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { name: 'T-Shirts', slug: 't-shirts', img: 'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { name: 'Accessories', slug: 'accessories', img: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <Navbar />

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FE5733] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-stone-500 font-mono uppercase tracking-widest">Loading Collections...</p>
          </div>
        </div>
      ) : (
        <main className="flex-grow">
          <HeroClient featuredProducts={featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5)} allProducts={products} />

          <section className="bg-white border-y border-[#121212]/5 py-8">
            <div className="max-w-[1560px] mx-auto px-6 md:px-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((f) => (
                  <div key={f.title} className="flex flex-col items-center text-center gap-3 py-4">
                    <div className="w-12 h-12 bg-[#F5F5F0] rounded-full flex items-center justify-center text-[#FE5733]">{f.icon}</div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#121212]">{f.title}</h4>
                      <p className="text-[10px] text-stone-500 mt-1">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 px-6 md:px-10">
            <div className="max-w-[1560px] mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">JUST DROPPED</p>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#121212] font-display">New <span className="text-[#FE5733]">Arrivals.</span></h2>
                </div>
                <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#121212] hover:text-[#FE5733] transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {newArrivals.length === 0 ? (
                <p className="text-stone-400 text-center py-12">No products found. Check your WooCommerce connection.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
              <div className="mt-8 text-center md:hidden">
                <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#121212] hover:text-[#FE5733] transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 px-6 md:px-10 bg-white">
            <div className="max-w-[1560px] mx-auto">
              <div className="mb-10">
                <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">BROWSE BY STYLE</p>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#121212] font-display">Shop <span className="text-[#FE5733]">Categories.</span></h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-[4px] bg-stone-100 block">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-black uppercase tracking-tight text-lg font-display">{cat.name}</h3>
                      <span className="text-white/70 text-xs font-bold uppercase tracking-widest group-hover:text-[#FE5733] transition-colors">Shop Now →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {onSale.length > 0 && (
            <section className="py-16 px-6 md:px-10 bg-[#121212]">
              <div className="max-w-[1560px] mx-auto">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="text-xs font-bold tracking-[0.3em] text-[#FE5733] uppercase mb-2 font-mono">LIMITED TIME</p>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white font-display">On <span className="text-[#FE5733]">Sale.</span></h2>
                  </div>
                  <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-[#FE5733] transition-colors">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {onSale.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          <section className="py-20 px-6 md:px-10 bg-[#FE5733]">
            <div className="max-w-[1560px] mx-auto text-center">
              <p className="text-xs font-bold tracking-[0.3em] text-white/70 uppercase mb-4 font-mono">VISIT US IN MAHENDRANAGAR</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-display mb-6">
                Find Your <span className="text-[#121212]">Style.</span>
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
                Visit our boutique at Street No. 2, Bhimdatta-4, Mahendranagar, Kanchanpur. Try clothes in person and get personalized style advice.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/shop" className="bg-white text-[#121212] font-bold uppercase tracking-widest text-xs px-10 py-4 rounded-sm hover:bg-[#121212] hover:text-white transition-colors">
                  Shop Online
                </Link>
                <Link href="/contact" className="border-2 border-white text-white font-bold uppercase tracking-widest text-xs px-10 py-4 rounded-sm hover:bg-white hover:text-[#FE5733] transition-colors">
                  Get Directions
                </Link>
              </div>
            </div>
          </section>
        </main>
      )}

      <Footer />
      <MobileDock />
    </div>
  );
}
