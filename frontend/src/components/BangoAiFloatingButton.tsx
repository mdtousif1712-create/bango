import React, { useState, useEffect, useRef } from 'react';
import { PageId } from './Header';
import { BangoRobotEyes } from './BangoRobotEyes';

interface BangoAiFloatingButtonProps {
  onClick: () => void;
  currentPage: PageId;
}

const ROTATING_PROMPTS = [
  'bango ai for your help !!',
  'plan ur day with ai ✨',
  'bango ai for your help !!',
  'trending in bengaluru 🔥',
  'bango ai for your help !!',
  'explore city hotspots 📍',
];

export const BangoAiFloatingButton: React.FC<BangoAiFloatingButtonProps> = ({
  onClick,
  currentPage,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTextBoxVisible, setIsTextBoxVisible] = useState<boolean>(true);
  const [promptIndex, setPromptIndex] = useState<number>(0);

  // Periodic appearance of the text box every few seconds
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const runPeriodicCycle = () => {
      // Keep visible for 4.2 seconds
      timer = setTimeout(() => {
        if (!isMounted) return;
        setIsTextBoxVisible(false);

        // Hide for 2.6 seconds, then show next prompt
        timer = setTimeout(() => {
          if (!isMounted) return;
          setPromptIndex((prev) => (prev + 1) % ROTATING_PROMPTS.length);
          setIsTextBoxVisible(true);
          runPeriodicCycle();
        }, 2600);
      }, 4200);
    };

    runPeriodicCycle();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Highly responsive cursor tracking across the entire screen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      // 1. Screen-wide ambient tilt & floating pull (reacts to cursor anywhere on the screen)
      const normX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const normY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      const ambientX = normX * 10;
      const ambientY = normY * 10;

      // 2. Strong responsive magnetic attraction when cursor is within 420px
      const magneticRadius = 420;
      let magneticX = 0;
      let magneticY = 0;

      if (distance < magneticRadius) {
        const power = Math.pow((magneticRadius - distance) / magneticRadius, 1.15);
        const maxPull = 26; // Prominent, responsive pull
        magneticX = (distX / distance) * power * maxPull;
        magneticY = (distY / distance) * power * maxPull;
      }

      setOffset({
        x: magneticX + ambientX,
        y: magneticY + ambientY,
      });
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const isCurrentPageAi = currentPage === 'bango-ai';
  // Text box appears every few seconds, or stays open when hovered
  const showTextBox = isHovered || (isTextBoxVisible && !isCurrentPageAi);

  return (
    <aside
      aria-label="Bango AI Quick Access"
      className="fixed bottom-6 right-6 z-[2500] pointer-events-none select-none"
    >
      <div className="relative flex items-center gap-3">
        
        {/* Periodic Appearing Text Box on the left */}
        <button
          type="button"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E3DFD7] text-[#191919] shadow-lg hover:shadow-xl hover:border-[#191919] active:scale-95 transition-all duration-400 ease-out ${
            showTextBox
              ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          }`}
          title="Plan your day with Bango AI"
        >
          <span className="font-display font-bold text-xs sm:text-sm text-[#191919] whitespace-nowrap">
            {ROTATING_PROMPTS[promptIndex]}
          </span>
        </button>

        {/* Circular Robot Head Button with Responsive Physics and "bo" Eyes */}
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? 1.08 : 1}) rotate(${offset.x * 0.45}deg)`,
            transition: 'transform 0.08s ease-out, box-shadow 0.2s ease',
          }}
          className="pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#191919] text-white flex items-center justify-center cursor-pointer shadow-2xl border border-white/10 hover:border-white/25 active:scale-95"
          title="Open Bango AI Day Planner"
          aria-label="Open Bango AI"
        >
          {/* Reactive Blinking "bo" Eyes */}
          <BangoRobotEyes size="md" isHovered={isHovered} followCursor={true} />
        </button>

      </div>
    </aside>
  );
};
