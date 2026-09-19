import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  User,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { enquiryService } from '../services/enquiryService';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'properties';

  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [propsRes, enqRes] = await Promise.all([
        propertyService.getMyProperties(),
        enquiryService.getOwnerEnquiries(),
      ]);
      setProperties(propsRes.properties || []);
      setEnquiries(enqRes.enquiries || []);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const handleToggleAvailability = async (prop) => {
    const newStatus = prop.status === 'available' ? 'rented' : 'available';
    try {
      await propertyService.updateProperty(prop._id, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => (p._id === prop._id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) {
      return;
    }
    try {
      await propertyService.deleteProperty(propId);
      setProperties((prev) => prev.filter((p) => p._id !== propId));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleEnquiryStatusChange = async (enquiryId, newStatus) => {
    setStatusUpdating(enquiryId);
    try {
      await enquiryService.updateEnquiryStatus(enquiryId, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      alert('Failed to update enquiry status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const activeListingsCount = properties.filter((p) => p.status === 'available').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
            Owner Portfolio Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Property Owner'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your listings, toggle availability, and track prospective tenant inquiries in real-time.
          </p>
        </div>

        <Link
          to="/properties/new"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/30 inline-flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing</span>
        </Link>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{properties.length}</div>
            <div className="text-xs text-slate-500 font-medium">
              Total Properties ({activeListingsCount} Active)
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{enquiries.length}</div>
            <div className="text-xs text-slate-500 font-medium">
              Tenant Enquiries ({newEnquiriesCount} New)
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {properties.reduce((sum, p) => sum + (p.viewCount || 0), 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Listing Views</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSearchParams({ tab: 'properties' })}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'properties'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Listings ({properties.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'enquiries' })}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'enquiries'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Received Enquiries ({enquiries.length})</span>
          {newEnquiriesCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold rounded-full text-[10px]">
              {newEnquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB: My Listings */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-400">Loading your listings...</div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">You haven't added any properties yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                List your apartment, villa, or independent house to start receiving verified tenant enquiries.
              </p>
              <Link
                to="/properties/new"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Listing</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-4">Property</th>
                      <th className="p-4">Rent & Deposit</th>
                      <th className="p-4">Views & Enquiries</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {properties.map((prop) => (
                      <tr key={prop._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'}
                              alt={prop.title}
                              className="w-16 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div>
                              <Link
                                to={`/properties/${prop._id}`}
                                className="font-bold text-slate-900 hover:text-emerald-600 line-clamp-1"
                              >
                                {prop.title}
                              </Link>
                              <div className="text-xs text-slate-500">
                                {prop.bedrooms} BHK • {prop.propertyType} • {prop.location?.area},{' '}
                                {prop.location?.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-emerald-700">
                            ₹{prop.rent?.toLocaleString('en-IN')}/mo
                          </div>
                          <div className="text-xs text-slate-400">
                            Deposit: ₹{prop.deposit?.toLocaleString('en-IN')}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{prop.viewCount || 0}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{prop.totalEnquiries || 0} Enquiries</span>
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleAvailability(prop)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              prop.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Click to toggle availability"
                          >
                            {prop.status === 'available' ? '● Available' : '○ Rented'}
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/properties/${prop._id}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="View Public Listing"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/properties/${prop._id}/edit`}
                              className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                              title="Edit Listing"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(prop._id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Received Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-400">Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No enquiries received yet</h3>
              <p className="text-xs text-slate-500">
                When prospective tenants submit an inquiry about your listings, they will be listed here with contact details.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq._id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-slate-900">{enq.name}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            enq.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : enq.status === 'contacted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${enq.email}`} className="hover:underline">
                            {enq.email}
                          </a>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`tel:${enq.phone}`} className="hover:underline font-medium">
                            {enq.phone}
                          </a>
                        </span>
                      </div>
                    </div>

                    {/* Quick Status Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEnquiryStatusChange(enq._id, 'contacted')}
                        disabled={statusUpdating === enq._id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          enq.status === 'contacted'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                        }`}
                      >
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => handleEnquiryStatusChange(enq._id, 'closed')}
                        disabled={statusUpdating === enq._id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          enq.status === 'closed'
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Enquiry Message */}
                  <div className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="font-semibold text-slate-800 mb-1">Tenant Message:</div>
                    "{enq.message}"
                  </div>

                  {/* Property Link */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      Listing:{' '}
                      <Link
                        to={`/properties/${enq.propertyId?._id}`}
                        className="font-semibold text-emerald-700 hover:underline"
                      >
                        {enq.propertyId?.title}
                      </Link>
                    </span>
                    <span>Received on {new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
