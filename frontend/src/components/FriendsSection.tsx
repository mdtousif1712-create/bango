import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Share2,
  MapPin,
  Sparkles,
  Bookmark,
  ExternalLink,
  Compass,
  ArrowRight,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Calendar,
  Check,
  Search,
  Navigation,
  Coffee,
  Beer,
  Layers,
  Copy
} from 'lucide-react';
import { Place } from '../types';
import { CATEGORY_COLORS } from './CityMap';

interface FriendsSectionProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  onViewDetails: (place: Place) => void;
  onNavigateToMap: () => void;
  onShowToast: (message: string, placeName?: string, type?: 'saved' | 'removed') => void;
}

interface FriendProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  locality: string;
  savedPlacesCount: number;
  favoriteDomain: string;
  status: string;
  recentSavedPlaceId: string;
}

const MOCK_FRIENDS: FriendProfile[] = [
  {
    id: 'f-1',
    name: 'Arjun Mehta',
    handle: '@arjun_blr',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    locality: 'Indiranagar',
    savedPlacesCount: 16,
    favoriteDomain: 'Restaurants',
    status: 'Exploring craft breweries on 100ft Road 🍺',
    recentSavedPlaceId: 'blr_rest_01', // Toit
  },
  {
    id: 'f-2',
    name: 'Priya Rao',
    handle: '@priyarao_arch',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    locality: 'Malleshwaram',
    savedPlacesCount: 22,
    favoriteDomain: 'Tourism',
    status: 'Sketching colonial balconies near Cubbon Park 🌿',
    recentSavedPlaceId: 'blr_tour_01', // Cubbon Park
  },
  {
    id: 'f-3',
    name: 'Karthik Somayaji',
    handle: '@karthik_filtercoffee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    locality: 'Basavanagudi',
    savedPlacesCount: 19,
    favoriteDomain: 'Restaurants',
    status: 'Crispy benne dosa crawl at Vidyarthi Bhavan ☕',
    recentSavedPlaceId: 'blr_rest_02', // Vidyarthi Bhavan
  },
  {
    id: 'f-4',
    name: 'Ananya Sharma',
    handle: '@ananya_deeptech',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    locality: 'HSR Layout',
    savedPlacesCount: 25,
    favoriteDomain: 'Startups',
    status: 'Demo day at HSR Sector 4 incubator 🚀',
    recentSavedPlaceId: 'blr_startup_02', // HSR Founders Corridor
  },
  {
    id: 'f-5',
    name: 'Rohan Deshmukh',
    handle: '@rohan_transit',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    locality: 'Central Bengaluru',
    savedPlacesCount: 14,
    favoriteDomain: 'Transportation',
    status: 'Testing new Purple Line feeder connections 🚇',
    recentSavedPlaceId: 'blr_trans_01', // Majestic Metro Station
  },
];

const LOCALITY_MIDPOINTS: Record<string, { midpointLocality: string; note: string; spotPlaceId: string }> = {
  'Indiranagar + Malleshwaram': {
    midpointLocality: 'Central Bengaluru / MG Road',
    note: 'Equidistant on Purple Line metro (~18 min from both)',
    spotPlaceId: 'blr_tour_01', // Cubbon Park
  },
  'Indiranagar + Koramangala': {
    midpointLocality: 'Domlur / Intermediate Ring Road',
    note: 'Quick 10-minute auto ride equidistant for both founders & foodies',
    spotPlaceId: 'blr_rest_01', // Toit
  },
  'HSR Layout + Malleshwaram': {
    midpointLocality: 'Residency Road / MG Road',
    note: 'Accessible via Green + Purple Line metro interchange at Majestic',
    spotPlaceId: 'blr_shop_02', // UB City
  },
  'Whitefield + Indiranagar': {
    midpointLocality: 'Baiyappanahalli / Swami Vivekananda Road',
    note: 'Direct 20-min commute along the Purple Line extension',
    spotPlaceId: 'blr_trans_04', // Baiyappanahalli Station
  },
  'Jayanagar + Koramangala': {
    midpointLocality: 'Dairy Circle / BTM Layout',
    note: 'Convenient 12-minute transit corridor with rooftop cafes',
    spotPlaceId: 'blr_edu_02', // Christ University
  },
};

