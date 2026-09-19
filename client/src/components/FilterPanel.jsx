import React from 'react';
import { Filter, RotateCcw, X, IndianRupee } from 'lucide-react';

const CITIES = ['All', 'Chennai', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi'];
const PROPERTY_TYPES = ['All', 'Apartment', 'Villa', 'Independent House', 'Studio', 'Penthouse'];
const BEDROOMS = [
  { label: 'All', val: 'all' },
  { label: '1 BHK', val: '1' },
  { label: '2 BHK', val: '2' },
  { label: '3 BHK', val: '3' },
  { label: '4+ BHK', val: '4' },
];
const ALL_AMENITIES = [
  'Parking',
  'Power Backup',
  'Lift',
  'Security',
  'Gym',
  'Swimming Pool',
  'WiFi',
  'Pet Friendly',
  'CCTV',
  'Balcony',
];

const FilterPanel = ({ filters, setFilters, onApply, onReset, isMobile, onClose }) => {
  const handleCityChange = (e) => {
    setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }));
  };

  const handleTypeChange = (type) => {
    setFilters((prev) => ({ ...prev, propertyType: type, page: 1 }));
  };

  const handleBedroomChange = (val) => {
    setFilters((prev) => ({ ...prev, bedrooms: val, page: 1 }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated, page: 1 };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <Filter className="w-5 h-5 text-emerald-600" />
          <span>Filters & Preferences</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            title="Reset Filters"
            className="text-xs text-slate-500 hover:text-emerald-700 font-semibold flex items-center space-x-1 p-1 hover:bg-slate-50 rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          City
        </label>
        <select
          value={filters.city || 'All'}
          onChange={handleCityChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Locations' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Bedrooms (BHK)
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {BEDROOMS.map((item) => {
            const isSelected = (filters.bedrooms || 'all') === item.val;
            return (
              <button
                key={item.val}
                type="button"
                onClick={() => handleBedroomChange(item.val)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rent Range */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Monthly Budget (₹)
          </label>
          <span className="text-xs font-semibold text-emerald-700">
            Up to ₹{Number(filters.maxRent || 100000).toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="10000"
          max="150000"
          step="2500"
          value={filters.maxRent || 100000}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxRent: Number(e.target.value), page: 1 }))
          }
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
          <span>₹10,000</span>
          <span>₹75,000</span>
          <span>₹1,50,000+</span>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Property Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((type) => {
            const isSelected = (filters.propertyType || 'All') === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Furnishing
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Any', val: '' },
            { label: 'Furnished', val: 'true' },
            { label: 'Unfurnished', val: 'false' },
          ].map((item) => {
            const isSelected = (filters.furnished ?? '') === item.val;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, furnished: item.val, page: 1 }))
                }
                className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities Multi-select */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Amenities
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ALL_AMENITIES.map((amenity) => {
            const checked = (filters.amenities || []).includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center space-x-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Apply Button for mobile */}
      {isMobile && (
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md text-sm hover:bg-emerald-700 transition-colors"
        >
          Show Matching Properties
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
