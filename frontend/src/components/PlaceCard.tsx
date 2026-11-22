import React from 'react';
import { Place } from '../types';
import { Star, MapPin, Bookmark, ExternalLink } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  isSelected?: boolean;
  isSaved?: boolean;
  onSelect: (place: Place) => void;
  onSave: (place: Place) => void;
  onViewDetails: (place: Place) => void;
}

const CATEGORY_TAG_COLORS: Record<string, string> = {
  Healthcare: 'bg-red-50 text-red-600 border-red-200',
  Transportation: 'bg-blue-50 text-blue-600 border-blue-200',
  Tourism: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Shopping: 'bg-orange-50 text-orange-600 border-orange-200',
  Education: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Entertainment: 'bg-purple-50 text-purple-600 border-purple-200',
  Restaurants: 'bg-amber-50 text-amber-600 border-amber-200',
  'Real Estate': 'bg-cyan-50 text-cyan-600 border-cyan-200',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isSelected = false,
  isSaved = false,
  onSelect,
  onSave,
  onViewDetails,
}) => {
  const badgeStyle = CATEGORY_TAG_COLORS[place.category] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <div
      onClick={() => onSelect(place)}
      className={`group relative bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex gap-3.5 ${
        isSelected
          ? 'border-[#5681EB] ring-2 ring-[#5681EB]/20 bg-[#F8FAFC]'
          : 'border-[#E8EBF0] hover:border-[#B9E2F1]'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
        <img
          src={place.image_url}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {place.rating && (
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
              {place.category}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSave(place);
              }}
              className={`p-1 rounded-lg transition-colors ${
                isSaved ? 'text-[#3F6FDB]' : 'text-[#777F8B] hover:text-[#171B24]'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Place'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h4 className="font-bold text-sm text-[#171B24] mt-1 line-clamp-1 group-hover:text-[#5681EB] transition-colors">
            {place.name}
          </h4>

          <p className="text-xs text-[#777F8B] line-clamp-2 mt-0.5 leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="mt-2 pt-1.5 border-t border-[#E8EBF0]/60 flex items-center justify-between text-[11px] text-[#777F8B]">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#5681EB] shrink-0" />
            <span className="truncate">{place.locality}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(place);
            }}
            className="text-[11px] font-bold text-[#5681EB] hover:text-[#3F6FDB] flex items-center gap-0.5 shrink-0 ml-2"
          >
            <span>Details</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
