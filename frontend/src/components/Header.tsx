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
  Rocket,
  Menu,
  X,
  Search,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Users
} from 'lucide-react';
import { Place } from '../types';
import { AuthUser } from '../services/auth';

export type PageId =
  | 'discover'
  | 'map'
  | 'assistant'
  | 'trending'
  | 'domains'
  | 'domain-detail'
  | 'friends'
  | 'saved';

export interface HeaderProps {
  currentPage: PageId;
  currentDomain?: string | null;
  onSelectPage: (page: PageId) => void;
  onSelectDomainPage?: (domainName: string) => void;
  savedCount: number;
  savedPlaces?: Place[];
  onSelectCategory?: (category: string) => void;
  onSelectPlace?: (place: Place) => void;
  user?: AuthUser | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

const DOMAINS_LIST = [
  { name: 'Tourism', icon: Landmark, desc: 'Parks, palaces & heritage spots' },
  { name: 'Transportation', icon: Train, desc: 'Namma Metro lines & transit' },
  { name: 'Restaurants', icon: Utensils, desc: 'Darshinis, cafes & breweries' },
  { name: 'Healthcare', icon: HeartPulse, desc: 'Hospitals & specialty research' },
  { name: 'Shopping', icon: ShoppingBag, desc: 'Commercial Street & malls' },
  { name: 'Education', icon: GraduationCap, desc: 'IISc, IIMB & universities' },
  { name: 'Entertainment', icon: Clapperboard, desc: 'Theatres, arenas & live clubs' },
  { name: 'Startups', icon: Rocket, desc: 'Incubators & unicorn hubs' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  currentDomain,
  onSelectPage,
  onSelectDomainPage,
  savedCount,
  savedPlaces = [],
  onSelectCategory,
  onSelectPlace,
  user,
  onOpenAuthModal,
  onLogout,
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
    if (onSelectDomainPage) {
      onSelectDomainPage(domainName);
    } else if (onSelectCategory) {
      onSelectCategory(domainName);
      handleNavClick('map');
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[1000] w-full bg-white/95 backdrop-blur-md border-b border-[#E3DFD7] select-none font-sans transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 h-18 sm:h-20 flex items-center justify-between gap-4">

        {/* ================= LEFT CORNER: BRAND LOGO + ALL SLIDE DOWN OPTIONS ================= */}
        <div className="flex items-center gap-4 sm:gap-6 xl:gap-8 shrink-0">

          {/* 1. BRAND LOGO */}
          <div
            onClick={() => handleNavClick('discover')}
            className="cursor-pointer group flex items-center gap-2.5 sm:gap-3 shrink-0"
            title="bango™ • smart city discovery"
          >
            {/* Circular bo Monogram */}
            <div className="w-10 h-10 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center font-display font-bold text-lg lowercase tracking-tight transition-colors shrink-0">
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
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-[#77736D] mt-0.5 whitespace-nowrap">
                smart city discovery
              </span>
            </div>
          </div>

          {/* 2. NAVIGATION SLIDE DOWN OPTIONS (Desktop lg+) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">

            {/* Discover */}
            <button
              onClick={() => handleNavClick('discover')}
              className={`px-3.5 xl:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${currentPage === 'discover'
                ? 'text-[#F02D25] bg-[#F5F3EE]'
                : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
                }`}
            >
              Discover
            </button>

            {/* Map Explorer (Guaranteed 1 single line: whitespace-nowrap shrink-0) */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => handleMouseEnter('map')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('map')}
                className={`flex items-center gap-1.5 px-3.5 xl:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${currentPage === 'map' || currentPage === 'assistant'
                  ? 'text-[#F02D25] bg-[#F5F3EE]'
                  : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
                  }`}
              >
                <span className="whitespace-nowrap">Map Explorer</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${activeDropdown === 'map' ? 'rotate-180 text-[#191919]' : 'text-[#77736D]'
                    }`}
                />
              </button>

              {/* Map Flyout Dropdown */}
              {activeDropdown === 'map' && (
                <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-2xl border border-[#E3DFD7] p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-none">
                  <div className="px-1 pb-3 border-b border-[#E3DFD7] mb-3 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#191919]">
                      Geographical Exploration
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div
                      onClick={() => handleNavClick('map')}
                      className={`p-3 rounded-xl cursor-pointer transition-colors group flex items-start gap-3.5 ${
                        currentPage === 'map' ? 'bg-[#F5F3EE]' : 'hover:bg-[#F5F3EE]'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        currentPage === 'map'
                          ? 'bg-[#191919] text-white'
                          : 'bg-[#F0EDE6] group-hover:bg-[#191919] group-hover:text-white text-[#191919]'
                      }`}>
                        <Map className={`w-5 h-5 transition-colors ${
                          currentPage === 'map' ? 'text-white' : 'text-[#191919] group-hover:text-white'
                        }`} />
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-[15px] font-extrabold transition-colors leading-snug whitespace-nowrap ${
                          currentPage === 'map' ? 'text-[#F02D25]' : 'text-[#191919] group-hover:text-[#F02D25]'
                        }`}>
                          Interactive 65/35 City Map
                        </h4>
                        <p className="text-xs font-medium text-[#66635C] leading-normal mt-1">
                          Category markers, popups, and instant Apriori recommendation rules
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => handleNavClick('assistant')}
                      className={`p-3 rounded-xl cursor-pointer transition-colors group flex items-start gap-3.5 ${
                        currentPage === 'assistant' ? 'bg-[#F5F3EE]' : 'hover:bg-[#F5F3EE]'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        currentPage === 'assistant'
                          ? 'bg-[#191919] text-white'
                          : 'bg-[#F0EDE6] group-hover:bg-[#191919] group-hover:text-white text-[#191919]'
                      }`}>
                        <Search className={`w-5 h-5 transition-colors ${
                          currentPage === 'assistant' ? 'text-white' : 'text-[#191919] group-hover:text-white'
                        }`} />
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-[15px] font-extrabold transition-colors leading-snug whitespace-nowrap ${
                          currentPage === 'assistant' ? 'text-[#F02D25]' : 'text-[#191919] group-hover:text-[#F02D25]'
                        }`}>
                          Natural Search Assistant
                        </h4>
                        <p className="text-xs font-medium text-[#66635C] leading-normal mt-1">
                          Search places using semantic queries and natural language
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trending */}
            <button
              onClick={() => handleNavClick('trending')}
              className={`px-3.5 xl:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${currentPage === 'trending'
                ? 'text-[#F02D25] bg-[#F5F3EE]'
                : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
                }`}
            >
              Trending
            </button>

            {/* Domains */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => handleMouseEnter('domains')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('domains')}
                className={`flex items-center gap-1.5 px-3.5 xl:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${currentPage === 'domains' || currentPage === 'domain-detail'
                  ? 'text-[#F02D25] bg-[#F5F3EE]'
                  : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
                  }`}
              >
                <span className="whitespace-nowrap">Domains</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${activeDropdown === 'domains' ? 'rotate-180 text-[#191919]' : 'text-[#77736D]'
                    }`}
                />
              </button>

              {/* Domains Flyout Dropdown */}
              {activeDropdown === 'domains' && (
                <div className="absolute top-full left-0 mt-2 w-[540px] bg-white rounded-2xl border border-[#E3DFD7] p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-none">
                  <div className="px-1 pb-3 border-b border-[#E3DFD7] mb-3.5 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#191919]">
                      8 Smart City Sectors
                    </span>
                    <span className="text-[11px] text-[#66635C] font-bold">
                      Click to view sector page
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {DOMAINS_LIST.map((domain) => {
                      const DomainIcon = domain.icon;
                      const isSelected =
                        currentPage === 'domain-detail' &&
                        currentDomain?.toLowerCase() === domain.name.toLowerCase();

                      return (
                        <div
                          key={domain.name}
                          onClick={() => handleDomainClick(domain.name)}
                          className={`p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors group flex items-start gap-3 border ${
                            isSelected
                              ? 'bg-[#F5F3EE] border-[#F02D25]'
                              : 'border-transparent hover:bg-[#F5F3EE] hover:border-[#E3DFD7]'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-[#191919] text-white'
                              : 'bg-[#F0EDE6] group-hover:bg-[#191919] group-hover:text-white text-[#191919]'
                          }`}>
                            <DomainIcon className="w-4.5 h-4.5 transition-colors" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs sm:text-sm font-extrabold transition-colors truncate leading-snug ${
                              isSelected
                                ? 'text-[#F02D25]'
                                : 'text-[#191919] group-hover:text-[#F02D25]'
                            }`}>
                              {domain.name}
                            </h4>
                            <p className="text-[11px] text-[#66635C] font-medium leading-tight truncate mt-0.5">
                              {domain.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 mt-3.5 border-t border-[#E3DFD7]">
                    <button
                      onClick={() => handleNavClick('domains')}
                      className="w-full text-center py-2.5 text-xs sm:text-sm font-black text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                    >
                      View All 8 Domains Grid &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Friends */}
            <button
              onClick={() => handleNavClick('friends')}
              className={`px-3.5 xl:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${currentPage === 'friends'
                ? 'text-[#F02D25] bg-[#F5F3EE]'
                : 'text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE]'
                }`}
            >
              Friends
            </button>

          </nav>

        </div>

        {/* ================= RIGHT: SAVED (IF LOGGED IN) + EXPLORE CITY + SIGN IN / PROFILE ================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* 1. SAVED PLACES (ONLY SHOWN ON WHEN THE PERSON HAS SIGNED IN USING GOOGLE) */}
          {user && (
            <div
              className="relative shrink-0"
              onMouseEnter={() => handleMouseEnter('saved')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('saved')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl transition-all cursor-pointer border whitespace-nowrap shrink-0 ${currentPage === 'saved'
                  ? 'bg-[#191919] text-white border-[#191919]'
                  : 'bg-white border-[#E3DFD7] hover:bg-[#F5F3EE] text-[#191919]'
                  }`}
                title={`Saved Destinations (${savedCount})`}
              >
                <Bookmark className="w-4 h-4 text-[#191919] shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm font-extrabold uppercase tracking-wider whitespace-nowrap">
                  Saved
                </span>
                <span className="w-5 h-5 rounded-full bg-[#191919] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {savedCount}
                </span>
              </button>

              {/* Saved Places Flyout Preview */}
              {activeDropdown === 'saved' && (
                <div className="absolute top-full right-0 mt-2 w-[360px] bg-white rounded-2xl border border-[#E3DFD7] p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-none">
                  <div className="px-1 pb-3 border-b border-[#E3DFD7] mb-3 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#191919]">
                      Saved Collection
                    </span>
                    <span className="text-xs font-black text-[#191919] bg-[#F0EDE6] px-2.5 py-0.5 rounded-full">
                      {savedCount} items
                    </span>
                  </div>

                  {savedPlaces.length > 0 ? (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {savedPlaces.slice(0, 4).map((place) => (
                        <div
                          key={place.place_id}
                          onClick={() => {
                            if (onSelectPlace) onSelectPlace(place);
                            setActiveDropdown(null);
                          }}
                          className="p-2.5 rounded-xl hover:bg-[#F5F3EE] cursor-pointer transition-colors flex items-center gap-3 group"
                        >
                          <img
                            src={place.image_url}
                            alt={place.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-extrabold text-[#191919] group-hover:text-[#F02D25] transition-colors truncate">
                              {place.name}
                            </p>
                            <span className="text-[11px] font-medium text-[#66635C] truncate block mt-0.5">
                              {place.locality} &bull; {place.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#77736D]">
                      <Bookmark className="w-7 h-7 text-[#191919] mx-auto mb-2" />
                      <p className="font-extrabold text-sm text-[#191919]">No places saved yet</p>
                      <p className="text-xs font-medium text-[#66635C] mt-1">
                        Bookmark places on the map to collect them here
                      </p>
                    </div>
                  )}

                  <div className="pt-3 mt-3 border-t border-[#E3DFD7]">
                    <button
                      onClick={() => handleNavClick('saved')}
                      className="w-full text-center py-2 text-xs sm:text-sm font-black text-[#191919] hover:text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                    >
                      View All Saved Places &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Explore City Pill CTA Button */}
          <button
            onClick={() => handleNavClick('map')}
            className="group hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>Explore City</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* 3. SIGN IN IN THE RIGHT (OR PROFILE AVATAR WHEN SIGNED IN) */}
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('profile')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[#E3DFD7] hover:border-[#191919] bg-white cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#191919] text-white flex items-center justify-center font-extrabold text-xs overflow-hidden shrink-0">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-[#191919] max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#77736D]" />
              </div>

              {/* Profile Flyout Dropdown */}
              {activeDropdown === 'profile' && (
                <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl border border-[#E3DFD7] p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-none">
                  <div className="flex items-center gap-3 p-1 border-b border-[#E3DFD7] pb-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-[#191919] text-white flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-[#191919] truncate">
                        {user.name}
                      </h4>
                      <span className="text-xs text-[#66635C] block truncate font-mono mt-0.5">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#77736D] p-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Google Account Connected</span>
                    </div>
                    <p className="text-xs font-medium text-[#66635C]">
                      Cloud sync active: {savedCount} places saved to MongoDB
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#E3DFD7] flex items-center justify-between gap-2 px-1">
                    <button
                      onClick={() => handleNavClick('saved')}
                      className="text-xs sm:text-sm font-extrabold text-[#191919] hover:text-[#F02D25] py-1.5 transition-colors cursor-pointer"
                    >
                      Saved Places ({savedCount})
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setActiveDropdown(null);
                        }}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#F02D25] hover:underline py-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full border border-[#E3DFD7] hover:border-[#191919] bg-white text-xs sm:text-sm font-extrabold text-[#191919] hover:bg-[#F5F3EE] transition-all cursor-pointer shrink-0"
              title="Sign in with Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="whitespace-nowrap">Sign in</span>
            </button>
          )}

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
                  { id: 'assistant', label: 'AI Assistant', icon: Search },
                  { id: 'trending', label: 'Trending', icon: TrendingUp },
                  { id: 'domains', label: 'Domains', icon: Layers },
                  { id: 'friends', label: 'Friends', icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id as PageId)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${isActive
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

              {user && (
                <div className="mt-6 pt-5 border-t border-[#E3DFD7] space-y-2">
                  <button
                    onClick={() => handleNavClick('saved')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider cursor-pointer ${currentPage === 'saved'
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
              )}

              {/* User Account / Sign in Section in Mobile Drawer */}
              <div className="mt-6 pt-5 border-t border-[#E3DFD7]">
                {user ? (
                  <div className="p-3 rounded-2xl bg-white border border-[#E3DFD7] space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#191919] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                        {user.picture ? (
                          <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#191919] truncate">{user.name}</p>
                        <p className="text-[10px] text-[#77736D] truncate font-mono">{user.email}</p>
                      </div>
                    </div>
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-center py-1.5 text-xs font-bold text-[#F02D25] hover:bg-[#F5F3EE] rounded-xl transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#E3DFD7] text-xs font-bold text-[#191919] flex items-center justify-center gap-2 shadow-2xs hover:bg-[#ECE9E2] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                )}
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
