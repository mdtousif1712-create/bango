import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Download, Sparkles } from 'lucide-react';

interface BangoIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BangoIntroModal: React.FC<BangoIntroModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [duration, setDuration] = useState<string>('0:12');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && isOpen) {
        e.preventDefault();
        togglePlay();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Attempt autoplay with sound
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // If browser blocks unmuted autoplay, mute and try again
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play();
          }
        });
        setIsPlaying(true);
      }
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 12.43;
    setProgress((curr / dur) * 100);

    const curMins = Math.floor(curr / 60);
    const curSecs = Math.floor(curr % 60);
    setCurrentTime(`${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`);

    const durMins = Math.floor(dur / 60);
    const durSecs = Math.floor(dur % 60);
    setDuration(`${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * (videoRef.current.duration || 12.43);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#191919] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F02D25] text-white flex items-center justify-center font-display font-bold text-sm lowercase shadow-xs">
              <span className="-translate-y-[0.5px]">bo</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base text-white lowercase">bango</span>
                <span className="text-[10px] font-bold text-[#F02D25]">TM</span>
                <span className="text-xs text-white/50 font-medium ml-1">Official Intro Animation</span>
              </div>
              <p className="text-[10px] sm:text-xs text-white/40 font-mono">
                1080p HD &bull; 30 FPS &bull; Recreated Bot Totem & Signature Lockup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/bango_intro.mp4"
              download="bango_intro.mp4"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              title="Download intro video file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download MP4</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-[#F02D25] text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src="/bango_intro.mp4"
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            playsInline
            autoPlay
          />

          {/* Central Play/Pause Watermark Overlay when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-18 h-18 rounded-full bg-[#F02D25]/90 hover:bg-[#F02D25] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer"
            >
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </button>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#141414] border-t border-white/10 flex flex-col gap-2.5">
          {/* Progress Timeline */}
          <div
            className="w-full h-1.5 bg-white/15 rounded-full cursor-pointer relative overflow-hidden group/bar"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-[#F02D25] rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-xs font-mono text-white/60">
                {currentTime} / {duration}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
