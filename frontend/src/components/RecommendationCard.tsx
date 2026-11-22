import React from 'react';
import { RecommendationItem, Place } from '../types';
import { Sparkles, Star, MapPin, Bookmark, ExternalLink, ArrowRight, TrendingUp } from 'lucide-react';

interface RecommendationCardProps {
  item: RecommendationItem;
  isSelected?: boolean;
  isSaved?: boolean;
  onSelect: (place: Place) => void;
  onSave: (place: Place) => void;
  onViewDetails: (place: Place) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  isSelected = false,
  isSaved = false,
  onSelect,
  onSave,
  onViewDetails,
}) => {
  const { place, confidence, lift, support, rule_explanation, recommendation_type } = item;
  const isApriori = recommendation_type === 'association';

  return (
    <div
      onClick={() => onSelect(place)}
      className={`group relative bg-white rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
        isSelected
          ? 'border-[#5681EB] ring-2 ring-[#5681EB]/20 bg-[#F8FAFC]'
          : 'border-[#E8EBF0] hover:border-[#B9E2F1]'
      }`}
    >
      {/* Top Explanation Banner */}
      <div className="mb-2.5 flex items-start gap-2 bg-[#F1F5F9]/80 rounded-xl p-2 border border-[#E8EBF0]">
        <div className="w-5 h-5 rounded-md bg-[#5681EB]/10 text-[#5681EB] flex items-center justify-center shrink-0 mt-0.5">
          {isApriori ? <Sparkles className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F6FDB]">
              {isApriori ? 'Apriori Rule Recommendation' : 'Domain Recommendation'}
            </span>
            {isApriori && (
              <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <span>{(confidence * 100).toFixed(0)}% Conf</span>
                <span>•</span>
                <span>{lift.toFixed(1)}x Lift</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#171B24] font-medium leading-tight mt-0.5 line-clamp-2">
            {rule_explanation}
          </p>
        </div>
      </div>

      {/* Main Place Card Body */}
      <div className="flex gap-3">
        {/* Photo */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {place.rating && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Place Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#E7EBEF] text-[#171B24]">
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
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h4 className="font-bold text-sm text-[#171B24] mt-1 line-clamp-1 group-hover:text-[#5681EB] transition-colors">
              {place.name}
            </h4>

            <p className="text-[11px] text-[#777F8B] line-clamp-1 mt-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-[#5681EB] shrink-0" />
              <span>{place.locality}</span>
            </p>
          </div>

          <div className="mt-1 flex items-center justify-between">
            {place.distance_km !== undefined ? (
              <span className="text-[10px] font-semibold text-[#5681EB]">
                {place.distance_km} km away
              </span>
            ) : (
              <span className="text-[10px] text-[#777F8B]">Bengaluru</span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(place);
              }}
              className="text-[11px] font-bold text-[#5681EB] hover:text-[#3F6FDB] flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
