'use client';

import { useState, type CSSProperties } from 'react';
import { MapPin } from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
//
// items         Gallery entries — image src and optional alt, plus optional place data
// cardWidth     Card width in px
// cardHeight    Card height in px
// cornerRadius  Border radius in px
// className     Styles for the outer shell
//
export type GalleryItem = {
  image: { src: string; alt?: string };
  title?: string;
  subtitle?: string;
  category?: string;
  description?: string;
  onClick?: () => void;
};

export type ArchGalleryProps = {
  items?: GalleryItem[];
  cardWidth?: number;
  cardHeight?: number;
  cornerRadius?: number;
  className?: string;
  onSelect?: (item: GalleryItem, index: number) => void;
};

// ---------------------------------------------------------------------------
// Defaults (High-res Unsplash Architectural & Living Spaces)
// ---------------------------------------------------------------------------
export const DEFAULT_ITEMS: GalleryItem[] = [
  {
    image: {
      src: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      alt: 'Cubbon Park Bamboo Grove',
    },
    title: 'Cubbon Park',
    subtitle: 'Central Bengaluru',
    category: 'Heritage Park',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
      alt: 'Lalbagh Botanical Garden',
    },
    title: 'Lalbagh Glass House',
    subtitle: 'Jayanagar',
    category: 'Botanical Sanctuary',
  },
  {
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Bangalore_Palace_exteriors.jpg',
      alt: 'Bengaluru Tudor Palace',
    },
    title: 'Bengaluru Palace',
    subtitle: 'Vasanth Nagar',
    category: 'Royal Heritage',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
      alt: 'Toit Craft Brewery',
    },
    title: 'Toit Brewpub',
    subtitle: 'Indiranagar',
    category: 'Craft Brewery',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80',
      alt: 'UB City Luxury Towers',
    },
    title: 'UB City Promenade',
    subtitle: 'Central Bengaluru',
    category: 'Luxury Lifestyle',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      alt: 'Koramangala Social Workspace',
    },
    title: 'Koramangala Social',
    subtitle: 'Koramangala 7th Block',
    category: 'Gastropub & Co-work',
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      alt: 'Indian Institute of Science Campus',
    },
    title: 'IISc Knowledge Hub',
    subtitle: 'Malleshwaram',
    category: 'Research & Education',
  },
];

const ROTATE_STEP = 6;
const Y_STEP = 20;
const OVERLAP = 0.50;
const HOVER_SCALE = 1.08;
const HOVER_LIFT = 18;

export function ArchGallery({
  items = DEFAULT_ITEMS,
  cardWidth = 216,
  cardHeight = 288,
  cornerRadius = 22,
  className = '',
  onSelect,
}: ArchGalleryProps) {
  const deck = items.length ? items : DEFAULT_ITEMS;
  const total = deck.length;
  const mid = (total - 1) / 2;
  const [hovered, setHovered] = useState<number | null>(null);

  const stageWidth = cardWidth + Math.abs(mid) * 2 * cardWidth * OVERLAP + cardWidth * 0.2;
  const stageHeight = cardHeight + Math.abs(mid) * Y_STEP + 48;

  return (
    <div
      className={['flex w-full items-center justify-center py-6 sm:py-10', className]
        .filter(Boolean)
        .join(' ')}
      role='group'
      aria-label='Image gallery'
    >
      <div
        className='relative'
        style={{ width: stageWidth, height: stageHeight }}
      >
        {deck.map((entry, index) => {
          const offset = index - mid;
          const rotate = offset * ROTATE_STEP;
          const translateY = Math.abs(offset) * Y_STEP;
          const translateX = offset * cardWidth * OVERLAP;
          const baseZ = total - Math.abs(offset);
          const isHovered = hovered === index;

          const cardStyle: CSSProperties = {
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: cardWidth,
            height: cardHeight,
            marginLeft: -cardWidth / 2,
            marginTop: -cardHeight / 2,
            borderRadius: cornerRadius,
            overflow: 'hidden',
            transformOrigin: 'center center',
            transform: isHovered
              ? `translate(${translateX}px, ${translateY - HOVER_LIFT}px) rotate(0deg) scale(${HOVER_SCALE})`
              : `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(1)`,
            zIndex: isHovered ? total + 10 : baseZ,
            transition:
              'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), z-index 0ms, box-shadow 280ms ease',
            boxShadow: isHovered
              ? '0 24px 44px -8px rgba(0,0,0,0.38), 0 6px 16px rgba(0,0,0,0.18)'
              : '0 12px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            backgroundColor: '#191919',
            border: '4px solid white',
          };

          return (
            <div
              key={`${entry.image.src}-${index}`}
              style={cardStyle}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              onClick={() => {
                if (entry.onClick) entry.onClick();
                if (onSelect) onSelect(entry, index);
              }}
              tabIndex={0}
              aria-label={entry.title || entry.image.alt || `Photo ${index + 1}`}
              className="group select-none outline-none focus:ring-2 focus:ring-[#F02D25]"
            >
              <img
                src={entry.image.src}
                alt={entry.image.alt || entry.title || ''}
                draggable={false}
                className='pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105'
              />

              {/* Gradient Scrim */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300" />

              {/* Place Information Caption Overlay */}
              {(entry.title || entry.subtitle) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 sm:p-4 text-white flex flex-col justify-end">
                  {entry.subtitle && (
                    <span className="text-[11px] sm:text-xs font-bold text-[#F02D25] tracking-wide flex items-center gap-1 drop-shadow-xs">
                      <MapPin className="w-3 h-3 text-[#F02D25] shrink-0" />
                      <span className="truncate">{entry.subtitle}</span>
                    </span>
                  )}

                  {entry.title && (
                    <h4 className="font-display font-bold text-sm sm:text-base text-white leading-tight tracking-tight mt-0.5 line-clamp-1 drop-shadow-sm">
                      {entry.title}
                    </h4>
                  )}

                  {entry.description && (
                    <p className={`text-[11px] text-white/85 line-clamp-2 mt-1 leading-snug transition-all duration-300 ${
                      isHovered ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>
                      {entry.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ArchGallery;
