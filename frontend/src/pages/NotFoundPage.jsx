import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, Home, Search } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-teal-600 mx-auto flex items-center justify-center">
          <Factory className="w-7 h-7" />
        </div>
        <span className="text-4xl font-extrabold text-navy-950">404</span>
        <h1 className="text-lg font-bold text-slate-800">Page Not Found</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested page or resource could not be found. It may have been moved, deleted, or never existed.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-950 transition-colors shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
