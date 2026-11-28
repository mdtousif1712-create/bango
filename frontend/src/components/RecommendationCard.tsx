import React from 'react';
import { RecommendationItem, Place } from '../types';
import { Star, MapPin, Bookmark, ArrowUpRight } from 'lucide-react';

interface RecommendationCardProps {
  item: RecommendationItem;
  isSelected?: boolean;
  isSaved?: boolean;
  onSelect: (place: Place) => void;
  onSave: (place: Place) => void;
  onViewDetails: (place: Place) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = React.memo(({
  item,
  isSelected = false,
  isSaved = false,
  onSelect,
  onSave,
  onViewDetails,
}) => {
  const { place } = item;

  return (
    <div
      onClick={() => onSelect(place)}
      className={`group relative bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
        isSelected
          ? 'border-[#F02D25] ring-2 ring-[#F02D25]/20 bg-[#F5F3EE]'
          : 'border-[#E3DFD7] hover:border-[#F02D25]'
      }`}
    >
      {/* Main Place Card Body */}
      <div className="flex gap-3">
        {/* Photo */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#ECE9E2]">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
          {place.rating && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded-md bg-[#191919]/80 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-[#F02D25] text-[#F02D25]" />
              <span>{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Place Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ECE9E2] text-[#191919]">
                {place.category}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(place);
                }}
                className={`p-1 rounded-lg transition-colors ${
                  isSaved ? 'text-[#F02D25]' : 'text-[#77736D] hover:text-[#191919]'
                }`}
                title={isSaved ? 'Remove Bookmark' : 'Save Place'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h4 className="font-display font-bold text-sm text-[#191919] mt-1 line-clamp-1 group-hover:text-[#F02D25] transition-colors">
              {place.name}
            </h4>

            <p className="text-[11px] text-[#77736D] line-clamp-1 mt-0.5">
              {place.address}
            </p>
          </div>

          {/* Action Row */}
          <div className="mt-1 pt-1 border-t border-[#E3DFD7]/80 flex items-center justify-between text-[11px] text-[#77736D]">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
              <span className="truncate">{place.locality}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(place);
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-[#191919] hover:text-[#F02D25] flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
