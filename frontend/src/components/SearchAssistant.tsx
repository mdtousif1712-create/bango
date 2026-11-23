import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';

interface SearchAssistantProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  activeQueryString?: string;
}

const PROMPT_CHIPS = [
  "Hospitals near Whitefield",
  "Parks near Cubbon Park",
  "Restaurants near MG Road",
  "Shopping near Metro",
  "Colleges in Malleshwaram",
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
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E3DFD7] shadow-lg transition-all duration-300 font-sans">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F02D25] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#191919] font-display">
              Smart Natural Language Query
            </h3>
            <p className="text-[11px] text-[#77736D]">
              Apriori rule matching & domain parser
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#77736D] hover:text-[#191919] text-[11px] font-bold uppercase tracking-wider cursor-pointer"
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </button>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative mt-2 flex items-center">
        <div className="absolute left-3 text-[#77736D]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you want to explore in Bengaluru?"
          className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-[#E3DFD7] focus:border-[#F02D25] outline-none text-xs text-[#191919] placeholder:text-[#77736D] bg-[#F5F3EE]/60 font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-12 text-[#77736D] hover:text-[#191919] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#F02D25] hover:bg-[#E9473D] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
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

      {/* Suggested Quick Prompt Chips */}
      {isExpanded && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E3DFD7]/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D] mr-1">
            Try:
          </span>
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F3EE] hover:bg-[#ECE9E2] text-[#191919] border border-[#E3DFD7]/60 transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
