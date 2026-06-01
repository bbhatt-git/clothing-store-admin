'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';

export default function ClientAnimationProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 2. Animate page elements dynamically with GSAP
    const ctx = gsap.context(() => {
      // Find all elements to fade and slide up cleanly
      const fadeElements = document.querySelectorAll('.animate-on-scroll');
      if (fadeElements.length > 0) {
        gsap.fromTo(
          fadeElements,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all',
          }
        );
      }
    }, containerRef);

    // Cleanup reference
    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return <div ref={containerRef} className="flex flex-col min-h-screen">{children}</div>;
}
