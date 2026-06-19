import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, readDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductDetailsClient from './ProductDetailsClient';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return { title: 'Product Not Found | The Style Zone' };
  }

  const price = product.sale_price ?? product.base_price;
  const keywords = [
    ...product.categories,
    product.brand,
    ...product.tags,
    product.name,
    'fashion',
    'clothing',
    'Mahendranagar',
  ].filter(Boolean).map((k) => String(k));

  return {
    title: `${product.name} | The Style Zone`,
    description:
      product.short_description ||
      product.description ||
      `Shop ${product.name} at The Style Zone. Quality ${product.categories.join(', ')} with COD delivery across Nepal.`,
    keywords,
    openGraph: {
      title: `${product.name} | The Style Zone`,
      description: product.short_description || product.description,
      type: 'website',
      images: product.images[0]
        ? [{ url: product.images[0], width: 800, height: 1000, alt: product.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | The Style Zone`,
      description: product.short_description || product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  const [product, db] = await Promise.all([
    getProductBySlug(resolvedParams.slug),
    readDb(),
  ]);

  if (!product) return notFound();

  const relatedProducts = db.products
    .filter((p) => p.id !== product.id && p.categories.some((cat) => product.categories.includes(cat)))
    .slice(0, 4);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    image: product.images,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.sale_price ?? product.base_price,
      priceCurrency: 'NPR',
      availability:
        product.stock_total > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://thestylezone.com.np/shop/${product.slug}`,
    },
    category: product.categories.join(', '),
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <Navbar />

      <main className="flex-grow py-8 px-6 md:px-10">
        <div className="max-w-[1560px] mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-10 text-xs font-mono font-bold text-[#121212]/40 uppercase">
            <Link href="/" className="hover:text-[#FE5733] transition-colors">THE STYLE ZONE</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-[#FE5733] transition-colors">SHOP ALL</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#121212]/80 max-w-[200px] truncate">{product.name}</span>
          </div>

          <ProductDetailsClient product={product} />

          {relatedProducts.length > 0 && (
            <div className="mt-32 border-t border-[#121212]/10 pt-16">
              <p className="text-xs font-bold tracking-[0.25em] text-[#FE5733] uppercase mb-3 font-mono">
                CURATED FOR YOU
              </p>
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#121212] font-display mb-10">
                Related <span className="text-[#FE5733]">Creations.</span>
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
