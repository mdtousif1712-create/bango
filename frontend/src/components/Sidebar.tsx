import React from 'react';
import { Home, Compass, Sparkles, Bookmark, Cpu, User } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  onOpenAlgorithmModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenAlgorithmModal,
}) => {
  const navItems = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'saved', label: 'Saved Places', icon: Bookmark, badge: savedCount },
  ];

  return (
    <aside className="w-[72px] bg-white border-r border-[#E8EBF0] flex flex-col items-center py-5 shrink-0 z-20 justify-between select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Top Section & Logo */}
      <div className="flex flex-col items-center gap-7 w-full">
        {/* Modern Blue Pin + Building Symbol Logo */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="cursor-pointer group flex flex-col items-center" 
          title="Bengaluru Smart City Discovery"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3F6FDB] to-[#5681EB] flex items-center justify-center text-white shadow-md shadow-[#5681EB]/25 group-hover:scale-105 transition-all duration-200">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold tracking-tight text-[#171B24] mt-1.5 opacity-90">BLR</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#B9E2F1]/60 text-[#3F6FDB] font-semibold shadow-xs'
                    : 'text-[#777F8B] hover:text-[#171B24] hover:bg-[#F1F5F9]'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                
                {/* Saved Places Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#5681EB] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}

                {/* Floating Tooltip */}
                <span className="absolute left-[70px] bg-[#171B24] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Algorithm Inspector & Profile */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          onClick={onOpenAlgorithmModal}
          className="relative group w-12 h-12 rounded-2xl flex items-center justify-center text-[#777F8B] hover:text-[#5681EB] hover:bg-[#B9E2F1]/30 transition-all duration-200"
          title="Apriori Rules & Transparency"
        >
          <Cpu className="w-5 h-5 stroke-[1.8]" />
          <span className="absolute left-[70px] bg-[#171B24] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            Apriori Rules Inspector
          </span>
        </button>

        <div className="w-10 h-10 rounded-full bg-[#E8EBF0] text-[#5681EB] flex items-center justify-center font-semibold text-xs border-2 border-white shadow-xs cursor-pointer hover:ring-2 hover:ring-[#5681EB]/30 transition-all">
          <User className="w-4 h-4 text-[#777F8B]" />
        </div>
      </div>
    </aside>
  );
};
