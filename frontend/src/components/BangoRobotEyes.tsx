import React, { useState, useEffect, useRef } from 'react';

export interface BangoRobotEyesProps {
  size?: 'sm' | 'md' | 'lg';
  isHovered?: boolean;
  followCursor?: boolean;
  className?: string;
}

/**
 * Bango AI companion face featuring the original "bo" typography design
 * acting as highly responsive, blinking companion eyes that actively track cursor movement.
 */
export const BangoRobotEyes: React.FC<BangoRobotEyesProps> = ({
  size = 'md',
  isHovered = false,
  followCursor = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Natural blinking loop: blinks every 2.4s - 4.6s with occasional double-blink
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    const triggerBlink = () => {
      if (!isMounted) return;
      setIsBlinking(true);

      // Blink lasts 130ms (squashing 'bo' into horizontal eyelid slits)
      setTimeout(() => {
        if (!isMounted) return;
        setIsBlinking(false);

        // 25% chance of a realistic quick double-blink
        if (Math.random() < 0.25) {
          setTimeout(() => {
            if (!isMounted) return;
            setIsBlinking(true);
            setTimeout(() => {
              if (!isMounted) return;
              setIsBlinking(false);
              scheduleNext();
            }, 110);
          }, 120);
        } else {
          scheduleNext();
        }
      }, 130);
    };

    const scheduleNext = () => {
      const delay = 2400 + Math.random() * 2200;
      timer = setTimeout(triggerBlink, delay);
    };

    scheduleNext();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Highly responsive smooth cursor tracking across the screen
  useEffect(() => {
    if (!followCursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      // Increased shift range so eye movement is prominent and lively
      const maxShiftX = size === 'sm' ? 5 : size === 'lg' ? 10 : 8.5;
      const maxShiftY = size === 'sm' ? 4 : size === 'lg' ? 8.5 : 7;

      // Higher sensitivity: looks strongly towards mouse even from afar
      const gazeDistance = Math.min(distance, 400);
      const ratio = Math.min(gazeDistance / 240, 1);
      const angle = Math.atan2(distY, distX);

      setEyeOffset({
        x: Math.cos(angle) * ratio * maxShiftX,
        y: Math.sin(angle) * ratio * maxShiftY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followCursor, size]);

  const fontSizeClass =
    size === 'sm'
      ? 'text-lg sm:text-xl'
      : size === 'lg'
      ? 'text-3xl sm:text-4xl'
      : 'text-2xl sm:text-3xl';

  const gapClass = size === 'sm' ? 'gap-0.5' : size === 'lg' ? 'gap-1.5' : 'gap-1';

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
        transition: 'transform 0.06s ease-out',
      }}
      className={`flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      {/* Original "bo" letters acting as interactive eyes */}
      <div
        style={{
          transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
          transformOrigin: 'center',
          transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s ease',
        }}
        className={`font-display font-black tracking-tight lowercase text-white leading-none flex items-center justify-center ${gapClass} ${fontSizeClass} ${
          isHovered
            ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]'
            : 'drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]'
        }`}
      >
        <span className="inline-block">b</span>
        <span className="inline-block">o</span>
      </div>
    </div>
  );
};
