import React, { useState, useEffect } from 'react';
import { Place, CategoryMeta, RecommendationItem } from './types';
import {
  fetchCategories,
  fetchPlaces,
  fetchTrendingPlaces,
  fetchRecommendations,
  performNaturalSearch,
} from './services/api';
import { Sidebar, PageId } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { HeroSection } from './components/HeroSection';
import { CityMap } from './components/CityMap';
import { SearchAssistant } from './components/SearchAssistant';
import { CategoryFilters } from './components/CategoryFilters';
import { CategoryGrid } from './components/CategoryGrid';
import { TrendingSection } from './components/TrendingSection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SavedPlacesSection } from './components/SavedPlacesSection';
import { Footer } from './components/Footer';
import { PlaceCard } from './components/PlaceCard';
import { RecommendationCard } from './components/RecommendationCard';
import { PlaceDetailDrawer } from './components/PlaceDetailDrawer';
import { AlgorithmModal } from './components/AlgorithmModal';
import {
  Sparkles,
  MapPin,
  Bookmark,
  Compass,
  AlertCircle,
  Map,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const App: React.FC = () => {
  // Page Routing & Navigation
  const [currentPage, setCurrentPage] = useState<PageId>('discover');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<'recommendations' | 'places' | 'saved'>('recommendations');
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

  // Persist saved places to localStorage
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
        handleSelectPlace(res.matched_places[0]);
      }
      setActiveSearchExplanation(res.explanation);
      if (res.notice) {
        setRecNotice(res.notice);
      }
      // Switch directly to map page so user sees results immediately
      setCurrentPage('map');
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

  return (
    <div className="min-h-screen w-full bg-[#F5F3EE] text-[#191919] font-sans antialiased flex flex-col lg:flex-row selection:bg-[#F02D25] selection:text-white">
      
      {/* 1. THEMATIC PERSISTENT SIDEBAR */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          setIsMobileMenuOpen(false);
        }}
        savedCount={savedPlaces.length}
        onOpenAlgorithm={() => setIsAlgorithmModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Mobile Top Navigation Header */}
        <MobileHeader
          currentPage={currentPage}
          savedCount={savedPlaces.length}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSaved={() => setCurrentPage('saved')}
        />

        {/* 3. DEDICATED PAGE VIEWS (SWITCHED VIA SIDEBAR) */}
        <main className="flex-1">
          
          {/* PAGE 1: DISCOVER */}
          {currentPage === 'discover' && (
            <div className="space-y-12">
              <HeroSection
                onSearch={handleNaturalSearch}
                isSearching={isSearching}
                onExploreMap={() => setCurrentPage('map')}
                onOpenAlgorithm={() => setIsAlgorithmModalOpen(true)}
              />

              {/* Discover Overview Feature Row */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E3DFD7]">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F02D25] block mb-1">
                      Quick Portals
                    </span>
                    <h3 className="font-display font-bold text-2xl tracking-tight text-[#191919]">
                      explore bango ecosystem.
                    </h3>
                  </div>
                  <span className="text-xs text-[#77736D] hidden sm:inline">
                    Choose any portal or select from the sidebar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Map Explorer */}
                  <div
                    onClick={() => setCurrentPage('map')}
                    className="group bg-white p-6 rounded-3xl border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[200px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-[#ECE9E2] group-hover:bg-[#F02D25] text-[#191919] group-hover:text-white flex items-center justify-center transition-colors mb-4">
                        <Map className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-tight text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Map Explorer
                      </h4>
                      <p className="text-xs text-[#77736D] mt-1 leading-relaxed">
                        65/35 interactive Leaflet map with red markers, popups & live radius search.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between text-xs font-bold uppercase text-[#F02D25]">
                      <span>Open Map</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 2: Trending */}
                  <div
                    onClick={() => setCurrentPage('trending')}
                    className="group bg-white p-6 rounded-3xl border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[200px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-[#ECE9E2] group-hover:bg-[#F02D25] text-[#191919] group-hover:text-white flex items-center justify-center transition-colors mb-4">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-tight text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        The City Is Talking
                      </h4>
                      <p className="text-xs text-[#77736D] mt-1 leading-relaxed">
                        Top destinations ranked by transactional footfall in Bengaluru mobility data.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between text-xs font-bold uppercase text-[#F02D25]">
                      <span>View Trending</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 3: Domains */}
                  <div
                    onClick={() => setCurrentPage('domains')}
                    className="group bg-white p-6 rounded-3xl border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[200px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-[#ECE9E2] group-hover:bg-[#F02D25] text-[#191919] group-hover:text-white flex items-center justify-center transition-colors mb-4">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-tight text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        8 Urban Domains
                      </h4>
                      <p className="text-xs text-[#77736D] mt-1 leading-relaxed">
                        Healthcare, transport, parks, tech hubs, restaurants & civic assets.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between text-xs font-bold uppercase text-[#F02D25]">
                      <span>Explore Domains</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 4: Apriori AI */}
                  <div
                    onClick={() => setCurrentPage('recommendations')}
                    className="group bg-white p-6 rounded-3xl border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[200px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-[#ECE9E2] group-hover:bg-[#F02D25] text-[#191919] group-hover:text-white flex items-center justify-center transition-colors mb-4">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-tight text-[#191919] group-hover:text-[#F02D25] transition-colors">
                        Apriori AI Engine
                      </h4>
                      <p className="text-xs text-[#77736D] mt-1 leading-relaxed">
                        Uncover high-confidence associative paths with positive lift metrics.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between text-xs font-bold uppercase text-[#F02D25]">
                      <span>Discover Connections</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: MAP EXPLORER */}
          {currentPage === 'map' && (
            <div className="py-10 bg-[#ECE9E2] min-h-[calc(100vh-80px)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F02D25]"></span>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#77736D]">
                        bango &bull; Interactive Geographical Exploration
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#191919] tracking-tight leading-tight">
                      bengaluru map explorer.
                    </h2>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[#77736D] max-w-md font-normal leading-relaxed">
                    Click any red marker on the map to focus that place, view details, and compute live Apriori association recommendations.
                  </p>
                </div>

                {/* 65 / 35 Responsive Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* LEFT: 65% Interactive Leaflet Map (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col min-h-[580px] lg:min-h-[660px] relative rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-lg bg-white">
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

                      {/* Floating Search Assistant in the Map Container */}
                      <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-xl mx-auto">
                        <SearchAssistant
                          onSearch={handleNaturalSearch}
                          isLoading={isSearching}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: 35% Editorial Discovery Panel (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col min-h-[580px] lg:min-h-[660px] rounded-3xl bg-white border border-[#E3DFD7] p-5 shadow-lg overflow-hidden">
                    
                    {/* Category Filter Pills */}
                    <div className="mb-4 shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] block mb-2">
                        Filter by Domain
                      </span>
                      <CategoryFilters
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                      />
                    </div>

                    {/* Natural Search Explanation Bar */}
                    {activeSearchExplanation && (
                      <div className="mb-3 px-3.5 py-2.5 bg-[#F5F3EE] rounded-2xl border border-[#E3DFD7] text-xs text-[#191919] flex items-center justify-between shrink-0">
                        <span className="font-semibold truncate">{activeSearchExplanation}</span>
                        <button
                          onClick={() => setActiveSearchExplanation(null)}
                          className="text-[#F02D25] hover:underline text-[11px] font-bold shrink-0 ml-2 uppercase tracking-wider"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Discovery View Tabs */}
                    <div className="flex items-center justify-between border-b border-[#E3DFD7] pb-3 mb-4 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#F5F3EE] p-1 rounded-2xl">
                        <button
                          onClick={() => setRightPanelTab('recommendations')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            rightPanelTab === 'recommendations'
                              ? 'bg-[#191919] text-white shadow-xs'
                              : 'text-[#77736D] hover:text-[#191919]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#F02D25]" />
                          <span>For You</span>
                          {recommendations.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F02D25] text-white">
                              {recommendations.length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => setRightPanelTab('places')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            rightPanelTab === 'places'
                              ? 'bg-[#191919] text-white shadow-xs'
                              : 'text-[#77736D] hover:text-[#191919]'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Places</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#ECE9E2] text-[#191919]">
                            {places.length}
                          </span>
                        </button>

                        <button
                          onClick={() => setRightPanelTab('saved')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            rightPanelTab === 'saved'
                              ? 'bg-[#191919] text-white shadow-xs'
                              : 'text-[#77736D] hover:text-[#191919]'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Saved</span>
                          {savedPlaces.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F02D25] text-white">
                              {savedPlaces.length}
                            </span>
                          )}
                        </button>
                      </div>

                      {selectedPlace && (
                        <span className="text-[11px] text-[#77736D] hidden sm:inline truncate max-w-[120px]">
                          Focus: <strong className="text-[#191919] uppercase">{selectedPlace.name}</strong>
                        </span>
                      )}
                    </div>

                    {/* Scrollable Feed */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                      {/* 1. RECOMMENDATIONS TAB */}
                      {rightPanelTab === 'recommendations' && (
                        <div className="space-y-3.5">
                          {recNotice && (
                            <div className="p-3 bg-[#ECE9E2] rounded-2xl border border-[#E3DFD7] text-xs text-[#191919] flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-[#F02D25] shrink-0 mt-0.5" />
                              <p className="leading-snug">{recNotice}</p>
                            </div>
                          )}

                          {isLoadingRecs ? (
                            <div className="py-16 text-center text-xs text-[#77736D]">
                              Computing Apriori association paths...
                            </div>
                          ) : recommendations.length > 0 ? (
                            recommendations.map((rec, idx) => (
                              <RecommendationCard
                                key={idx}
                                item={rec}
                                isSelected={selectedPlace?.place_id === rec.place.place_id}
                                isSaved={isPlaceSaved(rec.place.place_id)}
                                onSelect={(p) => handleSelectPlace(p, false)}
                                onSave={handleSavePlace}
                                onViewDetails={(p) => setDrawerPlace(p)}
                              />
                            ))
                          ) : (
                            <div className="py-12 text-center text-xs text-[#77736D] bg-[#F5F3EE] rounded-2xl border border-dashed border-[#E3DFD7] p-4">
                              Select a place on the map to view intelligent association recommendations.
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. PLACES TAB */}
                      {rightPanelTab === 'places' && (
                        <div className="space-y-3">
                          {isLoadingPlaces ? (
                            <div className="py-16 text-center text-xs text-[#77736D]">
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
                            <div className="py-12 text-center text-xs text-[#77736D] bg-[#F5F3EE] rounded-2xl">
                              No places found matching your filter.
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. SAVED TAB */}
                      {rightPanelTab === 'saved' && (
                        <div className="space-y-3">
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
                            <div className="py-16 text-center text-xs text-[#77736D] bg-[#F5F3EE] rounded-2xl border border-dashed border-[#E3DFD7] p-6">
                              <Bookmark className="w-8 h-8 text-[#D1CCC4] mx-auto mb-2" />
                              <p className="font-bold text-[#191919] uppercase">No saved places yet</p>
                              <p className="text-[11px] text-[#77736D] mt-1">
                                Click the bookmark icon on any card to save your favorite destinations!
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* PAGE 3: TRENDING */}
          {currentPage === 'trending' && (
            <TrendingSection
              places={trendingPlaces}
              onSelectPlace={(p) => handleSelectPlace(p, false)}
              onSavePlace={handleSavePlace}
              isPlaceSaved={isPlaceSaved}
              onViewDetails={(p) => setDrawerPlace(p)}
              onNavigateToMap={() => setCurrentPage('map')}
            />
          )}

          {/* PAGE 4: DOMAINS */}
          {currentPage === 'domains' && (
            <CategoryGrid
              categories={categories}
              onSelectCategory={(catName) => {
                handleCategorySelect(catName);
                setCurrentPage('map');
              }}
              onNavigateToMap={() => setCurrentPage('map')}
            />
          )}

          {/* PAGE 5: RECOMMENDATIONS (APRIORI AI) */}
          {currentPage === 'recommendations' && (
            <RecommendationsSection
              recommendations={recommendations}
              selectedPlace={selectedPlace}
              allPlaces={places}
              onSelectPlace={(p) => handleSelectPlace(p, false)}
              onSavePlace={handleSavePlace}
              isPlaceSaved={isPlaceSaved}
              onViewDetails={(p) => setDrawerPlace(p)}
              onOpenAlgorithm={() => setIsAlgorithmModalOpen(true)}
              isLoading={isLoadingRecs}
              notice={recNotice}
              onNavigateToMap={() => setCurrentPage('map')}
            />
          )}

          {/* PAGE 6: HOW IT WORKS */}
          {currentPage === 'how-it-works' && (
            <HowItWorksSection
              onOpenAlgorithm={() => setIsAlgorithmModalOpen(true)}
              onNavigateToMap={() => setCurrentPage('map')}
            />
          )}

          {/* PAGE 7: SAVED PLACES */}
          {currentPage === 'saved' && (
            <SavedPlacesSection
              savedPlaces={savedPlaces}
              onSelectPlace={(p) => handleSelectPlace(p, false)}
              onRemovePlace={handleSavePlace}
              onViewDetails={(p) => setDrawerPlace(p)}
              onNavigateToMap={() => setCurrentPage('map')}
            />
          )}

        </main>

        {/* 4. EDITORIAL FOOTER (HIDDEN ON FIRST / DISCOVER PAGE) */}
        {currentPage !== 'discover' && <Footer onNavigate={(page) => setCurrentPage(page)} />}

      </div>

      {/* Place Detail Side Drawer */}
      <PlaceDetailDrawer
        place={drawerPlace}
        onClose={() => setDrawerPlace(null)}
        onSavePlace={handleSavePlace}
        isSaved={drawerPlace ? isPlaceSaved(drawerPlace.place_id) : false}
        onSelectPlace={(p) => handleSelectPlace(p, true)}
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
