import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, BedDouble, Bath, Maximize2, Scale, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

const PropertyCard = ({ property }) => {
  const { isShortlisted, toggleShortlist, isAuthenticated } = useAuth();
  const { isInCompare, toggleCompare } = useCompare();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'];

  const saved = isShortlisted(property._id);
  const compared = isInCompare(property._id);

  const handleShortlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in as a Tenant to save properties to your shortlist.');
      return;
    }
    await toggleShortlist(property);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleCompare(property);
    if (!res.added && res.message) {
      alert(res.message);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col"
    >
      {/* Image Gallery Preview Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={images[currentImgIndex]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient Overlay on bottom of image for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-900 shadow-sm backdrop-blur-md">
            {property.propertyType}
          </span>
          {property.featured && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Top Right Actions: Shortlist Heart & Compare */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {/* Quick Compare Button */}
          <button
            onClick={handleCompareClick}
            type="button"
            title={compared ? 'Remove from Comparison' : 'Add to Comparison'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              compared
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-emerald-600'
            }`}
          >
            {compared ? <Check className="w-4 h-4 stroke-[3]" /> : <Scale className="w-4 h-4" />}
          </button>

          {/* Shortlist Heart */}
          <button
            onClick={handleShortlistClick}
            type="button"
            title={saved ? 'Remove from Shortlist' : 'Save to Shortlist'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              saved
                ? 'bg-rose-500 text-white ring-2 ring-rose-300'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Info: Pricing */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white z-10">
          <div>
            <span className="text-xl font-extrabold tracking-tight">
              ₹{property.rent?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-200 font-medium"> /month</span>
          </div>
          <div className="text-xs text-slate-200 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
            Dep: ₹{property.deposit?.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Multiple Images Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location Line */}
          <div className="flex items-center text-xs text-slate-500 mb-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location?.area}, {property.location?.city}</span>
          </div>

          {/* Title */}
          <Link
            to={`/properties/${property._id}`}
            className="block font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 text-base leading-snug mb-2"
          >
            {property.title}
          </Link>

          {/* Core Specs Row: Beds, Baths, Area */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium mb-3">
            <div className="flex items-center space-x-1.5">
              <BedDouble className="w-4 h-4 text-emerald-600" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-emerald-600" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>{property.areaSqFt} sq.ft</span>
            </div>
          </div>

          {/* Amenities Pills (Max 3) */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {property.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            property.furnishingStatus === 'Furnished'
              ? 'bg-emerald-50 text-emerald-700'
              : property.furnishingStatus === 'Semi-Furnished'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {property.furnishingStatus || (property.furnished ? 'Furnished' : 'Unfurnished')}
          </span>

          <Link
            to={`/properties/${property._id}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center"
          >
            <span>View Details</span>
            <span className="ml-1 text-sm">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
