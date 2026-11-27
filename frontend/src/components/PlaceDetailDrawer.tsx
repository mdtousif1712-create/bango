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
  Check,
  ArrowUpRight
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-[1500] flex flex-col border-l border-[#E3DFD7] animate-in slide-in-from-right duration-300 font-sans">
      {/* Header Bar */}
      <div className="h-16 px-6 border-b border-[#E3DFD7] flex items-center justify-between shrink-0 bg-[#F5F3EE]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
          <span className="text-xs font-bold text-[#191919] uppercase tracking-wider font-display">
            Location Dossier
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] rounded-xl transition-colors"
            title="Share place"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] rounded-xl transition-colors"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Image */}
        <div className="relative h-64 w-full bg-[#ECE9E2] overflow-hidden">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#F02D25] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {place.category}
              </span>
              <h2 className="font-display font-bold text-2xl text-white mt-1.5 leading-tight drop-shadow-sm">
                {place.name}
              </h2>
            </div>
            {place.rating && (
              <div className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[#191919] text-xs font-bold flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-[#F02D25] text-[#F02D25]" />
                <span>{place.rating.toFixed(1)}</span>
                <span className="text-[10px] text-[#77736D]">
                  ({(place.review_count || 120).toLocaleString()})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b border-[#E3DFD7] flex items-center gap-3 bg-[#F5F3EE]">
          <button
            onClick={handleDirections}
            className="flex-1 py-3 px-4 bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Navigation2 className="w-4 h-4 fill-white" />
            <span>Google Maps Directions</span>
          </button>

          <button
            onClick={() => onSavePlace(place)}
            className={`py-3 px-4 border text-xs font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 ${
              isSaved
                ? 'bg-[#F02D25] text-white border-[#F02D25]'
                : 'border-[#E3DFD7] bg-white text-[#191919] hover:bg-[#ECE9E2]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Bookmark'}</span>
          </button>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wider mb-2">
              About This Destination
            </h4>
            <p className="text-sm text-[#191919] leading-relaxed font-normal">
              {place.description}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wider mb-2">
              Civic Address & Coordinates
            </h4>
            <div className="p-4 rounded-2xl bg-[#ECE9E2]/60 border border-[#E3DFD7] flex items-start gap-3 text-xs text-[#191919]">
              <MapPin className="w-4 h-4 text-[#F02D25] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{place.address}</p>
                <p className="text-[#77736D] mt-1">
                  Locality: <strong className="text-[#191919]">{place.locality}</strong>
                </p>
                <p className="text-[#77736D] text-[11px] mt-1 font-mono">
                  Coordinates: {place.latitude.toFixed(4)}°N, {place.longitude.toFixed(4)}°E
                </p>
              </div>
            </div>
          </div>

          {place.popular_activity && (
            <div className="p-4 bg-white rounded-2xl border border-[#E3DFD7] shadow-2xs">
              <span className="text-[10px] font-extrabold text-[#F02D25] uppercase tracking-widest">
                Citizen Mobility Activity
              </span>
              <p className="text-xs text-[#191919] font-semibold mt-1">
                {place.popular_activity}
              </p>
            </div>
          )}

          {place.tags && place.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wider mb-2">
                Urban Classification Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#ECE9E2] text-[#191919]"
                  >
                    <Tag className="w-3 h-3 text-[#77736D]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PEOPLE ALSO EXPLORE (Apriori Association Rules) */}
          <div className="pt-6 border-t border-[#E3DFD7]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F02D25]" />
                <h4 className="font-display font-bold text-sm text-[#191919] uppercase tracking-wider">
                  People Also Explore
                </h4>
              </div>
              <span className="text-[10px] font-bold text-white bg-[#F02D25] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Apriori Rules
              </span>
            </div>

            <p className="text-xs text-[#77736D] mb-4 leading-relaxed">
              Mined from frequent transactional co-occurrences across Bengaluru citizen journey datasets.
            </p>

            {isLoadingRecs ? (
              <div className="py-8 text-center text-xs text-[#77736D]">
                Computing association patterns...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectPlace(rec.place);
                    }}
                    className="p-3.5 rounded-2xl border border-[#E3DFD7] hover:border-[#F02D25] bg-white hover:bg-[#F5F3EE] transition-all cursor-pointer group flex items-start gap-3.5 shadow-xs"
                  >
                    <img
                      src={rec.place.image_url}
                      alt={rec.place.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#F02D25] uppercase tracking-wider">
                          {rec.place.category}
                        </span>
                        {rec.confidence > 0 && (
                          <span className="text-[10px] font-bold text-[#191919] bg-[#ECE9E2] px-2 py-0.5 rounded-full">
                            {(rec.confidence * 100).toFixed(0)}% Conf
                          </span>
                        )}
                      </div>
                      <h5 className="font-display font-bold text-xs text-[#191919] group-hover:text-[#F02D25] truncate uppercase mt-0.5">
                        {rec.place.name}
                      </h5>
                      <p className="text-[11px] text-[#77736D] mt-1 line-clamp-1">
                        {rec.rule_explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#ECE9E2] text-center text-xs text-[#77736D]">
                No specific co-visitation association rule was found above 30% confidence for this location.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
