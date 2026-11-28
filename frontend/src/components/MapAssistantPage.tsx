import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Star,
  ExternalLink,
  Bookmark,
  Layers,
  Compass,
  Loader2,
  ArrowRight,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { Place, RecommendationItem } from '../types';
import { CityMap, CATEGORY_COLORS } from './CityMap';
import { performNaturalSearch } from '../services/api';
import { BangoRobotEyes } from './BangoRobotEyes';

interface MapAssistantPageProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  userLocation: { lat: number; lng: number } | null;
  onLocateMe: () => void;
  onViewDetails: (place: Place) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  parsedDomain?: string;
  parsedLocality?: string;
  parsedIntent?: string;
  matchedPlaces?: Place[];
  recommendations?: RecommendationItem[];
  explanation?: string;
}

const BANGO_AI_SUGGESTIONS = [
  { text: 'plan ur day', query: 'Plan an ideal full-day itinerary exploring Bengaluru with breakfast, culture, parks, and dinner', isRed: true },
  { text: 'gyms near me', query: 'Gyms and fitness centers near central Bengaluru', isRed: false },
  { text: 'trending in malleshwaram', query: 'Top trending cafes and heritage places in Malleshwaram', isRed: false },
  { text: 'best pub in church street', query: 'Best microbreweries and pubs near Church Street and Brigade Road', isRed: true },
  { text: 'craft breweries in indiranagar', query: 'Top craft breweries and brewpubs in Indiranagar', isRed: false },
  { text: 'heritage parks near MG road', query: 'Heritage parks, botanical gardens and historic spots near MG Road', isRed: false },
];

