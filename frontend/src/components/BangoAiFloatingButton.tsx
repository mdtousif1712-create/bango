import React, { useState, useEffect, useRef } from 'react';
import { PageId } from './Header';
import { BangoRobotEyes } from './BangoRobotEyes';

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
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    // Subtle magnetic physics when the mouse gets near the floating element
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      const magneticRadius = 180;

      if (distance < magneticRadius) {
        const power = Math.pow((magneticRadius - distance) / magneticRadius, 1.3);
        const maxPull = 15;
        setOffset({
          x: (distX / distance) * power * maxPull,
          y: (distY / distance) * power * maxPull,
        });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
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
    <aside
      aria-label="Bango AI Quick Access"
      className="fixed bottom-6 right-6 z-[2500] pointer-events-none select-none"
    >
      <div className="relative flex items-center gap-3">
        
        {/* Pill Label on the left: "bango ai for your help !!" */}
        <button
          type="button"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`pointer-events-auto cursor-pointer flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E3DFD7] text-[#191919] shadow-lg hover:shadow-xl hover:border-[#191919] transition-all duration-300 active:scale-95 ${
            isCurrentPageAi && !isHovered
              ? 'opacity-0 translate-x-4 pointer-events-none'
              : 'opacity-100 translate-x-0'
          }`}
          title="Plan your day with Bango AI"
        >
          <span className="font-display font-bold text-xs sm:text-sm text-[#191919] whitespace-nowrap">
            bango <span className="text-[#F02D25]">ai</span> for your help !!
          </span>
        </button>

        {/* Circular Robot Head Button with Reactive Blinking Eyes */}
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? 1.06 : 1})`,
            transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease',
          }}
          className="pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#191919] text-white flex items-center justify-center cursor-pointer shadow-2xl border border-white/10 hover:border-white/25 active:scale-95"
          title="Open Bango AI Day Planner"
          aria-label="Open Bango AI"
        >
          {/* Reactive Blinking Robot Eyes */}
          <BangoRobotEyes size="md" isHovered={isHovered} followCursor={true} />
        </button>

      </div>
    </aside>
  );
};
