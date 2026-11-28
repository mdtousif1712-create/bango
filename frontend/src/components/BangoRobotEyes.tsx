import React, { useState, useEffect, useRef } from 'react';

export interface BangoRobotEyesProps {
  size?: 'sm' | 'md' | 'lg';
  isHovered?: boolean;
  followCursor?: boolean;
  className?: string;
}

/**
 * Reusable Bango AI companion face with cursor-tracking gaze and natural periodic eye-blinking.
 * Styled after the modern companion robot UI in VajraCast/Bango AI.
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

  // Blinking loop: blinks naturally every 2.4s - 4.6s with occasional double-blink
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    const triggerBlink = () => {
      if (!isMounted) return;
      setIsBlinking(true);

      // Close eyes for 130ms (squash vertically)
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

  // Smooth cursor tracking across the screen
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

      const maxShift = size === 'sm' ? 4 : size === 'lg' ? 8 : 6.5;
      const gazeDistance = Math.min(distance, 450);
      const ratio = gazeDistance / 450;
      const angle = Math.atan2(distY, distX);

      setEyeOffset({
        x: Math.cos(angle) * ratio * maxShift,
        y: Math.sin(angle) * ratio * maxShift,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followCursor, size]);

  // Dimensions for different sizes
  const eyeWidth = size === 'sm' ? 'w-[7px]' : size === 'lg' ? 'w-[10px]' : 'w-[8.5px]';
  const eyeHeight = size === 'sm' ? 'h-[16px]' : size === 'lg' ? 'h-[25px]' : 'h-[21px]';
  const eyeGap = size === 'sm' ? 'gap-1.5' : size === 'lg' ? 'gap-2.5' : 'gap-2';

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
        transition: 'transform 0.12s ease-out',
      }}
      className={`flex items-center justify-center ${eyeGap} select-none pointer-events-none ${className}`}
    >
      {/* Left Capsule Eye */}
      <div
        style={{
          transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
          transformOrigin: 'center',
          transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, box-shadow 0.2s ease',
        }}
        className={`${eyeWidth} ${eyeHeight} rounded-full transition-all duration-200 ${
          isHovered
            ? 'bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]'
            : 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]'
        }`}
      />

      {/* Right Capsule Eye */}
      <div
        style={{
          transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
          transformOrigin: 'center',
          transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, box-shadow 0.2s ease',
        }}
        className={`${eyeWidth} ${eyeHeight} rounded-full transition-all duration-200 ${
          isHovered
            ? 'bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]'
            : 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]'
        }`}
      />
    </div>
  );
};
