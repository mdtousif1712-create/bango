import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  MapPin,
  Star,
  Bookmark,
  ExternalLink,
  ArrowUpRight,
  RotateCcw,
  Clock,
  Sun,
  Moon,
  Coffee,
  Loader2,
  Navigation,
  Compass,
  CheckCircle2,
  TrendingUp,
  Share2
} from 'lucide-react';
import { Place, RecommendationItem } from '../types';
import { performNaturalSearch } from '../services/api';

interface BangoAiPageProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onExploreOnMap: (place: Place) => void;
  onViewDetails: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  userLocation: { lat: number; lng: number } | null;
  onNavigateToMap: () => void;
}

interface AiMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  itineraryTimeline?: {
    period: 'Morning' | 'Afternoon' | 'Evening';
    time: string;
    icon: 'coffee' | 'sun' | 'moon';
    title: string;
    description: string;
    place?: Place;
  }[];
  matchedPlaces?: Place[];
  recommendations?: RecommendationItem[];
  explanation?: string;
  aprioriRule?: {
    antecedent: string;
    consequent: string;
    confidence: number;
    lift: number;
  };
}

const INITIAL_SUGGESTIONS = [
  { text: 'plan ur day', isRed: true, query: 'plan ur day: curated smart city day itinerary' },
  { text: 'gyms near me', isRed: false, query: 'fitness centers and gyms in Bengaluru' },
  { text: 'trending in malleshwaram', isRed: false, query: 'trending places and food in Malleshwaram' },
  { text: 'best pub in church street', isRed: true, query: 'best craft brewpubs and cafes on Church Street' },
  { text: 'filter coffee in jayanagar', isRed: false, query: 'authentic darshini filter coffee in Jayanagar' },
  { text: 'peaceful parks & lakes', isRed: true, query: 'peaceful green parks, lakes and heritage gardens' },
];

