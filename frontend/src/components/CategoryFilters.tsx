import React from 'react';
import {
  Compass,
  HeartPulse,
  Train,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  Utensils,
  Building2
} from 'lucide-react';
import { CategoryMeta } from '../types';

interface CategoryFiltersProps {
  categories: CategoryMeta[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  HeartPulse,
  Train,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  Utensils,
  Building2
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || Compass;
        const isSelected =
          selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
          (cat.id === 'all' && selectedCategory.toLowerCase() === 'all');

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id === 'all' ? 'All' : cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-[#F02D25] text-white border-[#F02D25] shadow-sm'
                : 'bg-white text-[#77736D] hover:text-[#191919] border-[#E3DFD7] hover:bg-[#ECE9E2]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#77736D]'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
