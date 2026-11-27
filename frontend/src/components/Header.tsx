import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Map,
  TrendingUp,
  Layers,
  Bookmark,
  ArrowUpRight,
  Menu,
  X,
  Pin,
  PinOff,
  ChevronDown
} from 'lucide-react';

export type PageId =
  | 'discover'
  | 'map'
  | 'trending'
  | 'domains'
  | 'saved';

export interface HeaderProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  savedCount: number;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'map', label: 'Map Explorer', icon: Map },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'domains', label: 'Domains', icon: Layers },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  savedCount,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const headerRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Proximity trigger: reveal header when cursor moves within the top 36px of the viewport
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned || isMobileMenuOpen) return;

      if (e.clientY <= 36) {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isPinned, isMobileMenuOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isPinned || isMobileMenuOpen) return;
    // Add brief smooth debounce before hiding
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 280);
  };

  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
    if (!isPinned) {
      // Tuck away after navigation unless pinned
      setIsHovered(false);
    }
  };

  const isVisible = isHovered || isPinned || isMobileMenuOpen;

  return (
    <>
      {/* 1. TOP PROXIMITY SENSOR STRIP (Invisible hover catcher across the top edge) */}
      <div
        onMouseEnter={handleMouseEnter}
        className="fixed top-0 left-0 right-0 h-4 z-40 cursor-pointer pointer-events-auto"
        aria-hidden="true"
      />

      {/* 2. MINIMAL FLOATING CAPSULE (Visible when header is tucked away, shows brand & hints to hover) */}
      {!isVisible && (
        <div
          onMouseEnter={handleMouseEnter}
          onClick={() => setIsHovered(true)}
          className="fixed top-2.5 left-1/2 -translate-x-1/2 z-30 group cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-top-2"
          title="Move cursor here to reveal navigation"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E3DFD7] shadow-md group-hover:border-[#F02D25] group-hover:shadow-lg transition-all">
            <div className="w-5 h-5 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center font-display font-bold text-[10px] lowercase transition-colors">
              bo
            </div>
            <span className="font-display font-bold text-xs lowercase text-[#191919] tracking-tight">
              bango
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25] animate-pulse"></span>
            <ChevronDown className="w-3.5 h-3.5 text-[#77736D] group-hover:text-[#F02D25] group-hover:translate-y-0.5 transition-all" />
          </div>
        </div>
      )}

      {/* 3. SLIDE-DOWN HOVER-REVEAL HEADER (Fixed over page with zero layout shift) */}
      <header
        ref={headerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-[#F5F3EE]/95 backdrop-blur-md border-b border-[#E3DFD7] transition-all duration-300 ease-in-out select-none font-sans ${
          isVisible
            ? 'translate-y-0 opacity-100 shadow-xl pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* ================= BRAND LOGO UNIT (Left) ================= */}
          <div
            onClick={() => handleNavClick('discover')}
            className="cursor-pointer group flex items-center gap-2.5 sm:gap-3 shrink-0"
            title="bango™ • smart city discovery"
          >
            {/* Circular Monogram Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center font-display font-bold text-base sm:text-lg lowercase tracking-tight transition-colors shrink-0 shadow-sm">
              bo
            </div>

            {/* Brand Title & Tagline */}
            <div className="flex flex-col">
              <div className="flex items-start">
                <span className="font-display font-bold text-2xl sm:text-3xl lowercase tracking-tight text-[#191919] leading-none group-hover:text-[#F02D25] transition-colors">
                  bango
                </span>
                <span className="text-[11px] font-bold text-[#F02D25] ml-0.5 -mt-0.5 select-none">
                  ™
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-[#77736D] mt-0.5 sm:mt-1">
                smart city discovery
              </span>
            </div>
          </div>

          {/* ================= NAVIGATION PILLS (Center) ================= */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-[#E3DFD7] mx-1 lg:mx-2" />

            {/* Nav Items Container */}
            <nav className="flex items-center gap-1 bg-[#ECE9E2]/60 p-1.5 rounded-2xl border border-[#E3DFD7]/80">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#191919] text-white shadow-sm ring-2 ring-[#F02D25]/30'
                        : 'text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2]'
                    }`}
                    title={item.label}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#F02D25]' : 'text-[#77736D]'
                      }`}
                    />
                    <span className="whitespace-nowrap font-bold">
                      {item.label}
                    </span>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25] animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-[#E3DFD7] mx-1 lg:mx-2" />
          </div>

          {/* ================= URBAN TOOLS & ACTIONS (Right) ================= */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Saved Places Button */}
            <button
              onClick={() => handleNavClick('saved')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl transition-all duration-200 shadow-2xs cursor-pointer border ${
                currentPage === 'saved'
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm ring-2 ring-[#F02D25]/30'
                  : 'bg-white border-[#E3DFD7] hover:bg-[#ECE9E2] text-[#191919]'
              }`}
              title={`Saved Places (${savedCount})`}
            >
              <Bookmark className="w-4 h-4 text-[#F02D25] shrink-0" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                Saved
              </span>
              <span className="w-5 h-5 rounded-full bg-[#F02D25] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                {savedCount}
              </span>
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-[#E3DFD7] mx-0.5 hidden sm:block" />

            {/* Explore City CTA (Desktop Pill) */}
            <button
              onClick={() => handleNavClick('map')}
              className="group hidden sm:flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              title="Explore City on Map"
            >
              <span className="whitespace-nowrap font-bold">
                Explore City
              </span>
              <div className="w-7 h-7 rounded-full bg-[#F02D25] group-hover:bg-[#E9473D] flex items-center justify-center text-white shrink-0 transition-colors shadow-xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>

            {/* Explore City CTA (Mobile Circle) */}
            <button
              onClick={() => handleNavClick('map')}
              className="sm:hidden w-10 h-10 rounded-full bg-[#F02D25] hover:bg-[#E9473D] text-white shadow-md flex items-center justify-center cursor-pointer transition-colors"
              title="Explore City on Map"
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </button>

            {/* Location Coordinates / Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 pl-1" title="Bengaluru, Karnataka • 12.9716° N, 77.5946° E">
              <span className="w-2 h-2 rounded-full bg-[#F02D25] animate-pulse"></span>
              <span className="text-[10px] text-[#77736D] font-mono hidden xl:inline">
                12.9716° N, 77.5946° E
              </span>
            </div>

            {/* Pin / Unpin Toggle (Optional: lets user lock header open or allow auto-hide on hover) */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`hidden md:flex p-2 rounded-xl transition-colors cursor-pointer ${
                isPinned
                  ? 'bg-[#191919] text-[#F02D25]'
                  : 'text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2]'
              }`}
              title={isPinned ? 'Header Pinned (Click to auto-hide)' : 'Auto-hiding (Click to pin permanently)'}
            >
              {isPinned ? (
                <PinOff className="w-4 h-4" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#191919] hover:bg-[#ECE9E2] transition-colors cursor-pointer"
              title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#191919]" />
              ) : (
                <Menu className="w-5 h-5 text-[#191919]" />
              )}
            </button>

          </div>

        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <aside className="relative z-10 w-72 h-full bg-[#F5F3EE] shadow-2xl p-6 flex flex-col justify-between font-sans overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#E3DFD7]">
                <div
                  onClick={() => handleNavClick('discover')}
                  className="cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-bold text-base lowercase tracking-tight">
                    bo
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      <span className="font-display font-bold text-2xl lowercase tracking-tight text-[#191919] leading-none">
                        bango
                      </span>
                      <span className="text-[10px] font-bold text-[#F02D25] ml-0.5 -mt-0.5">
                        ™
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#77736D] mt-0.5">
                      smart city discovery
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block px-3 mb-1">
                  Navigation
                </span>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#191919] text-white shadow-md ring-2 ring-[#F02D25]/30'
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
                        <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Urban Tools Section */}
              <div className="mt-6 pt-5 border-t border-[#E3DFD7] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block px-3 mb-1">
                  Urban Tools
                </span>

                <button
                  onClick={() => handleNavClick('saved')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider cursor-pointer ${
                    currentPage === 'saved'
                      ? 'bg-[#191919] text-white border-[#191919]'
                      : 'bg-white border-[#E3DFD7] text-[#191919]'
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

            {/* Bottom Drawer Footer */}
            <div className="mt-6 pt-5 border-t border-[#E3DFD7] space-y-4">
              <button
                onClick={() => handleNavClick('map')}
                className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#191919] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <span>Explore City</span>
                <div className="w-8 h-8 rounded-full bg-[#F02D25] flex items-center justify-center text-white">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>

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
        </div>
      )}
    </>
  );
};
