import React from 'react';
import { Compass, Sparkles, X, MapPin } from 'lucide-react';

interface TopBannerProps {
  onDismiss: () => void;
  onExploreClick: () => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onDismiss, onExploreClick }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#5681EB] via-[#3F6FDB] to-[#5681EB] text-white rounded-2xl p-5 mb-5 shadow-sm border border-[#5681EB]/20">
      {/* Background Subtle Geographical SVG Motifs */}
      <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none">
        <svg width="220" height="140" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="60" r="30" strokeDasharray="4 4" />
          <circle cx="140" cy="50" r="45" strokeDasharray="3 3" />
          <path d="M20 90 Q 70 30 130 80 T 200 40" />
          <circle cx="130" cy="80" r="6" fill="currentColor" />
          <circle cx="70" cy="45" r="4" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 mt-0.5 border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                Discover Bengaluru Smarter!
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wide">
                Apriori AI
              </span>
            </div>
            <p className="text-white/85 text-xs md:text-sm mt-1 leading-relaxed">
              Explore places, discover hidden gems and find recommendations powered by city data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={onExploreClick}
            className="px-4 py-2 bg-white text-[#3F6FDB] hover:bg-[#B9E2F1] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Bengaluru</span>
          </button>

          <button
            onClick={onDismiss}
            className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-all"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
