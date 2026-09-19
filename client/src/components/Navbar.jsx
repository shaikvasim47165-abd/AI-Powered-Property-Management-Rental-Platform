import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import {
  Home,
  Sparkles,
  Heart,
  Scale,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  Building2,
  Search,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isOwner, isTenant, shortlistIds, logout, loginAsDemo } = useAuth();
  const { compareCount } = useCompare();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDemoClick = async (role) => {
    setDemoMenuOpen(false);
    try {
      await loginAsDemo(role);
      if (role === 'owner') navigate('/dashboard/owner');
      else navigate('/dashboard/tenant');
    } catch (err) {
      console.error('Navbar demo login error:', err);
      alert(err.response?.data?.message || err.message || 'Could not complete demo login. Please ensure backend is running.');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Prop<span className="text-emerald-600">AI</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  MVP
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1 hidden sm:block">
                Smart Rental Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/properties"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/properties')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Explore Properties</span>
              </span>
            </Link>

            {/* Quick AI Search Trigger */}
            <Link
              to="/properties?ai=open"
              className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              <span>AI Search</span>
            </Link>

            {/* Comparison Badge */}
            {compareCount > 0 && (
              <Link
                to="/compare"
                className="relative px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                title="Compare Selected Properties"
              >
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Compare</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  {compareCount}
                </span>
              </Link>
            )}

            {/* Tenant Shortlists */}
            {isTenant && (
              <Link
                to="/dashboard/tenant?tab=shortlisted"
                className="relative px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center space-x-1"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                <span>Saved</span>
                {shortlistIds.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                    {shortlistIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* Owner Add Property Button */}
            {isOwner && (
              <Link
                to="/properties/new"
                className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Add Property</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Side / Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                {/* Demo Logins Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1 border border-slate-300/80"
                  >
                    <span>Quick Demo Login</span>
                    <span className="text-[10px]">▼</span>
                  </button>

                  {demoMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        1-Click Test Personas
                      </div>
                      <button
                        onClick={() => handleDemoClick('tenant')}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-medium">Demo Tenant</div>
                          <div className="text-xs text-slate-400">Priya Patel</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDemoClick('owner')}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-medium">Demo Owner</div>
                          <div className="text-xs text-slate-400">Rajesh Sharma</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:shadow"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Role Specific Dashboard Link */}
                <Link
                  to={isOwner ? '/dashboard/owner' : '/dashboard/tenant'}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-600" />
                  <span>Dashboard</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded capitalize ${
                    isOwner ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {compareCount > 0 && (
              <Link
                to="/compare"
                className="p-2 text-emerald-600 font-bold text-xs flex items-center"
              >
                <Scale className="w-5 h-5" />
                <span className="ml-1 bg-emerald-600 text-white rounded-full px-1">
                  {compareCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top">
          <Link
            to="/properties"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore Properties
          </Link>
          <Link
            to="/properties?ai=open"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 bg-emerald-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Natural Search</span>
          </Link>

          {isTenant && (
            <Link
              to="/dashboard/tenant?tab=shortlisted"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Saved Properties ({shortlistIds.length})
            </Link>
          )}

          {isOwner && (
            <Link
              to="/properties/new"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              + Add Property
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {!isAuthenticated ? (
              <>
                <div className="grid grid-cols-2 gap-2 pb-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleDemoClick('tenant');
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700"
                  >
                    Demo Tenant
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleDemoClick('owner');
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700"
                  >
                    Demo Owner
                  </button>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={isOwner ? '/dashboard/owner' : '/dashboard/tenant'}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg bg-slate-100 font-semibold text-slate-800 text-sm"
                >
                  Go to {isOwner ? 'Owner' : 'Tenant'} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-center py-2.5 rounded-lg text-rose-600 font-semibold text-sm hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
