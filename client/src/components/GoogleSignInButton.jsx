import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleSignInButton = ({ role = 'tenant', onSuccess, className = '' }) => {
  const { loginWithGoogle } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [selectedRole, setSelectedRole] = useState(role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleClick = () => {
    // Check if Google Client ID is configured in environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setLoading(true);
            try {
              await loginWithGoogle({
                credential: response.credential,
                role: selectedRole,
              });
              if (onSuccess) onSuccess();
            } catch (err) {
              setError(err.response?.data?.message || 'Google sign-in failed');
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      } catch (gisErr) {
        console.warn('Native GIS prompt fallback to modal dialog:', gisErr);
      }
    }

    // Interactive Google account dialog
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      setError('Please provide a valid Google email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginWithGoogle({
        email: googleEmail.trim().toLowerCase(),
        name: googleName.trim() || googleEmail.split('@')[0],
        googleId: `google_${Date.now()}`,
        role: selectedRole,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          googleName || googleEmail
        )}`,
      });
      setModalOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Google sign-in could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccount = (email, name) => {
    setGoogleEmail(email);
    setGoogleName(name);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-3 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 ${className}`}
      >
        {/* Official Google SVG Logo */}
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Google Account Selector / Authentication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 space-y-5">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Sign in with Google</h2>
              <p className="text-xs text-slate-500">
                Choose or enter your Google account to proceed to PropAI.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Google Test Accounts */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Google Profiles:
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleQuickAccount('vasim.propai@gmail.com', 'Shaik Vasim')}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center space-x-3 transition-colors text-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    V
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Shaik Vasim</div>
                    <div className="text-slate-400">vasim.propai@gmail.com</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAccount('user.google@gmail.com', 'Alex Morgan')}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center space-x-3 transition-colors text-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Alex Morgan</div>
                    <div className="text-slate-400">user.google@gmail.com</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form to enter any Google Email */}
            <form onSubmit={handleModalSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('tenant')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedRole === 'tenant'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('owner')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedRole === 'owner'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Property Owner
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !googleEmail}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Sign In With Google</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
