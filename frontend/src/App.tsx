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
import { MapAssistantPage } from './components/MapAssistantPage';
import { CategoryFilters } from './components/CategoryFilters';
import { CategoryGrid } from './components/CategoryGrid';
import { DomainDetailPage } from './components/DomainDetailPage';
import { TrendingSection } from './components/TrendingSection';
import { SavedPlacesSection } from './components/SavedPlacesSection';
import { FriendsSection } from './components/FriendsSection';
import { PlaceCard } from './components/PlaceCard';
import { RecommendationCard } from './components/RecommendationCard';
import { PlaceDetailDrawer } from './components/PlaceDetailDrawer';
import {
  Sparkles,
  MapPin,
  Bookmark,
  AlertCircle,
  Loader2,
  X,
  Check
} from 'lucide-react';

interface ToastData {
  id: string;
  message: string;
  placeName?: string;
  type: 'saved' | 'removed';
}

const VALID_PAGES: PageId[] = [
  'discover',
  'map',
  'assistant',
  'trending',
  'domains',
  'domain-detail',
  'friends',
  'saved',
];

const DOMAIN_SLUGS: Record<string, string> = {
  healthcare: 'Healthcare',
  transportation: 'Transportation',
  tourism: 'Tourism',
  shopping: 'Shopping',
  education: 'Education',
  entertainment: 'Entertainment',
  restaurants: 'Restaurants',
  startups: 'Startups',
};

const PAGE_TITLES: Record<PageId, string> = {
  discover: 'Bango — Smart City Discovery & Apriori Intelligence',
  map: 'Map Explorer — Bango Bengaluru',
  assistant: 'AI Search Assistant — Bango Bengaluru',
  trending: 'Trending Hotspots — Bango Bengaluru',
  domains: 'Explore Domains — Bango Bengaluru',
  'domain-detail': 'Sector Details — Bango Bengaluru',
  friends: 'Friends & Circles — Bango Bengaluru',
  saved: 'Saved Places — Bango Bengaluru',
};

interface InitialRoute {
  page: PageId;
  domain: string | null;
}

const getInitialRoute = (): InitialRoute => {
  if (typeof window === 'undefined') return { page: 'discover', domain: null };

  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const segments = path.split('/').filter(Boolean);

  // 1. Check /domains/:slug or /domain/:slug
  if (segments[0] === 'domains' || segments[0] === 'domain') {
    if (segments[1] && DOMAIN_SLUGS[segments[1]]) {
      return { page: 'domain-detail', domain: DOMAIN_SLUGS[segments[1]] };
    }
    return { page: 'domains', domain: null };
  }

  // 2. Direct slug: /healthcare etc.
  if (segments[0] && DOMAIN_SLUGS[segments[0]]) {
    return { page: 'domain-detail', domain: DOMAIN_SLUGS[segments[0]] };
  }

  // 3. Known page routes
  if (segments[0] && VALID_PAGES.includes(segments[0] as PageId)) {
    return { page: segments[0] as PageId, domain: null };
  }

  // 4. Hash fallback (#/domains/healthcare or #/map)
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const hashSegments = hash.split('/').filter(Boolean);
  if (hashSegments[0] === 'domains' || hashSegments[0] === 'domain') {
    if (hashSegments[1] && DOMAIN_SLUGS[hashSegments[1]]) {
      return { page: 'domain-detail', domain: DOMAIN_SLUGS[hashSegments[1]] };
    }
    return { page: 'domains', domain: null };
  }
  if (hashSegments[0] && DOMAIN_SLUGS[hashSegments[0]]) {
    return { page: 'domain-detail', domain: DOMAIN_SLUGS[hashSegments[0]] };
  }
  if (hashSegments[0] && VALID_PAGES.includes(hashSegments[0] as PageId)) {
    return { page: hashSegments[0] as PageId, domain: null };
  }

  // 5. Query param (?domain=healthcare or ?page=map)
  const queryDomain = new URLSearchParams(window.location.search).get('domain')?.toLowerCase();
  if (queryDomain && DOMAIN_SLUGS[queryDomain]) {
    return { page: 'domain-detail', domain: DOMAIN_SLUGS[queryDomain] };
  }
  const queryPage = new URLSearchParams(window.location.search).get('page')?.toLowerCase();
  if (queryPage && VALID_PAGES.includes(queryPage as PageId)) {
    return { page: queryPage as PageId, domain: null };
  }

  // 6. Session storage fallback
  try {
    const savedPage = sessionStorage.getItem('blr_active_page') as PageId;
    const savedDomain = sessionStorage.getItem('blr_active_domain');
    if (savedPage === 'domain-detail' && savedDomain) {
      return { page: 'domain-detail', domain: savedDomain };
    }
    if (savedPage && VALID_PAGES.includes(savedPage)) {
      return { page: savedPage, domain: null };
    }
  } catch (e) {
    // ignore
  }

  return { page: 'discover', domain: null };
};

