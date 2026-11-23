import React from 'react';
import { ArrowUpRight, Compass, HeartPulse, Train, Landmark, ShoppingBag, GraduationCap, Clapperboard, Utensils, Building2 } from 'lucide-react';
import { CategoryMeta } from '../types';

interface CategoryGridProps {
  categories: CategoryMeta[];
  onSelectCategory: (categoryName: string) => void;
  onNavigateToMap?: () => void;
}

// 8 Smart City Domains with curated editorial photography and descriptive copy
const DOMAIN_DETAILS: Record<string, { number: string; photo: string; subtitle: string }> = {
  Healthcare: {
    number: '01',
    photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Hospitals, specialty clinics, super-specialty research & trauma care.',
  },
  Transportation: {
    number: '02',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Namma Metro lines, BMTC bus interchanges, Kempegowda Intl Airport.',
  },
  Tourism: {
    number: '03',
    photo: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Cubbon Park, Lalbagh Glasshouse, Bangalore Palace, historical forts.',
  },
  Shopping: {
    number: '04',
    photo: 'https://images.unsplash.com/photo-1567449303078-57ad995bd302?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Commercial Street, Orion Mall, Phoenix Marketcity, Brigade Road.',
  },
  Education: {
    number: '05',
    photo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Indian Institute of Science, IIM Bangalore, RV College, Christ University.',
  },
  Entertainment: {
    number: '06',
    photo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Ranga Shankara, microbreweries, live comedy clubs, cultural arenas.',
  },
  Restaurants: {
    number: '07',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Iconic filter coffee darshinis, Indiranagar gastropubs, VV Puram food street.',
  },
  'Real Estate': {
    number: '08',
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Manyata Tech Park, UB City luxury towers, Bagmane, residential townships.',
  },
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  onNavigateToMap,
}) => {
  const filteredCategories = categories.filter((c) => c.id !== 'all');

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    if (onNavigateToMap) {
      onNavigateToMap();
    }
  };

  return (
    <section className="py-12 bg-[#F5F3EE] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F02D25]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#77736D]">
                bango &bull; 8 Smart City Sectors
              </span>
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#191919] tracking-tight leading-tight">
              one city. <br />
              endless possibilities.
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#77736D] max-w-md font-normal leading-relaxed">
            Bengaluru’s urban fabric spans 8 interconnected domains. Select any domain below to filter locations and view association patterns on the map.
          </p>
        </div>

        {/* 8-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
            const meta = DOMAIN_DETAILS[cat.name] || {
              number: '01',
              photo: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
              subtitle: cat.description,
            };

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Photo with zoom on hover */}
                <div className="relative h-48 w-full overflow-hidden bg-[#ECE9E2]">
                  <img
                    src={meta.photo}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Number Badge */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-extrabold text-[#191919] uppercase tracking-wider">
                    {meta.number}
                  </div>

                  {/* Circular Arrow on top right */}
                  <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#191919]/70 group-hover:bg-[#F02D25] text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#191919] uppercase tracking-tight group-hover:text-[#F02D25] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#77736D] mt-1.5 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E3DFD7] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#F02D25]">
                    <span>Explore on Map</span>
                    <span className="text-[#77736D] group-hover:text-[#191919]">&rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
