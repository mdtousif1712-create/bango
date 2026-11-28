import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Volume2 } from 'lucide-react';

interface BangoIntroModalProps {
  onComplete: () => void;
}

export const BangoIntroModal: React.FC<BangoIntroModalProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleUnmute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      video.volume = 1.0;
      // Rewind to beginning if under 4 seconds so user experiences full synchronized SFX from start
      if (video.currentTime < 4.0) {
        video.currentTime = 0;
      }
      video.play().catch(() => {});
    } catch {}
    setIsMuted(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Default configuration: unmuted with full volume
    video.muted = false;
    video.volume = 1.0;

    let cleanupListeners: (() => void) | null = null;

    const startPlayback = async () => {
      try {
        await video.play();
        setIsMuted(false);
      } catch (err) {
        console.warn('Autoplay with sound restricted by browser; playing muted with instant unmute on interaction:', err);
        // Fallback: start muted so visual motion graphics run without stalling
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
        } catch {
          handleFinish();
          return;
        }

        // On first user interaction anywhere, unmute audio immediately
        const unmuteOnUserGesture = () => {
          handleUnmute();
          removeGestureListeners();
        };

        const removeGestureListeners = () => {
          window.removeEventListener('click', unmuteOnUserGesture);
          window.removeEventListener('touchstart', unmuteOnUserGesture);
          window.removeEventListener('keydown', unmuteOnUserGesture);
        };

        window.addEventListener('click', unmuteOnUserGesture, { once: true });
        window.addEventListener('touchstart', unmuteOnUserGesture, { once: true });
        window.addEventListener('keydown', unmuteOnUserGesture, { once: true });

        cleanupListeners = removeGestureListeners;
      }
    };

    startPlayback();

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleFinish();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isMuted) {
          handleUnmute();
        } else {
          handleFinish();
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (cleanupListeners) cleanupListeners();
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={isMuted ? () => handleUnmute() : undefined}
      className={`fixed inset-0 z-[9999] bg-[#0A0A0B] flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      } ${isMuted ? 'cursor-pointer' : ''}`}
    >
      {/* Top Right Skip Control (Pure Clean, Zero Shadow) */}
      <div className="absolute top-5 right-5 sm:right-8 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
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
          <source src="/bango_og_intro.mp4" type="video/mp4" />
          <source src="/bango_og_intro.webm" type="video/webm" />
          Your browser does not support HTML5 video playback.
        </video>
      </div>

      {/* Sound activation badge (shown only when browser blocks unmuted autoplay) */}
      {isMuted && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={handleUnmute}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#F02D25] border border-white/25 hover:border-[#F02D25] text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-2xl transition-all hover:scale-105 cursor-pointer animate-pulse"
          >
            <Volume2 className="w-4 h-4 text-white" />
            <span>Click to Enable Sound</span>
          </button>
        </div>
      )}

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
