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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border shrink-0 ${
              isSelected
                ? 'bg-[#5681EB] text-white border-[#5681EB] shadow-xs'
                : 'bg-white text-[#777F8B] hover:text-[#171B24] border-[#E8EBF0] hover:bg-[#F8FAFC]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#777F8B]'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