export const FriendsSection: React.FC<FriendsSectionProps> = ({
  places,
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  onViewDetails,
  onNavigateToMap,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'midpoint'>('feed');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile>(MOCK_FRIENDS[0]);

  // Midpoint selector state
  const [localityA, setLocalityA] = useState('Indiranagar');
  const [localityB, setLocalityB] = useState('Malleshwaram');

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/friends?invite=bango_${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    onShowToast('Invite link copied to clipboard!', 'Share with your Bengaluru crew');
    setTimeout(() => setCopiedInvite(false), 3000);
  };

  const midpointKey = `${localityA} + ${localityB}`;
  const midpointReverseKey = `${localityB} + ${localityA}`;
  const midpointData =
    LOCALITY_MIDPOINTS[midpointKey] ||
    LOCALITY_MIDPOINTS[midpointReverseKey] || {
      midpointLocality: 'Central Bengaluru / MG Road',
      note: 'Central transit intersection accessible from all quadrants',
      spotPlaceId: 'blr_tour_01',
    };

  const midpointPlace =
    places.find((p) => p.place_id === midpointData.spotPlaceId) || places[0];

  return (
    <section className="py-8 sm:py-12 bg-[#F5F3EE] min-h-[calc(100vh-80px)] font-sans antialiased selection:bg-[#F02D25] selection:text-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* 1. SECTION HERO HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F02D25]"></span>
              <span className="text-xs font-black uppercase tracking-widest text-[#77736D]">
                bango &bull; Urban Social Discovery
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#191919] tracking-tight leading-tight">
              explore bengaluru <br className="hidden sm:inline" />
              with friends.
            </h1>
            <p className="text-sm sm:text-base text-[#66635C] mt-3 max-w-2xl font-medium leading-relaxed">
              Coordinate group hangouts, track where your friends are exploring, discover midpoint meetups, and uncover group co-visit patterns powered by Apriori algorithm intelligence.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E3DFD7] hover:border-[#191919] text-xs sm:text-sm font-extrabold text-[#191919] hover:bg-[#F5F3EE] transition-all cursor-pointer shadow-xs"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#F02D25]" />
                  <span>Invite Friends</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToMap}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#191919] hover:bg-[#F02D25] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md group"
            >
              <Compass className="w-4 h-4 text-[#F02D25] group-hover:text-white transition-colors" />
              <span>Explore Group Map</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* 2. TAB CONTROLS (Feed, Circles, Midpoint Finder) */}
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-[#E3DFD7] overflow-x-auto">
          {[
            { id: 'feed', label: 'Friends Activity Feed', icon: Sparkles },
            { id: 'circles', label: 'Friends Circles & Saves', icon: Users },
            { id: 'midpoint', label: 'Midpoint Meetup Finder', icon: Navigation },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#191919] text-white shadow-xs'
                    : 'bg-white text-[#77736D] border border-[#E3DFD7] hover:text-[#191919] hover:border-[#191919]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F02D25]' : 'text-[#77736D]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. TAB 1: FRIENDS ACTIVITY FEED */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
            {/* Left 8 Cols: Timeline Feed */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#191919]">
                  Live Activity in Bengaluru
                </span>
                <span className="text-xs font-medium text-[#77736D]">
                  Updated 3 minutes ago
                </span>
              </div>

              {MOCK_FRIENDS.map((friend, idx) => {
                const place =
                  places.find((p) => p.place_id === friend.recentSavedPlaceId) ||
                  places[idx % places.length];
                const isSaved = isPlaceSaved(place?.place_id);

                return (
                  <div
                    key={friend.id}
                    className="bg-white rounded-3xl border border-[#E3DFD7] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-5"
                  >
                    {/* Friend Avatar */}
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                    />

                    {/* Activity Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-[#191919] text-sm sm:text-base leading-none">
                            {friend.name}
                          </h4>
                          <span className="text-xs text-[#77736D] font-mono mt-0.5 block">
                            {friend.handle} &bull; {friend.locality}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#F02D25] bg-[#F5F3EE] px-2.5 py-1 rounded-full border border-[#E3DFD7]">
                          Saved to {friend.favoriteDomain}
                        </span>
                      </div>

                      {/* Status note */}
                      <p className="text-xs text-[#191919] font-medium mt-2.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E3DFD7]">
                        &ldquo;{friend.status}&rdquo;
                      </p>

                      {/* Embedded Place Card */}
                      {place && (
                        <div className="mt-4 p-3 bg-[#F5F3EE] rounded-2xl border border-[#E3DFD7] flex flex-col sm:flex-row items-center justify-between gap-3 group hover:border-[#191919] transition-all">
                          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                            <img
                              src={place.image_url}
                              alt={place.name}
                              className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="font-display font-bold text-sm text-[#191919] truncate group-hover:text-[#F02D25] transition-colors">
                                {place.name}
                              </h5>
                              <p className="text-xs text-[#77736D] truncate mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                                <span>{place.locality}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                            <button
                              onClick={() => onSelectPlace(place)}
                              className="py-1.5 px-3 rounded-lg bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                              View on Map
                            </button>
                            <button
                              onClick={() => onViewDetails(place)}
                              className="p-1.5 rounded-lg border border-[#E3DFD7] text-[#191919] hover:bg-white transition-colors"
                              title="Details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSavePlace(place)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSaved
                                  ? 'bg-[#F02D25] text-white border-[#F02D25]'
                                  : 'border-[#E3DFD7] text-[#77736D] hover:bg-white'
                              }`}
                              title={isSaved ? 'Saved' : 'Save Place'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 4 Cols: Quick Circles & Apriori Group Hangout Recommendations */}
            <div className="lg:col-span-4 space-y-6">
              {/* Group Hangout Rules Card */}
              <div className="bg-white rounded-3xl border border-[#E3DFD7] p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#F02D25]" />
                  <h3 className="font-display font-bold text-base text-[#191919] uppercase tracking-wider">
                    Group Co-Visit Rules
                  </h3>
                </div>
                <p className="text-xs text-[#66635C] leading-relaxed mb-4">
                  Apriori Association mining indicates these destinations are frequently co-visited when exploring Bangalore with groups:
                </p>

                <div className="space-y-2.5">
                  {[
                    { from: 'Cubbon Park', to: 'State Central Library', lift: '10.8x', conf: '89%' },
                    { from: 'Toit Brewpub', to: 'Truffles Indiranagar', lift: '8.4x', conf: '82%' },
                    { from: 'UB City', to: 'Commercial Street', lift: '7.2x', conf: '78%' },
                  ].map((rule, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E3DFD7] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#191919] block truncate">{rule.from}</span>
                        <span className="text-[#77736D] text-[11px] block truncate">
                          &rarr; Co-visit {rule.to}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-[#F02D25] bg-white px-2 py-0.5 rounded-full border border-[#E3DFD7] block">
                          {rule.lift} Lift
                        </span>
                        <span className="text-[10px] text-[#77736D] mt-0.5 block">{rule.conf} Conf</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Card */}
              <div className="bg-[#191919] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[#F02D25] text-white flex items-center justify-center mb-3">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-xl uppercase tracking-tight">
                    Invite Your Bengaluru Crew
                  </h4>
                  <p className="text-xs text-[#ECE9E2]/70 mt-2 leading-relaxed">
                    Share your custom Bangalore itinerary and see friends' live saved places across all 8 smart city sectors.
                  </p>
                  <button
                    onClick={handleCopyInviteLink}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white text-[#191919] hover:bg-[#F02D25] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Invite Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB 2: FRIENDS CIRCLES & SAVES */}
        {activeTab === 'circles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
            {/* Left 4 Cols: Friend selector */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="pb-1 text-xs font-black uppercase tracking-wider text-[#191919]">
                Your Connected Friends ({MOCK_FRIENDS.length})
              </div>

              {MOCK_FRIENDS.map((f) => {
                const isSelected = selectedFriend.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFriend(f)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-white border-[#191919] shadow-md'
                        : 'bg-white/70 border-[#E3DFD7] hover:bg-white hover:border-[#191919]'
                    }`}
                  >
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-[#191919] truncate">{f.name}</h4>
                        <span className="text-[10px] font-bold text-[#F02D25] bg-[#F5F3EE] px-2 py-0.5 rounded-full">
                          {f.savedPlacesCount} saved
                        </span>
                      </div>
                      <p className="text-xs text-[#77736D] truncate mt-0.5">{f.locality}</p>
                      <p className="text-[11px] text-[#66635C] truncate mt-1">{f.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 8 Cols: Selected Friend's Saved Collection */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E3DFD7] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E3DFD7] mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedFriend.avatar}
                    alt={selectedFriend.name}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#191919]">
                      {selectedFriend.name}&apos;s Saved Collection
                    </h3>
                    <p className="text-xs text-[#77736D] mt-0.5">
                      {selectedFriend.locality} &bull; Favorite Domain: {selectedFriend.favoriteDomain}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onNavigateToMap}
                  className="px-4 py-2 rounded-xl bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View on Map
                </button>
              </div>

              {/* Places grid for selected friend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {places.slice(0, 6).map((place, idx) => (
                  <div
                    key={place.place_id}
                    className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E3DFD7] flex items-center justify-between gap-3 hover:border-[#191919] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={place.image_url}
                        alt={place.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white inline-block mb-0.5"
                          style={{ backgroundColor: CATEGORY_COLORS[place.category] || '#F02D25' }}
                        >
                          {place.category}
                        </span>
                        <h5 className="font-display font-bold text-xs sm:text-sm text-[#191919] truncate group-hover:text-[#F02D25] transition-colors">
                          {place.name}
                        </h5>
                        <p className="text-[11px] text-[#77736D] truncate mt-0.5">{place.locality}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onSelectPlace(place)}
                        className="p-2 rounded-lg bg-[#191919] hover:bg-[#F02D25] text-white text-[11px] font-bold transition-colors"
                        title="Locate on Map"
                      >
                        <Compass className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSavePlace(place)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isPlaceSaved(place.place_id)
                            ? 'bg-[#F02D25] text-white border-[#F02D25]'
                            : 'border-[#E3DFD7] text-[#77736D] hover:bg-white'
                        }`}
                        title="Save to My Places"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isPlaceSaved(place.place_id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB 3: MIDPOINT MEETUP FINDER */}
        {activeTab === 'midpoint' && (
          <div className="bg-white rounded-3xl border border-[#E3DFD7] p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="w-12 h-12 rounded-full bg-[#F5F3EE] text-[#F02D25] flex items-center justify-center mx-auto mb-3 border border-[#E3DFD7]">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#191919] uppercase tracking-tight">
                Bangalore Midpoint Hangout Finder
              </h3>
              <p className="text-xs sm:text-sm text-[#66635C] mt-2 leading-relaxed">
                Living in Indiranagar while your friend is in Malleshwaram? Select your two neighborhoods and let Bango calculate the optimal equidistant meetup hotspot!
              </p>
            </div>

            {/* Neighborhood Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E3DFD7]">
                <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-2">
                  Your Neighborhood
                </label>
                <select
                  value={localityA}
                  onChange={(e) => setLocalityA(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E3DFD7] font-bold text-sm text-[#191919] focus:outline-hidden"
                >
                  <option value="Indiranagar">Indiranagar (East)</option>
                  <option value="Malleshwaram">Malleshwaram (North-West)</option>
                  <option value="Koramangala">Koramangala (South-East)</option>
                  <option value="HSR Layout">HSR Layout (South-East)</option>
                  <option value="Whitefield">Whitefield (East Corridor)</option>
                  <option value="Jayanagar">Jayanagar (South)</option>
                  <option value="Central Bengaluru">Central Bengaluru (CBD)</option>
                </select>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E3DFD7]">
                <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-2">
                  Friend&apos;s Neighborhood
                </label>
                <select
                  value={localityB}
                  onChange={(e) => setLocalityB(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E3DFD7] font-bold text-sm text-[#191919] focus:outline-hidden"
                >
                  <option value="Malleshwaram">Malleshwaram (North-West)</option>
                  <option value="Indiranagar">Indiranagar (East)</option>
                  <option value="Koramangala">Koramangala (South-East)</option>
                  <option value="HSR Layout">HSR Layout (South-East)</option>
                  <option value="Whitefield">Whitefield (East Corridor)</option>
                  <option value="Jayanagar">Jayanagar (South)</option>
                  <option value="Central Bengaluru">Central Bengaluru (CBD)</option>
                </select>
              </div>
            </div>

            {/* Calculated Midpoint Result */}
            <div className="p-6 bg-[#F5F3EE] rounded-3xl border border-[#E3DFD7]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DFD7] mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                      Optimal Transit Midpoint Identified
                    </span>
                  </div>
                  <h4 className="font-display font-black text-xl sm:text-2xl text-[#191919]">
                    {midpointData.midpointLocality}
                  </h4>
                  <p className="text-xs text-[#77736D] mt-1">{midpointData.note}</p>
                </div>

                <button
                  onClick={() => onSelectPlace(midpointPlace)}
                  className="px-5 py-2.5 rounded-xl bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-extrabold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
                >
                  Explore on Map &rarr;
                </button>
              </div>

              {/* Recommended Meetup Spot */}
              {midpointPlace && (
                <div className="bg-white p-4 rounded-2xl border border-[#E3DFD7] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={midpointPlace.image_url}
                      alt={midpointPlace.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span
                        className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white inline-block mb-1"
                        style={{ backgroundColor: CATEGORY_COLORS[midpointPlace.category] || '#F02D25' }}
                      >
                        {midpointPlace.category}
                      </span>
                      <h5 className="font-display font-bold text-base text-[#191919] truncate">
                        {midpointPlace.name}
                      </h5>
                      <p className="text-xs text-[#66635C] mt-0.5 line-clamp-1">
                        {midpointPlace.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewDetails(midpointPlace)}
                      className="py-2 px-3.5 rounded-xl border border-[#E3DFD7] text-xs font-bold text-[#191919] hover:bg-[#F5F3EE] transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onSavePlace(midpointPlace)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isPlaceSaved(midpointPlace.place_id)
                          ? 'bg-[#F02D25] text-white border-[#F02D25]'
                          : 'border-[#E3DFD7] text-[#77736D] hover:bg-[#F5F3EE]'
                      }`}
                      title="Save"
                    >
                      <Bookmark className={`w-4 h-4 ${isPlaceSaved(midpointPlace.place_id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