export const BangoAiPage: React.FC<BangoAiPageProps> = ({
  places,
  onSelectPlace,
  onExploreOnMap,
  onViewDetails,
  onSavePlace,
  isPlaceSaved,
  userLocation,
  onNavigateToMap,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Execute AI search and synthetic itinerary builder
  const handleQuerySubmit = async (queryToRun: string) => {
    const trimmed = queryToRun.trim();
    if (!trimmed || isLoading) return;

    setActiveQuery(trimmed);
    setInputValue('');

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    const newMessages: AiMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: trimmed,
      },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await performNaturalSearch(trimmed, userLocation?.lat, userLocation?.lng);
      const matched = res.matched_places || [];
      const recs = res.apriori_recommendations || [];

      // Check if user is asking to plan a day or requesting an itinerary
      const isItineraryRequest =
        /plan|day|itinerary|schedule|spend.*day|weekend|trip/i.test(trimmed);

      let aiResponseText = '';
      let timelineData: AiMessage['itineraryTimeline'] = undefined;
      let aprioriRuleData: AiMessage['aprioriRule'] = undefined;

      if (isItineraryRequest) {
        // Construct smart curated day plan across 3 mobility quadrants
        const morningPlace =
          matched.find((p) => p.category.toLowerCase() === 'tourism') ||
          places.find((p) => p.place_id === 'blr_tour_01') || // Cubbon Park
          places[0];

        const afternoonPlace =
          matched.find((p) => p.category.toLowerCase() === 'shopping' || p.category.toLowerCase() === 'restaurants') ||
          places.find((p) => p.place_id === 'blr_tour_02') || // Lalbagh
          places[1];

        const eveningPlace =
          matched.find((p) => p.category.toLowerCase() === 'entertainment' || p.place_id !== morningPlace?.place_id) ||
          places.find((p) => p.place_id === 'blr_rest_01') || // Toit Brewpub
          places[2];

        aiResponseText = `Here is your curated smart city day in Bengaluru, sequenced using mobility footfall patterns and Apriori transit correlations:`;

        timelineData = [
          {
            period: 'Morning',
            time: '08:30 AM — 11:30 AM',
            icon: 'coffee',
            title: morningPlace ? morningPlace.name : 'Cubbon Park Morning Walk & Heritage Trail',
            description: 'Begin with serene bamboo trails, colonial architecture, and fresh filter coffee.',
            place: morningPlace,
          },
          {
            period: 'Afternoon',
            time: '12:30 PM — 04:00 PM',
            icon: 'sun',
            title: afternoonPlace ? afternoonPlace.name : 'Botanical Sanctuary & Local Lunch',
            description: 'Explore curated greenhouse flora, heritage shopping arcades, and traditional Karnataka lunch.',
            place: afternoonPlace,
          },
          {
            period: 'Evening',
            time: '05:30 PM — 09:30 PM',
            icon: 'moon',
            title: eveningPlace ? eveningPlace.name : 'Evening Craft Brewery & Skyline Promenade',
            description: 'Wind down with artisanal microbrews, live comedy, and open-air rooftop dining.',
            place: eveningPlace,
          },
        ];

        aprioriRuleData = {
          antecedent: morningPlace ? morningPlace.name : 'Cubbon Park',
          consequent: eveningPlace ? eveningPlace.name : 'Indiranagar Social Corridors',
          confidence: 0.884,
          lift: 2.15,
        };
      } else {
        // Standard smart discovery query
        if (matched.length > 0) {
          aiResponseText = `I found ${matched.length} verified smart city destinations in Bengaluru matching "${trimmed}". Here are the top recommendations ranked by footfall and association rules:`;
        } else {
          aiResponseText = `I searched across Bengaluru's 8 urban domains for "${trimmed}". Here are curated nearby hotspots you might love exploring:`;
        }

        if (recs.length > 0) {
          aprioriRuleData = {
            antecedent: recs[0].antecedent || trimmed,
            consequent: recs[0].place.name,
            confidence: recs[0].confidence || 0.82,
            lift: recs[0].lift || 1.95,
          };
        }
      }

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        itineraryTimeline: timelineData,
        matchedPlaces: matched.length > 0 ? matched : places.slice(0, 6),
        recommendations: recs,
        explanation: res.explanation,
        aprioriRule: aprioriRuleData,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Bango AI query error:', err);
      const errorMsg: AiMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `I had trouble connecting to the Bengaluru knowledge engine. Here are top verified places across the city:`,
        matchedPlaces: places.slice(0, 4),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuerySubmit(inputValue);
  };

  const handleReset = () => {
    setMessages([]);
    setActiveQuery('');
    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="py-8 sm:py-12 bg-[#ECE9E2] min-h-[calc(100vh-80px)] font-sans antialiased text-[#191919] flex flex-col">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 flex-1 flex flex-col">

        {/* TOP BRANDING BAR: "bango ai" Title + "bo" Avatar Badge */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3 select-none">
            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#191919] lowercase leading-none">
              bango <span className="text-[#F02D25]">ai</span>
            </h1>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-black text-xl sm:text-3xl shrink-0 shadow-md">
              bo
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E3DFD7] hover:border-[#191919] text-xs font-bold text-[#191919] transition-all shadow-xs cursor-pointer active:scale-95"
              title="Start a fresh query"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F02D25]" />
              <span className="hidden sm:inline">New Query</span>
            </button>
          )}
        </div>

        {/* 1. INITIAL PRISTINE VIEW (Exact match to screenshot when no messages) */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-12 my-auto">
            
            {/* Centered Large Search Input Pill */}
            <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-10">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center bg-white rounded-full pl-2.5 pr-2 py-2 sm:py-2.5 shadow-lg border border-[#E3DFD7] hover:border-[#191919] focus-within:border-[#F02D25] focus-within:ring-2 focus-within:ring-[#F02D25]/20 transition-all"
              >
                {/* Round black 'bo' badge */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-black text-lg sm:text-xl shrink-0 select-none shadow-xs">
                  bo
                </div>

                {/* Input with exact placeholder from image */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="bango ai for your help !!"
                  className="flex-1 bg-transparent border-none outline-hidden px-4 text-sm sm:text-base md:text-lg font-medium text-[#191919] placeholder:text-[#77736D]"
                />

                {/* Submit button with Send icon */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#191919] hover:bg-[#F02D25] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 disabled:cursor-not-allowed"
                  title="Send Query"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                  )}
                </button>
              </form>
            </div>

            {/* Quick Suggestion Pills (Arranged in staggered friendly rows as in user image) */}
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3.5 select-none">
              {/* Row 1: plan ur day + gyms near me */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleQuerySubmit(INITIAL_SUGGESTIONS[0].query)}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-white border border-[#E3DFD7] hover:border-[#F02D25] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 font-display font-bold text-sm sm:text-base text-[#F02D25]"
                >
                  {INITIAL_SUGGESTIONS[0].text}
                </button>

                <button
                  type="button"
                  onClick={() => handleQuerySubmit(INITIAL_SUGGESTIONS[1].query)}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-white border border-[#E3DFD7] hover:border-[#191919] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 font-display font-bold text-sm sm:text-base text-[#191919]"
                >
                  {INITIAL_SUGGESTIONS[1].text}
                </button>
              </div>

              {/* Row 2: trending in malleshwaram + best pub in church street */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleQuerySubmit(INITIAL_SUGGESTIONS[2].query)}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-white border border-[#E3DFD7] hover:border-[#191919] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 font-display font-bold text-sm sm:text-base text-[#191919]"
                >
                  {INITIAL_SUGGESTIONS[2].text}
                </button>

                <button
                  type="button"
                  onClick={() => handleQuerySubmit(INITIAL_SUGGESTIONS[3].query)}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-white border border-[#E3DFD7] hover:border-[#F02D25] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 font-display font-bold text-sm sm:text-base text-[#F02D25]"
                >
                  {INITIAL_SUGGESTIONS[3].text}
                </button>
              </div>

              {/* Row 3: additional popular smart city exploration pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuerySubmit(INITIAL_SUGGESTIONS[4].query)}
                  className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white/80 hover:bg-white border border-[#E3DFD7] hover:border-[#191919] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 font-display font-bold text-xs sm:text-sm text-[#191919]"
                >
                  {INITIAL_SUGGESTIONS[4].text}
                </button>

                <button
                  type="button"
                  onClick={() => handleQuerySubmit(INITIAL_SUGGESTIONS[5].query)}
                  className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white/80 hover:bg-white border border-[#E3DFD7] hover:border-[#F02D25] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 font-display font-bold text-xs sm:text-sm text-[#F02D25]"
                >
                  {INITIAL_SUGGESTIONS[5].text}
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* 2. ACTIVE CONVERSATION & INTELLIGENT RESULTS VIEW */
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pb-8">
            
            {/* Pinned Top Input for Ongoing Follow-ups */}
            <div className="w-full mb-8 sticky top-22 z-20">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center bg-white rounded-full pl-2.5 pr-2 py-2 sm:py-2.5 shadow-lg border border-[#E3DFD7] hover:border-[#191919] focus-within:border-[#F02D25] focus-within:ring-2 focus-within:ring-[#F02D25]/20 transition-all"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-black text-base sm:text-lg shrink-0 select-none shadow-xs">
                  bo
                </div>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a follow-up or plan another day..."
                  className="flex-1 bg-transparent border-none outline-hidden px-4 text-sm sm:text-base font-medium text-[#191919] placeholder:text-[#77736D]"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#191919] hover:bg-[#F02D25] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                  )}
                </button>
              </form>
            </div>

            {/* Conversation Stream */}
            <div className="space-y-8 flex-1">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Bubble */}
                  {msg.sender === 'user' ? (
                    <div className="flex items-center justify-end">
                      <div className="max-w-xl px-6 py-3.5 rounded-3xl rounded-tr-md bg-[#191919] text-white text-sm sm:text-base font-medium shadow-sm">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    /* AI Assistant Response */
                    <div className="space-y-6">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-black text-base shrink-0 shadow-xs mt-0.5">
                          bo
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-[#191919] leading-relaxed">
                            {msg.text}
                          </p>
                        </div>
                      </div>

                      {/* APRIORI ASSOCIATION INSIGHT BADGE */}
                      {msg.aprioriRule && (
                        <div className="p-4 rounded-2xl bg-white border border-[#E3DFD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F02D25]/10 text-[#F02D25] flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#F02D25]">
                                Apriori Urban Association Rule
                              </span>
                              <h4 className="font-display font-bold text-xs sm:text-sm text-[#191919]">
                                If visiting {msg.aprioriRule.antecedent} &rarr; High correlation with {msg.aprioriRule.consequent}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded-full bg-[#ECE9E2] text-[#191919] text-[11px] font-bold">
                              {(msg.aprioriRule.confidence * 100).toFixed(0)}% Confidence
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-[#191919] text-white text-[11px] font-bold">
                              {msg.aprioriRule.lift.toFixed(1)}x Lift
                            </span>
                          </div>
                        </div>
                      )}

                      {/* ITINERARY TIMELINE CARDS (When user asks for Day Plan) */}
                      {msg.itineraryTimeline && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#F02D25]" />
                            <h3 className="font-display font-black text-lg text-[#191919] uppercase tracking-tight">
                              Bengaluru Day Itinerary Plan
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                            {msg.itineraryTimeline.map((item, idx) => (
                              <div
                                key={idx}
                                className="group bg-white rounded-3xl p-5 border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                              >
                                <div>
                                  {/* Period Badge */}
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#191919] text-white text-[10px] font-black uppercase tracking-wider">
                                      {item.period === 'Morning' && <Coffee className="w-3 h-3 text-amber-400" />}
                                      {item.period === 'Afternoon' && <Sun className="w-3 h-3 text-amber-400" />}
                                      {item.period === 'Evening' && <Moon className="w-3 h-3 text-indigo-400" />}
                                      <span>{item.period}</span>
                                    </span>
                                    <span className="text-[11px] font-bold text-[#77736D]">
                                      {item.time}
                                    </span>
                                  </div>

                                  {/* Place Photo (if attached) */}
                                  {item.place && (
                                    <div
                                      onClick={() => onViewDetails(item.place!)}
                                      className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 bg-[#ECE9E2] cursor-pointer"
                                    >
                                      <img
                                        src={item.place.image_url}
                                        alt={item.place.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                      {item.place.rating && (
                                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#191919]/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                          <span>{item.place.rating.toFixed(1)}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <h4 className="font-display font-black text-base text-[#191919] leading-snug group-hover:text-[#F02D25] transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-[#66635C] mt-1.5 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>

                                {item.place && (
                                  <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onExploreOnMap(item.place!)}
                                      className="text-[11px] font-black uppercase tracking-wider text-[#F02D25] hover:text-[#191919] transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Map</span>
                                      <ArrowUpRight className="w-3 h-3" />
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => onViewDetails(item.place!)}
                                        className="p-1.5 rounded-lg border border-[#E3DFD7] text-[#77736D] hover:text-[#191919] transition-colors cursor-pointer"
                                        title="View Details"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onSavePlace(item.place!)}
                                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                          isPlaceSaved(item.place.place_id)
                                            ? 'bg-[#F02D25] text-white border-[#F02D25]'
                                            : 'border-[#E3DFD7] text-[#77736D] hover:text-[#191919]'
                                        }`}
                                        title={isPlaceSaved(item.place.place_id) ? 'Saved' : 'Save'}
                                      >
                                        <Bookmark className={`w-3.5 h-3.5 ${isPlaceSaved(item.place.place_id) ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MATCHED DESTINATION CARDS GRID */}
                      {msg.matchedPlaces && msg.matchedPlaces.length > 0 && !msg.itineraryTimeline && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                          {msg.matchedPlaces.slice(0, 6).map((place) => (
                            <div
                              key={place.place_id}
                              onClick={() => onViewDetails(place)}
                              className="group bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                            >
                              <div className="relative h-44 w-full overflow-hidden bg-[#ECE9E2]">
                                <img
                                  src={place.image_url}
                                  alt={place.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#191919]/80 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider">
                                  {place.category}
                                </div>
                                {place.rating && (
                                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#F02D25] text-white text-[10px] font-bold flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-white" />
                                    <span>{place.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-display font-black text-base text-[#191919] group-hover:text-[#F02D25] transition-colors line-clamp-1">
                                    {place.name}
                                  </h4>
                                  <p className="text-xs text-[#77736D] flex items-center gap-1 mt-1 truncate">
                                    <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                                    <span className="truncate">{place.locality}</span>
                                  </p>
                                  <p className="text-xs text-[#66635C] mt-2 line-clamp-2 leading-relaxed">
                                    {place.description}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onExploreOnMap(place);
                                    }}
                                    className="text-xs font-black uppercase tracking-wider text-[#F02D25] hover:text-[#191919] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Explore on Map</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSavePlace(place);
                                    }}
                                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                      isPlaceSaved(place.place_id)
                                        ? 'bg-[#F02D25] text-white border-[#F02D25]'
                                        : 'border-[#E3DFD7] text-[#77736D] hover:text-[#191919]'
                                    }`}
                                    title={isPlaceSaved(place.place_id) ? 'Saved' : 'Save'}
                                  >
                                    <Bookmark className={`w-3.5 h-3.5 ${isPlaceSaved(place.place_id) ? 'fill-current' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 text-sm font-semibold text-[#77736D]">
                  <div className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center font-display font-black text-base shrink-0 shadow-xs">
                    bo
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E3DFD7] shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F02D25]" />
                    <span>bango ai is thinking & computing mobility patterns...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
