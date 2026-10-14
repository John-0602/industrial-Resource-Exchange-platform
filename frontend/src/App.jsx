import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ResourceDetailsPage } from './pages/ResourceDetailsPage';
import { AddResourcePage } from './pages/AddResourcePage';
import { EditResourcePage } from './pages/EditResourcePage';
import { MyListingsPage } from './pages/MyListingsPage';
import { SentRequestsPage } from './pages/SentRequestsPage';
import { ReceivedRequestsPage } from './pages/ReceivedRequestsPage';
import { ExchangeHistoryPage } from './pages/ExchangeHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

import { BookOpen, Server, Shield, Heart } from 'lucide-react';

export const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/resources/:id" element={<ResourceDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-resource"
                  element={
                    <ProtectedRoute>
                      <AddResourcePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-resource/:id"
                  element={
                    <ProtectedRoute>
                      <EditResourcePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-listings"
                  element={
                    <ProtectedRoute>
                      <MyListingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests/sent"
                  element={
                    <ProtectedRoute>
                      <SentRequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests/received"
                  element={
                    <ProtectedRoute>
                      <ReceivedRequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <ExchangeHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-navy-950 text-teal-400 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">ResourceHub</span>
                      <span className="text-[11px] font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        College Microservices Lab
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                      A full-stack campus resource exchange platform architected with two autonomous backend microservices, REST communication, and isolated MongoDB databases.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Platform</h4>
                    <ul className="space-y-1 text-slate-500">
                      <li><Link to="/marketplace" className="hover:text-teal-700">Browse Catalog</Link></li>
                      <li><Link to="/add-resource" className="hover:text-teal-700">List an Item</Link></li>
                      <li><Link to="/dashboard" className="hover:text-teal-700">Student Dashboard</Link></li>
                      <li><Link to="/requests/received" className="hover:text-teal-700">Pending Requests</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Microservices</h4>
                    <ul className="space-y-1 text-slate-500 text-[11px]">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Resource Service (:5001)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>Exchange Service (:5002)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>Frontend Vite React (:5173)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
                  <p>© {new Date().getFullYear()} Resource Exchange Platform. Developed for Full Stack Application Lab.</p>
                  <p className="flex items-center gap-1">
                    <span>Built with MERN Microservices & REST APIs</span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
