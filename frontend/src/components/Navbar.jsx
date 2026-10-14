import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CompanyBadge } from './CompanyBadge';
import { 
  Factory, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  Send, 
  Inbox, 
  LogOut, 
  Building2, 
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  FileText,
  Truck
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-navy-950 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500 text-navy-950 flex items-center justify-center font-extrabold shadow-sm">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">IREP<span className="text-teal-400 font-light">.portal</span></span>
                <span className="text-[10px] font-semibold bg-navy-800 text-teal-300 px-1.5 py-0.5 rounded border border-slate-700">
                  Circular B2B
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Industrial Resource & By-Product Exchange</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/marketplace"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                isActive('/marketplace')
                  ? 'bg-navy-800 text-teal-400'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              Material Catalog
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/matching"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    isActive('/matching')
                      ? 'bg-navy-800 text-teal-400'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Matching Engine</span>
                </Link>

                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-navy-800 text-teal-400'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 bg-teal-900/40 text-teal-300 border border-teal-700/60`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Review</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Actions & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/post-requirement"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-navy-900 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Post Requirement</span>
                </Link>

                <Link
                  to="/publish-resource"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-navy-950 text-xs font-bold transition-all shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Publish Material</span>
                </Link>

                <div className="relative ml-2">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-navy-900 border border-slate-800 hover:border-slate-700 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded bg-teal-900/60 border border-teal-600/40 flex items-center justify-center text-teal-300 font-bold text-xs">
                      {user?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <p className="font-semibold text-slate-200 truncate max-w-[140px]">{user?.name}</p>
                      <p className="text-slate-400 text-[10px] truncate max-w-[140px]">{user?.city}, {user?.state}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Registered Enterprise</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1.5">
                          <CompanyBadge status={user?.verificationStatus} />
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Industrial Dashboard
                        </Link>
                        <Link
                          to="/my-listings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          My Material Listings
                        </Link>
                        <Link
                          to="/matching"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          Matching & Requirements
                        </Link>
                        <Link
                          to="/requests/received"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Inbox className="w-4 h-4 text-slate-400" />
                          Received Proposals
                        </Link>
                        <Link
                          to="/requests/sent"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Send className="w-4 h-4 text-slate-400" />
                          Sent Procurement Proposals
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Truck className="w-4 h-4 text-slate-400" />
                          Transfer Tracking & History
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          Company Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold"
                          >
                            <ShieldAlert className="w-4 h-4 text-amber-700" />
                            Admin Moderation Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-900 rounded-lg transition-colors"
                >
                  Enterprise Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm transition-colors"
                >
                  Register Company
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:bg-navy-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-navy-950 px-4 pt-3 pb-6 space-y-2 text-sm">
          {isAuthenticated && (
            <div className="p-3 bg-navy-900 rounded-lg mb-3 border border-slate-800">
              <p className="font-bold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="mt-2">
                <CompanyBadge status={user?.verificationStatus} />
              </div>
            </div>
          )}

          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
          >
            Material Catalog
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Dashboard
              </Link>
              <Link
                to="/matching"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-teal-300 hover:bg-navy-900"
              >
                Matching Engine
              </Link>
              <Link
                to="/publish-resource"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Publish Material Listing
              </Link>
              <Link
                to="/post-requirement"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Post Material Requirement
              </Link>
              <Link
                to="/my-listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                My Listings
              </Link>
              <Link
                to="/requests/received"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Received Proposals
              </Link>
              <Link
                to="/requests/sent"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Sent Proposals
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Transfer Tracking
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-navy-900"
              >
                Company Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-amber-300 font-semibold hover:bg-navy-900"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-navy-900 rounded-md font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-navy-900 text-white border border-slate-700 text-xs font-semibold"
              >
                Enterprise Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-teal-400 text-navy-950 text-xs font-bold"
              >
                Register Company
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
