import React from 'react';
import { Sparkles, Bookmark, Compass, Sliders, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAlgorithm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onOpenAlgorithm,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F5F3EE]/90 backdrop-blur-md border-b border-[#E3DFD7] transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer flex items-center gap-2.5 group select-none"
        >
          <div className="w-9 h-9 rounded-full bg-[#191919] text-white flex items-center justify-center font-bold text-sm tracking-wider group-hover:bg-[#F02D25] transition-colors">
            BLR
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-tight text-[#191919] uppercase leading-none">
                Bengaluru
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#77736D] font-semibold">
              Smart City Discovery
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => scrollTo('hero')}
            className="text-xs font-bold uppercase tracking-wider text-[#191919] hover:text-[#F02D25] transition-colors"
          >
            Discover
          </button>
          <button
            onClick={() => scrollTo('map-explorer')}
            className="text-xs font-bold uppercase tracking-wider text-[#77736D] hover:text-[#191919] transition-colors"
          >
            Map Explorer
          </button>
          <button
            onClick={() => scrollTo('trending')}
            className="text-xs font-bold uppercase tracking-wider text-[#77736D] hover:text-[#191919] transition-colors"
          >
            Trending
          </button>
          <button
            onClick={() => scrollTo('categories')}
            className="text-xs font-bold uppercase tracking-wider text-[#77736D] hover:text-[#191919] transition-colors"
          >
            Domains
          </button>
          <button
            onClick={() => scrollTo('recommendations')}
            className="text-xs font-bold uppercase tracking-wider text-[#77736D] hover:text-[#191919] transition-colors"
          >
            Apriori AI
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="text-xs font-bold uppercase tracking-wider text-[#77736D] hover:text-[#191919] transition-colors"
          >
            How It Works
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Algorithm Inspector Trigger */}
          <button
            onClick={onOpenAlgorithm}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border border-[#E3DFD7] bg-white hover:bg-[#ECE9E2] text-xs font-semibold text-[#191919] transition-all shadow-xs"
            title="Inspect Apriori Association Rules"
          >
            <Sliders className="w-3.5 h-3.5 text-[#F02D25]" />
            <span>Algorithm Insights</span>
          </button>

          {/* Saved Places Button */}
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E3DFD7] bg-white hover:bg-[#ECE9E2] text-xs font-semibold text-[#191919] transition-all shadow-xs"
            title="View Saved Places"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#191919]" />
            <span className="hidden md:inline">Saved</span>
            <span className="w-5 h-5 rounded-full bg-[#F02D25] text-white text-[10px] font-bold flex items-center justify-center">
              {savedCount}
            </span>
          </button>

          {/* Signature Video CTA Pill Button with Red Circular Arrow */}
          <button
            onClick={() => scrollTo('map-explorer')}
            className="group flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            <span>Explore City</span>
            <div className="w-7 h-7 rounded-full bg-[#F02D25] group-hover:bg-[#E9473D] flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
