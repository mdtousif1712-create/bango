import React, { useEffect, useState } from 'react';
import { Place, RecommendationItem } from '../types';
import { fetchRecommendations } from '../services/api';
import {
  X,
  Star,
  MapPin,
  Bookmark,
  Navigation2,
  Sparkles,
  ExternalLink,
  Tag,
  Share2,
  Check
} from 'lucide-react';

interface PlaceDetailDrawerProps {
  place: Place | null;
  onClose: () => void;
  onSavePlace: (place: Place) => void;
  isSaved: boolean;
  onSelectPlace: (place: Place) => void;
  userLocation: { lat: number; lng: number } | null;
}

export const PlaceDetailDrawer: React.FC<PlaceDetailDrawerProps> = ({
  place,
  onClose,
  onSavePlace,
  isSaved,
  onSelectPlace,
  userLocation,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (place) {
      setIsLoadingRecs(true);
      fetchRecommendations(place.place_id, userLocation?.lat, userLocation?.lng)
        .then((res) => {
          setRecommendations(res.recommendations || []);
        })
        .catch((err) => {
          console.error('Error fetching recommendations for place:', err);
          setRecommendations([]);
        })
        .finally(() => setIsLoadingRecs(false));
    }
  }, [place, userLocation]);

  if (!place) return null;

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `Explore ${place.name} in Bengaluru Smart City Discovery!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${place.name} - ${place.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#E8EBF0] animate-in slide-in-from-right duration-300">
      {/* Header Bar */}
      <div className="h-14 px-5 border-b border-[#E8EBF0] flex items-center justify-between shrink-0 bg-white">
        <span className="text-xs font-bold text-[#777F8B] uppercase tracking-wider">
          Place Information
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 text-[#777F8B] hover:text-[#171B24] hover:bg-slate-100 rounded-xl transition-colors"
            title="Share place"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-[#777F8B] hover:text-[#171B24] hover:bg-slate-100 rounded-xl transition-colors"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Image */}
        <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5681EB] text-white text-xs font-bold shadow-xs">
                {place.category}
              </span>
              <h2 className="text-xl font-bold text-white mt-1 drop-shadow-sm">
                {place.name}
              </h2>
            </div>
            {place.rating && (
              <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{place.rating.toFixed(1)}</span>
                <span className="text-[10px] text-white/70">
                  ({(place.review_count || 120).toLocaleString()})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-b border-[#E8EBF0] flex items-center gap-3">
          <button
            onClick={handleDirections}
            className="flex-1 py-2.5 px-4 bg-[#5681EB] hover:bg-[#3F6FDB] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Navigation2 className="w-4 h-4 fill-white" />
            <span>Get Directions</span>
          </button>

          <button
            onClick={() => onSavePlace(place)}
            className={`py-2.5 px-4 border text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              isSaved
                ? 'bg-[#B9E2F1]/50 text-[#3F6FDB] border-[#3F6FDB]'
                : 'border-[#E8EBF0] text-[#171B24] hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Bookmark'}</span>
          </button>
        </div>

        {/* Details Section */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-[#777F8B] uppercase tracking-wider">
              About This Location
            </h4>
            <p className="text-sm text-[#171B24] mt-1.5 leading-relaxed">
              {place.description}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#777F8B] uppercase tracking-wider">
              Address & Locality
            </h4>
            <div className="flex items-start gap-2 text-xs text-[#171B24] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#5681EB] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{place.address}</p>
                <p className="text-[#777F8B] mt-0.5">
                  Locality: <span className="text-[#171B24] font-medium">{place.locality}</span>
                </p>
                <p className="text-[#777F8B] text-[11px] mt-0.5 font-mono">
                  Coordinates: {place.latitude.toFixed(4)}°N, {place.longitude.toFixed(4)}°E
                </p>
              </div>
            </div>
          </div>

          {place.popular_activity && (
            <div className="p-3 bg-[#E7EBEF]/50 rounded-xl border border-[#E8EBF0]">
              <span className="text-[11px] font-bold text-[#3F6FDB] uppercase tracking-wide">
                Popular Citizen Activity
              </span>
              <p className="text-xs text-[#171B24] font-medium mt-0.5">
                {place.popular_activity}
              </p>
            </div>
          )}

          {place.tags && place.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#777F8B] uppercase tracking-wider mb-2">
                Features & Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700"
                  >
                    <Tag className="w-3 h-3 text-[#777F8B]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PEOPLE ALSO EXPLORE (Apriori Association Mining Engine) */}
          <div className="pt-4 border-t border-[#E8EBF0]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5681EB]" />
                <h4 className="text-xs font-bold text-[#171B24] uppercase tracking-wider">
                  People Also Explore
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-[#5681EB] bg-[#5681EB]/10 px-2 py-0.5 rounded-full">
                Apriori Rules
              </span>
            </div>

            <p className="text-xs text-[#777F8B] mb-3 leading-relaxed">
              Discovered from frequent association patterns across 1,200+ historical smart city citizen mobility journeys.
            </p>

            {isLoadingRecs ? (
              <div className="py-6 text-center text-xs text-[#777F8B]">
                Mining smart city association rules...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-2.5">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectPlace(rec.place);
                    }}
                    className="p-3 rounded-xl border border-[#E8EBF0] hover:border-[#5681EB] bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <img
                      src={rec.place.image_url}
                      alt={rec.place.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#5681EB] uppercase">
                          {rec.place.category}
                        </span>
                        {rec.confidence > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                            {(rec.confidence * 100).toFixed(0)}% Conf
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-[#171B24] group-hover:text-[#5681EB] truncate">
                        {rec.place.name}
                      </h5>
                      <p className="text-[10px] text-[#777F8B] mt-0.5 line-clamp-1">
                        {rec.rule_explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-[#777F8B] border border-dashed border-[#E8EBF0]">
                No specific co-visitation association rule was found above 30% confidence for this location.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
