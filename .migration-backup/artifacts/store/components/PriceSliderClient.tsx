'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PriceSliderClientProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export default function PriceSliderClient({ min, max, onChange }: PriceSliderClientProps) {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Sync internal state with props when they change
  useEffect(() => {
    setMinVal(min);
    setMaxVal(max);
  }, [min, max]);

  const getPercent = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPercent = useCallback((percent: number) => {
    return Math.round(min + (percent / 100) * (max - min));
  }, [min, max]);

  const handleMouseDown = useCallback((thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(thumb);
  }, []);

  const handleTouchStart = useCallback((thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(thumb);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const value = getValueFromPercent(percent);

    if (dragging === 'min') {
      const newMin = Math.min(value, maxVal - 100);
      setMinVal(newMin);
      onChange(newMin, maxVal);
    } else {
      const newMax = Math.max(value, minVal + 100);
      setMaxVal(newMax);
      onChange(minVal, newMax);
    }
  }, [dragging, maxVal, minVal, onChange, getValueFromPercent]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const percent = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const value = getValueFromPercent(percent);

    if (dragging === 'min') {
      const newMin = Math.min(value, maxVal - 100);
      setMinVal(newMin);
      onChange(newMin, maxVal);
    } else {
      const newMax = Math.max(value, minVal + 100);
      setMaxVal(newMax);
      onChange(minVal, newMax);
    }
  }, [dragging, maxVal, minVal, onChange, getValueFromPercent]);

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleTouchEnd = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragging, handleMouseMove, handleTouchMove]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Price Range</label>
        <span className="text-xs font-bold text-[#FE5733] font-mono">
          Rs {minVal.toLocaleString()} - Rs {maxVal.toLocaleString()}
        </span>
      </div>
      
      <div className="relative h-12 select-none" ref={sliderRef}>
        {/* Background Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-stone-200 rounded-lg -translate-y-1/2" />
        
        {/* Active Track */}
        <div 
          className="absolute top-1/2 h-1.5 bg-[#FE5733] rounded-lg -translate-y-1/2"
          style={{
            left: `${getPercent(minVal)}%`,
            right: `${100 - getPercent(maxVal)}%`
          }}
        />
        
        {/* Min Thumb */}
        <div 
          className={`absolute top-1/2 w-6 h-6 bg-white border-2 border-[#FE5733] rounded-full shadow-md -translate-y-1/2 transition-transform hover:scale-110 cursor-ew-resize ${dragging === 'min' ? 'scale-125' : ''}`}
          style={{ left: `calc(${getPercent(minVal)}% - 12px)` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
        />
        
        {/* Max Thumb */}
        <div 
          className={`absolute top-1/2 w-6 h-6 bg-white border-2 border-[#FE5733] rounded-full shadow-md -translate-y-1/2 transition-transform hover:scale-110 cursor-ew-resize ${dragging === 'max' ? 'scale-125' : ''}`}
          style={{ left: `calc(${getPercent(maxVal)}% - 12px)` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-mono text-stone-600">
        <span>Rs {min.toLocaleString()}</span>
        <span>Rs {max.toLocaleString()}</span>
      </div>
    </div>
  );
}
