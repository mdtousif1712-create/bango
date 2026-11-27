import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Place } from '../types';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  onExploreMap: () => void;
  onOpenAlgorithm?: () => void;
  trendingPlaces?: Place[];
}

interface LocationSlide {
  id: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  pills: { name: string; top?: string; bottom?: string; left?: string; right?: string }[];
}

// Curated authentic trending places in Bengaluru from the Apriori mobility dataset
const DEFAULT_TRENDING_SLIDES: LocationSlide[] = [
  {
    id: 'cubbon-park',
    tag: '1,250+ MOBILITY VISITS • TOURISM',
    title: 'Cubbon Park Heritage Green',
    description: 'Central Bengaluru landmark showing frequent Apriori associations with Namma Metro, Vidhana Soudha, and MG Road cafes.',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'CENTRAL BENGALURU', top: '14%', left: '7%' },
      { name: 'MG ROAD METRO', top: '24%', right: '7%' },
      { name: 'KASTURBA ROAD', top: '46%', left: '9%' },
    ],
  },
  {
    id: 'truffles-koramangala',
    tag: 'HIGH CO-OCCURRENCE • RESTAURANTS',
    title: 'Truffles Koramangala',
    description: 'Extremely popular culinary hotspot in Koramangala 5th Block celebrated for gourmet burgers, pastas, and vibrant youth footfall.',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'KORAMANGALA 5TH BLOCK', top: '14%', left: '7%' },
      { name: 'SONY SIGNAL', top: '24%', right: '7%' },
      { name: 'JYOTI NIVAS ROAD', top: '46%', left: '9%' },
    ],
  },
  {
    id: 'koshys-cafe',
    tag: 'HERITAGE CAFE • RESTAURANTS',
    title: "Koshy's Parade Cafe",
    description: 'Historic British-era culinary landmark on St. Marks Road, strongly associated with Central Bengaluru art and literature hubs.',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'ST. MARKS ROAD', top: '14%', left: '7%' },
      { name: 'BRIGADE ROAD', top: '24%', right: '7%' },
      { name: 'CHURCH STREET', top: '46%', left: '9%' },
    ],
  },
  {
    id: 'ctr-malleshwaram',
    tag: 'ICONIC BENNE DOSA • RESTAURANTS',
    title: 'CTR (Shri Sagar)',
    description: 'Legendary heritage breakfast haven in Malleshwaram renowned across Karnataka for its crispy butter benne masala dosa.',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'MALLESHWARAM 7TH CROSS', top: '14%', left: '7%' },
      { name: 'MARGOSA ROAD', top: '24%', right: '7%' },
      { name: 'SANKEY TANK', top: '46%', left: '9%' },
    ],
  },
  {
    id: 'indiranagar-metro',
    tag: 'TRANSIT & NIGHTLIFE • TRANSPORTATION',
    title: 'Indiranagar Metro Station',
    description: 'High-density Purple Line interchange with massive commuter interchange into 100 Feet Road boutiques and eateries.',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'INDIRANAGAR', top: '14%', left: '7%' },
      { name: '100FT ROAD', top: '24%', right: '7%' },
      { name: 'DEFENCE COLONY', top: '46%', left: '9%' },
    ],
  },
  {
    id: 'phoenix-marketcity',
    tag: 'PREMIER LIFESTYLE • SHOPPING',
    title: 'Phoenix Marketcity',
    description: 'Major retail and entertainment center in Mahadevapura connecting Whitefield tech corridors with luxury shopping and dining.',
    imageUrl: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'WHITEFIELD', top: '14%', left: '7%' },
      { name: 'MAHADEVAPURA', top: '24%', right: '7%' },
      { name: 'ITPB LINK', top: '46%', left: '9%' },
    ],
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMap,
  trendingPlaces,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute slides directly from real trendingPlaces (no random locations)
  const slides = useMemo<LocationSlide[]>(() => {
    if (trendingPlaces && trendingPlaces.length >= 4) {
      return trendingPlaces.slice(0, 8).map((p, idx) => {
        const defaultSlide = DEFAULT_TRENDING_SLIDES[idx % DEFAULT_TRENDING_SLIDES.length];
        const pills = [
          { name: p.locality ? p.locality.toUpperCase() : 'BENGALURU', top: '14%', left: '7%' },
          { name: p.category ? p.category.toUpperCase() : 'TRENDING', top: '24%', right: '7%' },
          { name: p.subcategory ? p.subcategory.toUpperCase() : (p.popular_activity ? p.popular_activity.slice(0, 22).toUpperCase() : 'TOP DESTINATION'), top: '46%', left: '9%' },
        ];

        return {
          id: p.place_id || `trending-${idx}`,
          tag: p.popular_activity 
            ? `${p.popular_activity.toUpperCase()} • ${p.category?.toUpperCase() || 'TRENDING'}`
            : `${p.category?.toUpperCase() || 'TRENDING'} • TOP FOOTFALL`,
          title: p.name,
          description: p.description || defaultSlide.description,
          imageUrl: p.image_url || defaultSlide.imageUrl,
          pills,
        };
      });
    }
    return DEFAULT_TRENDING_SLIDES;
  }, [trendingPlaces]);

  // Auto-rotating timer that changes slide every 4.5 seconds
  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const currentSlide = slides[activeSlide % slides.length] || DEFAULT_TRENDING_SLIDES[0];
  const nextSlide1 = slides[(activeSlide + 1) % slides.length] || DEFAULT_TRENDING_SLIDES[1];
  const nextSlide2 = slides[(activeSlide + 2) % slides.length] || DEFAULT_TRENDING_SLIDES[2];
  const nextSlide3 = slides[(activeSlide + 3) % slides.length] || DEFAULT_TRENDING_SLIDES[3];

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center py-6 sm:py-8 md:py-10 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        
        {/* 2-Column Editorial Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 2xl:gap-20 items-center">
          
          {/* Left: Oversized Typography & Search (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[76px] 2xl:text-[86px] text-[#191919] leading-[1.03] tracking-tight mb-5">
              discover <br />
              banglore <br />
              <span className="text-[#F02D25]">like never before.</span>
            </h1>

            <p className="text-sm sm:text-base xl:text-lg text-[#77736D] max-w-2xl leading-relaxed mb-6 sm:mb-7 font-normal">
              <strong className="text-[#191919] font-bold">bango</strong> is an intelligent urban discovery platform powered by the <strong className="text-[#191919] font-semibold">Apriori Association Rule Mining</strong> algorithm. Uncover hidden mobility patterns, transit connections, and curated smart city destinations across 8 urban domains.
            </p>

            {/* Primary Action CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onExploreMap}
                className="group flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Open Map Explorer</span>
                <div className="w-6 h-6 rounded-full bg-[#F02D25] flex items-center justify-center text-white">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

          </div>

          {/* Right: Layered 4-Card Stepped Cascade Deck + Centered Segmented Indicator (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center">
            
            {/* Card Deck Wrapper - balanced sizing and padding so bottom pills remain visible */}
            <div className="relative w-full max-w-[325px] sm:max-w-[355px] xl:max-w-[380px] flex flex-col items-center pr-8 sm:pr-10 pb-6">
              
              {/* The 4-Card Stepped Cascade Deck (50% thinner borders, stepped down & right) */}
              <div
                className="relative w-full aspect-[4/4.7] select-none cursor-pointer"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                title="Click to view next trending place"
              >
                {/* 4th Card in Deck (Layer 4 - Deepest upcoming +3, stepped offset down & right) */}
                <div
                  key={`deck-card-4-${nextSlide3.id}`}
                  className="absolute inset-0 z-10 rounded-[38px] sm:rounded-[44px] overflow-hidden border-[3px] border-white shadow-[6px_8px_16px_rgba(0,0,0,0.18)] bg-[#191919] transition-all duration-500 ease-out origin-center translate-x-[27px] sm:translate-x-[36px] translate-y-[21px] sm:translate-y-[27px] filter brightness-70 pointer-events-none"
                >
                  <img
                    src={nextSlide3.imageUrl}
                    alt={nextSlide3.title}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20"></div>
                </div>

                {/* 3rd Card in Deck (Layer 3 - Upcoming +2, stepped offset down & right) */}
                <div
                  key={`deck-card-3-${nextSlide2.id}`}
                  className="absolute inset-0 z-20 rounded-[38px] sm:rounded-[44px] overflow-hidden border-[3px] border-white shadow-[6px_8px_20px_rgba(0,0,0,0.22)] bg-[#191919] transition-all duration-500 ease-out origin-center translate-x-[18px] sm:translate-x-[24px] translate-y-[14px] sm:translate-y-[18px] filter brightness-80 pointer-events-none"
                >
                  <img
                    src={nextSlide2.imageUrl}
                    alt={nextSlide2.title}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
                </div>

                {/* 2nd Card in Deck (Layer 2 - Upcoming +1, stepped offset down & right) */}
                <div
                  key={`deck-card-2-${nextSlide1.id}`}
                  className="absolute inset-0 z-30 rounded-[38px] sm:rounded-[44px] overflow-hidden border-[3px] border-white shadow-[6px_8px_22px_rgba(0,0,0,0.26)] bg-[#191919] transition-all duration-500 ease-out origin-center translate-x-[9px] sm:translate-x-[12px] translate-y-[7px] sm:translate-y-[9px] filter brightness-90 pointer-events-none"
                >
                  <img
                    src={nextSlide1.imageUrl}
                    alt={nextSlide1.title}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                </div>

                {/* 1st Card in Deck (Layer 1 - Active Front Card with 50% thinner border [4px]) */}
                <div
                  key={`deck-card-front-${currentSlide.id}`}
                  className="relative z-40 w-full h-full rounded-[38px] sm:rounded-[44px] overflow-hidden border-[4px] border-white shadow-[8px_10px_28px_rgba(0,0,0,0.30)] bg-[#191919] transition-all duration-500 group select-none"
                >
                  {/* Active Card Image */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover filter contrast-[1.05] transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>

                  {/* Dynamic Floating Locality Tags inside the Front Card */}
                  {currentSlide.pills.map((loc, idx) => (
                    <div
                      key={`${currentSlide.id}-${idx}`}
                      style={{ top: loc.top, left: loc.left, right: loc.right, bottom: loc.bottom }}
                      className="absolute z-10 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-[#191919] uppercase tracking-wider border border-white/80 shadow-md flex items-center gap-1.5 animate-in fade-in duration-300 select-none hover:scale-105 transition-transform"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25] shrink-0"></span>
                      <span>{loc.name}</span>
                    </div>
                  ))}

                  {/* Bottom Aperture Info Badge */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 p-3 sm:p-3.5 rounded-[18px] sm:rounded-[20px] bg-white/95 backdrop-blur-md border border-white/80 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-widest text-[#F02D25] truncate max-w-[200px]">
                        {currentSlide.tag}
                      </span>
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-xs sm:text-[13px] text-[#191919] leading-snug tracking-tight truncate">
                      {currentSlide.title}
                    </h4>
                    <p className="text-[9.5px] sm:text-[10.5px] text-[#77736D] mt-0.5 leading-relaxed line-clamp-2">
                      {currentSlide.description}
                    </p>
                  </div>

                </div>

              </div>

              {/* Custom Segmented Capsule Pagination Indicator (Visible above fold & centered) */}
              <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 select-none z-30">
                {slides.map((slide, idx) => {
                  const isActive = idx === (activeSlide % slides.length);
                  return (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(idx);
                      }}
                      className={`transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-9 sm:w-11 h-2 sm:h-2.5 rounded-full bg-[#F02D25] shadow-xs'
                          : 'w-4 sm:w-5 h-1.5 sm:h-2 rounded-full bg-[#D8D4CC] hover:bg-[#B3ADA3]'
                      }`}
                      title={`Slide ${idx + 1}: ${slide.title}`}
                    />
                  );
                })}
              </div>

            </div>

            {/* Decorative Ambient Background Ring */}
            <div className="absolute -z-10 w-[460px] h-[460px] rounded-full border border-[#E3DFD7] -top-10 -right-10 pointer-events-none opacity-60"></div>
          </div>

        </div>

      </div>
    </section>
  );
};
