import React, { useState } from 'react';
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
  // Desktop hover-to-expand state
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Helper renderer for desktop sidebar (collapses to slim centered icon bar, expands on hover)
  const renderDesktopSidebar = () => (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen sticky top-0 shrink-0 z-40 bg-[#F5F3EE] border-r border-[#E3DFD7] flex flex-col justify-between py-6 select-none font-sans overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out shadow-xs ${
        isHovered ? 'w-72 px-5' : 'w-20 px-3'
      }`}
    >
      {/* Top Section: Brand & Nav Items */}
      <div className="flex flex-col w-full items-center">
        
        {/* Brand Logo & Header */}
        <div
          onClick={() => handleNavClick('discover')}
          className={`cursor-pointer group flex items-center pb-5 mb-4 border-b border-[#E3DFD7] transition-all duration-300 w-full ${
            isHovered ? 'justify-start gap-3' : 'justify-center gap-0'
          }`}
          title="bango™ • smart city discovery"
        >
          {/* Centered Circular Monogram Badge with Chunky Rounded Lettering */}
          <div className="w-11 h-11 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center font-display font-bold text-lg lowercase tracking-tight transition-colors shrink-0 shadow-sm">
            bg
          </div>

          {/* Full Brand Name matching the atons™ puffy typography */}
          {isHovered && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-start">
                <span className="font-display font-bold text-3xl lowercase tracking-tight text-[#191919] leading-none group-hover:text-[#F02D25] transition-colors">
                  bango
                </span>
                <span className="text-[11px] font-bold text-[#F02D25] ml-0.5 -mt-0.5 select-none">
                  ™
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#77736D] mt-1">
                smart city discovery
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-2 w-full flex flex-col items-center">
          {/* Navigation Label (visible only when hovered) */}
          {isHovered && (
            <div className="w-full px-3 mb-1 animate-in fade-in duration-150">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] whitespace-nowrap">
                Navigation
              </span>
            </div>
          )}

          {/* Nav Buttons */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? `w-full justify-between px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#191919] text-white shadow-md'
                            : 'text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2]'
                        }`
                      : `w-11 h-11 rounded-2xl justify-center ${
                          isActive
                            ? 'bg-[#191919] text-[#F02D25] shadow-md ring-2 ring-[#F02D25]/30'
                            : 'text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2]'
                        }`
                  }`}
                  title={!isHovered ? item.label : undefined}
                >
                  {/* When Hovered: Icon + Label */}
                  {isHovered ? (
                    <>
                      <div className="flex items-center gap-3 shrink-0">
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            isActive ? 'text-[#F02D25]' : 'text-[#77736D] group-hover:text-[#191919]'
                          }`}
                        />
                        <span className="whitespace-nowrap font-bold">
                          {item.label}
                        </span>
                      </div>

                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#F02D25] animate-pulse shrink-0"></span>
                      )}
                    </>
                  ) : (
                    /* When Collapsed: Centered Icon ONLY */
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-[#F02D25]' : 'text-[#77736D] group-hover:text-[#191919]'
                      }`}
                    />
                  )}
                </button>

                {/* Collapsed Tooltip (shows on linger when not hovered) */}
                {!isHovered && (
                  <div className="absolute left-[68px] top-1/2 -translate-y-1/2 bg-[#191919] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider Between Nav and Urban Tools */}
        <div className={`transition-all duration-300 border-b border-[#E3DFD7] ${
          isHovered ? 'w-full my-5' : 'w-10 my-4'
        }`}></div>

        {/* Urban Tools Section */}
        <div className="space-y-2 w-full flex flex-col items-center">
          {/* Urban Tools Label (visible only when hovered) */}
          {isHovered && (
            <div className="w-full px-3 mb-1 animate-in fade-in duration-150">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] whitespace-nowrap">
                Urban Tools
              </span>
            </div>
          )}

          {/* Algorithm Insights Button */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={onOpenAlgorithm}
              className={`flex items-center transition-all duration-200 shadow-2xs cursor-pointer ${
                isHovered
                  ? 'w-full justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-[#E3DFD7] hover:bg-[#ECE9E2] text-xs font-bold uppercase tracking-wider text-[#191919]'
                  : 'w-11 h-11 rounded-2xl bg-white border border-[#E3DFD7] justify-center hover:bg-[#ECE9E2] text-[#F02D25]'
              }`}
              title={!isHovered ? 'Algorithm Insights (Apriori Rules)' : undefined}
            >
              {isHovered ? (
                <>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Sliders className="w-4 h-4 text-[#F02D25] group-hover:rotate-45 transition-transform shrink-0" />
                    <span className="whitespace-nowrap font-bold">
                      Algorithm Insights
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#F02D25] bg-[#F5F3EE] px-1.5 py-0.5 rounded-full shrink-0">
                    ARM
                  </span>
                </>
              ) : (
                <Sliders className="w-4 h-4 text-[#F02D25] shrink-0" />
              )}
            </button>

            {!isHovered && (
              <div className="absolute left-[68px] top-1/2 -translate-y-1/2 bg-[#191919] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Algorithm Insights
              </div>
            )}
          </div>

          {/* Saved Places Button */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleNavClick('saved')}
              className={`flex items-center transition-all duration-200 shadow-2xs cursor-pointer relative ${
                isHovered
                  ? `w-full justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider ${
                      currentPage === 'saved'
                        ? 'bg-[#191919] text-white border-[#191919]'
                        : 'bg-white border-[#E3DFD7] hover:bg-[#ECE9E2] text-[#191919]'
                    }`
                  : `w-11 h-11 rounded-2xl justify-center border ${
                      currentPage === 'saved'
                        ? 'bg-[#191919] text-white border-[#191919]'
                        : 'bg-white border-[#E3DFD7] hover:bg-[#ECE9E2] text-[#191919]'
                    }`
              }`}
              title={!isHovered ? `Saved Places (${savedCount})` : undefined}
            >
              {isHovered ? (
                <>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Bookmark className="w-4 h-4 text-[#F02D25] shrink-0" />
                    <span className="whitespace-nowrap font-bold">
                      Saved Places
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-[#F02D25] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {savedCount}
                  </span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-[#F02D25] shrink-0" />
                  {savedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F02D25] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                      {savedCount}
                    </span>
                  )}
                </>
              )}
            </button>

            {!isHovered && (
              <div className="absolute left-[68px] top-1/2 -translate-y-1/2 bg-[#191919] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Saved Places ({savedCount})
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Explore City CTA & Coordinates */}
      <div className="flex flex-col w-full items-center">
        {/* Divider */}
        <div className={`transition-all duration-300 border-b border-[#E3DFD7] ${
          isHovered ? 'w-full mb-5' : 'w-10 mb-4'
        }`}></div>

        {/* Explore City CTA Button */}
        <div className="relative group w-full flex justify-center mb-3">
          <button
            onClick={() => handleNavClick('map')}
            className={`transition-all duration-200 cursor-pointer shadow-md flex items-center ${
              isHovered
                ? 'w-full justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider'
                : 'w-11 h-11 rounded-full bg-[#F02D25] hover:bg-[#E9473D] text-white justify-center'
            }`}
            title={!isHovered ? 'Explore City on Map' : undefined}
          >
            {isHovered ? (
              <>
                <span className="whitespace-nowrap font-bold">
                  Explore City
                </span>
                <div className="w-8 h-8 rounded-full bg-[#F02D25] flex items-center justify-center text-white shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </>
            ) : (
              <ArrowUpRight className="w-4 h-4 text-white shrink-0" />
            )}
          </button>

          {!isHovered && (
            <div className="absolute left-[68px] top-1/2 -translate-y-1/2 bg-[#191919] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Explore City
            </div>
          )}
        </div>

        {/* Location Coordinates / Centered Dot */}
        {isHovered ? (
          <div className="w-full px-1 text-[11px] text-[#77736D] space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 font-semibold text-[#191919]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
              <span>Bengaluru, Karnataka</span>
            </div>
            <p className="text-[10px] text-[#77736D] font-mono">
              12.9716° N, 77.5946° E &bull; 920m
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-1" title="Bengaluru, Karnataka • 12.9716° N, 77.5946° E">
            <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
          </div>
        )}
      </div>
    </aside>
  );

  // Mobile drawer content (always full-width for touch devices)
  const renderMobileDrawer = () => (
    <aside className="w-72 h-full bg-[#F5F3EE] flex flex-col justify-between p-6 select-none font-sans overflow-y-auto">
      <div>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E3DFD7]">
          <div
            onClick={() => handleNavClick('discover')}
            className="cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-bold text-base lowercase tracking-tight">
              bg
            </div>
            <div className="flex flex-col">
              <div className="flex items-start">
                <span className="font-display font-bold text-3xl lowercase tracking-tight text-[#191919] leading-none">
                  bango
                </span>
                <span className="text-[10px] font-bold text-[#F02D25] ml-0.5 -mt-0.5">
                  ™
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#77736D] mt-1">
                smart city discovery
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="space-y-2">
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
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#191919] text-white shadow-md'
                    : 'text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F02D25]' : 'text-[#77736D]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>}
              </button>
            );
          })}
        </div>

        {/* Mobile Urban Tools */}
        <div className="mt-6 pt-5 border-t border-[#E3DFD7] space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block px-3 mb-1">
            Urban Tools
          </span>

          <button
            onClick={() => {
              onOpenAlgorithm();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-[#E3DFD7] text-xs font-bold uppercase tracking-wider text-[#191919]"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-[#F02D25]" />
              <span>Algorithm Insights</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#F02D25] bg-[#F5F3EE] px-1.5 py-0.5 rounded-full">
              ARM
            </span>
          </button>

          <button
            onClick={() => handleNavClick('saved')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider ${
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

      <div className="mt-6 pt-5 border-t border-[#E3DFD7]">
        <button
          onClick={() => handleNavClick('map')}
          className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#191919] text-white text-xs font-bold uppercase tracking-wider"
        >
          <span>Explore City</span>
          <div className="w-8 h-8 rounded-full bg-[#F02D25] flex items-center justify-center text-white">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Hover-Collapsible Sidebar */}
      <div className="hidden lg:block">
        {renderDesktopSidebar()}
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          ></div>
          <div className="relative z-10 w-72 h-full bg-[#F5F3EE] shadow-2xl animate-in slide-in-from-left duration-200">
            {renderMobileDrawer()}
          </div>
        </div>
      )}
    </>
  );
};
