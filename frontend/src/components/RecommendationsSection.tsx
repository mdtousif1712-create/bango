import React, { useState } from 'react';
import { RecommendationItem, Place } from '../types';
import { Sparkles, Sliders, Star, MapPin, Bookmark, ArrowRight, ArrowUpRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[];
  selectedPlace: Place | null;
  allPlaces?: Place[];
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  onViewDetails: (place: Place) => void;
  onOpenAlgorithm: () => void;
  isLoading: boolean;
  notice?: string | null;
  onNavigateToMap?: () => void;
}

const POPULAR_ANCHORS = [
  { name: 'Cubbon Park', id: 'blr_tour_01' },
  { name: 'Lalbagh Garden', id: 'blr_tour_02' },
  { name: 'Indiranagar 100ft Rd', id: 'blr_rest_01' },
  { name: 'MG Road Metro', id: 'blr_trans_01' },
  { name: 'Manipal Hospital', id: 'blr_health_01' },
  { name: 'IISc Bangalore', id: 'blr_edu_01' },
  { name: 'Commercial Street', id: 'blr_shop_01' },
  { name: 'Manyata Tech Park', id: 'blr_real_01' },
];

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  selectedPlace,
  allPlaces = [],
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  onViewDetails,
  onOpenAlgorithm,
  isLoading,
  notice,
  onNavigateToMap,
}) => {
  const [expandedRuleIdx, setExpandedRuleIdx] = useState<number | null>(null);

  const toggleRuleInfo = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRuleIdx(expandedRuleIdx === idx ? null : idx);
  };

  const handleAnchorPick = (placeId: string) => {
    const found = allPlaces.find((p) => p.place_id === placeId);
    if (found) {
      onSelectPlace(found);
    }
  };

  return (
    <section className="py-12 bg-[#F5F3EE] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F02D25] animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#77736D]">
                bango &bull; Association Rule Mining &bull; MLxtend Apriori
              </span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#191919] uppercase tracking-tight leading-[0.95]">
              Discover <br />
              What Connects.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {selectedPlace && (
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#E3DFD7] text-xs shadow-xs">
                <span className="text-[#77736D]">Active Anchor: </span>
                <strong className="text-[#191919] uppercase font-bold">{selectedPlace.name}</strong>
              </div>
            )}

            <button
              onClick={onOpenAlgorithm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#F02D25]" />
              <span>Inspect Rules & Retrain</span>
            </button>
          </div>
        </div>

        {/* Quick Anchor Switcher Bar */}
        <div className="mb-8 p-4 rounded-3xl bg-[#ECE9E2] border border-[#E3DFD7]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block mb-2.5">
            Switch Antecedent (Source Location):
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ANCHORS.map((anchor) => {
              const isSelected = selectedPlace?.place_id === anchor.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => handleAnchorPick(anchor.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F02D25] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F5F3EE] text-[#191919] border border-[#E3DFD7]'
                  }`}
                >
                  {anchor.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fallback Notice if few rules found */}
        {notice && (
          <div className="mb-8 p-4 rounded-2xl bg-[#ECE9E2] border border-[#E3DFD7] text-xs text-[#191919] flex items-center justify-between">
            <span className="font-medium">{notice}</span>
            <span className="text-[11px] text-[#77736D] uppercase font-bold tracking-wider">
              Smart Proximity Fallback Active
            </span>
          </div>
        )}

        {/* Recommendations Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#F02D25] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-display font-bold text-base text-[#191919] uppercase">
              Computing Association Rules via MLxtend...
            </p>
            <p className="text-xs text-[#77736D] mt-1">
              Analyzing mobility transactional support, confidence and lift metrics
            </p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item, idx) => {
              const { place, confidence, lift, support, rule_explanation, recommendation_type } = item;
              const isApriori = recommendation_type === 'association';
              const isExpanded = expandedRuleIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectPlace(place);
                    if (onNavigateToMap) {
                      onNavigateToMap();
                    }
                  }}
                  className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#ECE9E2]">
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#191919]">
                        {place.category}
                      </span>

                      <div className="flex items-center gap-2">
                        {isApriori && (
                          <span className="px-2.5 py-1 rounded-full bg-[#F02D25] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{(confidence * 100).toFixed(0)}% Match</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSavePlace(place);
                          }}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                            isPlaceSaved(place.place_id)
                              ? 'bg-[#F02D25] text-white'
                              : 'bg-white/80 text-[#191919] hover:bg-white'
                          }`}
                          title={isPlaceSaved(place.place_id) ? 'Saved' : 'Save Place'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isPlaceSaved(place.place_id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Photo Label */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#F02D25]" />
                        <span className="truncate">{place.locality}</span>
                      </div>
                      {place.rating && (
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#F02D25] text-[#F02D25]" />
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Associative Connection Tag */}
                      <div className="mb-3 flex items-center justify-between text-[11px] font-bold text-[#F02D25] uppercase tracking-wider">
                        <span>
                          {isApriori ? 'Apriori Mined Association' : 'Intelligent Domain Pairing'}
                        </span>
                        {isApriori && (
                          <span className="text-[#191919] bg-[#ECE9E2] px-2 py-0.5 rounded-full text-[10px]">
                            {lift.toFixed(1)}x Lift
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-xl text-[#191919] uppercase tracking-tight group-hover:text-[#F02D25] transition-colors line-clamp-1">
                        {place.name}
                      </h3>

                      <p className="text-xs text-[#77736D] mt-1.5 line-clamp-2 leading-relaxed">
                        {rule_explanation}
                      </p>
                    </div>

                    {/* Expandable Mathematical Breakdown */}
                    <div className="mt-4 pt-3 border-t border-[#E3DFD7]">
                      <button
                        type="button"
                        onClick={(e) => toggleRuleInfo(idx, e)}
                        className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#77736D] hover:text-[#191919] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-[#F02D25]" />
                          <span>Why This Recommendation?</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-[#ECE9E2] text-xs space-y-1.5 animate-in fade-in duration-200">
                          <div className="flex justify-between text-[#191919]">
                            <span className="font-medium text-[#77736D]">Algorithm:</span>
                            <span className="font-bold">Apriori (MLxtend)</span>
                          </div>
                          <div className="flex justify-between text-[#191919]">
                            <span className="font-medium text-[#77736D]">Confidence:</span>
                            <span className="font-bold">{(confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-[#191919]">
                            <span className="font-medium text-[#77736D]">Lift Metric:</span>
                            <span className="font-bold">{lift.toFixed(2)}x (Strong Positive)</span>
                          </div>
                          <div className="flex justify-between text-[#191919]">
                            <span className="font-medium text-[#77736D]">Support:</span>
                            <span className="font-bold">{(support * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-[10px] text-[#77736D] pt-1.5 border-t border-[#D1CCC4] leading-tight">
                            Citizens visiting {selectedPlace ? selectedPlace.name : 'the source'} have a {(confidence * 100).toFixed(0)}% empirical likelihood of also visiting {place.name}.
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(place);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-[#191919] hover:text-[#F02D25] transition-colors cursor-pointer"
                        >
                          View Details &rarr;
                        </button>

                        <div className="w-8 h-8 rounded-full bg-[#191919] group-hover:bg-[#F02D25] text-white flex items-center justify-center transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#E3DFD7] p-8">
            <Sparkles className="w-10 h-10 text-[#F02D25] mx-auto mb-3" />
            <h4 className="font-display font-bold text-lg text-[#191919] uppercase">
              Select an anchor location
            </h4>
            <p className="text-xs text-[#77736D] mt-1 max-w-md mx-auto">
              Pick one of the anchor places above to compute live Apriori association rules from the smart city database.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
