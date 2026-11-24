import React from 'react';
import { Menu, Bookmark } from 'lucide-react';
import { PageId } from './Sidebar';

interface MobileHeaderProps {
  currentPage: PageId;
  savedCount: number;
  onOpenMobileMenu: () => void;
  onOpenSaved: () => void;
}

const PAGE_NAMES: Record<PageId, string> = {
  discover: 'Discover',
  map: 'Map Explorer',
  trending: 'Trending',
  domains: 'Domains',
  'how-it-works': 'How It Works',
  saved: 'Saved Places',
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentPage,
  savedCount,
  onOpenMobileMenu,
  onOpenSaved,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-20 w-full bg-[#F5F3EE]/95 backdrop-blur-md border-b border-[#E3DFD7] px-4 py-3 flex items-center justify-between font-sans">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-[#191919] hover:bg-[#ECE9E2] transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-start">
          <span className="font-display font-bold text-2xl lowercase tracking-tight text-[#191919] leading-none">
            bango
          </span>
          <span className="text-[10px] font-bold text-[#F02D25] ml-0.5 -mt-0.5">
            ™
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#77736D] bg-[#ECE9E2] px-2.5 py-1 rounded-full">
          {PAGE_NAMES[currentPage]}
        </span>

        <button
          onClick={onOpenSaved}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E3DFD7] text-xs font-bold text-[#191919] cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#F02D25]" />
          <span>{savedCount}</span>
        </button>
      </div>
    </header>
  );
};
