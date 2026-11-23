import React from 'react';
import {
  Compass,
  MapPin,
  TrendingUp,
  Layers,
  Sparkles,
  HelpCircle,
  Sliders,
  Bookmark,
  ArrowUpRight,
  X,
  Map
} from 'lucide-react';

export type PageId =
  | 'discover'
  | 'map'
  | 'trending'
  | 'domains'
  | 'recommendations'
  | 'how-it-works'
  | 'saved';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  savedCount: number;
  onOpenAlgorithm: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'map', label: 'Map Explorer', icon: Map },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'domains', label: 'Domains', icon: Layers },
  { id: 'recommendations', label: 'Apriori AI', icon: Sparkles },
  { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  savedCount,
  onOpenAlgorithm,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside className="w-72 h-full bg-[#F5F3EE] border-r border-[#E3DFD7] flex flex-col justify-between p-6 select-none font-sans overflow-y-auto">
      
      {/* Top Brand Section */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E3DFD7]">
          <div
            onClick={() => handleNavClick('discover')}
            className="cursor-pointer group flex items-center gap-3"
          >
            {/* Signature Circular Monogram */}
            <div className="w-10 h-10 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center font-display font-extrabold text-base tracking-tight transition-colors shadow-sm">
              bg
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-2xl uppercase tracking-tight text-[#191919] leading-none group-hover:text-[#F02D25] transition-colors">
                  bango
                </span>
                <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#77736D] mt-0.5">
                Smart City Discovery
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation Items (Inspired by current UI theme) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block px-3 mb-2">
            Navigation
          </span>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#191919] text-white shadow-md'
                    : 'text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#F02D25]' : 'text-[#77736D]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#F02D25] animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action & Utility Section */}
        <div className="mt-8 pt-6 border-t border-[#E3DFD7] space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block px-3 mb-2">
            Urban Tools
          </span>

          {/* Algorithm Insights Button */}
          <button
            onClick={onOpenAlgorithm}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-[#E3DFD7] hover:bg-[#ECE9E2] text-xs font-bold uppercase tracking-wider text-[#191919] transition-all shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-[#F02D25] group-hover:rotate-45 transition-transform" />
              <span>Algorithm Insights</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#F02D25] bg-[#F5F3EE] px-1.5 py-0.5 rounded-full">
              ARM
            </span>
          </button>

          {/* Saved Places Button */}
          <button
            onClick={() => handleNavClick('saved')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer ${
              currentPage === 'saved'
                ? 'bg-[#191919] text-white border-[#191919]'
                : 'bg-white border-[#E3DFD7] hover:bg-[#ECE9E2] text-[#191919]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-[#F02D25]" />
              <span>Saved Places</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-[#F02D25] text-white text-[10px] font-extrabold flex items-center justify-center">
              {savedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Explore City CTA & City Coordinates */}
      <div className="mt-8 pt-6 border-t border-[#E3DFD7] space-y-4">
        {/* Signature Editorial Pill Button with Red Circular Arrow */}
        <button
          onClick={() => handleNavClick('map')}
          className="w-full group flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          <span>Explore City</span>
          <div className="w-8 h-8 rounded-full bg-[#F02D25] group-hover:bg-[#E9473D] flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 shadow-sm">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </button>

        {/* Location & Dataset Meta */}
        <div className="px-1 text-[11px] text-[#77736D] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#191919]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
            <span>Bengaluru, Karnataka</span>
          </div>
          <p className="text-[10px] text-[#77736D] font-mono">
            12.9716° N, 77.5946° E &bull; 920m
          </p>
        </div>
      </div>

    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          ></div>
          <div className="relative z-10 w-72 h-full bg-[#F5F3EE] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
