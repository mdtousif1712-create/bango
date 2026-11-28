import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowRight, Play, Sparkles } from 'lucide-react';

interface BangoIntroModalProps {
  onComplete: () => void;
}

export const BangoIntroModal: React.FC<BangoIntroModalProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
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

    // Start playing video automatically
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay prevented or video playback error:', err);
        // Fallback: If autoplay fails, ensure video plays muted
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {
          // If playback totally fails, don't trap user
          handleFinish();
        });
      });
    }

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
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0A0A0B] flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Header Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Brand identity badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#191919] border border-white/20 flex items-center justify-center shadow-lg">
            <span className="font-sans font-black text-xs text-white tracking-tighter">bo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-lg text-white tracking-tight">bango</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25] animate-pulse"></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleFinish}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-[#F02D25] border border-white/15 hover:border-[#F02D25] text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer shadow-lg hover:shadow-red-500/30"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Fullscreen Video Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isMuted}
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
          className="h-full bg-[#F02D25] transition-all duration-150 ease-linear shadow-[0_0_12px_rgba(240,45,37,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
