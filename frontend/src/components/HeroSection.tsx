import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, MapPin, Compass, ArrowUpRight } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  onExploreMap: () => void;
  onOpenAlgorithm: () => void;
}

const PROMPT_CHIPS = [
  "Metro stations near Indiranagar",
  "Parks near Cubbon Park",
  "Hospitals in Whitefield",
  "Restaurants near MG Road",
  "Colleges around Malleshwaram",
  "EV Charging near Koramangala",
];

const LOCALITIES = [
  { name: 'INDIRANAGAR', top: '15%', left: '8%' },
  { name: 'MG ROAD', top: '22%', right: '12%' },
  { name: 'CUBBON PARK', bottom: '28%', left: '14%' },
  { name: 'WHITEFIELD', bottom: '18%', right: '10%' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  isSearching,
  onExploreMap,
  onOpenAlgorithm,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      // Smooth scroll to map explorer to see results
      document.getElementById('map-explorer')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    onSearch(chip);
    document.getElementById('map-explorer')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow Label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F02D25] animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#77736D]">
            Bengaluru Smart City Discovery &bull; Karnataka, India
          </span>
          <span className="hidden sm:inline-block w-12 h-[1px] bg-[#E3DFD7]"></span>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#191919] uppercase tracking-wider bg-[#ECE9E2] px-2.5 py-0.5 rounded-full">
            Apriori Algorithm v2.0
          </span>
        </div>

        {/* 2-Column Editorial Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Oversized Typography & Search (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#191919] leading-[0.92] tracking-tighter uppercase mb-6">
              Discover <br />
              Bengaluru <br />
              <span className="text-[#F02D25] underline decoration-4 underline-offset-8">
                Differently.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#77736D] max-w-xl leading-relaxed mb-8 font-normal">
              An intelligent urban discovery platform powered by the <strong className="text-[#191919] font-semibold">Apriori Association Rule Mining</strong> algorithm. Uncover hidden mobility patterns, transit connections, and curated smart city destinations across 8 urban domains.
            </p>

            {/* Editorial "WHERE DO YOU WANT TO GO?" Search Bar */}
            <div className="w-full max-w-xl bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E3DFD7] shadow-lg mb-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="pl-2 text-[#77736D]">
                  <Search className="w-5 h-5 text-[#191919]" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where do you want to go in Bengaluru?"
                  className="flex-1 bg-transparent px-2 py-2 text-sm sm:text-base text-[#191919] placeholder:text-[#77736D] outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="w-11 h-11 rounded-xl bg-[#F02D25] hover:bg-[#E9473D] text-white flex items-center justify-center transition-all shrink-0 shadow-sm disabled:opacity-40 disabled:hover:bg-[#F02D25] group cursor-pointer"
                  title="Search Bengaluru"
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {/* Prompt Suggestions */}
              <div className="mt-2.5 pt-2 border-t border-[#E3DFD7]/60 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D] mr-1">
                  Try:
                </span>
                {PROMPT_CHIPS.slice(0, 4).map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F3EE] hover:bg-[#ECE9E2] text-[#191919] transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreMap}
                className="group flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Explore Interactive Map</span>
                <div className="w-6 h-6 rounded-full bg-[#F02D25] flex items-center justify-center text-white">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={onOpenAlgorithm}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-[#ECE9E2] text-[#191919] text-xs font-bold uppercase tracking-wider border border-[#E3DFD7] transition-all shadow-xs"
              >
                Inspect Apriori Engine
              </button>
            </div>

          </div>

          {/* Right: Airplane Window / Aperture Frame (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* The Signature Aperture / Curved Window Motif */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-[90px] sm:rounded-[120px] overflow-hidden border-[8px] border-white shadow-2xl bg-[#191919]">
              
              {/* Bengaluru Imagery */}
              <img
                src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85"
                alt="Bengaluru Cubbon Park and Heritage"
                className="w-full h-full object-cover filter contrast-[1.05]"
              />

              {/* Gradient Overlay for Editorial Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Floating Locality Tags inside the Aperture */}
              {LOCALITIES.map((loc, idx) => (
                <div
                  key={idx}
                  style={{ top: loc.top, left: loc.left, right: loc.right, bottom: loc.bottom }}
                  className="absolute z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#191919] uppercase tracking-wider border border-white/60 shadow-md flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
                  <span>{loc.name}</span>
                </div>
              ))}

              {/* Bottom Aperture Info Badge */}
              <div className="absolute bottom-6 left-6 right-6 z-10 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F02D25]">
                    1,250+ Mobility Patterns
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <h4 className="font-display font-bold text-sm text-[#191919] uppercase leading-tight">
                  Real-time Apriori Association Engine
                </h4>
                <p className="text-[11px] text-[#77736D] mt-0.5">
                  Mining statistical co-occurrences across Namma Metro, tech hubs, parks, and healthcare.
                </p>
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
