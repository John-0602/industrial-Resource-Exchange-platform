import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  Inbox, 
  Send, 
  LogOut, 
  User, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-navy-900 text-teal-400 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-navy-950 tracking-tight">Resource<span className="text-teal-600">Hub</span></span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                Campus Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/marketplace')
                  ? 'bg-navy-50 text-navy-900 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Marketplace
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-navy-50 text-navy-900 font-semibold'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/requests/received"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/requests/received')
                      ? 'bg-navy-50 text-navy-900 font-semibold'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  Received Requests
                </Link>
              </>
            )}
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/add-resource"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Resource</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
                >
                  <img
                    src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Student'}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate max-w-[120px]">{user?.department}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                      <p className="text-[11px] text-teal-700 font-medium truncate">{user?.collegeName}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/my-listings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        My Listings
                      </Link>
                      <Link
                        to="/requests/sent"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                      >
                        <Send className="w-4 h-4 text-slate-400" />
                        Sent Requests
                      </Link>
                      <Link
                        to="/requests/received"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                      >
                        <Inbox className="w-4 h-4 text-slate-400" />
                        Received Requests
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Student Profile
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-medium text-white bg-navy-900 hover:bg-navy-950 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/add-resource"
              className="p-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100"
              title="Add Resource"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-3">
              <img
                src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Student'}`}
                alt={user?.name}
                className="w-10 h-10 rounded-full border border-slate-300"
              />
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          )}

          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Marketplace
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/my-listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Listings
              </Link>
              <Link
                to="/requests/sent"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Sent Requests
              </Link>
              <Link
                to="/requests/received"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Received Requests
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium"
              >
                Create Student Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
