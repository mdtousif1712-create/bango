import React, { useState, useEffect } from 'react';
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
  Copy,
  Plus,
  Trash2,
  X,
  Lock
} from 'lucide-react';
import { Place } from '../types';
import { AuthUser } from '../services/auth';
import { CATEGORY_COLORS } from './CityMap';

interface FriendsSectionProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  onViewDetails: (place: Place) => void;
  onNavigateToMap: () => void;
  onShowToast: (message: string, placeName?: string, type?: 'saved' | 'removed') => void;
  user: AuthUser | null;
  onOpenAuthModal: () => void;
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

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
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
  user,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'midpoint'>('feed');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>(() => {
    try {
      const saved = localStorage.getItem('bango_connected_friends');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

  // Add friend modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendHandle, setFriendHandle] = useState('');
  const [friendLocality, setFriendLocality] = useState('Indiranagar');
  const [friendDomain, setFriendDomain] = useState('Restaurants');
  const [friendStatus, setFriendStatus] = useState('');
  const [friendPlaceId, setFriendPlaceId] = useState('');

  // Keep selectedFriend in sync if list changes
  useEffect(() => {
    if (friends.length > 0) {
      if (!selectedFriend || !friends.some((f) => f.id === selectedFriend.id)) {
        setSelectedFriend(friends[0]);
      }
    } else {
      setSelectedFriend(null);
    }
  }, [friends, selectedFriend]);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    const chosenPlaceId =
      friendPlaceId ||
      places.find((p) => p.category === friendDomain)?.place_id ||
      places[0]?.place_id ||
      '';

    const newFriend: FriendProfile = {
      id: `friend_${Date.now()}`,
      name: friendName.trim(),
      handle: friendHandle.trim().startsWith('@')
        ? friendHandle.trim()
        : `@${friendHandle.trim().toLowerCase().replace(/\s+/g, '_') || 'bango_user'}`,
      avatar: DEFAULT_AVATARS[friends.length % DEFAULT_AVATARS.length],
      locality: friendLocality,
      savedPlacesCount: 1,
      favoriteDomain: friendDomain,
      status: friendStatus.trim() || `Exploring ${friendLocality} hotspots 📍`,
      recentSavedPlaceId: chosenPlaceId,
    };

    const updated = [newFriend, ...friends];
    setFriends(updated);
    setSelectedFriend(newFriend);
    try {
      localStorage.setItem('bango_connected_friends', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setFriendName('');
    setFriendHandle('');
    setFriendStatus('');
    setFriendPlaceId('');
    setShowAddModal(false);
    onShowToast(`Connected with ${newFriend.name}!`, 'Added to your Bengaluru circle');
  };

  const handleRemoveFriend = (friendId: string, name: string) => {
    const updated = friends.filter((f) => f.id !== friendId);
    setFriends(updated);
    try {
      localStorage.setItem('bango_connected_friends', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    onShowToast(`Removed ${name}`, 'Friend removed from your circle');
  };

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
    <section className="py-8 sm:py-12 bg-[#ECE9E2] min-h-[calc(100vh-80px)] font-sans antialiased selection:bg-[#F02D25] selection:text-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* 1. SECTION HERO HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#191919] tracking-tight leading-tight">
              explore bengaluru <br className="hidden sm:inline" />
              with <span className="text-[#F02D25]">friends.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#66635C] mt-3 max-w-2xl font-medium leading-relaxed">
              Coordinate group hangouts, track where your friends are exploring, discover midpoint meetups, and uncover group co-visit patterns powered by Apriori algorithm intelligence.
            </p>
          </div>

          {/* Action buttons - only visible when signed in */}
          {user && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E3DFD7] hover:border-[#191919] text-xs sm:text-sm font-extrabold text-[#191919] hover:bg-[#F5F3EE] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#F02D25]" />
                <span>Add Friend</span>
              </button>

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
          )}
        </div>

        {/* If user is NOT logged in: Show High-Converting Locked State */}
        {!user ? (
          <div className="bg-white rounded-3xl border border-[#E3DFD7] p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto my-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-[#F02D25]/10 text-[#F02D25] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Users className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E3DFD7] text-[11px] font-black uppercase tracking-wider text-[#F02D25] mb-4">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-4xl text-[#191919] tracking-tight leading-tight mb-3">
              Sign in to unlock Social Discovery
            </h2>
            <p className="text-sm sm:text-base text-[#66635C] max-w-xl mx-auto leading-relaxed mb-8">
              Connect with your friends, see where your circle is exploring across Bengaluru, find midpoint meetup spots, and share custom destination dossiers.
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3DFD7]">
                <div className="w-9 h-9 rounded-xl bg-[#191919] text-white flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4 text-[#F02D25]" />
                </div>
                <h4 className="font-extrabold text-sm text-[#191919] mb-1">
                  Friends Activity Feed
                </h4>
                <p className="text-xs text-[#77736D] leading-relaxed">
                  See real-time bookmarks, reviews, and visits from friends across 8 smart city sectors.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3DFD7]">
                <div className="w-9 h-9 rounded-xl bg-[#191919] text-white flex items-center justify-center mb-3">
                  <Bookmark className="w-4 h-4 text-[#F02D25]" />
                </div>
                <h4 className="font-extrabold text-sm text-[#191919] mb-1">
                  Shared Circles & Saves
                </h4>
                <p className="text-xs text-[#77736D] leading-relaxed">
                  Access friend recommendations and co-visit rules discovered by our Apriori data engine.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3DFD7]">
                <div className="w-9 h-9 rounded-xl bg-[#191919] text-white flex items-center justify-center mb-3">
                  <Navigation className="w-4 h-4 text-[#F02D25]" />
                </div>
                <h4 className="font-extrabold text-sm text-[#191919] mb-1">
                  Midpoint Meetup Finder
                </h4>
                <p className="text-xs text-[#77736D] leading-relaxed">
                  Calculate equidistant rendezvous hubs across Namma Metro Purple & Green lines.
                </p>
              </div>
            </div>

            {/* Sign in Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#191919] hover:bg-[#F02D25] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In with Google</span>
              </button>

              <button
                onClick={onNavigateToMap}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-[#E3DFD7] hover:border-[#191919] text-[#191919] hover:bg-[#F5F3EE] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore City Solo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
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
                  {friends.length === 0 ? '0 Connected Friends' : `${friends.length} Active Friends`}
                </span>
              </div>

              {friends.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E3DFD7] p-8 sm:p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E3DFD7] text-[#F02D25] flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-black text-2xl text-[#191919] tracking-tight">
                    No Friend Activity Yet
                  </h3>
                  <p className="text-sm text-[#66635C] mt-2 max-w-md mx-auto leading-relaxed">
                    You haven&apos;t connected with any friends on Bango yet. Share your invite link or connect with friends to see what places they are exploring and saving across Bengaluru!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <button
                      onClick={handleCopyInviteLink}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F02D25] hover:bg-[#d0251e] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Invite Friends</span>
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#191919] hover:bg-[#333] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-[#F02D25]" />
                      <span>Add a Friend</span>
                    </button>
                    <button
                      onClick={onNavigateToMap}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E3DFD7] hover:border-[#191919] text-[#191919] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                    >
                      <Compass className="w-4 h-4 text-[#F02D25]" />
                      <span>Explore Group Map</span>
                    </button>
                  </div>
                </div>
              ) : (
                friends.map((friend, idx) => {
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
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#F02D25] bg-[#F5F3EE] px-2.5 py-1 rounded-full border border-[#E3DFD7]">
                              Saved to {friend.favoriteDomain}
                            </span>
                            <button
                              onClick={() => handleRemoveFriend(friend.id, friend.name)}
                              className="p-1 rounded-lg text-[#77736D] hover:text-[#F02D25] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
                              title="Remove Friend"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                                className="py-1.5 px-3 rounded-lg bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                View on Map
                              </button>
                              <button
                                onClick={() => onViewDetails(place)}
                                className="p-1.5 rounded-lg border border-[#E3DFD7] text-[#191919] hover:bg-white transition-colors cursor-pointer"
                                title="Details"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSavePlace(place)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
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
                })
              )}
            </div>

            {/* Right 4 Cols: Invite Card */}
            <div className="lg:col-span-4 space-y-6">
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
          <div>
            {friends.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E3DFD7] p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E3DFD7] text-[#77736D] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#77736D]" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#191919] tracking-tight">
                  No Connected Friends
                </h3>
                <p className="text-sm text-[#66635C] mt-2 max-w-md mx-auto leading-relaxed">
                  Connect with friends to discover their saved collections, favorite neighborhoods, and curated places across Bengaluru.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#191919] hover:bg-[#333] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-[#F02D25]" />
                    <span>Add a Friend</span>
                  </button>
                  <button
                    onClick={handleCopyInviteLink}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E3DFD7] hover:border-[#191919] text-[#191919] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-4 h-4 text-[#F02D25]" />
                    <span>Invite Friends</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
                {/* Left 4 Cols: Friend selector */}
                <div className="lg:col-span-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#191919]">
                      Your Connected Friends ({friends.length})
                    </span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-xs font-bold text-[#F02D25] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {friends.map((f) => {
                    const isSelected = (selectedFriend || friends[0])?.id === f.id;
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
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-[#F02D25] bg-[#F5F3EE] px-2 py-0.5 rounded-full">
                                {f.savedPlacesCount} saved
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFriend(f.id, f.name);
                                }}
                                className="p-1 rounded-md text-[#77736D] hover:text-[#F02D25] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-[#77736D] truncate mt-0.5">{f.locality}</p>
                          <p className="text-[11px] text-[#66635C] truncate mt-1">{f.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right 8 Cols: Selected Friend's Saved Collection */}
                {(selectedFriend || friends[0]) && (
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E3DFD7] p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E3DFD7] mb-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={(selectedFriend || friends[0]).avatar}
                          alt={(selectedFriend || friends[0]).name}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                        <div>
                          <h3 className="font-display font-bold text-xl text-[#191919]">
                            {(selectedFriend || friends[0]).name}&apos;s Saved Collection
                          </h3>
                          <p className="text-xs text-[#77736D] mt-0.5">
                            {(selectedFriend || friends[0]).locality} &bull; Favorite Domain: {(selectedFriend || friends[0]).favoriteDomain}
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
                      {places
                        .filter((p) => p.category === (selectedFriend || friends[0]).favoriteDomain)
                        .slice(0, 6)
                        .map((place) => (
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
                                className="p-2 rounded-lg bg-[#191919] hover:bg-[#F02D25] text-white text-[11px] font-bold transition-colors cursor-pointer"
                                title="Locate on Map"
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSavePlace(place)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
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
                )}
              </div>
            )}
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
                  className="px-5 py-2.5 rounded-xl bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-extrabold uppercase tracking-wider transition-colors shrink-0 shadow-sm cursor-pointer"
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
                      className="py-2 px-3.5 rounded-xl border border-[#E3DFD7] text-xs font-bold text-[#191919] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onSavePlace(midpointPlace)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
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
        </>
        )}
      </div>

      {/* 6. ADD FRIEND MODAL */}
      {user && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E3DFD7] p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F5F3EE] text-[#77736D] hover:text-[#191919] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E3DFD7] text-[#F02D25] flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-[#191919]">
                  Add a Friend
                </h3>
                <p className="text-xs text-[#77736D]">
                  Connect friends to see their Bengaluru recommendations
                </p>
              </div>
            </div>

            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-1.5">
                  Friend Name *
                </label>
                <input
                  type="text"
                  required
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="e.g. Pooja Rao"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#E3DFD7] text-sm text-[#191919] font-medium focus:outline-hidden focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-1.5">
                  Handle / Username
                </label>
                <input
                  type="text"
                  value={friendHandle}
                  onChange={(e) => setFriendHandle(e.target.value)}
                  placeholder="@pooja_blr"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#E3DFD7] text-sm text-[#191919] font-mono focus:outline-hidden focus:border-[#191919]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-1.5">
                    Neighborhood
                  </label>
                  <select
                    value={friendLocality}
                    onChange={(e) => setFriendLocality(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E3DFD7] text-xs font-bold text-[#191919] focus:outline-hidden"
                  >
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="Malleshwaram">Malleshwaram</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="Central Bengaluru">Central Bengaluru</option>
                    <option value="Basavanagudi">Basavanagudi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-1.5">
                    Favorite Sector
                  </label>
                  <select
                    value={friendDomain}
                    onChange={(e) => setFriendDomain(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E3DFD7] text-xs font-bold text-[#191919] focus:outline-hidden"
                  >
                    <option value="Restaurants">Restaurants</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Startups">Startups</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-1.5">
                  Status / Note
                </label>
                <input
                  type="text"
                  value={friendStatus}
                  onChange={(e) => setFriendStatus(e.target.value)}
                  placeholder="e.g. Trying new coffee spots in Indiranagar ☕"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#E3DFD7] text-sm text-[#191919] focus:outline-hidden focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#77736D] block mb-1.5">
                  Recently Visited Spot
                </label>
                <select
                  value={friendPlaceId}
                  onChange={(e) => setFriendPlaceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E3DFD7] text-xs font-bold text-[#191919] focus:outline-hidden"
                >
                  <option value="">Default to top {friendDomain} spot</option>
                  {places
                    .filter((p) => p.category === friendDomain)
                    .map((p) => (
                      <option key={p.place_id} value={p.place_id}>
                        {p.name} ({p.locality})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3DFD7]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3DFD7] text-xs font-bold text-[#77736D] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F02D25] hover:bg-[#d0251e] text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Connect Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
