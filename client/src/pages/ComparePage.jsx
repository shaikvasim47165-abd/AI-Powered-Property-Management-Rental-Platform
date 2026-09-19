import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Trash2, ArrowLeft, Check, X, Building, CheckCircle2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

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

const ComparePage = () => {
  const { comparedProperties, removeFromCompare, clearCompare } = useCompare();

  if (comparedProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Properties Selected for Comparison</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          You can select up to 4 properties from the Explore page or individual listings to compare features side-by-side.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Properties</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Property Comparison Matrix
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Side-by-side feature and pricing analysis derived strictly from real database records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={clearCompare}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
          <Link
            to="/properties"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Add More (+{4 - comparedProperties.length} left)
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="p-4 w-48 text-xs font-bold uppercase tracking-wider text-slate-400">
                Property Overview
              </th>
              {comparedProperties.map((prop) => (
                <th key={prop._id} className="p-4 w-64 align-top">
                  <div className="space-y-2">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 relative">
                      <img
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFromCompare(prop._id)}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Link
                      to={`/properties/${prop._id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-emerald-600 line-clamp-2"
                    >
                      {prop.title}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {/* Rent */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Monthly Rent</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 font-extrabold text-emerald-700 text-base">
                  ₹{prop.rent?.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Deposit */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Security Deposit</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 font-semibold text-slate-800">
                  ₹{prop.deposit?.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Bedrooms & Type */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Bedrooms & Type</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 text-slate-800">
                  <span className="font-bold">{prop.bedrooms} BHK</span> • {prop.propertyType}
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Bathrooms</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 text-slate-800">
                  {prop.bathrooms}
                </td>
              ))}
            </tr>

            {/* Area */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Super Area</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 text-slate-800">
                  {prop.areaSqFt} sq.ft
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Location</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 text-slate-800 font-medium">
                  {prop.location?.area}, {prop.location?.city}
                </td>
              ))}
            </tr>

            {/* Furnishing */}
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/30">Furnishing</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4 text-slate-800">
                  {prop.furnishingStatus || (prop.furnished ? 'Furnished' : 'Unfurnished')}
                </td>
              ))}
            </tr>

            {/* Amenities Checklist Matrix */}
            <tr className="bg-slate-50">
              <td colSpan={comparedProperties.length + 1} className="p-3 font-bold text-xs uppercase tracking-wider text-slate-500">
                Amenities Breakdown
              </td>
            </tr>

            {ALL_AMENITIES.map((amenity) => (
              <tr key={amenity}>
                <td className="p-3 text-xs font-medium text-slate-600 bg-slate-50/30 pl-4">
                  {amenity}
                </td>
                {comparedProperties.map((prop) => {
                  const hasAmenity = (prop.amenities || []).includes(amenity);
                  return (
                    <td key={prop._id} className="p-3 text-center sm:text-left">
                      {hasAmenity ? (
                        <div className="inline-flex items-center text-emerald-600 font-bold text-xs space-x-1">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span className="hidden sm:inline">Yes</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center text-slate-300 text-xs space-x-1">
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">No</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Action Row */}
            <tr className="bg-slate-50/50">
              <td className="p-4 font-bold text-slate-600">Action</td>
              {comparedProperties.map((prop) => (
                <td key={prop._id} className="p-4">
                  <Link
                    to={`/properties/${prop._id}`}
                    className="block text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    View Listing
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
