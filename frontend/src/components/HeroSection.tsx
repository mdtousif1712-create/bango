import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  onExploreMap: () => void;
  onOpenAlgorithm?: () => void;
}

interface LocationSlide {
  id: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  pills: { name: string; top?: string; bottom?: string; left?: string; right?: string }[];
}

const LOCATION_SLIDES: LocationSlide[] = [
  {
    id: 'cubbon',
    tag: '1,250+ MOBILITY PATTERNS',
    title: 'bango™ Apriori association engine',
    description: 'Mining statistical co-occurrences across Namma Metro, tech hubs, parks, and healthcare.',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'INDIRANAGAR', top: '16%', left: '8%' },
      { name: 'MG ROAD', top: '26%', right: '8%' },
      { name: 'CUBBON PARK', top: '50%', left: '10%' },
    ],
  },
  {
    id: 'indiranagar',
    tag: '89% HIGH CO-OCCURRENCE',
    title: 'Indiranagar Gastronomy Hub',
    description: 'Strong cross-domain linkage with Namma Metro Purple Line and commercial shopping corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: '100FT ROAD', top: '16%', left: '8%' },
      { name: 'DEFENCE COLONY', top: '26%', right: '8%' },
      { name: 'INDIRANAGAR METRO', top: '50%', left: '10%' },
    ],
  },
  {
    id: 'whitefield',
    tag: '4.2x LIFT FACTOR',
    title: 'Whitefield Silicon Corridor',
    description: 'Heavy weekday transit transactions linking tech parks directly to suburban residential clusters.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'ITPB BANGALORE', top: '16%', right: '8%' },
      { name: 'HOODI JUNCTION', top: '26%', left: '8%' },
      { name: 'KADUGODI METRO', top: '50%', left: '10%' },
    ],
  },
  {
    id: 'lalbagh',
    tag: 'POPULAR CITIZEN CORRIDOR',
    title: 'Lalbagh Botanical Heritage',
    description: 'Frequent association patterns linking heritage gardens with iconic South Bangalore darshinis.',
    imageUrl: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'LALBAGH GLASSHOUSE', top: '16%', left: '8%' },
      { name: 'BASAVANAGUDI', top: '26%', right: '8%' },
      { name: 'SOUTH END CIRCLE', top: '50%', left: '10%' },
    ],
  },
  {
    id: 'malleshwaram',
    tag: 'EDUCATION & CIVIC CLUSTER',
    title: 'Malleshwaram Knowledge Hub',
    description: 'Top education cluster showing strong weekend footfall associations with Sankey Tank & Orion Mall.',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85',
    pills: [
      { name: 'IISC BANGALORE', top: '16%', left: '8%' },
      { name: 'SANKEY TANK', top: '26%', right: '8%' },
      { name: 'ORION MALL', top: '50%', left: '10%' },
    ],
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMap,
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

  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 sm:pt-28 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2-Column Editorial Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Oversized Typography & Search (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] text-[#191919] leading-[1.05] tracking-tight mb-6">
              discover <br />
              banglore <br />
              <span className="text-[#F02D25]">like never before.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#77736D] max-w-xl leading-relaxed mb-8 font-normal">
              <strong className="text-[#191919] font-bold">bango</strong> is an intelligent urban discovery platform powered by the <strong className="text-[#191919] font-semibold">Apriori Association Rule Mining</strong> algorithm. Uncover hidden mobility patterns, transit connections, and curated smart city destinations across 8 urban domains.
            </p>

            {/* Primary Action CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreMap}
                className="group flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Open Map Explorer</span>
                <div className="w-6 h-6 rounded-full bg-[#F02D25] flex items-center justify-center text-white">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

          </div>

          {/* Right: Airplane Window Carousel + Segmented Pill Indicator (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* The Signature Aperture / Curved Window Card with Auto-Transition */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative w-full max-w-[420px] aspect-[4/5] rounded-[56px] sm:rounded-[64px] overflow-hidden border-[8px] border-white shadow-2xl bg-[#191919] transition-all duration-500 group select-none"
            >
              
              {/* Animated Carousel Image */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  key={currentSlide.id}
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover filter contrast-[1.05] transition-all duration-700 animate-in fade-in zoom-in-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
              </div>

              {/* Dynamic Floating Locality Tags inside the Aperture */}
              {currentSlide.pills.map((loc, idx) => (
                <div
                  key={`${currentSlide.id}-${idx}`}
                  style={{ top: loc.top, left: loc.left, right: loc.right, bottom: loc.bottom }}
                  className="absolute z-10 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#191919] uppercase tracking-wider border border-white/80 shadow-md flex items-center gap-1.5 animate-in fade-in duration-300 select-none hover:scale-105 transition-transform"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25] shrink-0"></span>
                  <span>{loc.name}</span>
                </div>
              ))}

              {/* Bottom Aperture Info Badge */}
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 z-10 p-4 sm:p-5 rounded-[22px] sm:rounded-[24px] bg-white/95 backdrop-blur-md border border-white/80 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#F02D25]">
                    {currentSlide.tag}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm sm:text-[15px] text-[#191919] leading-snug tracking-tight">
                  {currentSlide.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#77736D] mt-1 leading-relaxed line-clamp-2">
                  {currentSlide.description}
                </p>
              </div>

            </div>

            {/* Custom Segmented Capsule Pagination Indicator (Matching User Reference Image) */}
            <div className="flex items-center justify-center gap-2 mt-6 select-none z-10">
              {LOCATION_SLIDES.map((_, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-12 h-2.5 rounded-full bg-[#F02D25] shadow-xs'
                        : 'w-6 h-2 rounded-full bg-[#D8D4CC] hover:bg-[#B3ADA3]'
                    }`}
                    title={`Slide ${idx + 1}: ${LOCATION_SLIDES[idx].title}`}
                  />
                );
              })}
            </div>

            {/* Decorative Ambient Background Ring */}
            <div className="absolute -z-10 w-[480px] h-[480px] rounded-full border border-[#E3DFD7] -top-10 -right-10 pointer-events-none opacity-60"></div>
          </div>

        </div>

      </div>
    </section>
  );
};
