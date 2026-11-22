import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';

interface SearchAssistantProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  activeQueryString?: string;
}

const PROMPT_CHIPS = [
  "Find hospitals near Whitefield",
  "Show tourist attractions in Bengaluru",
  "Suggest restaurants near MG Road",
  "Find shopping malls near metro stations",
  "Show colleges around Malleshwaram",
  "Recommend entertainment places nearby"
];

export const SearchAssistant: React.FC<SearchAssistantProps> = ({
  onSearch,
  isLoading,
  activeQueryString = '',
}) => {
  const [query, setQuery] = useState(activeQueryString);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (chipText: string) => {
    setQuery(chipText);
    onSearch(chipText);
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E8EBF0] shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5681EB]/10 text-[#5681EB] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#171B24]">
              Where would you like to explore today?
            </h3>
            <p className="text-[11px] text-[#777F8B]">
              Ask me anything about Bengaluru smart city places.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#777F8B] hover:text-[#171B24] text-[11px] font-medium"
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </button>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative mt-2 flex items-center">
        <div className="absolute left-3 text-[#777F8B]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find good restaurants near Indiranagar, hospitals, metro..."
          className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-[#E8EBF0] focus:border-[#5681EB] focus:ring-2 focus:ring-[#5681EB]/10 outline-none text-xs text-[#171B24] placeholder:text-[#777F8B] bg-slate-50/50"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-12 text-[#777F8B] hover:text-[#171B24] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#5681EB] hover:bg-[#3F6FDB] text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-all shadow-xs"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      </form>

      {/* Suggested Prompt Chips */}
      {isExpanded && (
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-semibold text-[#777F8B] uppercase tracking-wider shrink-0 mr-1">
            Try:
          </span>
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="text-[11px] font-medium text-[#171B24] bg-[#E7EBEF]/50 hover:bg-[#B9E2F1]/50 hover:text-[#3F6FDB] px-2.5 py-1 rounded-lg shrink-0 border border-[#E8EBF0] transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
