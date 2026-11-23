import React, { useState } from 'react';
import { Place } from '../types';
import { Star, MapPin, Bookmark, ArrowUpRight, TrendingUp } from 'lucide-react';

interface TrendingSectionProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  onViewDetails: (place: Place) => void;
  onNavigateToMap?: () => void;
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
  'Real Estate',
];

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  places,
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  onViewDetails,
  onNavigateToMap,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filteredPlaces =
    selectedFilter === 'All'
      ? places
      : places.filter((p) => p.category.toLowerCase() === selectedFilter.toLowerCase());

  const featured = filteredPlaces[0] || places[0];
  const secondary = filteredPlaces.slice(1, 3);
  const tertiary = filteredPlaces.slice(3, 9);

  const handleCardClick = (place: Place) => {
    onSelectPlace(place);
    if (onNavigateToMap) {
      onNavigateToMap();
    }
  };

  return (
    <section className="py-12 bg-[#ECE9E2] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#77736D]">
                bango &bull; Smart City Footfall Analytics
              </span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#191919] uppercase tracking-tight leading-[0.95]">
              The City <br />
              Is Talking.
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
          
          {/* 1. Large Hero Card (7 cols) */}
          {featured && (
            <div
              onClick={() => handleCardClick(featured)}
              className="lg:col-span-7 group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[460px] flex flex-col justify-between"
            >
              {/* Photo with overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={featured.image_url}
                  alt={featured.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.85]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20"></div>
              </div>

              {/* Top Tags */}
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-[#191919] text-xs font-extrabold uppercase tracking-wider shadow-sm">
                    {featured.category}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
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
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
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
                    <span>{featured.locality} &bull; Central Bengaluru</span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
                    {featured.name}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm mt-2 line-clamp-2 font-normal">
                    {featured.description}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#F02D25] group-hover:bg-[#E9473D] text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-lg">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* 2. Secondary Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {secondary.map((place) => (
              <div
                key={place.place_id}
                onClick={() => handleCardClick(place)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex-1 flex flex-col justify-between min-h-[220px]"
              >
                <div className="relative h-36 w-full overflow-hidden bg-[#ECE9E2]">
                  <img
                    src={place.image_url}
                    alt={place.name}
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
                    <h4 className="font-display font-bold text-base text-[#191919] uppercase truncate group-hover:text-[#F02D25] transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-xs text-[#77736D] truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                      <span>{place.locality}</span>
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center shrink-0 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 3. Tertiary Compact Row */}
        {tertiary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {tertiary.map((place) => (
              <div
                key={place.place_id}
                onClick={() => handleCardClick(place)}
                className="group relative bg-white rounded-3xl p-4 border border-[#E3DFD7] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#ECE9E2]">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F02D25]">
                    {place.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#191919] uppercase truncate mt-0.5">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-[#77736D] truncate mt-0.5">
                    {place.locality}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#ECE9E2] group-hover:bg-[#F02D25] group-hover:text-white text-[#191919] flex items-center justify-center shrink-0 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
