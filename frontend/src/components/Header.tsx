import React, { useState, useRef } from 'react';
import {
  Compass,
  Map,
  TrendingUp,
  Layers,
  Bookmark,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  MapPin,
  HeartPulse,
  Train,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  Utensils,
  Building2,
  Menu,
  X,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Place } from '../types';

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
  savedPlaces?: Place[];
  onSelectCategory?: (category: string) => void;
  onSelectPlace?: (place: Place) => void;
}

const DOMAINS_LIST = [
  { name: 'Tourism', icon: Landmark, desc: 'Parks, palaces & heritage spots' },
  { name: 'Transportation', icon: Train, desc: 'Namma Metro lines & transit' },
  { name: 'Restaurants', icon: Utensils, desc: 'Darshinis, cafes & breweries' },
  { name: 'Healthcare', icon: HeartPulse, desc: 'Hospitals & specialty research' },
  { name: 'Shopping', icon: ShoppingBag, desc: 'Commercial Street & malls' },
  { name: 'Education', icon: GraduationCap, desc: 'IISc, IIMB & universities' },
  { name: 'Entertainment', icon: Clapperboard, desc: 'Theatres, arenas & live clubs' },
  { name: 'Real Estate', icon: Building2, desc: 'Tech parks & towers' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  savedCount,
  savedPlaces = [],
  onSelectCategory,
  onSelectPlace,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menuId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menuId);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200); // 200ms grace period so moving cursor into dropdown card is smooth
  };

  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleDomainClick = (domainName: string) => {
    if (onSelectCategory) {
      onSelectCategory(domainName);
    }
    handleNavClick('map');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E3DFD7] select-none font-sans transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* ================= LEFT: BRAND LOGO ================= */}
        <div
          onClick={() => handleNavClick('discover')}
          className="cursor-pointer group flex items-center gap-3 shrink-0"
          title="bango™ • smart city discovery"
        >
          {/* Circular bo Monogram */}
          <div className="w-10 h-10 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center font-display font-bold text-lg lowercase tracking-tight transition-colors shadow-sm">
            bo
          </div>

          <div className="flex flex-col">
            <div className="flex items-start">
              <span className="font-display font-bold text-2xl sm:text-3xl lowercase tracking-tight text-[#191919] leading-none group-hover:text-[#F02D25] transition-colors">
                bango
              </span>
              <span className="text-[11px] font-bold text-[#F02D25] ml-0.5 -mt-0.5 select-none">
                ™
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-[#77736D] mt-0.5">
              smart city discovery
            </span>
          </div>
        </div>

        {/* ================= CENTER: NAVIGATION LINKS WITH HOVER DROPDOWNS (Dribbble Style) ================= */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">

          {/* 1. DISCOVER ITEM + DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('discover')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleNavClick('discover')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === 'discover'
                  ? 'text-[#F02D25] bg-[#F5F3EE]'
                  : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
              }`}
            >
              <span>Discover</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'discover' ? 'rotate-180 text-[#F02D25]' : 'text-[#77736D]'
                }`}
              />
            </button>

            {/* Discover Flyout Dropdown */}
            {activeDropdown === 'discover' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-[#E3DFD7] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-[#E3DFD7] mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                    Smart City Intelligence
                  </span>
                </div>

                <div className="space-y-1">
                  <div
                    onClick={() => handleNavClick('discover')}
                    className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Apriori AI Mining Engine
                      </h4>
                      <p className="text-[11px] text-[#77736D] leading-snug mt-0.5">
                        Mining associative patterns across Bengaluru mobility transactions
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleNavClick('discover')}
                    className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Featured Aperture Corridors
                      </h4>
                      <p className="text-[11px] text-[#77736D] leading-snug mt-0.5">
                        Indiranagar, Whitefield, Cubbon Park, Lalbagh & Malleshwaram
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#E3DFD7]">
                  <button
                    onClick={() => handleNavClick('discover')}
                    className="w-full text-center py-2 text-xs font-bold text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                  >
                    Open Discover Home &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. MAP EXPLORER ITEM + DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('map')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleNavClick('map')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === 'map'
                  ? 'text-[#F02D25] bg-[#F5F3EE]'
                  : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
              }`}
            >
              <span>Map Explorer</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'map' ? 'rotate-180 text-[#F02D25]' : 'text-[#77736D]'
                }`}
              />
            </button>

            {/* Map Flyout Dropdown */}
            {activeDropdown === 'map' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-[#E3DFD7] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-[#E3DFD7] mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                    Geographical Exploration
                  </span>
                </div>

                <div className="space-y-1">
                  <div
                    onClick={() => handleNavClick('map')}
                    className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors">
                      <Map className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Interactive 65/35 City Map
                      </h4>
                      <p className="text-[11px] text-[#77736D] leading-snug mt-0.5">
                        Category markers, popups, and instant Apriori recommendation rules
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleNavClick('map')}
                    className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Natural Search Assistant
                      </h4>
                      <p className="text-[11px] text-[#77736D] leading-snug mt-0.5">
                        Search places using semantic queries and natural language
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#E3DFD7]">
                  <button
                    onClick={() => handleNavClick('map')}
                    className="w-full text-center py-2 text-xs font-bold text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                  >
                    Open Bengaluru Map &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. TRENDING ITEM + DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('trending')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleNavClick('trending')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === 'trending'
                  ? 'text-[#F02D25] bg-[#F5F3EE]'
                  : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
              }`}
            >
              <span>Trending</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'trending' ? 'rotate-180 text-[#F02D25]' : 'text-[#77736D]'
                }`}
              />
            </button>

            {/* Trending Flyout Dropdown */}
            {activeDropdown === 'trending' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-[#E3DFD7] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-[#E3DFD7] mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                    Footfall Analytics
                  </span>
                </div>

                <div className="space-y-1">
                  <div
                    onClick={() => handleNavClick('trending')}
                    className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        High-Frequency Urban Hotspots
                      </h4>
                      <p className="text-[11px] text-[#77736D] leading-snug mt-0.5">
                        Ranked destinations derived from Bengaluru transactional mobility
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleNavClick('trending')}
                    className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Gastronomy & Culture
                      </h4>
                      <p className="text-[11px] text-[#77736D] leading-snug mt-0.5">
                        Toit, Truffles, Koshy's, Nagarjuna & Vidyarthi Bhavan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#E3DFD7]">
                  <button
                    onClick={() => handleNavClick('trending')}
                    className="w-full text-center py-2 text-xs font-bold text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                  >
                    View All Trending Places &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. DOMAINS ITEM + DROPDOWN (Grid of 8 Domains) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('domains')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleNavClick('domains')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === 'domains'
                  ? 'text-[#F02D25] bg-[#F5F3EE]'
                  : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
              }`}
            >
              <span>Domains</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'domains' ? 'rotate-180 text-[#F02D25]' : 'text-[#77736D]'
                }`}
              />
            </button>

            {/* Domains Flyout Dropdown (2-Column Grid) */}
            {activeDropdown === 'domains' && (
              <div className="absolute top-full -left-20 mt-2 w-[480px] bg-white rounded-2xl border border-[#E3DFD7] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-2 pb-2.5 border-b border-[#E3DFD7] mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                    8 Smart City Sectors
                  </span>
                  <span className="text-[10px] text-[#77736D] font-semibold">
                    Click to filter on Map
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {DOMAINS_LIST.map((domain) => {
                    const DomainIcon = domain.icon;
                    return (
                      <div
                        key={domain.name}
                        onClick={() => handleDomainClick(domain.name)}
                        className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F5F3EE] group-hover:bg-[#191919] group-hover:text-white text-[#F02D25] flex items-center justify-center shrink-0 transition-colors mt-0.5">
                          <DomainIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#191919] group-hover:text-[#F02D25] transition-colors truncate">
                            {domain.name}
                          </h4>
                          <p className="text-[10px] text-[#77736D] leading-tight truncate">
                            {domain.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2.5 mt-3 border-t border-[#E3DFD7]">
                  <button
                    onClick={() => handleNavClick('domains')}
                    className="w-full text-center py-2 text-xs font-bold text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                  >
                    View All 8 Domains Grid &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

        </nav>

        {/* ================= RIGHT: TOOLS, SAVED, CTA & PROFILE (Dribbble Style) ================= */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Saved Places with Hover Preview Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('saved')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleNavClick('saved')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl transition-all cursor-pointer border ${
                currentPage === 'saved'
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                  : 'bg-white border-[#E3DFD7] hover:bg-[#F5F3EE] text-[#191919]'
              }`}
              title={`Saved Destinations (${savedCount})`}
            >
              <Bookmark className="w-4 h-4 text-[#F02D25] shrink-0" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                Saved
              </span>
              <span className="w-5 h-5 rounded-full bg-[#F02D25] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                {savedCount}
              </span>
            </button>

            {/* Saved Places Flyout Preview */}
            {activeDropdown === 'saved' && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E3DFD7] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-2 py-1.5 border-b border-[#E3DFD7] mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                    Saved Collection
                  </span>
                  <span className="text-[10px] font-bold text-[#F02D25]">
                    {savedCount} items
                  </span>
                </div>

                {savedPlaces.length > 0 ? (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {savedPlaces.slice(0, 3).map((place) => (
                      <div
                        key={place.place_id}
                        onClick={() => {
                          if (onSelectPlace) onSelectPlace(place);
                          setActiveDropdown(null);
                        }}
                        className="p-2 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors flex items-center gap-2.5"
                      >
                        <img
                          src={place.image_url}
                          alt={place.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#191919] truncate">
                            {place.name}
                          </p>
                          <span className="text-[10px] text-[#77736D] truncate block">
                            {place.locality} &bull; {place.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 text-center text-xs text-[#77736D]">
                    <Bookmark className="w-6 h-6 text-[#D1CCC4] mx-auto mb-1.5" />
                    <p className="font-semibold text-[#191919]">No places saved yet</p>
                    <p className="text-[10px] text-[#77736D] mt-0.5">
                      Bookmark places on the map to collect them here
                    </p>
                  </div>
                )}

                <div className="pt-2 mt-2 border-t border-[#E3DFD7]">
                  <button
                    onClick={() => handleNavClick('saved')}
                    className="w-full text-center py-1.5 text-xs font-bold text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                  >
                    View All Saved Places &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explore City Pill CTA Button (Like Dribbble's 'Start Project Brief') */}
          <button
            onClick={() => handleNavClick('map')}
            className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0"
          >
            <span>Explore City</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* User Profile Avatar with Hover Dropdown (Matching MD TOUSIF from user video!) */}
          <div
            className="relative hidden sm:block"
            onMouseEnter={() => handleMouseEnter('profile')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-9 h-9 rounded-full bg-[#ECE9E2] border border-[#E3DFD7] hover:border-[#F02D25] flex items-center justify-center font-bold text-xs text-[#191919] cursor-pointer transition-colors shadow-2xs">
              MT
            </div>

            {/* Profile Flyout Dropdown */}
            {activeDropdown === 'profile' && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E3DFD7] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 p-2 border-b border-[#E3DFD7] pb-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center font-bold text-sm">
                    MT
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#191919] truncate">
                      MD TOUSIF
                    </h4>
                    <span className="text-[10px] text-[#77736D] block truncate">
                      Bengaluru Urban Explorer
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#77736D] p-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    <span className="text-[11px] font-medium text-[#191919]">
                      Apriori AI Engine Active
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#77736D]">
                    12.9716° N, 77.5946° E &bull; 920m
                  </p>
                  <p className="text-[10px] text-[#77736D]">
                    1,250 transactions analyzed &bull; 8 domains
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#191919] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
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

      {/* ================= MOBILE DRAWER FOR TOUCH SCREENS ================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <aside className="relative z-10 w-72 h-full bg-[#F5F3EE] shadow-2xl p-6 flex flex-col justify-between font-sans overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#E3DFD7]">
                <div
                  onClick={() => handleNavClick('discover')}
                  className="cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-bold text-base lowercase tracking-tight">
                    bo
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-2xl lowercase tracking-tight text-[#191919] leading-none">
                      bango™
                    </span>
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
                {[
                  { id: 'discover', label: 'Discover', icon: Compass },
                  { id: 'map', label: 'Map Explorer', icon: Map },
                  { id: 'trending', label: 'Trending', icon: TrendingUp },
                  { id: 'domains', label: 'Domains', icon: Layers },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id as PageId)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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

              <div className="mt-6 pt-5 border-t border-[#E3DFD7] space-y-2">
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

            <div className="mt-6 pt-5 border-t border-[#E3DFD7]">
              <button
                onClick={() => handleNavClick('map')}
                className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#191919] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <span>Explore City</span>
                <div className="w-8 h-8 rounded-full bg-[#F02D25] flex items-center justify-center text-white">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
