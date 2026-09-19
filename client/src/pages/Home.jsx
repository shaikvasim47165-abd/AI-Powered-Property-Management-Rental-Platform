import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight,
  MapPin,
  BedDouble,
  ChevronRight,
  Layers,
  Users,
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import AISearchBar from '../components/AISearchBar';
import { PropertyGridSkeleton } from '../components/LoadingSkeleton';

const CITIES_SHOWCASE = [
  {
    name: 'Chennai',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    tagline: 'Tambaram, OMR, Anna Nagar',
  },
  {
    name: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    tagline: 'Whitefield, Koramangala, Indiranagar',
  },
  {
    name: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80',
    tagline: 'Bandra, Powai, Andheri',
  },
  {
    name: 'Hyderabad',
    image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=600&q=80',
    tagline: 'Hitec City, Gachibowli, Jubilee Hills',
  },
];

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAISearch, setShowAISearch] = useState(false);
  const [quickCity, setQuickCity] = useState('');
  const [quickBeds, setQuickBeds] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await propertyService.getFeaturedProperties();
        setFeaturedProperties(data.properties || []);
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickCity) params.append('city', quickCity);
    if (quickBeds) params.append('bedrooms', quickBeds);
    navigate(`/properties?${params.toString()}`);
  };

  const handleAISearchResult = (data) => {
    if (data && data.properties) {
      navigate('/properties', { state: { aiResult: data } });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Rental Platform Powered by Database Truth & Gemini AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-white">
              Discover your next rental with <span className="text-emerald-400">intelligent certainty.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Connect directly with verified property owners. Use standard filters or converse naturally with our AI assistant to discover homes matching your exact lifestyle.
            </p>

            {/* Mode Switch Button */}
            <div className="flex justify-center pt-2">
              <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 inline-flex shadow-lg">
                <button
                  type="button"
                  onClick={() => setShowAISearch(false)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    !showAISearch
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowAISearch(true)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                    showAISearch
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Natural Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar Container */}
          <div className="mt-8 max-w-4xl mx-auto">
            {showAISearch ? (
              <AISearchBar onAISearchResult={handleAISearchResult} />
            ) : (
              <form
                onSubmit={handleQuickSearch}
                className="bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-slate-800"
              >
                {/* City */}
                <div className="sm:col-span-4 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    City / Location
                  </label>
                  <select
                    value={quickCity}
                    onChange={(e) => setQuickCity(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Metros</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div className="sm:col-span-4 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bedrooms
                  </label>
                  <select
                    value={quickBeds}
                    onChange={(e) => setQuickBeds(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">Any Bedrooms</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>

                {/* Submit button */}
                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Properties</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-center border-t border-slate-800/80 pt-8 text-slate-300">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Database Truth</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">0%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">AI Hallucinations</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 100ms</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Search Latency</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Direct</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Owner Enquiries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Handpicked Homes
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured Rental Properties
            </h2>
          </div>
          <Link
            to="/properties"
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Browse All Listings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <PropertyGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Metros Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Top Locations
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Explore Prime Metropolitan Hubs
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Discover rental listings in India's top tech corridors and vibrant neighborhoods.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CITIES_SHOWCASE.map((city) => (
            <Link
              key={city.name}
              to={`/properties?city=${city.name}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-xl font-bold">{city.name}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">{city.tagline}</p>
                <div className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                  <span>Explore rentals</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works (Spec Sections 1, 2, 40) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Simple & Reliable
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How PropAI Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed with strict architectural separation so you get the best of fast database queries and conversational AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Natural or Filtered Search</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by bedrooms, rent, city, and amenities, or type conversational queries like "2BHK near metro with parking". Gemini parses the parameters into precise database criteria.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Grounded Listing Q&A</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Have questions about parking, deposit, or furnishings? Ask our listing-grounded assistant. It answers exclusively with facts from the real MongoDB property record.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Direct Owner Contact</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Found the right home? Submit an enquiry with 1 click. Owners receive inquiries directly on their dashboard and can update status to keep you informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
              For Property Owners
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              List your property and reach high-intent tenants today.
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Manage your portfolio, upload photos, track enquiries, and toggle listing availability—all from a sleek, intuitive owner portal.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/properties/new"
                className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-md hover:bg-slate-100 transition-all flex items-center space-x-2"
              >
                <span>Add Your Property</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Owner Login
              </Link>
            </div>
          </div>

          <div className="hidden md:block w-72 h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-2 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
              alt="Luxury modern property"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
