import React, { useState, useEffect } from 'react';
import { Place, FriendProfile } from '../types';
import {
  X,
  Share2,
  Users,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  Plus,
  MapPin,
  Sparkles
} from 'lucide-react';
import { CATEGORY_COLORS } from './CityMap';

interface SharePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  onShowToast?: (message: string, placeName?: string, type?: 'saved' | 'removed') => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

export const SharePlaceModal: React.FC<SharePlaceModalProps> = ({
  isOpen,
  onClose,
  place,
  onShowToast,
}) => {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [sentFriendIds, setSentFriendIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickLocality, setQuickLocality] = useState('Indiranagar');

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('bango_connected_friends');
        setFriends(saved ? JSON.parse(saved) : []);
      } catch {
        setFriends([]);
      }
      setSentFriendIds(new Set());
      setCopiedLink(false);
      setShowQuickAdd(false);
    }
  }, [isOpen]);

  if (!isOpen || !place) return null;

  const shareUrl = `${window.location.origin}/domains/${place.category.toLowerCase()}`;
  const categoryColor = CATEGORY_COLORS[place.category] || '#F02D25';

  const handleShareWithFriend = (friend: FriendProfile) => {
    // Add to sent set
    const updatedSent = new Set(sentFriendIds);
    updatedSent.add(friend.id);
    setSentFriendIds(updatedSent);

    // Update friend's recent saved place and persist
    try {
      const updatedFriends = friends.map((f) => {
        if (f.id === friend.id) {
          return {
            ...f,
            recentSavedPlaceId: place.place_id,
            status: `Shared ${place.name} in ${place.locality} 📍`,
            savedPlacesCount: (f.savedPlacesCount || 0) + 1,
          };
        }
        return f;
      });
      setFriends(updatedFriends);
      localStorage.setItem('bango_connected_friends', JSON.stringify(updatedFriends));
    } catch (e) {
      console.error(e);
    }

    if (onShowToast) {
      onShowToast(`Shared with ${friend.name}!`, place.name, 'saved');
    }
  };

  const handleQuickAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newFriend: FriendProfile = {
      id: `friend_${Date.now()}`,
      name: quickName.trim(),
      handle: `@${quickName.trim().toLowerCase().replace(/\s+/g, '_')}`,
      avatar: DEFAULT_AVATARS[friends.length % DEFAULT_AVATARS.length],
      locality: quickLocality,
      savedPlacesCount: 1,
      favoriteDomain: place.category,
      status: `Check out ${place.name} in ${place.locality}! 📍`,
      recentSavedPlaceId: place.place_id,
    };

    const updated = [newFriend, ...friends];
    setFriends(updated);
    try {
      localStorage.setItem('bango_connected_friends', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Mark as sent immediately
    const updatedSent = new Set(sentFriendIds);
    updatedSent.add(newFriend.id);
    setSentFriendIds(updatedSent);

    setQuickName('');
    setShowQuickAdd(false);

    if (onShowToast) {
      onShowToast(`Connected & shared with ${newFriend.name}!`, place.name, 'saved');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${place.name} - ${place.address}\n${shareUrl}`);
    setCopiedLink(true);
    if (onShowToast) {
      onShowToast('Link copied to clipboard!', place.name);
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = `Hey! Check out *${place.name}* in ${place.locality}, Bengaluru on Bango Smart City Discovery:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    const text = `Exploring ${place.name} in ${place.locality}, Bengaluru on Bango Smart City Discovery! 🏙️`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `Explore ${place.name} (${place.category}) in Bengaluru on Bango!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E3DFD7] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E3DFD7] flex items-center justify-between shrink-0 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F02D25] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#191919] leading-tight">
                Share Destination
              </h3>
              <p className="text-xs text-[#77736D] mt-0.5">
                Send to your friends in Bango or share via external apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Destination Preview Card */}
          <div className="p-3 bg-[#F5F3EE] rounded-2xl border border-[#E3DFD7] flex items-center gap-3.5">
            <img
              src={place.image_url}
              alt={place.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span
                className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white inline-block mb-1"
                style={{ backgroundColor: categoryColor }}
              >
                {place.category}
              </span>
              <h4 className="font-display font-bold text-sm sm:text-base text-[#191919] truncate leading-tight">
                {place.name}
              </h4>
              <p className="text-xs text-[#77736D] truncate mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                <span>{place.locality}</span>
              </p>
            </div>
          </div>

          {/* SECTION 1: SHARE WITH FRIENDS IN APP */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F02D25]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#191919]">
                  Share with Friends in App
                </h4>
              </div>
              <button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="text-xs font-bold text-[#F02D25] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showQuickAdd ? 'Cancel' : 'Add Friend'}</span>
              </button>
            </div>

            {/* Quick Add Friend Form */}
            {showQuickAdd && (
              <form onSubmit={handleQuickAddFriend} className="mb-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E3DFD7] space-y-2.5 animate-in fade-in duration-150">
                <div className="text-xs font-bold text-[#191919]">Connect & Share with New Friend:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Friend's Name"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="p-2.5 rounded-xl bg-white border border-[#E3DFD7] text-xs font-medium focus:outline-hidden focus:border-[#191919]"
                  />
                  <select
                    value={quickLocality}
                    onChange={(e) => setQuickLocality(e.target.value)}
                    className="p-2.5 rounded-xl bg-white border border-[#E3DFD7] text-xs font-bold focus:outline-hidden"
                  >
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="Malleshwaram">Malleshwaram</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="Central Bengaluru">Central Bengaluru</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F02D25] hover:bg-[#d0251e] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Add & Send Destination
                  </button>
                </div>
              </form>
            )}

            {/* Friends List */}
            {friends.length === 0 ? (
              <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E3DFD7] text-center">
                <p className="text-xs text-[#66635C] font-medium leading-relaxed">
                  You haven&apos;t added any friends to your Bango circle yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(true)}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#191919] text-white text-xs font-bold hover:bg-[#F02D25] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a Friend to Share</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {friends.map((friend) => {
                  const isSent = sentFriendIds.has(friend.id);

                  return (
                    <div
                      key={friend.id}
                      className="p-3 bg-white rounded-2xl border border-[#E3DFD7] flex items-center justify-between gap-3 hover:border-[#191919] transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border"
                        />
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-xs sm:text-sm text-[#191919] truncate leading-tight">
                            {friend.name}
                          </h5>
                          <p className="text-[11px] text-[#77736D] truncate mt-0.5">
                            {friend.handle} &bull; {friend.locality}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShareWithFriend(friend)}
                        disabled={isSent}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isSent
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#191919] hover:bg-[#F02D25] text-white shadow-xs'
                        }`}
                      >
                        {isSent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: EXTERNAL & LINK OPTIONS */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#77736D] mb-3">
              Share via Link & Apps
            </h4>

            {/* Quick Share Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="p-3 rounded-2xl border border-[#E3DFD7] bg-[#FAF8F5] hover:bg-white hover:border-[#191919] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-2xs"
              >
                {copiedLink ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5 text-[#191919] group-hover:text-[#F02D25] transition-colors" />
                )}
                <span className="text-xs font-bold text-[#191919]">
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="p-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-2xs"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className="text-xs font-bold text-[#191919]">WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleTwitter}
                className="p-3 rounded-2xl border border-[#E3DFD7] bg-[#FAF8F5] hover:bg-white hover:border-[#191919] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-2xs"
              >
                <Share2 className="w-5 h-5 text-[#191919] group-hover:text-[#F02D25] transition-colors" />
                <span className="text-xs font-bold text-[#191919]">Twitter / X</span>
              </button>
            </div>

            {/* Native OS Share Sheet Fallback */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="mt-3 w-full py-2.5 px-4 rounded-xl border border-[#E3DFD7] bg-white hover:bg-[#F5F3EE] text-xs font-bold text-[#77736D] hover:text-[#191919] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>More System Options (Windows / Phone)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
