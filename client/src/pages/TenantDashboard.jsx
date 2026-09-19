import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Scale,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { shortlistService } from '../services/shortlistService';
import { enquiryService } from '../services/enquiryService';
import PropertyCard from '../components/PropertyCard';
import { PropertyGridSkeleton } from '../components/LoadingSkeleton';

const TenantDashboard = () => {
  const { user } = useAuth();
  const { comparedProperties } = useCompare();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [shortlists, setShortlists] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingShortlists, setLoadingShortlists] = useState(true);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [slRes, enqRes] = await Promise.all([
          shortlistService.getShortlists(),
          enquiryService.getTenantEnquiries(),
        ]);
        setShortlists(slRes.properties || []);
        setEnquiries(enqRes.enquiries || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoadingShortlists(false);
        setLoadingEnquiries(false);
      }
    };
    loadData();
  }, []);

  const handleRemoveShortlist = async (propId) => {
    try {
      await shortlistService.removeShortlist(propId);
      setShortlists((prev) => prev.filter((p) => p._id !== propId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
            Tenant Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Tenant'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your saved listings, direct enquiries, and compare features all in one place.
          </p>
        </div>

        <Link
          to="/properties"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <span>Explore More Homes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Building },
          { id: 'shortlisted', label: `Saved Listings (${shortlists.length})`, icon: Heart },
          { id: 'enquiries', label: `My Enquiries (${enquiries.length})`, icon: MessageSquare },
          { id: 'compare', label: `Compared (${comparedProperties.length})`, icon: Scale },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${
                isCurrent
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-rose-100" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{shortlists.length}</div>
                <div className="text-xs text-slate-500 font-medium">Saved Properties</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{enquiries.length}</div>
                <div className="text-xs text-slate-500 font-medium">Active Enquiries Sent</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {comparedProperties.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">In Comparison Matrix</div>
              </div>
            </div>
          </div>

          {/* Recent Shortlists Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Saved Properties</h2>
              {shortlists.length > 0 && (
                <button
                  onClick={() => setSearchParams({ tab: 'shortlisted' })}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All ({shortlists.length})
                </button>
              )}
            </div>

            {loadingShortlists ? (
              <PropertyGridSkeleton count={3} />
            ) : shortlists.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
                <p className="text-sm text-slate-500">You haven't saved any listings yet.</p>
                <Link
                  to="/properties"
                  className="inline-block text-xs font-bold text-emerald-600 hover:underline"
                >
                  Browse available properties →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlists.slice(0, 3).map((prop) => (
                  <PropertyCard key={prop._id} property={prop} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Shortlisted */}
      {activeTab === 'shortlisted' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Your Shortlisted Properties</h2>
          {loadingShortlists ? (
            <PropertyGridSkeleton count={6} />
          ) : shortlists.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Your shortlist is empty</h3>
              <p className="text-xs text-slate-500">Click the heart icon on any property to save it here.</p>
              <Link
                to="/properties"
                className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortlists.map((prop) => (
                <div key={prop._id} className="relative group">
                  <PropertyCard property={prop} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Enquiries Sent to Property Owners</h2>
          {loadingEnquiries ? (
            <div className="text-center py-12 text-sm text-slate-400">Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No enquiries submitted yet</h3>
              <p className="text-xs text-slate-500">
                When you click "Enquire Now" on a listing, your request and owner replies will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <Link
                        to={`/properties/${enq.propertyId?._id}`}
                        className="font-bold text-slate-900 hover:text-emerald-600 text-sm sm:text-base"
                      >
                        {enq.propertyId?.title || 'Rental Listing'}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {enq.propertyId?.location?.area}, {enq.propertyId?.location?.city} • ₹
                        {enq.propertyId?.rent?.toLocaleString('en-IN')}/mo
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto capitalize ${
                        enq.status === 'new'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'contacted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Status: {enq.status}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-900">Your Message: </span>
                    "{enq.message}"
                  </div>

                  {/* Owner Notes if available */}
                  {enq.ownerNotes && (
                    <div className="text-xs text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <span className="font-bold">Owner Note: </span>
                      {enq.ownerNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Sent on {new Date(enq.createdAt).toLocaleDateString()}</span>
                    <span>Owner: {enq.ownerId?.name || 'Property Owner'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Compare */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Compared Properties</h2>
            {comparedProperties.length > 0 && (
              <Link
                to="/compare"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Open Full Comparison Table →
              </Link>
            )}
          </div>
          {comparedProperties.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Scale className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No properties in comparison</h3>
              <p className="text-xs text-slate-500">
                Click the scale icon on listings to compare up to 4 homes side-by-side.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparedProperties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Account Profile</h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase">Full Name</label>
              <div className="font-semibold text-slate-800">{user?.name}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase">Email</label>
              <div className="font-semibold text-slate-800">{user?.email}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase">Phone</label>
              <div className="font-semibold text-slate-800">{user?.phone || 'Not provided'}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase">Account Role</label>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
