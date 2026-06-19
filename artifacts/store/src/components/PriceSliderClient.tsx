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

  useEffect(() => { setMinVal(min); setMaxVal(max); }, [min, max]);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const getValueFromPercent = useCallback((percent: number) => {
    return Math.round(min + (percent / 100) * (max - min));
  }, [min, max]);

  const handleMouseDown = useCallback((thumb: 'min' | 'max') => (e: React.MouseEvent) => {
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

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove]);

  const minPercent = getPercent(minVal);
  const maxPercent = getPercent(maxVal);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Price Range</label>
      <div className="flex justify-between text-xs font-mono font-bold text-[#121212]">
        <span>Rs {minVal.toLocaleString()}</span>
        <span>Rs {maxVal.toLocaleString()}</span>
      </div>
      <div ref={sliderRef} className="relative h-2 bg-stone-200 rounded-full cursor-pointer select-none">
        <div
          className="absolute h-2 bg-[#121212] rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-[#121212] rounded-full -top-1.5 cursor-grab active:cursor-grabbing shadow-sm z-10"
          style={{ left: `calc(${minPercent}% - 10px)` }}
          onMouseDown={handleMouseDown('min')}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-[#121212] rounded-full -top-1.5 cursor-grab active:cursor-grabbing shadow-sm z-10"
          style={{ left: `calc(${maxPercent}% - 10px)` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
    </div>
  );
}
