import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, Loader2, X, SlidersHorizontal } from 'lucide-react';
import { aiService } from '../services/aiService';

const SAMPLE_PROMPTS = [
  'Show me a 2BHK in Chennai with parking under 25k',
  'Luxury 3BHK penthouse in Bangalore with gym and pool',
  'Sea-facing 2BHK apartment in Mumbai with balcony',
  'Cozy furnished studio in Koramangala under 20k',
  'Pet-friendly villa with private garden',
];

const AISearchBar = ({ onAISearchResult, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const handleSearch = async (promptText) => {
    const textToSearch = promptText || query;
    if (!textToSearch || textToSearch.trim() === '') return;

    setLoading(true);
    setError('');

    try {
      const data = await aiService.searchAI(textToSearch.trim());
      setLastResult(data);
      if (onAISearchResult) {
        onAISearchResult(data);
      }
    } catch (err) {
      console.error('AI search failed:', err);
      setError(
        err.response?.data?.message ||
          'AI Search is temporarily taking a breather. Please try standard filters or rephrase.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setLastResult(null);
    setError('');
    if (onAISearchResult) {
      onAISearchResult(null);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-8 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-4">
        {/* Header Tag */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-300" />
            <span>AI Natural Language Search</span>
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Describe your ideal rental in plain English
          </span>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 pointer-events-none text-emerald-400">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Show me a 2BHK near metro with parking under 25k in Chennai'..."
            disabled={loading}
            className="w-full pl-12 pr-28 py-4 sm:py-4.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 backdrop-blur-md text-sm sm:text-base transition-all font-medium"
          />

          <div className="absolute right-2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Thinking...' : 'Search'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Sample Prompt Pills */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Try asking:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  handleSearch(prompt);
                }}
                className="px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all text-left flex items-center space-x-1.5"
              >
                <span className="text-emerald-400 font-bold">↳</span>
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 text-rose-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Explanation & Extracted Filter Pills */}
        {lastResult && (
          <div className="pt-3 border-t border-white/10 space-y-2.5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-300 font-medium">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>{lastResult.aiExplanation}</span>
              </div>
              <button
                onClick={handleClear}
                className="text-[11px] text-slate-400 hover:text-white underline self-start sm:self-auto"
              >
                Clear AI Filter & Reset
              </button>
            </div>

            {/* Extracted filters display */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                Extracted:
              </span>
              {lastResult.extractedFilters.city && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                  📍 {lastResult.extractedFilters.city}
                </span>
              )}
              {lastResult.extractedFilters.bedrooms !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 border border-teal-400/30 text-teal-200">
                  🛏️ {lastResult.extractedFilters.bedrooms} BHK
                </span>
              )}
              {lastResult.extractedFilters.maxRent && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 border border-cyan-400/30 text-cyan-200">
                  💰 Max ₹{lastResult.extractedFilters.maxRent.toLocaleString('en-IN')}
                </span>
              )}
              {lastResult.extractedFilters.propertyType && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                  🏢 {lastResult.extractedFilters.propertyType}
                </span>
              )}
              {lastResult.extractedFilters.amenities?.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 border border-slate-600 text-slate-200"
                >
                  ✨ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearchBar;
