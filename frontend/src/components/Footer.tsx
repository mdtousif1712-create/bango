import React from 'react';
import { ArrowUp, MapPin, Heart, Compass } from 'lucide-react';
import { PageId } from './Sidebar';

interface FooterProps {
  onNavigate?: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (page: PageId) => {
    if (onNavigate) {
      onNavigate(page);
      scrollToTop();
    }
  };

  return (
    <footer className="bg-[#191919] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Coordinates (6 cols) */}
          <div className="md:col-span-6">
            <div className="flex items-start gap-1 mb-4">
              <span className="font-display font-bold text-3xl lowercase tracking-tight text-white leading-none">
                bango
              </span>
              <span className="text-xs font-bold text-[#F02D25] -mt-0.5 select-none">
                ™
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ECE9E2]/60 ml-2 mt-1">
                smart city discovery
              </span>
            </div>
            
            <p className="text-sm text-[#ECE9E2]/70 max-w-md leading-relaxed mb-6 font-normal">
              An intelligent, citizen-first urban exploration platform applying the Apriori Algorithm across Bengaluru’s mobility transactions to discover cross-domain synergies.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#ECE9E2]/50">
              <MapPin className="w-4 h-4 text-[#F02D25]" />
              <span>12.9716° N, 77.5946° E &bull; Elevation 920m &bull; Karnataka, India</span>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3">
            <h5 className="font-display font-bold text-xs uppercase tracking-widest text-[#ECE9E2]/50 mb-4">
              Explore Pages
            </h5>
            <ul className="space-y-2.5 text-xs font-semibold text-[#ECE9E2]/80">
              <li>
                <button onClick={() => handleNav('discover')} className="hover:text-[#F02D25] transition-colors cursor-pointer">
                  Discover Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('map')} className="hover:text-[#F02D25] transition-colors cursor-pointer">
                  Map Explorer
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('trending')} className="hover:text-[#F02D25] transition-colors cursor-pointer">
                  Trending Destinations
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('domains')} className="hover:text-[#F02D25] transition-colors cursor-pointer">
                  8 Smart City Domains
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('how-it-works')} className="hover:text-[#F02D25] transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Algorithmic Tech Stack (3 cols) */}
          <div className="md:col-span-3">
            <h5 className="font-display font-bold text-xs uppercase tracking-widest text-[#ECE9E2]/50 mb-4">
              Engine & Technology
            </h5>
            <ul className="space-y-2 text-xs text-[#ECE9E2]/80">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
                <span>MLxtend Association Mining</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
                <span>FastAPI Python Service</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
                <span>Leaflet & OpenStreetMap</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F02D25]"></span>
                <span>Tailwind CSS Editorial UI</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#ECE9E2]/50">
          <div>
            &copy; {new Date().getFullYear()} bango &bull; Bengaluru Smart City Discovery. Made for urban explorers.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#F02D25] text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
