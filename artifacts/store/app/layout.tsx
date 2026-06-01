import React from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ClientAnimationProvider from '@/components/ClientAnimationProvider';
import PageTransition from '@/components/PageTransition';
import MobileDock from '@/components/MobileDock';
import { ModalProvider } from '@/contexts/ModalContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'The Style Zone • Fashion Boutique in Mahendranagar, Kanchanpur',
  description: 'Shop trendy clothes, hoodies, jackets, and fashion accessories at The Style Zone boutique in Mahendranagar, Kanchanpur. Quality apparel with COD delivery across Nepal.',
  icons: {
    icon: '/favicon.svg',
  },
  // Add verification and other meta tags
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
  },
};

// Structured Data for Local Business
const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'The Style Zone',
  description: 'Fashion boutique in Mahendranagar, Kanchanpur, Nepal. Quality clothes, hoodies, jackets, and accessories.',
  url: 'https://thestylezone.com.np',
  telephone: '+977 984-8123456',
  email: 'info@thestylezone.com.np',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Gali No. 2, Bhimdatta-4',
    addressLocality: 'Mahendranagar',
    addressRegion: 'Kanchanpur',
    addressCountry: 'NP',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ],
    opens: '10:00',
    closes: '20:30',
  },
  priceRange: '₨₨',
};

// Structured Data for WebSite
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'The Style Zone',
  url: 'https://thestylezone.com.np',
  description: 'Shop trendy clothes, hoodies, jackets, and fashion accessories at The Style Zone boutique in Mahendranagar, Kanchanpur.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://thestylezone.com.np/shop?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F5F5F0] text-[#121212]">
        <ModalProvider>
          <ClientAnimationProvider>
            <PageTransition>
              {children}
            </PageTransition>
            <MobileDock />
          </ClientAnimationProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
