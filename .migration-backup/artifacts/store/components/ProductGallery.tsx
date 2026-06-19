'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<{ display: string; backgroundPosition: string }>({
    display: 'none',
    backgroundPosition: '0% 0%'
  });

  const photoList = images && images.length > 0 ? images : ['https://picsum.photos/seed/defaultp/600/800'];
  const activeImage = photoList[activeImageIndex];

  // Mouse move zoom effect for extreme luxury desktop desktop feel
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      display: 'none',
      backgroundPosition: '0% 0%'
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary visual frame with magnifier zoom */}
      <div 
        className="relative bg-zinc-50 border border-zinc-100 rounded-3xl aspect-[3/4] overflow-hidden cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={activeImage} 
          alt={name} 
          className="w-full h-full object-cover transition-all"
        />

        {/* Large lens container shown on hover */}
        <div 
          className="absolute inset-0 bg-no-repeat pointer-events-none transition-opacity duration-150"
          style={{
            ...zoomStyle,
            backgroundImage: `url(${activeImage})`,
            backgroundSize: '200%',
          }}
        />
      </div>

      {/* Thumbnails list below container */}
      {photoList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {photoList.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`relative aspect-[3/4] w-20 rounded-xl overflow-hidden border-2 bg-zinc-50 transition-all flex-none cursor-pointer ${activeImageIndex === index ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}
              aria-label={`View image ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img} 
                alt={`${name} thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
