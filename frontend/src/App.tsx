import React, { useState, useEffect } from 'react';
import { Place, CategoryMeta, RecommendationItem } from './types';
import {
  fetchCategories,
  fetchPlaces,
  fetchTrendingPlaces,
  fetchRecommendations,
  performNaturalSearch,
} from './services/api';
import { Header, PageId } from './components/Header';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AuthUser, getStoredUser, clearStoredUser, syncUserSavedPlaces } from './services/auth';
import { HeroSection } from './components/HeroSection';
import { CityMap } from './components/CityMap';
import { CategoryFilters } from './components/CategoryFilters';
import { CategoryGrid } from './components/CategoryGrid';
import { TrendingSection } from './components/TrendingSection';
import { SavedPlacesSection } from './components/SavedPlacesSection';
import { PlaceCard } from './components/PlaceCard';
import { RecommendationCard } from './components/RecommendationCard';
import { PlaceDetailDrawer } from './components/PlaceDetailDrawer';
import {
  Sparkles,
  MapPin,
  Bookmark,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const App: React.FC = () => {
  // Page Routing & Navigation
  const [currentPage, setCurrentPage] = useState<PageId>('discover');
  const [rightPanelTab, setRightPanelTab] = useState<'recommendations' | 'places' | 'saved'>('recommendations');

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingSavePlace, setPendingSavePlace] = useState<Place | null>(null);
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
      if (currentUser?.email) {
        syncUserSavedPlaces(currentUser.email, savedPlaces.map((p) => p.place_id));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedPlaces, currentUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setSavedPlaces((prev) => {
      let updated = [...prev];
      if (user.saved_places && user.saved_places.length > 0 && places.length > 0) {
        const userCloudPlaces = places.filter((p) => user.saved_places?.includes(p.place_id));
        const existingIds = new Set(updated.map((p) => p.place_id));
        const newItems = userCloudPlaces.filter((p) => !existingIds.has(p.place_id));
        updated = [...updated, ...newItems];
      }
      if (pendingSavePlace) {
        if (!updated.some((p) => p.place_id === pendingSavePlace.place_id)) {
          updated.push(pendingSavePlace);
        }
        setPendingSavePlace(null);
      }
      return updated;
    });
  };

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    if (currentPage === 'saved') {
      setCurrentPage('discover');
    }
  };

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

  // Handle Place Selection
  const handleSelectPlace = async (place: Place, shouldScrollToMap = false) => {
    setSelectedPlace(place);
    if (shouldScrollToMap) {
      setCurrentPage('map');
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

  // Plan Your Day Itinerary Search
  const handlePlanYourDay = () => {
    handleNaturalSearch('Curated full day smart city itinerary: morning heritage walk & filter coffee, afternoon lakeside stroll, evening craft brewery & dining');
  };

  // Save / Bookmark Place
  const handleSavePlace = (place: Place) => {
    // If user has not signed in with Google, prompt sign-in popup!
    if (!currentUser) {
      setPendingSavePlace(place);
      setIsAuthModalOpen(true);
      return;
    }

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
    <div className="min-h-screen w-full bg-[#F5F3EE] text-[#191919] font-sans antialiased flex flex-col selection:bg-[#F02D25] selection:text-white">

      {/* 1. PERSISTENT NAVIGATION HEADER */}
      <Header
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        savedCount={savedPlaces.length}
        savedPlaces={savedPlaces}
        onSelectCategory={(cat) => {
          handleCategorySelect(cat);
          setCurrentPage('map');
        }}
        onSelectPlace={(p) => handleSelectPlace(p, true)}
        user={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. DEDICATED PAGE VIEWS */}
      <main className="flex-1 min-w-0 w-full">

        {/* PAGE 1: DISCOVER */}
        {currentPage === 'discover' && (
          <HeroSection
            onSearch={handleNaturalSearch}
            isSearching={isSearching}
            onExploreMap={() => setCurrentPage('map')}
            onPlanDay={handlePlanYourDay}
          />
        )}

        {/* PAGE 2: MAP EXPLORER - Fits 100% in viewport without outer scrolling */}
      {currentPage === 'map' && (
        <div className="w-full h-[calc(100vh-80px)] bg-[#ECE9E2] flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-3.5 overflow-hidden">
          
          {/* Top Heading Bar (shrink-0) */}
          <div className="flex items-center justify-between gap-4 mb-2 sm:mb-2.5 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F02D25] shrink-0"></span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#191919] tracking-tight leading-none whitespace-nowrap">
                bengaluru map explorer.
              </h2>
              <span className="hidden md:inline text-xs sm:text-sm text-[#77736D] font-normal border-l border-[#D1CCC4] pl-3 truncate">
                Click any marker on the map to focus & compute live recommendations
              </span>
            </div>

            {selectedPlace && (
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#E3DFD7] text-xs shrink-0 shadow-xs">
                <span className="text-[#77736D] text-[11px] uppercase font-bold">Active:</span>
                <span className="font-bold text-[#191919] text-sm">{selectedPlace.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F3EE] text-[#F02D25] font-extrabold uppercase">
                  {selectedPlace.category}
                </span>
              </div>
            )}
          </div>

          {/* 65 / 35 Responsive Grid Layout - Locked to remaining screen height (flex-1 min-h-0) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 min-h-0 overflow-hidden">

            {/* LEFT: 65% Interactive Leaflet Map (8 cols) - 100% Height of Screen */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm bg-white relative">
              <div className="flex-1 w-full h-full relative min-h-0">
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
              </div>
            </div>

            {/* RIGHT: 35% Editorial Discovery Panel (4 cols) - Fixed Top Controls + Independent Scrollable Feed */}
            <div className="lg:col-span-4 flex flex-col h-full min-h-0 rounded-2xl sm:rounded-3xl bg-white border border-[#E3DFD7] p-3.5 sm:p-4 shadow-sm overflow-hidden">

              {/* 1. FIXED: Category Filter Pills at Top */}
              <div className="mb-2.5 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                    Filter by Domain
                  </span>
                  <span className="text-[10px] text-[#A8A29E] font-medium">
                    {selectedCategory === 'all' ? 'All 8 Domains' : selectedCategory}
                  </span>
                </div>
                <CategoryFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                />
              </div>

              {/* 2. FIXED: Natural Search Explanation Bar (if active) */}
              {activeSearchExplanation && (
                <div className="mb-2.5 px-3 py-1.5 bg-[#F5F3EE] rounded-xl border border-[#E3DFD7] text-xs text-[#191919] flex items-center justify-between shrink-0">
                  <span className="font-semibold truncate text-[11px]">{activeSearchExplanation}</span>
                  <button
                    onClick={() => setActiveSearchExplanation(null)}
                    className="text-[#F02D25] hover:underline text-[10px] font-bold shrink-0 ml-2 uppercase tracking-wider"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* 3. FIXED: View Tabs (For You / Places / Saved) */}
              <div className="flex items-center justify-between border-b border-[#E3DFD7] pb-2 mb-2.5 shrink-0">
                <div className="flex items-center gap-1 bg-[#F5F3EE] p-1 rounded-xl">
                  <button
                    onClick={() => setRightPanelTab('recommendations')}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
                  <span className="text-[10px] text-[#77736D] hidden xl:inline truncate max-w-[120px]">
                    Focus: <strong className="text-[#191919] uppercase">{selectedPlace.name}</strong>
                  </span>
                )}
              </div>

              {/* 4. INDEPENDENT SCROLLABLE FEED OF PLACES / RECOMMENDATIONS */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
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
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#F02D25]" />
                          Mining association rules...
                        </div>
                      ) : recommendations.length > 0 ? (
                        recommendations.map((item) => (
                          <RecommendationCard
                            key={item.place.place_id}
                            item={item}
                            isSelected={selectedPlace?.place_id === item.place.place_id}
                            isSaved={isPlaceSaved(item.place.place_id)}
                            onSelect={(p) => handleSelectPlace(p, false)}
                            onSave={handleSavePlace}
                            onViewDetails={(p) => setDrawerPlace(p)}
                          />
                        ))
                      ) : (
                        <div className="py-16 text-center text-xs text-[#77736D] bg-[#F5F3EE] rounded-2xl border border-dashed border-[#E3DFD7] p-6">
                          <Sparkles className="w-8 h-8 text-[#D1CCC4] mx-auto mb-2" />
                          <p className="font-bold text-[#191919] uppercase">No active associations</p>
                          <p className="text-[11px] text-[#77736D] mt-1">
                            Click other markers on the map to trigger dynamic Apriori basket recommendations.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. PLACES TAB */}
                  {rightPanelTab === 'places' && (
                    <div className="space-y-3">
                      {isLoadingPlaces ? (
                        <div className="py-16 text-center text-xs text-[#77736D]">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#F02D25]" />
                          Loading places...
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
                        <div className="py-16 text-center text-xs text-[#77736D]">
                          No places found in this domain.
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

                              {/* PAGE 5: SAVED PLACES */}
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

                            {/* Place Detail Slide-over Drawer */}
                            <PlaceDetailDrawer
                              place={drawerPlace}
                              onClose={() => setDrawerPlace(null)}
                              onSavePlace={handleSavePlace}
                              isSaved={drawerPlace ? isPlaceSaved(drawerPlace.place_id) : false}
                              onSelectPlace={(p) => {
                                handleSelectPlace(p, true);
                                setDrawerPlace(null);
                              }}
                              userLocation={userLocation}
                            />

                            {/* Google Authentication Modal */}
                            <GoogleAuthModal
                              isOpen={isAuthModalOpen}
                              onClose={() => {
                                setIsAuthModalOpen(false);
                                setPendingSavePlace(null);
                              }}
                              onLoginSuccess={handleLoginSuccess}
                              pendingPlaceName={pendingSavePlace?.name}
                            />
                          </div>
                          );
};