export const MapAssistantPage: React.FC<MapAssistantPageProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  userLocation,
  onLocateMe,
  onViewDetails,
}) => {
  const [displayedPlaces, setDisplayedPlaces] = useState<Place[]>(places);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync displayed places when places load
  useEffect(() => {
    if (!activeQuery) {
      setDisplayedPlaces(places);
    }
  }, [places, activeQuery]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hello! I am bango ai, your Bengaluru smart city companion. Ask me anything about places, food, transit, culture, or plan your day in natural language. I'll pinpoint them directly on the map!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isSearching) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsSearching(true);
    setIsExpanded(true);

    try {
      const response = await performNaturalSearch(
        query,
        userLocation?.lat,
        userLocation?.lng
      );

      const matched = response.matched_places || [];
      const recs = response.apriori_recommendations || [];

      // Filter or highlight map places
      if (matched.length > 0) {
        setDisplayedPlaces(matched);
        setActiveQuery(query);
        // Select first match automatically to focus
        onSelectPlace(matched[0]);
      } else {
        // Fallback to all places
        setDisplayedPlaces(places);
      }

      let explanationText = response.explanation;
      if (!explanationText) {
        if (matched.length > 0) {
          explanationText = `Found ${matched.length} destination${
            matched.length > 1 ? 's' : ''
          } matching your query in Bengaluru. Pinned on the map below.`;
        } else {
          explanationText = `I couldn't find exact matches for "${query}". Displaying all 80 smart city places across Bengaluru.`;
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: explanationText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsedDomain: response.parsed_domain,
        parsedLocality: response.parsed_locality,
        parsedIntent: response.parsed_intent,
        matchedPlaces: matched,
        recommendations: recs,
        explanation: response.explanation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to perform natural search:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the search service. Please try another query or rephrase.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetMap = () => {
    setDisplayedPlaces(places);
    setActiveQuery('');
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#ECE9E2] flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-3.5 overflow-hidden">
      {/* Top Heading Bar */}
      <div className="flex items-center justify-between gap-4 mb-2 sm:mb-2.5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-3.5 h-3.5 rounded-full bg-[#F02D25] shrink-0"></span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#191919] tracking-tight leading-none whitespace-nowrap">
            bengaluru map & ai <span className="text-[#F02D25]">assistant.</span>
          </h2>
          <span className="hidden md:inline text-xs sm:text-sm text-[#77736D] font-normal border-l border-[#D1CCC4] pl-3 truncate">
            Natural language search and conversational discovery powered by Apriori association mining
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {activeQuery && (
            <button
              onClick={handleResetMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E3DFD7] text-xs font-bold text-[#191919] hover:text-[#F02D25] hover:border-[#F02D25] transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All {places.length} Places</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E3DFD7] text-xs font-bold text-[#191919] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Map Live</span>
          </div>
        </div>
      </div>

      {/* Main Full-Height Interactive Map Container */}
      <div className="flex-1 min-h-0 w-full relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm bg-white">
        <CityMap
          places={displayedPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => onSelectPlace(p)}
          onSavePlace={onSavePlace}
          isPlaceSaved={isPlaceSaved}
          userLocation={userLocation}
          onLocateMe={onLocateMe}
          onViewDetails={onViewDetails}
        />

        {/* Active Filter Banner over map if filtered */}
        {activeQuery && (
          <div className="absolute top-16 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#E3DFD7] shadow-sm flex items-center gap-2 text-xs font-bold text-[#191919]">
            <span className="text-[#77736D]">Filter:</span>
            <span className="text-[#F02D25]">&ldquo;{activeQuery}&rdquo;</span>
            <span className="text-[#77736D]">({displayedPlaces.length} places)</span>
            <button
              onClick={handleResetMap}
              className="ml-1 text-[#F02D25] hover:underline text-[11px] font-black cursor-pointer uppercase tracking-wider"
            >
              Clear
            </button>
          </div>
        )}

        {/* BOTTOM FLOATING CHATBOT PANEL: BANGO AI CHAT BOX */}
        <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl lg:max-w-3xl z-[450]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E3DFD7] shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
            {/* Header bar of Bango AI Chatbot */}
            <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#E3DFD7] flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#191919] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BangoRobotEyes size="sm" isHovered={false} followCursor={true} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#191919] leading-none tracking-tight flex items-center gap-1.5">
                    <span>bango</span>
                    <span className="text-[#F02D25]">ai</span>
                  </h3>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Apriori Semantic Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeQuery && (
                  <button
                    onClick={handleResetMap}
                    className="text-[11px] font-extrabold text-[#77736D] hover:text-[#191919] transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-[#ECE9E2]"
                  >
                    Reset Map
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-xl hover:bg-[#ECE9E2] text-[#77736D] hover:text-[#191919] transition-colors cursor-pointer"
                  title={isExpanded ? 'Collapse Chat' : 'Expand Chat'}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expandable Conversation Body */}
            {isExpanded && (
              <div className="max-h-[220px] sm:max-h-[280px] overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#FAF8F5]/80">
                {/* Bango AI Quick Prompts Suggestions */}
                {messages.length <= 2 && (
                  <div className="pb-1">
                    <p className="text-[10px] font-bold text-[#77736D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#F02D25]" />
                      <span>Suggested Queries</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {BANGO_AI_SUGGESTIONS.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(item.query)}
                          disabled={isSearching}
                          className={`px-3 py-1.5 rounded-full bg-white border border-[#E3DFD7] hover:border-[#191919] text-xs font-display font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap ${
                            item.isRed ? 'text-[#F02D25] hover:border-[#F02D25]' : 'text-[#191919]'
                          }`}
                        >
                          {item.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages List */}
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#191919] text-white rounded-br-xs'
                            : 'bg-white text-[#191919] border border-[#E3DFD7] rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-1.5 mb-1.5 select-none">
                            <div className="w-4 h-4 rounded-full bg-[#191919] text-white flex items-center justify-center text-[8px] font-bold">
                              bo
                            </div>
                            <span className="font-display font-bold text-[11px] text-[#191919]">
                              bango <span className="text-[#F02D25]">ai</span>
                            </span>
                          </div>
                        )}

                        {/* Text explanation */}
                        <p className="text-xs font-medium">{msg.text}</p>

                        {/* Parsed query badges (if assistant and present) */}
                        {!isUser && (msg.parsedDomain || msg.parsedLocality || msg.parsedIntent) && (
                          <div className="mt-2 pt-2 border-t border-[#E3DFD7] flex items-center gap-1.5 flex-wrap">
                            {msg.parsedDomain && (
                              <span
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                                style={{ backgroundColor: CATEGORY_COLORS[msg.parsedDomain] || '#F02D25' }}
                              >
                                {msg.parsedDomain}
                              </span>
                            )}
                            {msg.parsedLocality && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F0EDE6] text-[#191919] border border-[#E3DFD7]">
                                📍 {msg.parsedLocality}
                              </span>
                            )}
                            {msg.parsedIntent && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F0EDE6] text-[#77736D] border border-[#E3DFD7]">
                                🔍 {msg.parsedIntent}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Matched Places Carousel / Cards */}
                        {!isUser && msg.matchedPlaces && msg.matchedPlaces.length > 0 && (
                          <div className="mt-2.5 pt-2.5 border-t border-[#E3DFD7] space-y-2">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#77736D]">
                              Matched Locations ({msg.matchedPlaces.length})
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                              {msg.matchedPlaces.slice(0, 6).map((plc) => (
                                <div
                                  key={plc.place_id}
                                  className="w-48 shrink-0 bg-[#F5F3EE] rounded-xl border border-[#E3DFD7] p-2 flex flex-col justify-between hover:border-[#191919] transition-all"
                                >
                                  <div>
                                    <div className="h-16 w-full rounded-lg overflow-hidden relative mb-1.5 bg-[#E3DFD7]">
                                      <img
                                        src={plc.image_url}
                                        alt={plc.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                      <span
                                        className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white"
                                        style={{ backgroundColor: CATEGORY_COLORS[plc.category] || '#F02D25' }}
                                      >
                                        {plc.category}
                                      </span>
                                    </div>
                                    <h4 className="font-extrabold text-[#191919] text-xs line-clamp-1">
                                      {plc.name}
                                    </h4>
                                    <p className="text-[10px] text-[#77736D] line-clamp-1 mt-0.5">
                                      {plc.locality}
                                    </p>
                                  </div>
                                  <div className="mt-2 pt-1.5 border-t border-[#E3DFD7] flex items-center justify-between gap-1">
                                    <button
                                      onClick={() => onSelectPlace(plc)}
                                      className="flex-1 py-1 px-2 bg-[#191919] hover:bg-[#F02D25] text-white text-[10px] font-bold rounded-lg transition-colors text-center cursor-pointer"
                                    >
                                      Pin on Map
                                    </button>
                                    <button
                                      onClick={() => onViewDetails(plc)}
                                      className="p-1 rounded-lg border border-[#E3DFD7] text-[#191919] hover:bg-white cursor-pointer"
                                      title="View Details"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onSavePlace(plc)}
                                      className={`p-1 rounded-lg border cursor-pointer ${
                                        isPlaceSaved(plc.place_id)
                                          ? 'bg-[#F02D25] text-white border-[#F02D25]'
                                          : 'border-[#E3DFD7] text-[#77736D] hover:bg-white'
                                      }`}
                                      title="Save Place"
                                    >
                                      <Bookmark className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Co-visit Apriori Recommendations */}
                        {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#E3DFD7] space-y-1.5">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F02D25] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Apriori Co-Visited Highlights</span>
                            </p>
                            <div className="space-y-1">
                              {msg.recommendations.slice(0, 2).map((rec, i) => (
                                <div
                                  key={i}
                                  onClick={() => onSelectPlace(rec.place)}
                                  className="p-1.5 bg-[#FAF8F5] hover:bg-[#F5F3EE] rounded-lg border border-[#E3DFD7] cursor-pointer flex items-center justify-between text-[11px]"
                                >
                                  <span className="font-bold text-[#191919] truncate">
                                    {rec.place.name}
                                  </span>
                                  <span className="text-[9px] font-extrabold text-[#F02D25] shrink-0 ml-2">
                                    {(rec.confidence * 100).toFixed(0)}% Conf • {rec.lift.toFixed(1)}x Lift
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-[#77736D] mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}

                {/* Loading indicator inside chat */}
                {isSearching && (
                  <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-[#E3DFD7] w-fit shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F02D25]" />
                    <span className="text-xs font-medium text-[#77736D]">
                      bango ai is thinking & searching destinations on map...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Bar: Signature Bango AI Pill Chat Box */}
            <div className="p-2 sm:p-2.5 bg-white border-t border-[#E3DFD7]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center bg-[#FAF8F5] rounded-full pl-2 pr-1.5 py-1.5 sm:py-2 border border-[#E3DFD7] hover:border-[#191919] focus-within:border-[#F02D25] focus-within:ring-2 focus-within:ring-[#F02D25]/20 focus-within:bg-white transition-all shadow-xs"
              >
                {/* Round black companion robot face with blinking eyes */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#191919] text-white flex items-center justify-center shrink-0 select-none shadow-xs">
                  <BangoRobotEyes size="sm" isHovered={false} followCursor={true} />
                </div>

                {/* Input with exact signature placeholder */}
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="bango ai for your help !!"
                  className="flex-1 bg-transparent border-none outline-hidden px-3 text-xs sm:text-sm font-medium text-[#191919] placeholder:text-[#77736D]"
                  disabled={isSearching}
                />

                {/* Submit button with Send icon */}
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isSearching}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#191919] hover:bg-[#F02D25] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 disabled:cursor-not-allowed"
                  title="Ask Bango AI"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
