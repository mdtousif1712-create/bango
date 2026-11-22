import React from 'react';
import { MapPin, Bookmark, Sparkles, SlidersHorizontal } from 'lucide-react';

interface TopbarProps {
  currentCity?: string;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAlgorithm: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentCity = 'Bengaluru, India',
  savedCount,
  onOpenSaved,
  onOpenAlgorithm
}) => {
  return (
    <header className="h-16 px-6 border-b border-[#E8EBF0] flex items-center justify-between bg-white shrink-0">
      {/* Left: Breadcrumbs & App Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#777F8B]">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#171B24] font-semibold">Discover</span>
        </div>

        <div className="h-4 w-[1px] bg-[#E8EBF0] mx-1"></div>

        {/* Current City Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EBEF]/60 text-[#171B24] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <MapPin className="w-3.5 h-3.5 text-[#5681EB]" />
          <span>{currentCity}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Apriori Engine Badge & Button */}
        <button
          onClick={onOpenAlgorithm}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E8EBF0] hover:border-[#5681EB]/40 bg-[#F8FAFC] hover:bg-[#B9E2F1]/20 text-[#171B24] text-xs font-medium transition-all shadow-2xs"
          title="Inspect MLxtend Apriori Rules"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5681EB]" />
          <span>Apriori Mining Engine</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#5681EB]/10 text-[#3F6FDB] text-[10px] font-bold">
            Live
          </span>
        </button>

        {/* Saved Places Shortcut */}
        <button
          onClick={onOpenSaved}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8EBF0] hover:bg-[#F8FAFC] text-[#171B24] text-xs font-medium transition-all"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#777F8B]" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#5681EB] text-white text-[10px] font-bold">
              {savedCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3F6FDB] to-[#5681EB] text-white text-xs font-semibold flex items-center justify-center ring-2 ring-[#B9E2F1]">
          KA
        </div>
      </div>
    </header>
  );
};
