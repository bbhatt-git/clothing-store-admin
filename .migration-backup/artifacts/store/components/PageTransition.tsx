'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const previousPathname = useRef<string>('');

  useEffect(() => {
    // Skip animation on initial page load
    if (previousPathname.current === '') {
      previousPathname.current = pathname;
      return;
    }

    // Skip animation on mobile/tablet (screens smaller than 1024px)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      previousPathname.current = pathname;
      return;
    }

    // Skip animation for order success page
    if (pathname === '/checkout/success' || pathname.includes('/checkout/success')) {
      previousPathname.current = pathname;
      return;
    }

    // Only animate on route changes
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onStart: () => setIsAnimating(true),
        onComplete: () => setIsAnimating(false),
      });

      // Animate cover from top to bottom
      gsap.set(coverRef.current, { 
        height: '0%', 
        top: '0%',
        opacity: 1 
      });

      tl.to(coverRef.current, {
        height: '100%',
        duration: 0.3,
        ease: 'power2.inOut',
      })
      .to(coverRef.current, {
        height: '0%',
        top: '100%',
        duration: 0.3,
        ease: 'power2.inOut',
      }, '-=0.05');
    }, coverRef);

    previousPathname.current = pathname;

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div className="relative">
      {/* Cover Screen */}
      <div
        ref={coverRef}
        className="fixed left-0 right-0 z-[100] bg-[#121212]"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Page Content */}
      <div className={isAnimating ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </div>
  );
}
