import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Lock, Mail, Loader2, User, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const target = redirectPath || (res.user.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant');
      navigate(target);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      const res = await loginAsDemo(role);
      const target = redirectPath || (res.user.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant');
      navigate(target);
    } catch (err) {
      console.error('Demo login error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not complete demo login. Please verify the backend server is active.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const target = redirectPath || (user.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant');
    navigate(target);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-900 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">
              Prop<span className="text-emerald-600">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your tenant shortlists or manage your owner listings.
          </p>
        </div>

        {/* 1-Click Quick Demo Login Personas */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Quick 1-Click Evaluator Logins
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('tenant')}
              className="py-2.5 px-3 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Tenant</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('owner')}
              className="py-2.5 px-3 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Owner</span>
            </button>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-3">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
              or sign in with email
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
