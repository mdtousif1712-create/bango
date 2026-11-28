import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface BangoIntroModalProps {
  onComplete: () => void;
}

export const BangoIntroModal: React.FC<BangoIntroModalProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Automatically play with full sound enabled
    video.muted = false;
    video.volume = 1;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Browser required gesture for sound:', err);
        // Play video immediately, and unmute on first gesture silently without showing any UI badge
        video.muted = true;
        video.play().then(() => {
          video.muted = false;
        }).catch(() => {});
      });
    }

    const handleSilentUnmute = () => {
      if (video && video.muted) {
        video.muted = false;
        video.volume = 1;
      }
    };

    window.addEventListener('click', handleSilentUnmute);
    window.addEventListener('keydown', handleSilentUnmute);
    window.addEventListener('touchstart', handleSilentUnmute);

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleFinish();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFinish();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleSilentUnmute);
      window.removeEventListener('keydown', handleSilentUnmute);
      window.removeEventListener('touchstart', handleSilentUnmute);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0A0A0B] flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Right Skip Control (Pure Clean, Zero Shadow) */}
      <div className="absolute top-5 right-5 sm:right-8 z-20">
        <button
          onClick={handleFinish}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-[#F02D25] border border-white/20 hover:border-[#F02D25] text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Fullscreen Video Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/bango_og_intro.webm" type="video/webm" />
          <source src="/bango_og_intro.mp4" type="video/mp4" />
          Your browser does not support HTML5 video playback.
        </video>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
        <div
          className="h-full bg-[#F02D25] transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
