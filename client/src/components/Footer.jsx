import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Database, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Platform Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                Prop<span className="text-emerald-500">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modern serverless rental platform bridging tenants and property owners with real-time database discovery and grounded Gemini AI intelligence.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className="inline-flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>MongoDB Source of Truth</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Gemini Powered</span>
              </span>
            </div>
          </div>

          {/* Col 2: Discovery */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  All Rental Properties
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Chennai" className="hover:text-white transition-colors">
                  Rentals in Chennai
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Bangalore" className="hover:text-white transition-colors">
                  Rentals in Bangalore
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Mumbai" className="hover:text-white transition-colors">
                  Rentals in Mumbai
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Property Comparison Matrix
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Owners & Tenants */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Portals & Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Tenant Login & Enquiries
                </Link>
              </li>
              <li>
                <Link to="/properties/new" className="hover:text-white transition-colors">
                  List Your Property (Owner)
                </Link>
              </li>
              <li>
                <Link to="/dashboard/owner" className="hover:text-white transition-colors">
                  Owner Portfolio Dashboard
                </Link>
              </li>
              <li>
                <Link to="/properties?ai=open" className="hover:text-white transition-colors">
                  Conversational AI Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Principles */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quality Assurance
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero AI Hallucination Policy</span>
              </div>
              <p className="text-slate-400 leading-normal">
                All property listings, pricing, and availability strictly come from verified database records.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} PropAI Platform. Built for commercial property excellence.
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Fast Serverless Architecture</span>
            <span>•</span>
            <span>JWT Security</span>
            <span>•</span>
            <span>Tailwind & Framer Motion</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
