import React, { useState, useEffect, useMemo } from 'react';
import { Place, CategoryMeta, RecommendationItem } from './types';
import {
  fetchCategories,
  fetchPlaces,
  fetchTrendingPlaces,
  fetchRecommendations,
  performNaturalSearch,
} from './services/api';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { TopBanner } from './components/TopBanner';
import { CategoryFilters } from './components/CategoryFilters';
import { CityMap } from './components/CityMap';
import { SearchAssistant } from './components/SearchAssistant';
import { PlaceCard } from './components/PlaceCard';
import { RecommendationCard } from './components/RecommendationCard';
import { PlaceDetailDrawer } from './components/PlaceDetailDrawer';
import { AlgorithmModal } from './components/AlgorithmModal';
import { Sparkles, MapPin, Bookmark, TrendingUp, AlertCircle, Compass } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [rightPanelTab, setRightPanelTab] = useState<'recommendations' | 'places' | 'saved'>('recommendations');
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [isAlgorithmModalOpen, setIsAlgorithmModalOpen] = useState<boolean>(false);

  // Data states
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [places, setPlaces] = useState<Place[]>([]);
  const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [drawerPlace, setDrawerPlace] = useState<Place | null>(null);
  
  // Apriori Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recNotice, setRecNotice] = useState<string | null>(null);
  const [activeSearchExplanation, setActiveSearchExplanation] = useState<string | null>(null);

  // User location & saved places
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(() => {
    try {
      const stored = localStorage.getItem('blr_saved_places');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Loading states
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Save places to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('blr_saved_places', JSON.stringify(savedPlaces));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedPlaces]);

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, plcs, trnd] = await Promise.all([
          fetchCategories(),
          fetchPlaces({ limit: 80 }),
          fetchTrendingPlaces('All', 10),
        ]);
        setCategories(cats);
        setPlaces(plcs);
        setTrendingPlaces(trnd);

        // Default to Cubbon Park (blr_tour_01) to immediately demonstrate Apriori mining!
        const defaultPlace = plcs.find((p) => p.place_id === 'blr_tour_01') || plcs[0];
        if (defaultPlace) {
          handleSelectPlace(defaultPlace, false);
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setIsLoadingPlaces(false);
      }
    };
    init();
  }, []);

  // Handle Category Selection
  const handleCategorySelect = async (catName: string) => {
    setSelectedCategory(catName);
    setIsLoadingPlaces(true);
    try {
      const filtered = await fetchPlaces({
        category: catName,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
        limit: 80,
      });
      setPlaces(filtered);

      const trending = await fetchTrendingPlaces(catName, 8);
      setTrendingPlaces(trending);

      // If user filtered by category, pick top place in category for recommendations
      if (filtered.length > 0) {
        handleSelectPlace(filtered[0], false);
      }
    } catch (err) {
      console.error('Error filtering category:', err);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // Handle Marker or Place Selection
  const handleSelectPlace = async (place: Place, openDrawer = false) => {
    setSelectedPlace(place);
    if (openDrawer) {
      setDrawerPlace(place);
    }

    setIsLoadingRecs(true);
    setRecNotice(null);
    try {
      const res = await fetchRecommendations(place.place_id, userLocation?.lat, userLocation?.lng);
      setRecommendations(res.recommendations || []);
      setRecNotice(res.notice || null);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Handle Natural Language Search
  const handleNaturalSearch = async (query: string) => {
    setIsSearching(true);
    setActiveSearchExplanation(null);
    try {
      const res = await performNaturalSearch(query, userLocation?.lat, userLocation?.lng);
      if (res.matched_places && res.matched_places.length > 0) {
        setPlaces(res.matched_places);
        setSelectedPlace(res.matched_places[0]);
      }
      if (res.apriori_recommendations && res.apriori_recommendations.length > 0) {
        setRecommendations(res.apriori_recommendations);
        setRightPanelTab('recommendations');
      } else if (res.matched_places.length > 0) {
        // Query recommendations for first matched place
        handleSelectPlace(res.matched_places[0]);
      }
      setActiveSearchExplanation(res.explanation);
      if (res.notice) {
        setRecNotice(res.notice);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Save / Bookmark Place
  const handleSavePlace = (place: Place) => {
    setSavedPlaces((prev) => {
      const exists = prev.some((p) => p.place_id === place.place_id);
      if (exists) {
        return prev.filter((p) => p.place_id !== place.place_id);
      } else {
        return [...prev, place];
      }
    });
  };

  const isPlaceSaved = (placeId: string) => savedPlaces.some((p) => p.place_id === placeId);

  // Geolocation
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          // Re-sort places by proximity
          if (selectedCategory) {
            handleCategorySelect(selectedCategory);
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
          alert('Location access was denied. You can still explore all places in Bengaluru manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Switch tabs from sidebar
  const handleSidebarTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'saved') {
      setRightPanelTab('saved');
    } else if (tabId === 'recommendations') {
      setRightPanelTab('recommendations');
    } else if (tabId === 'explore') {
      setRightPanelTab('places');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#E7EBEF] p-2 md:p-3.5 antialiased font-sans">
      {/* Outer App Rounded Container */}
      <div className="flex flex-1 rounded-[24px] bg-white overflow-hidden shadow-xl border border-[#E8EBF0]">
        {/* Left Vertical Slim Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSidebarTabChange}
          savedCount={savedPlaces.length}
          onOpenAlgorithmModal={() => setIsAlgorithmModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar Navigation */}
          <Topbar
            currentCity="Bengaluru, India"
            savedCount={savedPlaces.length}
            onOpenSaved={() => setRightPanelTab('saved')}
            onOpenAlgorithm={() => setIsAlgorithmModalOpen(true)}
          />

          {/* Split 2-Column Discovery Interface */}
          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3.5 gap-3.5 bg-[#F8FAFC]">
            {/* CENTRE SECTION: Interactive Leaflet Map (~53% desktop width) */}
            <section className="flex-[53] flex flex-col min-h-[360px] lg:min-h-0 relative rounded-2xl overflow-hidden bg-white border border-[#E8EBF0] shadow-xs">
              {/* The Map occupies the container */}
              <div className="flex-1 w-full h-full relative">
                <CityMap
                  places={places}
                  selectedPlace={selectedPlace}
                  onSelectPlace={(p) => handleSelectPlace(p, false)}
                  onSavePlace={handleSavePlace}
                  isPlaceSaved={isPlaceSaved}
                  userLocation={userLocation}
                  onLocateMe={handleLocateMe}
                  onViewDetails={(p) => setDrawerPlace(p)}
                />

                {/* Floating AI Search Assistant placed at bottom of map */}
                <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-xl mx-auto">
                  <SearchAssistant
                    onSearch={handleNaturalSearch}
                    isLoading={isSearching}
                  />
                </div>
              </div>
            </section>

            {/* RIGHT DISCOVERY PANEL: (~47% desktop width) */}
            <section className="flex-[47] flex flex-col min-h-0 rounded-2xl bg-white border border-[#E8EBF0] p-4 shadow-xs overflow-hidden">
              {/* Top Promotional Banner (Dismissible) */}
              {showBanner && (
                <TopBanner
                  onDismiss={() => setShowBanner(false)}
                  onExploreClick={() => {
                    handleCategorySelect('Tourism');
                    setRightPanelTab('places');
                  }}
                />
              )}

              {/* Horizontal Category Filters */}
              <div className="mb-3 shrink-0">
                <CategoryFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                />
              </div>

              {/* Search Result Feedback Bar */}
              {activeSearchExplanation && (
                <div className="mb-3 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shrink-0">
                  <span className="font-medium truncate">{activeSearchExplanation}</span>
                  <button
                    onClick={() => setActiveSearchExplanation(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold shrink-0 ml-2"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Discovery View Tabs */}
              <div className="flex items-center justify-between border-b border-[#E8EBF0] pb-2.5 mb-3 shrink-0">
                <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
                  <button
                    onClick={() => setRightPanelTab('recommendations')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rightPanelTab === 'recommendations'
                        ? 'bg-white text-[#5681EB] shadow-xs'
                        : 'text-[#777F8B] hover:text-[#171B24]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recommendations</span>
                    {recommendations.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#5681EB]/10 text-[#3F6FDB]">
                        {recommendations.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setRightPanelTab('places')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rightPanelTab === 'places'
                        ? 'bg-white text-[#5681EB] shadow-xs'
                        : 'text-[#777F8B] hover:text-[#171B24]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Places</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 text-slate-700">
                      {places.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setRightPanelTab('saved')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rightPanelTab === 'saved'
                        ? 'bg-white text-[#5681EB] shadow-xs'
                        : 'text-[#777F8B] hover:text-[#171B24]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved</span>
                    {savedPlaces.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#5681EB] text-white">
                        {savedPlaces.length}
                      </span>
                    )}
                  </button>
                </div>

                {selectedPlace && (
                  <span className="text-[11px] text-[#777F8B] hidden sm:inline truncate max-w-[140px]">
                    Focus: <strong className="text-[#171B24]">{selectedPlace.name}</strong>
                  </span>
                )}
              </div>

              {/* Scrollable Cards Feed */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* 1. RECOMMENDATIONS TAB */}
                {rightPanelTab === 'recommendations' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#171B24]">
                            For You in Bengaluru
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-[#5681EB]/10 text-[#3F6FDB] text-[10px] font-bold">
                            Apriori Mined
                          </span>
                        </div>
                        {selectedPlace && (
                          <span className="text-[11px] text-[#777F8B]">
                            Based on {selectedPlace.name}
                          </span>
                        )}
                      </div>

                      {/* Insufficient Association Notice Fallback */}
                      {recNotice && (
                        <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="leading-snug">{recNotice}</p>
                        </div>
                      )}

                      {isLoadingRecs ? (
                        <div className="py-12 text-center text-xs text-[#777F8B]">
                          Generating intelligent association rules...
                        </div>
                      ) : recommendations.length > 0 ? (
                        <div className="space-y-3">
                          {recommendations.map((rec, idx) => (
                            <RecommendationCard
                              key={idx}
                              item={rec}
                              isSelected={selectedPlace?.place_id === rec.place.place_id}
                              isSaved={isPlaceSaved(rec.place.place_id)}
                              onSelect={(p) => handleSelectPlace(p, false)}
                              onSave={handleSavePlace}
                              onViewDetails={(p) => setDrawerPlace(p)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-[#777F8B] bg-slate-50 rounded-2xl border border-dashed border-[#E8EBF0]">
                          Select a place on the map to view intelligent association recommendations.
                        </div>
                      )}
                    </div>

                    {/* Trending Section */}
                    {trendingPlaces.length > 0 && (
                      <div className="pt-3 border-t border-[#E8EBF0]">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                            <h3 className="font-bold text-sm text-[#171B24]">
                              Trending in Bengaluru
                            </h3>
                          </div>
                          <span className="text-[10px] text-[#777F8B]">
                            From mobility dataset counts
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {trendingPlaces.slice(0, 4).map((place) => (
                            <PlaceCard
                              key={place.place_id}
                              place={place}
                              isSelected={selectedPlace?.place_id === place.place_id}
                              isSaved={isPlaceSaved(place.place_id)}
                              onSelect={(p) => handleSelectPlace(p, false)}
                              onSave={handleSavePlace}
                              onViewDetails={(p) => setDrawerPlace(p)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PLACES TAB */}
                {rightPanelTab === 'places' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-[#171B24]">
                        Bengaluru Places ({places.length})
                      </h3>
                      <span className="text-xs text-[#777F8B]">
                        Domain: {selectedCategory}
                      </span>
                    </div>

                    {isLoadingPlaces ? (
                      <div className="py-12 text-center text-xs text-[#777F8B]">
                        Loading Bengaluru smart city locations...
                      </div>
                    ) : places.length > 0 ? (
                      places.map((place) => (
                        <PlaceCard
                          key={place.place_id}
                          place={place}
                          isSelected={selectedPlace?.place_id === place.place_id}
                          isSaved={isPlaceSaved(place.place_id)}
                          onSelect={(p) => handleSelectPlace(p, false)}
                          onSave={handleSavePlace}
                          onViewDetails={(p) => setDrawerPlace(p)}
                        />
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-[#777F8B]">
                        No places found matching your filter.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SAVED PLACES TAB */}
                {rightPanelTab === 'saved' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-[#171B24]">
                        Saved Places ({savedPlaces.length})
                      </h3>
                      <span className="text-xs text-[#777F8B]">
                        Stored in browser
                      </span>
                    </div>

                    {savedPlaces.length > 0 ? (
                      savedPlaces.map((place) => (
                        <PlaceCard
                          key={place.place_id}
                          place={place}
                          isSelected={selectedPlace?.place_id === place.place_id}
                          isSaved={true}
                          onSelect={(p) => handleSelectPlace(p, false)}
                          onSave={handleSavePlace}
                          onViewDetails={(p) => setDrawerPlace(p)}
                        />
                      ))
                    ) : (
                      <div className="py-16 text-center text-xs text-[#777F8B] bg-slate-50 rounded-2xl border border-dashed border-[#E8EBF0] p-6">
                        <Bookmark className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                        <p className="font-semibold text-[#171B24]">No saved places yet</p>
                        <p className="text-[11px] text-[#777F8B] mt-1">
                          Click the bookmark icon on any place card or marker to save your favorite destinations!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Place Detail Side Drawer */}
      <PlaceDetailDrawer
        place={drawerPlace}
        onClose={() => setDrawerPlace(null)}
        onSavePlace={handleSavePlace}
        isSaved={drawerPlace ? isPlaceSaved(drawerPlace.place_id) : false}
        onSelectPlace={(p) => {
          handleSelectPlace(p, true);
        }}
        userLocation={userLocation}
      />

      {/* Apriori Algorithm Inspector Modal */}
      <AlgorithmModal
        isOpen={isAlgorithmModalOpen}
        onClose={() => setIsAlgorithmModalOpen(false)}
        onRetrained={() => {
          if (selectedPlace) {
            handleSelectPlace(selectedPlace, false);
          }
        }}
      />
    </div>
  );
};
