import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import ComparePage from './pages/ComparePage';
import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CompareProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/compare" element={<ComparePage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Tenant Protected Routes */}
                <Route
                  path="/dashboard/tenant"
                  element={
                    <ProtectedRoute allowedRoles={['tenant']}>
                      <TenantDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Protected Routes */}
                <Route
                  path="/dashboard/owner"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/properties/new"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <AddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/properties/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <EditProperty />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CompareProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
