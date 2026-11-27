import React, { useRef, useState, useEffect } from 'react';
import {
  Compass,
  HeartPulse,
  Train,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  Utensils,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CategoryMeta } from '../types';

interface CategoryFiltersProps {
  categories: CategoryMeta[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  HeartPulse,
  Train,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  Utensils,
  Building2
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to update arrow indicators
  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 6);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // Translate vertical mouse wheel delta into horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
        checkScroll();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Arrow button scroll handler
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 320);
    }
  };

  // Mouse drag-to-scroll implementation
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full min-w-0 select-none">
      {/* Top Header Row with Domain Status & Scroll Arrows */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
            Filter by Domain
          </span>
          <span className="text-[10px] text-[#A8A29E] font-medium">
            ({selectedCategory.toLowerCase() === 'all' ? 'All 8 Domains' : selectedCategory})
          </span>
        </div>

        {/* Scroll Arrow Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
              canScrollLeft
                ? 'bg-white hover:bg-[#F5F3EE] text-[#191919] border-[#E3DFD7] shadow-xs'
                : 'bg-[#ECE9E2]/50 text-[#A8A29E] border-transparent cursor-not-allowed opacity-40'
            }`}
            title="Scroll Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
              canScrollRight
                ? 'bg-white hover:bg-[#F5F3EE] text-[#191919] border-[#E3DFD7] shadow-xs'
                : 'bg-[#ECE9E2]/50 text-[#A8A29E] border-transparent cursor-not-allowed opacity-40'
            }`}
            title="Scroll Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Pill List with Mouse Wheel & Drag Support */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="category-scroll-container flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth cursor-grab active:cursor-grabbing min-w-0"
      >
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Compass;
          const isSelected =
            selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === 'all' && selectedCategory.toLowerCase() === 'all');

          return (
            <button
              key={cat.id}
              onClick={() => {
                if (!hasMoved.current) {
                  onSelectCategory(cat.id === 'all' ? 'All' : cat.name);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#F02D25] text-white border-[#F02D25] shadow-xs'
                  : 'bg-white text-[#77736D] hover:text-[#191919] border-[#E3DFD7] hover:bg-[#ECE9E2]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#77736D]'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
