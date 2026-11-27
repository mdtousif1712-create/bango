import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  onExploreMap: () => void;
  onPlanDay?: () => void;
  onOpenAlgorithm?: () => void;
}

interface LocationSlide {
  id: string;
  name: string;
  locality: string;
  category: string;
  description: string;
  imageUrl: string;
}

const LOCATION_SLIDES: LocationSlide[] = [
  {
    id: 'cubbon',
    name: 'Cubbon Park',
    locality: 'Central Bengaluru',
    category: 'Heritage Park',
    description: 'Historic 300-acre green lung in central Bengaluru featuring serene walking paths, bamboo groves, and Victorian architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'bangalore-palace',
    name: 'Bengaluru Palace',
    locality: 'Vasanth Nagar',
    category: 'Royal Heritage',
    description: '19th-century Tudor-style royal palace with fortified towers, wood carvings, stained glass, and expansive gardens.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'lalbagh',
    name: 'Lalbagh Botanical Garden',
    locality: 'Jayanagar / Mavalli',
    category: 'Botanical Haven',
    description: '240-acre world-renowned botanical sanctuary home to centuries-old trees and the iconic London Crystal Palace-inspired Glass House.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'toit',
    name: 'Toit Brewpub',
    locality: 'Indiranagar',
    category: 'Craft Brewery',
    description: 'Iconic multi-level brewpub pioneering Bengaluru\'s craft beer revolution, famous for artisanal brews and wood-fired pizzas.',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'ub-city',
    name: 'UB City',
    locality: 'Central Bengaluru',
    category: 'Luxury Lifestyle',
    description: 'Premier luxury destination featuring high-end international designer fashion, open-air promenade dining, and striking architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=85',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMap,
  onPlanDay,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotating timer that changes slide every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % LOCATION_SLIDES.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const currentSlide = LOCATION_SLIDES[activeSlide];
  const nextSlide1 = LOCATION_SLIDES[(activeSlide + 1) % LOCATION_SLIDES.length];
  const nextSlide2 = LOCATION_SLIDES[(activeSlide + 2) % LOCATION_SLIDES.length];

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

            {/* Primary Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2">
              {/* Elongated Button 1: Open Map Explorer */}
              <button
                onClick={onExploreMap}
                className="group relative flex items-center justify-between gap-4 sm:gap-6 px-7 sm:px-9 py-4 sm:py-4.5 min-w-[220px] sm:min-w-[250px] rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:shadow-black/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer overflow-hidden animate-subtle-float"
                title="Open Bengaluru Map Explorer"
              >
                {/* Shimmer Light Sweep on Hover */}
                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </span>

                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                  Open Map Explorer
                </span>

                <div className="relative z-10 w-7 h-7 rounded-full bg-[#F02D25] group-hover:bg-[#E0261E] group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(240,45,37,0.55)] flex items-center justify-center text-white shrink-0 transition-all duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
                </div>
              </button>

              {/* Replica Elongated Button 2: Plan Ur Day */}
              <button
                onClick={onPlanDay || onExploreMap}
                className="group relative flex items-center justify-between gap-4 sm:gap-6 px-7 sm:px-9 py-4 sm:py-4.5 min-w-[220px] sm:min-w-[250px] rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:shadow-black/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer overflow-hidden animate-subtle-float-delayed"
                title="Plan your smart city day in Bengaluru"
              >
                {/* Shimmer Light Sweep on Hover */}
                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </span>

                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                  Plan Ur Day
                </span>

                <div className="relative z-10 w-7 h-7 rounded-full bg-[#F02D25] group-hover:bg-[#E0261E] group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(240,45,37,0.55)] flex items-center justify-center text-white shrink-0 transition-all duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
                </div>
              </button>
            </div>

          </div>

          {/* Right: Layered Airplane Window Card Deck + Centered Segmented Indicator (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center">
            
            {/* Card Deck Wrapper (pr-7 balances the sideways peeking cards) */}
            <div className="relative w-full max-w-[340px] sm:max-w-[370px] xl:max-w-[400px] 2xl:max-w-[425px] flex flex-col items-center pr-6 sm:pr-8">
              
              {/* The 3-Tier Layered Card Deck Stack with Sideways Shadows */}
              <div
                className="relative w-full aspect-[4/4.8] select-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* 3rd Card in Deck (Deepest Layer, Upcoming +2 - Sideways Offset to Right, Same Size) */}
                <div
                  key={`deck-back-${nextSlide2.id}`}
                  className="absolute inset-0 z-10 rounded-[52px] sm:rounded-[64px] overflow-hidden border-[8px] border-white/70 shadow-[22px_0_36px_-4px_rgba(0,0,0,0.28)] bg-[#191919] transition-all duration-700 ease-out translate-x-6 sm:translate-x-7 translate-y-0 filter brightness-75 pointer-events-none"
                >
                  <img
                    src={nextSlide2.imageUrl}
                    alt={nextSlide2.name}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20"></div>
                </div>

                {/* 2nd Card in Deck (Middle Layer, Upcoming +1 - Sideways Offset to Right, Same Size) */}
                <div
                  key={`deck-mid-${nextSlide1.id}`}
                  className="absolute inset-0 z-20 rounded-[52px] sm:rounded-[64px] overflow-hidden border-[8px] border-white/85 shadow-[15px_0_28px_-4px_rgba(0,0,0,0.32)] bg-[#191919] transition-all duration-700 ease-out translate-x-3 sm:translate-x-3.5 translate-y-0 filter brightness-90 pointer-events-none"
                >
                  <img
                    src={nextSlide1.imageUrl}
                    alt={nextSlide1.name}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                </div>

                {/* 1st Card in Deck (Active Front Card with Lateral Sideways Shadows, Same Size) */}
                <div
                  className="relative z-30 w-full h-full rounded-[52px] sm:rounded-[64px] overflow-hidden border-[8px] border-white shadow-[10px_0_28px_-4px_rgba(0,0,0,0.32),-6px_0_20px_-4px_rgba(0,0,0,0.1)] bg-[#191919] transition-all duration-500 group select-none cursor-pointer"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % LOCATION_SLIDES.length)}
                  title="Click to explore next trending place"
                >
                  {/* Carousel Image */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      key={currentSlide.id}
                      src={currentSlide.imageUrl}
                      alt={currentSlide.name}
                      className="w-full h-full object-cover filter contrast-[1.05] transition-all duration-700 animate-in fade-in zoom-in-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                  </div>

                  {/* Bottom Info Badge - Place Name & Non-Technical Description */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 z-10 p-3.5 sm:p-4 rounded-[22px] bg-white/95 backdrop-blur-md border border-white/80 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#F02D25] tracking-wide flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                        <span>{currentSlide.locality}</span>
                      </span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-[#191919] leading-snug tracking-tight">
                      {currentSlide.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#66625C] mt-1 leading-relaxed line-clamp-2">
                      {currentSlide.description}
                    </p>
                  </div>

                </div>

              </div>

              {/* Custom Segmented Capsule Pagination Indicator (Visible above fold & centered) */}
              <div className="w-full flex items-center justify-center gap-2 sm:gap-2.5 mt-5 sm:mt-6 select-none z-30">
                {LOCATION_SLIDES.map((_, idx) => {
                  const isActive = idx === activeSlide;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-11 h-2.5 rounded-full bg-[#F02D25] shadow-xs'
                          : 'w-5 h-2 rounded-full bg-[#D8D4CC] hover:bg-[#B3ADA3]'
                      }`}
                      title={`Slide ${idx + 1}: ${LOCATION_SLIDES[idx].name}`}
                    />
                  );
                })}
              </div>

            </div>

            {/* Decorative Ambient Background Ring */}
            <div className="absolute -z-10 w-[480px] h-[480px] rounded-full border border-[#E3DFD7] -top-10 -right-10 pointer-events-none opacity-60"></div>
          </div>

        </div>

      </div>
    </section>
  );
};
