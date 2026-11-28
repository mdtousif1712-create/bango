import React, { useState, useEffect, useRef } from 'react';
import { Place } from '../types';
import { Star, MapPin, Bookmark, ArrowUpRight, TrendingUp } from 'lucide-react';

interface TrendingSectionProps {
  places: Place[];
  allPlaces?: Place[];
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  onViewDetails: (place: Place) => void;
  onNavigateToMap?: () => void;
  onExploreOnMap?: (place: Place) => void;
}

const CATEGORY_TABS = [
  'All',
  'Tourism',
  'Transportation',
  'Restaurants',
  'Healthcare',
  'Shopping',
  'Education',
  'Entertainment',
  'Startups',
];

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  places,
  allPlaces,
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  onViewDetails,
  onNavigateToMap,
  onExploreOnMap,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pool of all catalog places for the active domain
  const poolOfAllPlaces = allPlaces && allPlaces.length > 0 ? allPlaces : places;
  const domainAllPlaces = poolOfAllPlaces.filter(
    (p) => p.category.toLowerCase() === selectedFilter.toLowerCase()
  );

  // Combine scored trending places with any domain places from the full catalog
  const filteredPlaces =
    selectedFilter === 'All'
      ? (places && places.length >= 20 ? places : poolOfAllPlaces)
      : (() => {
          const domainTrending = places.filter(
            (p) => p.category.toLowerCase() === selectedFilter.toLowerCase()
          );
          const existingIds = new Set(domainTrending.map((p) => p.place_id));
          const additional = domainAllPlaces.filter((p) => !existingIds.has(p.place_id));
          return [...domainTrending, ...additional];
        })();

  // Top 5 destinations for the featured rotating hero card
  const heroCarouselPlaces = filteredPlaces.slice(0, 5);
  const activeIndex = activeFeaturedIndex % (heroCarouselPlaces.length || 1);
  const featured = heroCarouselPlaces[activeIndex] || filteredPlaces[0] || places[0];

  // Auto-rotating timer that changes featured card every 4.5 seconds (matching discover page)
  useEffect(() => {
    if (isPaused || heroCarouselPlaces.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveFeaturedIndex((prev) => (prev + 1) % heroCarouselPlaces.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, heroCarouselPlaces.length]);

  // Reset index when filter changes
  useEffect(() => {
    setActiveFeaturedIndex(0);
  }, [selectedFilter]);

  // Remaining places for secondary stack (2 cards) and tertiary grid (all remaining cards)
  const otherPlaces = filteredPlaces.filter((p) => p.place_id !== featured?.place_id);
  const secondary = otherPlaces.slice(0, 2);
  const tertiary = otherPlaces.slice(2);

  const handleExploreMap = (place: Place, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExploreOnMap) {
      onExploreOnMap(place);
    } else {
      onSelectPlace(place);
      if (onNavigateToMap) {
        onNavigateToMap();
      }
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-[#ECE9E2] min-h-[calc(100vh-80px)]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#191919] tracking-tight leading-tight">
              the city <br />
              is talking.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#77736D]">
            <TrendingUp className="w-4 h-4 text-[#F02D25]" />
            <span>Ranked by transactional co-occurrences in Bengaluru mobility datasets</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-[#191919] text-white shadow-sm'
                  : 'bg-white text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Varied Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Large Auto-Rotating Featured Hero Card (7 cols) */}
          {featured && (
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={() => onViewDetails(featured)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[460px] flex-1 flex flex-col justify-between select-none"
              >
                {/* Photo with overlay and smooth keyframe fade */}
                <div className="absolute inset-0 z-0 bg-[#ECE9E2]">
                  <img
                    key={featured.place_id}
                    src={featured.image_url}
                    alt={featured.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.85] animate-in fade-in zoom-in-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20"></div>
                </div>

                {/* Top Tags */}
                <div className="relative z-10 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-white text-[#191919] text-xs font-extrabold uppercase tracking-wider shadow-sm">
                      {featured.category}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{featured.rating ? featured.rating.toFixed(1) : '4.8'}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSavePlace(featured);
                    }}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
                      isPlaceSaved(featured.place_id)
                        ? 'bg-[#F02D25] text-white'
                        : 'bg-white/80 text-[#191919] hover:bg-white'
                    }`}
                    title={isPlaceSaved(featured.place_id) ? 'Saved' : 'Save Place'}
                  >
                    <Bookmark className={`w-4 h-4 ${isPlaceSaved(featured.place_id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Bottom Info with Circular Arrow */}
                <div className="relative z-10 p-6 sm:p-8 flex items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-white/80 text-xs font-semibold mb-2">
                      <MapPin className="w-4 h-4 text-[#F02D25]" />
                      <span>{featured.locality} &bull; Bengaluru</span>
                    </div>
                    <h3 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                      {featured.name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm mt-2 line-clamp-2 font-normal">
                      {featured.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleExploreMap(featured, e)}
                    className="w-12 h-12 rounded-full bg-[#F02D25] hover:bg-[#D9221A] text-white flex items-center justify-center shrink-0 transition-all hover:scale-110 shadow-lg cursor-pointer"
                    title="Explore on Map"
                  >
                    <ArrowUpRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Segmented Capsule Pagination Indicator (Matching First Page) */}
              {heroCarouselPlaces.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 select-none">
                  {heroCarouselPlaces.map((place, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={place.place_id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFeaturedIndex(idx);
                        }}
                        className={`transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'w-10 sm:w-12 h-2.5 rounded-full bg-[#F02D25] shadow-xs'
                            : 'w-5 sm:w-6 h-2 rounded-full bg-[#D8D4CC] hover:bg-[#B3ADA3]'
                        }`}
                        title={`Slide ${idx + 1}: ${place.name}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Secondary Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {secondary.map((place) => (
              <div
                key={place.place_id}
                onClick={() => onViewDetails(place)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex-1 flex flex-col justify-between min-h-[220px]"
              >
                <div className="relative h-36 w-full overflow-hidden bg-[#ECE9E2]">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#191919]/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {place.category}
                  </div>
                  {place.rating && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#F02D25] text-white text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      <span>{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-base text-[#191919] truncate group-hover:text-[#F02D25] transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-xs text-[#77736D] truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                      <span>{place.locality}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleExploreMap(place, e)}
                    className="w-9 h-9 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white flex items-center justify-center shrink-0 transition-all hover:scale-110 cursor-pointer shadow-xs"
                    title="Explore on Map"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 3. Tertiary Compact Row */}
        {tertiary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {tertiary.map((place) => (
              <div
                key={place.place_id}
                onClick={() => onViewDetails(place)}
                className="group relative bg-white rounded-3xl p-4 border border-[#E3DFD7] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#ECE9E2]">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F02D25]">
                    {place.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#191919] truncate mt-0.5">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-[#77736D] truncate mt-0.5">
                    {place.locality}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleExploreMap(place, e)}
                  className="w-8 h-8 rounded-full bg-[#ECE9E2] hover:bg-[#F02D25] hover:text-white text-[#191919] flex items-center justify-center shrink-0 transition-all hover:scale-110 cursor-pointer shadow-xs"
                  title="Explore on Map"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
