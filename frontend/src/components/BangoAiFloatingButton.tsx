import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { PageId } from './Header';

interface BangoAiFloatingButtonProps {
  onClick: () => void;
  currentPage: PageId;
}

export const BangoAiFloatingButton: React.FC<BangoAiFloatingButtonProps> = ({
  onClick,
  currentPage,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [innerOffset, setInnerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    // Smooth magnetic cursor tracking physics
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      // Magnetic interaction radius (within 240px cursor pull)
      const magneticRadius = 240;

      if (distance < magneticRadius) {
        // Non-linear ease: closer cursor = stronger pull
        const power = Math.pow((magneticRadius - distance) / magneticRadius, 1.4);
        const maxPull = 32; // max displacement in pixels
        const pullX = (distX / distance) * power * maxPull;
        const pullY = (distY / distance) * power * maxPull;

        setOffset({ x: pullX, y: pullY });
        // Inner "bo" text parallax
        setInnerOffset({ x: pullX * 0.45, y: pullY * 0.45 });
      } else {
        // Spring back gently to center
        setOffset({ x: 0, y: 0 });
        setInnerOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
      setInnerOffset({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const isCurrentPageAi = currentPage === 'bango-ai';

  return (
    <div className="fixed bottom-6 right-6 z-[2500] pointer-events-none select-none">
      <div className="relative flex items-center justify-end">
        
        {/* Tooltip Label expanding to the left on hover */}
        <div
          className={`pointer-events-none absolute right-full mr-3.5 px-3.5 py-1.5 rounded-full bg-[#191919] text-white text-xs font-display font-bold shadow-xl border border-white/10 whitespace-nowrap flex items-center gap-1.5 transition-all duration-300 ${
            isHovered
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-2 scale-95'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F02D25] animate-pulse"></span>
          <span>bango <span className="text-[#F02D25]">ai</span></span>
        </div>

        {/* Magnetic Floating "bo" Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? 1.08 : 1})`,
            transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease',
          }}
          className={`pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#191919] text-white flex items-center justify-center cursor-pointer shadow-2xl hover:shadow-[0_12px_30px_rgba(240,45,37,0.35)] border-2 ${
            isCurrentPageAi
              ? 'border-[#F02D25] ring-4 ring-[#F02D25]/20'
              : 'border-white/15 hover:border-[#F02D25]'
          } active:scale-95`}
          title="Open Bango AI Day Planner"
          aria-label="Open Bango AI"
        >
          {/* Inner Parallax "bo" Branding Typography */}
          <span
            style={{
              transform: `translate3d(${innerOffset.x}px, ${innerOffset.y}px, 0)`,
              transition: 'transform 0.12s ease-out',
            }}
            className="font-display font-black text-2xl sm:text-3xl tracking-normal lowercase text-white leading-none select-none inline-block"
          >
            bo
          </span>

          {/* Glowing Red AI Activity Badge at top right */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F02D25] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F02D25] border-2 border-white"></span>
          </span>
        </button>

      </div>
    </div>
  );
};
