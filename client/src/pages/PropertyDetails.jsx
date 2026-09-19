import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  Heart,
  Scale,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Check,
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import AIPropertyQA from '../components/AIPropertyQA';
import EnquiryModal from '../components/EnquiryModal';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isShortlisted, toggleShortlist, isAuthenticated } = useAuth();
  const { isInCompare, toggleCompare } = useCompare();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await propertyService.getPropertyById(id);
        setProperty(res.property);
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-sm text-slate-500 mt-4">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Property Listing Not Found</h2>
        <p className="text-sm text-slate-500">This property might have been unlisted or removed.</p>
        <Link
          to="/properties"
          className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Listings</span>
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'];

  const saved = isShortlisted(property._id);
  const compared = isInCompare(property._id);

  const handleShortlist = async () => {
    if (!isAuthenticated) {
      alert('Please sign in as a tenant to shortlist this property.');
      return;
    }
    await toggleShortlist(property);
  };

  const handleCompare = () => {
    const res = toggleCompare(property);
    if (!res.added && res.message) {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listings</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Compare toggle */}
          <button
            onClick={handleCompare}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
              compared
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {compared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{compared ? 'In Compare' : 'Add to Compare'}</span>
          </button>

          {/* Shortlist button */}
          <button
            onClick={handleShortlist}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
              saved
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-white' : 'text-rose-500'}`} />
            <span>{saved ? 'Saved' : 'Shortlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Image Gallery */}
      <div className="space-y-3">
        <div className="aspect-[21/9] sm:aspect-[21/10] w-full rounded-3xl overflow-hidden bg-slate-900 relative shadow-lg">
          <img
            src={images[selectedImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow backdrop-blur-md">
              {property.propertyType}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow">
              {property.status === 'available' ? 'Available for Rent' : 'Rented'}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  idx === selectedImage
                    ? 'border-emerald-600 shadow-md scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Specs, Description, Amenities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Title & Location Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h1>
            <div className="flex items-center text-sm text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-emerald-600 mr-1.5 flex-shrink-0" />
              <span>
                {property.location?.address ? `${property.location.address}, ` : ''}
                {property.location?.area}, {property.location?.city}
                {property.location?.pincode ? ` - ${property.location.pincode}` : ''}
              </span>
            </div>
          </div>

          {/* Key Specs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <BedDouble className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-medium">Bedrooms</div>
              <div className="text-base font-extrabold text-slate-800">{property.bedrooms} BHK</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Bath className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-medium">Bathrooms</div>
              <div className="text-base font-extrabold text-slate-800">{property.bathrooms} Baths</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Maximize2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-medium">Super Area</div>
              <div className="text-base font-extrabold text-slate-800">{property.areaSqFt} sq.ft</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Building2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-medium">Furnishing</div>
              <div className="text-base font-extrabold text-slate-800">
                {property.furnishingStatus || (property.furnished ? 'Furnished' : 'Unfurnished')}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Property Overview</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Amenities & Features</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Standard residential amenities included.</p>
            )}
          </div>

          {/* Embedded AI Property Q&A Assistant */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Ask the Listing Assistant</h2>
            </div>
            <AIPropertyQA property={property} />
          </div>
        </div>

        {/* Right Column: Pricing, Owner Info & Enquiry CTA */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Price & Action Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Rent
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹{property.rent?.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 font-medium"> /month</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between">
                <span>Security Deposit:</span>
                <span className="font-bold text-slate-900">₹{property.deposit?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Main Action: Enquire */}
            <button
              onClick={() => setEnquiryOpen(true)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Enquire with Owner</span>
            </button>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero brokerage enquiry</span>
            </div>
          </div>

          {/* Owner Information Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Listing Owner
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {property.ownerId?.name || 'Verified Property Owner'}
                </div>
                <div className="text-xs text-slate-400">Owner since 2024</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 leading-normal">
              Direct communication enabled through PropAI's enquiry system. Contact details are securely forwarded upon inquiry.
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        property={property}
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </div>
  );
};

export default PropertyDetails;
