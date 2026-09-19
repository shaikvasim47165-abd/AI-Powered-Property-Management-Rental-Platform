import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Building,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import FilterPanel from '../components/FilterPanel';
import AISearchBar from '../components/AISearchBar';
import { PropertyGridSkeleton } from '../components/LoadingSkeleton';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAISearch, setShowAISearch] = useState(() => {
    return searchParams.get('ai') === 'open' || !!location.state?.aiResult;
  });
  const [aiResultData, setAiResultData] = useState(() => {
    return location.state?.aiResult || null;
  });

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    bedrooms: searchParams.get('bedrooms') || 'all',
    propertyType: searchParams.get('propertyType') || 'All',
    maxRent: searchParams.get('maxRent') || 100000,
    furnished: searchParams.get('furnished') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  // Fetch properties from backend
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 9,
        sort: filters.sort,
      };

      if (filters.search) params.search = filters.search;
      if (filters.city && filters.city !== 'All') params.city = filters.city;
      if (filters.bedrooms && filters.bedrooms !== 'all') params.bedrooms = filters.bedrooms;
      if (filters.propertyType && filters.propertyType !== 'All') params.propertyType = filters.propertyType;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      if (filters.furnished !== '') params.furnished = filters.furnished;
      if (filters.amenities && filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(',');
      }

      const res = await propertyService.getProperties(params);
      setProperties(res.properties || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch whenever filters change
  useEffect(() => {
    // If we have an AI search result active and user hasn't touched manual filters, show AI results
    if (aiResultData && aiResultData.properties) {
      setProperties(aiResultData.properties);
      setTotal(aiResultData.count || aiResultData.properties.length);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    fetchProperties();
  }, [filters, aiResultData]);

  // Handle AI Search result callback
  const handleAISearchResult = (data) => {
    if (data) {
      setAiResultData(data);
    } else {
      setAiResultData(null);
      fetchProperties();
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: '',
      bedrooms: 'all',
      propertyType: 'All',
      maxRent: 100000,
      furnished: '',
      amenities: [],
      sort: 'newest',
      page: 1,
    });
    setAiResultData(null);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Rental Properties
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real, verified listings direct from property owners with transparent pricing.
          </p>
        </div>

        {/* Toggle AI Search Bar vs Standard */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowAISearch(!showAISearch);
              if (showAISearch) {
                setAiResultData(null);
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              showAISearch
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{showAISearch ? 'Hide AI Search' : 'Open AI Search'}</span>
          </button>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Embedded AI Search Bar if toggled */}
      {showAISearch && (
        <div className="animate-in fade-in duration-300">
          <AISearchBar onAISearchResult={handleAISearchResult} />
        </div>
      )}

      {/* Main Grid with Sidebar Filter and Results */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-24">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onApply={fetchProperties}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden flex justify-end">
            <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-4 animate-in slide-in-from-right">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onApply={() => {
                  setMobileFilterOpen(false);
                  fetchProperties();
                }}
                onReset={handleResetFilters}
                isMobile={true}
                onClose={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* Controls Bar: Search Input, Count & Sort */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
                  setAiResultData(null);
                }}
                placeholder="Search area, society, keywords..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              />
            </div>

            {/* Results Count & Sort Dropdown */}
            <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
              <div className="text-xs font-bold text-slate-500">
                <span>Showing </span>
                <span className="text-slate-900 font-extrabold">{total}</span>
                <span> properties</span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filters.sort}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }));
                    setAiResultData(null);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Search Active Notification Banner */}
          {aiResultData && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">AI Query Filter Active: </span>
                  <span>"{aiResultData.originalQuery}"</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setAiResultData(null);
                  fetchProperties();
                }}
                className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg font-bold text-xs hover:bg-emerald-100 flex-shrink-0"
              >
                Reset to All
              </button>
            </div>
          )}

          {/* Properties Grid */}
          {loading ? (
            <PropertyGridSkeleton count={6} />
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                We couldn't find any listings matching your specific combination of filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!aiResultData && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={filters.page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-600 px-3 py-1">
                Page {filters.page} of {totalPages}
              </span>

              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={filters.page >= totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