export const App: React.FC = () => {
  // Page Routing & Navigation (URL synced & persistent across refresh)
  const initialRoute = getInitialRoute();
  const [currentPage, setCurrentPage] = useState<PageId>(initialRoute.page);
  const [selectedDomain, setSelectedDomain] = useState<string>(initialRoute.domain || 'Healthcare');

  // Data states
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [places, setPlaces] = useState<Place[]>([]);
  const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [singleFocusedPlace, setSingleFocusedPlace] = useState<Place | null>(null);
  const [drawerPlace, setDrawerPlace] = useState<Place | null>(null);

  // Apriori Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recNotice, setRecNotice] = useState<string | null>(null);
  const [activeSearchExplanation, setActiveSearchExplanation] = useState<string | null>(null);

  // User location & saved places
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingSavePlace, setPendingSavePlace] = useState<Place | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, placeName?: string, type: 'saved' | 'removed' = 'saved') => {
    setToast({
      id: Date.now().toString(),
      message,
      placeName,
      type,
    });
  };

  // Auto-dismiss bottom toast after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
    const targetPlace = pendingSavePlace;
    setPendingSavePlace(null);
    setIsAuthModalOpen(false);

    setSavedPlaces((prev) => {
      let updated = [...prev];
      if (user.saved_places && user.saved_places.length > 0 && places.length > 0) {
        const userCloudPlaces = places.filter((p) => user.saved_places?.includes(p.place_id));
        const existingIds = new Set(updated.map((p) => p.place_id));
        const newItems = userCloudPlaces.filter((p) => !existingIds.has(p.place_id));
        updated = [...updated, ...newItems];
      }
      if (targetPlace) {
        if (!updated.some((p) => p.place_id === targetPlace.place_id)) {
          updated.push(targetPlace);
        }
      }
      if (user.email) {
        syncUserSavedPlaces(user.email, updated.map((p) => p.place_id));
      }
      return updated;
    });

    if (targetPlace) {
      showToast('Saved to your collection!', targetPlace.name, 'saved');
    }
  };

  // Centralized page navigation handler with HTML5 History API integration
  const navigateToPage = (targetPage: PageId, replace: boolean = false) => {
    // Automatically close any open Location Dossier side panel when switching/exiting pages
    setDrawerPlace(null);

    if (targetPage === currentPage && targetPage !== 'domain-detail') return;

    const targetPath = targetPage === 'discover' ? '/' : `/${targetPage}`;
    if (replace) {
      window.history.replaceState({ page: targetPage, domain: null }, '', targetPath);
    } else {
      window.history.pushState({ page: targetPage, domain: null }, '', targetPath);
    }

    document.title = PAGE_TITLES[targetPage] || 'Bango — Smart City Discovery';

    try {
      sessionStorage.setItem('blr_active_page', targetPage);
      sessionStorage.removeItem('blr_active_domain');
    } catch (e) {
      // ignore
    }

    setCurrentPage(targetPage);
  };

  // Dedicated navigation to an individual domain page (Healthcare, Transportation, etc.)
  const navigateToDomainPage = (domainName: string, replace: boolean = false) => {
    // Automatically close any open Location Dossier side panel when navigating to another domain
    setDrawerPlace(null);

    const slug = domainName.toLowerCase();
    const targetPath = `/domains/${slug}`;

    if (replace) {
      window.history.replaceState({ page: 'domain-detail', domain: domainName }, '', targetPath);
    } else {
      window.history.pushState({ page: 'domain-detail', domain: domainName }, '', targetPath);
    }

    document.title = `${domainName} — Bango Bengaluru Domains`;

    try {
      sessionStorage.setItem('blr_active_page', 'domain-detail');
      sessionStorage.setItem('blr_active_domain', domainName);
    } catch (e) {
      // ignore
    }

    setSelectedDomain(domainName);
    setCurrentPage('domain-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatically slide the side panel in / close whenever exiting a page or domain
  useEffect(() => {
    setDrawerPlace(null);
  }, [currentPage, selectedDomain]);

  // Sync initial URL, History state & Title on mount
  useEffect(() => {
    const route = getInitialRoute();
    let targetPath = route.page === 'discover' ? '/' : `/${route.page}`;
    if (route.page === 'domain-detail' && route.domain) {
      targetPath = `/domains/${route.domain.toLowerCase()}`;
      document.title = `${route.domain} — Bango Bengaluru Domains`;
    } else {
      document.title = PAGE_TITLES[route.page] || 'Bango — Smart City Discovery';
    }

    if (window.location.pathname !== targetPath && !window.location.pathname.startsWith('/api')) {
      window.history.replaceState({ page: route.page, domain: route.domain }, '', targetPath);
    } else if (!window.history.state || window.history.state.page !== route.page) {
      window.history.replaceState({ page: route.page, domain: route.domain }, '', window.location.pathname || targetPath);
    }

    try {
      sessionStorage.setItem('blr_active_page', route.page);
      if (route.domain) sessionStorage.setItem('blr_active_domain', route.domain);
    } catch (e) {
      // ignore
    }
  }, []);

  // Handle browser popstate (Back & Forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Automatically close any open Location Dossier side panel on back/forward navigation
      setDrawerPlace(null);

      const statePage = event.state?.page;
      const stateDomain = event.state?.domain;

      let targetPage: PageId = 'discover';
      let targetDomain: string | null = null;

      if (statePage && VALID_PAGES.includes(statePage)) {
        targetPage = statePage;
        targetDomain = stateDomain || null;
      } else {
        const route = getInitialRoute();
        targetPage = route.page;
        targetDomain = route.domain;
      }

      if (targetDomain) {
        setSelectedDomain(targetDomain);
      }

      document.title = targetPage === 'domain-detail' && targetDomain
        ? `${targetDomain} — Bango Bengaluru Domains`
        : PAGE_TITLES[targetPage] || 'Bango — Smart City Discovery';

      setCurrentPage(targetPage);

      try {
        sessionStorage.setItem('blr_active_page', targetPage);
        if (targetDomain) sessionStorage.setItem('blr_active_domain', targetDomain);
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle hardware mouse Back & Forward buttons (buttons 3 and 4)
  useEffect(() => {
    const handleMouseNav = (e: MouseEvent) => {
      // Button 3: Mouse thumb back button
      // Button 4: Mouse thumb forward button
      if (e.button === 3) {
        e.preventDefault();
        window.history.back();
      } else if (e.button === 4) {
        e.preventDefault();
        window.history.forward();
      }
    };

    window.addEventListener('mouseup', handleMouseNav);
    return () => window.removeEventListener('mouseup', handleMouseNav);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    if (currentPage === 'saved') {
      navigateToPage('discover');
    }
  };

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, plcs, trnd] = await Promise.all([
          fetchCategories(),
          fetchPlaces({ limit: 100 }),
          fetchTrendingPlaces('All', 100),
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
    setSingleFocusedPlace(null);
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
      navigateToPage('map');
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
    setSingleFocusedPlace(null);
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
      } else if (res.matched_places.length > 0) {
        handleSelectPlace(res.matched_places[0]);
      }
      setActiveSearchExplanation(res.explanation);
      if (res.notice) {
        setRecNotice(res.notice);
      }
      // Switch directly to map page so user sees results immediately
      navigateToPage('map');
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
    // If user has not signed in with Google, prompt sign-in / sign-up popup!
    if (!currentUser) {
      setPendingSavePlace(place);
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = savedPlaces.some((p) => p.place_id === place.place_id);
    if (isCurrentlySaved) {
      const nextSaved = savedPlaces.filter((p) => p.place_id !== place.place_id);
      setSavedPlaces(nextSaved);
      showToast('Removed from your saved places', place.name, 'removed');
      if (currentUser?.email) {
        syncUserSavedPlaces(currentUser.email, nextSaved.map((p) => p.place_id));
      }
    } else {
      const nextSaved = [...savedPlaces, place];
      setSavedPlaces(nextSaved);
      showToast('Saved to your places!', place.name, 'saved');
      if (currentUser?.email) {
        syncUserSavedPlaces(currentUser.email, nextSaved.map((p) => p.place_id));
      }
    }
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
    <div className="min-h-screen w-full bg-[#ECE9E2] text-[#191919] font-sans antialiased flex flex-col selection:bg-[#F02D25] selection:text-white">

      {/* 1. PERSISTENT NAVIGATION HEADER */}
      <Header
        currentPage={currentPage}
        currentDomain={selectedDomain}
        onSelectPage={(page) => {
          if (page === 'map') {
            setSingleFocusedPlace(null);
          }
          navigateToPage(page);
        }}
        onSelectDomainPage={(domain) => navigateToDomainPage(domain)}
        savedCount={savedPlaces.length}
        savedPlaces={savedPlaces}
        onSelectCategory={(cat) => {
          setSingleFocusedPlace(null);
          handleCategorySelect(cat);
          navigateToPage('map');
        }}
        onSelectPlace={(p) => {
          setSingleFocusedPlace(p);
          handleSelectPlace(p, true);
        }}
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
            onExploreMap={() => navigateToPage('map')}
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
                Explore destinations, transit hubs, and curated smart city locations across Bengaluru
              </span>
            </div>
          </div>

          {/* 65 / 35 Responsive Grid Layout - Locked to remaining screen height (flex-1 min-h-0) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 min-h-0 overflow-hidden">

            {/* LEFT: 65% Interactive Leaflet Map (8 cols) - 100% Height of Screen */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm bg-white relative">
              <div className="flex-1 w-full h-full relative min-h-0">
                <CityMap
                  places={places}
                  selectedPlace={selectedPlace}
                  focusedPlace={singleFocusedPlace}
                  onClearFocus={() => setSingleFocusedPlace(null)}
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
              <div className="mb-2 shrink-0 min-w-0 w-full">
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

              {/* 3. INDEPENDENT SCROLLABLE FEED OF PLACES */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 pt-1">
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
                  <div className="py-16 text-center text-xs text-[#77736D] bg-[#ECE9E2] rounded-2xl border border-dashed border-[#E3DFD7] p-6">
                    <p className="font-bold text-[#191919] uppercase">No places found</p>
                    <p className="text-[11px] text-[#77736D] mt-1">
                      Try selecting another category from the filters above.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PAGE: NATURAL SEARCH ASSISTANT WITH FULL MAP & BOTTOM CHATBOT */}
      {currentPage === 'assistant' && (
        <MapAssistantPage
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => handleSelectPlace(p, false)}
          onSavePlace={handleSavePlace}
          isPlaceSaved={isPlaceSaved}
          userLocation={userLocation}
          onLocateMe={handleLocateMe}
          onViewDetails={(p) => setDrawerPlace(p)}
        />
      )}

      {/* PAGE 3: TRENDING */}
                              {currentPage === 'trending' && (
                                <TrendingSection
                                  places={trendingPlaces && trendingPlaces.length >= 30 ? trendingPlaces : places}
                                  allPlaces={places}
                                  onSelectPlace={(p) => {
                                    setSingleFocusedPlace(p);
                                    handleSelectPlace(p, true);
                                  }}
                                  onExploreOnMap={(place) => {
                                    setSingleFocusedPlace(place);
                                    handleSelectPlace(place, true);
                                  }}
                                  onSavePlace={handleSavePlace}
                                  isPlaceSaved={isPlaceSaved}
                                  onViewDetails={(p) => setDrawerPlace(p)}
                                  onNavigateToMap={() => {
                                    setSingleFocusedPlace(null);
                                    navigateToPage('map');
                                  }}
                                />
                              )}

                              {/* PAGE 4: DOMAINS (ALL 8 SECTORS OVERVIEW) */}
                              {currentPage === 'domains' && (
                                <CategoryGrid
                                  categories={categories}
                                  onSelectCategory={(catName) => {
                                    handleCategorySelect(catName);
                                    navigateToPage('map');
                                  }}
                                  onSelectDomainPage={(domainName) => navigateToDomainPage(domainName)}
                                  onNavigateToMap={() => navigateToPage('map')}
                                />
                              )}

                              {/* PAGE 4.5: INDIVIDUAL DOMAIN PAGE (Healthcare, Tourism, etc.) */}
                              {currentPage === 'domain-detail' && (
                                <DomainDetailPage
                                  domainName={selectedDomain}
                                  places={places}
                                  onSelectDomain={(d) => navigateToDomainPage(d)}
                                  onExploreOnMap={(place) => {
                                    setSingleFocusedPlace(place);
                                    handleSelectPlace(place, true);
                                  }}
                                  onExploreDomainOnMap={(domain) => {
                                    setSingleFocusedPlace(null);
                                    handleCategorySelect(domain);
                                    navigateToPage('map');
                                  }}
                                  onViewDetails={(place) => setDrawerPlace(place)}
                                  onSavePlace={handleSavePlace}
                                  isPlaceSaved={isPlaceSaved}
                                  onBackToAllDomains={() => navigateToPage('domains')}
                                />
                              )}

                              {/* PAGE 4.75: FRIENDS DISCOVERY & CIRCLES */}
                              {currentPage === 'friends' && (
                                <FriendsSection
                                  places={places}
                                  onSelectPlace={(place) => {
                                    setSingleFocusedPlace(place);
                                    handleSelectPlace(place, true);
                                  }}
                                  onSavePlace={handleSavePlace}
                                  isPlaceSaved={isPlaceSaved}
                                  onViewDetails={(place) => setDrawerPlace(place)}
                                  onNavigateToMap={() => {
                                    setSingleFocusedPlace(null);
                                    navigateToPage('map');
                                  }}
                                  onShowToast={showToast}
                                  user={currentUser}
                                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                                />
                              )}

                              {/* PAGE 5: SAVED PLACES */}
                              {currentPage === 'saved' && (
                                <SavedPlacesSection
                                  savedPlaces={savedPlaces}
                                  onSelectPlace={(p) => {
                                    setSingleFocusedPlace(p);
                                    handleSelectPlace(p, true);
                                  }}
                                  onRemovePlace={handleSavePlace}
                                  onViewDetails={(p) => setDrawerPlace(p)}
                                  onNavigateToMap={() => {
                                    setSingleFocusedPlace(null);
                                    navigateToPage('map');
                                  }}
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
                                setSingleFocusedPlace(p);
                                handleSelectPlace(p, true);
                                setDrawerPlace(null);
                              }}
                              userLocation={userLocation}
                              onShowToast={showToast}
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

                            {/* Small Bottom Pop Up (Toast) */}
                            {toast && (
                              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
                                <div className="bg-[#191919] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    toast.type === 'saved' ? 'bg-[#F02D25] text-white' : 'bg-white/15 text-white'
                                  }`}>
                                    {toast.type === 'saved' ? (
                                      <Bookmark className="w-4 h-4 fill-current" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-xs font-bold truncate text-white">
                                      {toast.placeName || 'Location'}
                                    </p>
                                    <p className="text-[11px] text-[#A8A29E] truncate">
                                      {toast.message}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => {
                                        navigateToPage('saved');
                                        setToast(null);
                                      }}
                                      className="text-[11px] font-bold uppercase tracking-wider text-white hover:text-[#F02D25] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => setToast(null)}
                                      className="p-1 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                                      title="Dismiss"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          );
};
