import React, { useState } from 'react';
import {
  ArrowUpRight,
  MapPin,
  Star,
  Bookmark,
  ExternalLink,
  Map,
  Sparkles,
  HeartPulse,
  Train,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  Utensils,
  Rocket,
  Search
} from 'lucide-react';
import { Place } from '../types';

export interface DomainMetaInfo {
  name: string;
  slug: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tagline: string;
  description: string;
  heroPhoto: string;
}

export const ALL_DOMAINS_META: Record<string, DomainMetaInfo> = {
  Healthcare: {
    name: 'Healthcare',
    slug: 'healthcare',
    color: '#EF4444',
    icon: HeartPulse,
    tagline: 'Hospitals, specialty clinics, super-specialty research & trauma care',
    description: 'Bengaluru is India’s premier medical hub, home to world-renowned psychiatric institutes (NIMHANS), premier oncology centers (Kidwai), cardiac specialty hospitals (Narayana), and quaternary trauma facilities.',
    heroPhoto: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  },
  Transportation: {
    name: 'Transportation',
    slug: 'transportation',
    color: '#3B82F6',
    icon: Train,
    tagline: 'Namma Metro lines, BMTC bus interchanges, Kempegowda Intl Airport',
    description: 'Explore Bengaluru’s interconnected transit grid spanning Purple and Green Metro corridors, suburban railway stations, and high-frequency TTMC bus interchanges.',
    heroPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  Tourism: {
    name: 'Tourism',
    slug: 'tourism',
    color: '#10B981',
    icon: Landmark,
    tagline: 'Cubbon Park, Lalbagh Glasshouse, Bangalore Palace, historical forts',
    description: 'Immerse in the historic Garden City heritage, 240-acre botanical sanctuaries, Tudor-style royal residences, and neo-Dravidian state architecture.',
    heroPhoto: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
  },
  Shopping: {
    name: 'Shopping',
    slug: 'shopping',
    color: '#F97316',
    icon: ShoppingBag,
    tagline: 'Commercial Street, Orion Mall, Phoenix Marketcity, Brigade Road',
    description: 'From iconic open-air textile bazaars on Commercial Street to luxury global lifestyle arcades at UB City and multi-level suburban entertainment malls.',
    heroPhoto: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  },
  Education: {
    name: 'Education',
    slug: 'education',
    color: '#6366F1',
    icon: GraduationCap,
    tagline: 'Indian Institute of Science, IIM Bangalore, RV College, Christ University',
    description: 'The academic heart of India’s technological renaissance, featuring century-old research campuses, premier business academies, and iconic public heritage libraries.',
    heroPhoto: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  },
  Entertainment: {
    name: 'Entertainment',
    slug: 'entertainment',
    color: '#8B5CF6',
    icon: Clapperboard,
    tagline: 'Ranga Shankara, microbreweries, live comedy clubs, cultural arenas',
    description: 'Bengaluru’s vibrant cultural tapestry: intimate Kannada and English theatre auditoriums, sprawling multiplex screens, and interactive adventure arenas.',
    heroPhoto: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  Restaurants: {
    name: 'Restaurants',
    slug: 'restaurants',
    color: '#F59E0B',
    icon: Utensils,
    tagline: 'Iconic filter coffee darshinis, Indiranagar gastropubs, VV Puram food street',
    description: 'A legendary culinary journey through century-old filter coffee darshinis, crispy benne dosas, authentic Andhra biryanis, and craft brewpubs.',
    heroPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
  Startups: {
    name: 'Startups',
    slug: 'startups',
    color: '#06B6D4',
    icon: Rocket,
    tagline: 'Koramangala VC hubs, HSR Layout incubators, WeWork, unicorn tech campuses',
    description: 'India’s Silicon Valley innovation spine: university incubator networks, venture capital corridors, co-working ecosystems, and deep-tech aerospace centers.',
    heroPhoto: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
};

interface DomainDetailPageProps {
  domainName: string;
  places: Place[];
  onSelectDomain?: (domain: string) => void;
  onExploreOnMap: (place: Place) => void;
  onExploreDomainOnMap: (domain: string) => void;
  onViewDetails: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  onBackToAllDomains?: () => void;
}

export const DomainDetailPage: React.FC<DomainDetailPageProps> = ({
  domainName,
  places,
  onExploreOnMap,
  onExploreDomainOnMap,
  onViewDetails,
  onSavePlace,
  isPlaceSaved,
}) => {
  // Normalize domain matching (case-insensitive)
  const canonicalDomain =
    Object.keys(ALL_DOMAINS_META).find(
      (d) => d.toLowerCase() === domainName.toLowerCase()
    ) || 'Healthcare';

  const meta = ALL_DOMAINS_META[canonicalDomain];
  const DomainIcon = meta.icon;

  // Filter places belonging to this domain
  const domainPlaces = places.filter(
    (p) => p.category.toLowerCase() === canonicalDomain.toLowerCase()
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = domainPlaces.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.locality.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-8 sm:py-12 bg-[#F5F3EE] min-h-[calc(100vh-80px)] font-sans antialiased">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* HERO DISPLAY SECTION (Matches Healthcare reference) */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              {/* Category Pill Tag */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }}></span>
                <span className="text-xs font-black uppercase tracking-widest text-[#77736D]">
                  Bengaluru Smart City Sector &bull; {domainPlaces.length} Verified Locations
                </span>
              </div>

              {/* Huge Bold Title (e.g. HEALTHCARE, TRANSPORTATION) */}
              <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#191919] uppercase leading-none">
                {canonicalDomain}
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-base sm:text-lg text-[#66635C] mt-4 max-w-3xl leading-relaxed font-medium">
                {meta.tagline}. {meta.description}
              </p>
            </div>

            {/* Action Buttons on right */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onExploreDomainOnMap(canonicalDomain)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#191919] hover:bg-[#F02D25] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md group"
              >
                <Map className="w-4 h-4 text-[#F02D25] group-hover:text-white transition-colors" />
                <span>Explore All on Map</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* Quick Search filter bar */}
          <div className="mt-8 pt-6 border-t border-[#E3DFD7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${canonicalDomain.toLowerCase()} locations...`}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#E3DFD7] focus:border-[#191919] focus:outline-hidden text-xs sm:text-sm text-[#191919] placeholder:text-[#77736D] transition-colors shadow-2xs"
              />
              <Search className="w-4 h-4 text-[#77736D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="text-xs font-bold text-[#77736D] uppercase tracking-wider self-start sm:self-auto">
              Showing {filteredPlaces.length} of {domainPlaces.length} {canonicalDomain} destinations
            </div>
          </div>
        </div>

        {/* 3. 4-COLUMN CARD GRID (Matches Image 1 reference with 01, 02, 03... numbering) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {filteredPlaces.map((place, index) => {
            const formattedNumber = String(index + 1).padStart(2, '0');
            const isSaved = isPlaceSaved(place.place_id);

            return (
              <div
                key={place.place_id}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#ECE9E2]">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Number Badge (e.g. 01, 02, 03... as in reference image) */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-extrabold text-[#191919] uppercase tracking-wider shadow-xs">
                    {formattedNumber}
                  </div>

                  {/* Category Indicator Dot / Rating on Top Right */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#191919]/80 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }}></span>
                    {place.rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{place.rating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Place Name in Bold Display Font */}
                    <h3
                      onClick={() => onViewDetails(place)}
                      className="font-display font-bold text-lg sm:text-xl text-[#191919] uppercase tracking-tight group-hover:text-[#F02D25] transition-colors cursor-pointer line-clamp-1"
                      title={place.name}
                    >
                      {place.name}
                    </h3>

                    {/* Locality */}
                    <p className="text-xs font-semibold text-[#77736D] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
                      <span className="truncate">{place.locality}</span>
                    </p>

                    {/* Subtitle / Description */}
                    <p className="text-xs text-[#66635C] mt-2.5 leading-relaxed line-clamp-2">
                      {place.description}
                    </p>

                    {/* Tags */}
                    {place.tags && place.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {place.tags.slice(0, 2).map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-[#F5F3EE] border border-[#E3DFD7] text-[#77736D] px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: EXPLORE ON MAP -> (exact match to Image 1) */}
                  <div className="mt-5 pt-3.5 border-t border-[#E3DFD7] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onExploreOnMap(place)}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F02D25] hover:text-[#191919] transition-colors cursor-pointer"
                    >
                      <span>Explore on Map</span>
                      <span className="text-sm leading-none">&rarr;</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewDetails(place)}
                        className="p-1.5 rounded-xl border border-[#E3DFD7] text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE] transition-colors"
                        title="View Full Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSavePlace(place)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-[#F02D25] text-white border-[#F02D25]'
                            : 'border-[#E3DFD7] text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE]'
                        }`}
                        title={isSaved ? 'Saved to collection' : 'Save Place'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search finds nothing */}
        {filteredPlaces.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#E3DFD7] p-8 max-w-md mx-auto">
            <Search className="w-8 h-8 text-[#D1CCC4] mx-auto mb-2" />
            <h4 className="font-extrabold text-[#191919] text-sm uppercase">No locations match your search</h4>
            <p className="text-xs text-[#77736D] mt-1">
              Try adjusting your search query or clear the filter to view all {domainPlaces.length} destinations.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-[#191919] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#F02D25] transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
