import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ArchGallery, GalleryItem } from '@/components/ui/arch-gallery';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  onExploreMap: () => void;
  onPlanDay?: () => void;
  onOpenAlgorithm?: () => void;
}

const DISCOVER_GALLERY_ITEMS: GalleryItem[] = [
  {
    image: {
      src: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=85',
      alt: 'Cubbon Park Bamboo Grove',
    },
    title: 'Cubbon Park',
    subtitle: 'Central Bengaluru',
    category: 'Heritage Park',
    description: '300-acre green lung in central Bengaluru with serene walking trails and Victorian heritage.',
  },
  {
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Bangalore_Palace_exteriors.jpg',
      alt: 'Bengaluru Palace Exterior',
    },
    title: 'Bengaluru Palace',
    subtitle: 'Vasanth Nagar',
    category: 'Royal Heritage',
    description: '19th-century Tudor-style royal palace with fortified towers and expansive gardens.',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=85',
      alt: 'Lalbagh Glass House',
    },
    title: 'Lalbagh Glass House',
    subtitle: 'Jayanagar',
    category: 'Botanical Sanctuary',
    description: '240-acre botanical haven home to centuries-old trees and the iconic Glass House.',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=85',
      alt: 'Toit Craft Brewery',
    },
    title: 'Toit Brewpub',
    subtitle: 'Indiranagar',
    category: 'Craft Brewery',
    description: 'Pioneering brewpub in Indiranagar famous for artisanal microbrews and wood-fired pizzas.',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1000&q=85',
      alt: 'UB City Luxury Promenade',
    },
    title: 'UB City',
    subtitle: 'Central Bengaluru',
    category: 'Luxury Lifestyle',
    description: 'Premier luxury destination featuring high-end fashion, open-air promenade dining, and skyline views.',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMap,
  onPlanDay,
}) => {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center py-6 sm:py-8 md:py-10 overflow-hidden bg-[#ECE9E2]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        
        {/* 2-Column Editorial Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 2xl:gap-16 items-center">
          
          {/* Left: Oversized Typography & Search (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[76px] 2xl:text-[86px] text-[#191919] leading-[1.03] tracking-tight mb-5">
              discover <br />
              banglore <br />
              <span className="text-[#F02D25] whitespace-nowrap">like never before.</span>
            </h1>

            <p className="text-sm sm:text-base xl:text-lg text-[#77736D] max-w-2xl leading-relaxed mb-6 sm:mb-7 font-normal">
              <strong className="text-[#191919] font-bold">bango</strong> is an intelligent urban discovery platform powered by the <strong className="text-[#191919] font-semibold">Apriori Association Rule Mining</strong> algorithm. Uncover hidden mobility patterns, transit connections, and curated smart city destinations across 8 urban domains.
            </p>

            {/* Primary Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2">
              {/* Elongated Button 1: Open Map Explorer (+30% Elongation, Project Color Transition) */}
              <button
                onClick={onExploreMap}
                className="group relative flex items-center justify-between gap-4 sm:gap-6 px-8 sm:px-10 py-4 sm:py-4.5 min-w-[285px] sm:min-w-[325px] rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:shadow-[#F02D25]/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer overflow-hidden animate-subtle-float"
                title="Open Bengaluru Map Explorer"
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                  Open Map Explorer
                </span>

                <div className="relative z-10 w-7 h-7 rounded-full bg-[#F02D25] group-hover:bg-[#191919] flex items-center justify-center text-white shrink-0 transition-colors duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
                </div>
              </button>

              {/* Replica Elongated Button 2: Plan Your Day (+30% Elongation, Project Color Transition) */}
              <button
                onClick={onPlanDay || onExploreMap}
                className="group relative flex items-center justify-between gap-4 sm:gap-6 px-8 sm:px-10 py-4 sm:py-4.5 min-w-[285px] sm:min-w-[325px] rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:shadow-[#F02D25]/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer overflow-hidden animate-subtle-float-delayed"
                title="Plan your day in Bengaluru"
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                  Plan Your Day
                </span>

                <div className="relative z-10 w-7 h-7 rounded-full bg-[#F02D25] group-hover:bg-[#191919] flex items-center justify-center text-white shrink-0 transition-colors duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
                </div>
              </button>
            </div>

          </div>

          {/* Right: Arch Gallery of Trending Bengaluru Destinations (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center w-full min-w-0">
            <div className="relative w-full flex flex-col items-center justify-center scale-90 sm:scale-95 lg:scale-90 xl:scale-100 origin-center transition-transform">
              <ArchGallery
                items={DISCOVER_GALLERY_ITEMS}
                cardWidth={195}
                cardHeight={280}
                cornerRadius={24}
                onSelect={() => onExploreMap()}
              />
            </div>

            {/* Decorative Ambient Background Ring */}
            <div className="absolute -z-10 w-[500px] h-[500px] rounded-full border border-[#E3DFD7] -top-10 -right-10 pointer-events-none opacity-60"></div>
          </div>

        </div>

      </div>
    </section>
  );
};
