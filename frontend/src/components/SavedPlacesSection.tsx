import React from 'react';
import { Place } from '../types';
import { Bookmark, Star, MapPin, ExternalLink, ArrowUpRight, Trash2 } from 'lucide-react';

interface SavedPlacesSectionProps {
  savedPlaces: Place[];
  onSelectPlace: (place: Place) => void;
  onRemovePlace: (place: Place) => void;
  onViewDetails: (place: Place) => void;
  onNavigateToMap?: () => void;
}

export const SavedPlacesSection: React.FC<SavedPlacesSectionProps> = ({
  savedPlaces,
  onSelectPlace,
  onRemovePlace,
  onViewDetails,
  onNavigateToMap,
}) => {
  const handleCardClick = (place: Place) => {
    onSelectPlace(place);
    if (onNavigateToMap) {
      onNavigateToMap();
    }
  };

  return (
    <section className="py-10 md:py-12 bg-[#ECE9E2] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#77736D]">
                bango &bull; Personal Itinerary &bull; Local Storage
              </span>
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#191919] tracking-tight leading-tight">
              your city. <br />
              your collection.
            </h2>
          </div>

          <div className="text-xs font-semibold text-[#77736D]">
            <span>{savedPlaces.length} destinations saved in your browser</span>
          </div>
        </div>

        {/* Content */}
        {savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map((place) => (
              <div
                key={place.place_id}
                onClick={() => handleCardClick(place)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-[#ECE9E2]">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#191919]/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {place.category}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlace(place);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-[#F02D25] text-[#191919] hover:text-white transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-lg text-[#191919] uppercase truncate group-hover:text-[#F02D25] transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-xs text-[#77736D] mt-1 line-clamp-2">
                      {place.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[#77736D] truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#F02D25] shrink-0" />
                      <span className="truncate">{place.locality}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(place);
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-[#191919] hover:text-[#F02D25] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E3DFD7] p-8 max-w-xl mx-auto my-8">
            <Bookmark className="w-12 h-12 text-[#D1CCC4] mx-auto mb-3" />
            <h4 className="font-display font-bold text-xl text-[#191919] uppercase">
              No saved destinations yet
            </h4>
            <p className="text-xs text-[#77736D] mt-1.5 max-w-sm mx-auto">
              Click the bookmark icon on any card or map pin across Bengaluru to build your personal smart city itinerary.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
