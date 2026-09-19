import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { shortlistService } from '../services/shortlistService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [shortlistIds, setShortlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user and their shortlists if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          setToken(storedToken);

          // If tenant, fetch shortlisted IDs
          if (res.user.role === 'tenant') {
            try {
              const slRes = await shortlistService.getShortlists();
              setShortlistIds(slRes.properties.map((p) => p._id));
            } catch (slErr) {
              console.warn('Could not load shortlists:', slErr);
            }
          }
        } catch (err) {
          console.warn('Token validation failed:', err);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setToken(res.token);

    if (res.user.role === 'tenant') {
      try {
        const slRes = await shortlistService.getShortlists();
        setShortlistIds(slRes.properties.map((p) => p._id));
      } catch (e) {
        setShortlistIds([]);
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.user);
    setToken(res.token);
    setShortlistIds([]);
    return res;
  };

  // Robust 1-Click Demo Login (calls dedicated backend /api/auth/demo-login)
  const loginAsDemo = async (role = 'tenant') => {
    const res = await authService.demoLogin(role);
    setUser(res.user);
    setToken(res.token);

    if (res.user.role === 'tenant') {
      try {
        const slRes = await shortlistService.getShortlists();
        setShortlistIds(slRes.properties.map((p) => p._id));
      } catch (e) {
        setShortlistIds([]);
      }
    }
    return res;
  };

  // Google OAuth Login
  const loginWithGoogle = async (googleData) => {
    const res = await authService.googleLogin(googleData);
    setUser(res.user);
    setToken(res.token);

    if (res.user.role === 'tenant') {
      try {
        const slRes = await shortlistService.getShortlists();
        setShortlistIds(slRes.properties.map((p) => p._id));
      } catch (e) {
        setShortlistIds([]);
      }
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setShortlistIds([]);
  };

  // Shortlist helpers
  const toggleShortlist = async (property) => {
    if (!user) {
      return { success: false, requireAuth: true };
    }
    const propId = property._id;
    const isSaved = shortlistIds.includes(propId);

    if (isSaved) {
      setShortlistIds((prev) => prev.filter((id) => id !== propId));
      try {
        await shortlistService.removeShortlist(propId);
        return { success: true, saved: false };
      } catch (err) {
        // Rollback
        setShortlistIds((prev) => [...prev, propId]);
        throw err;
      }
    } else {
      setShortlistIds((prev) => [...prev, propId]);
      try {
        await shortlistService.addShortlist(propId);
        return { success: true, saved: true };
      } catch (err) {
        // Rollback
        setShortlistIds((prev) => prev.filter((id) => id !== propId));
        throw err;
      }
    }
  };

  const isShortlisted = (propertyId) => shortlistIds.includes(propertyId);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isOwner: user?.role === 'owner',
        isTenant: user?.role === 'tenant',
        shortlistIds,
        login,
        register,
        logout,
        loginAsDemo,
        loginWithGoogle,
        toggleShortlist,
        isShortlisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
