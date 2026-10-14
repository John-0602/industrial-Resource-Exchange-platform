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
import { PostRequirementPage } from './pages/PostRequirementPage';
import { MatchingResultsPage } from './pages/MatchingResultsPage';
import { SentRequestsPage } from './pages/SentRequestsPage';
import { ReceivedRequestsPage } from './pages/ReceivedRequestsPage';
import { NegotiationDetailsPage } from './pages/NegotiationDetailsPage';
import { ExchangeHistoryPage } from './pages/ExchangeHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { Factory, Server, ShieldCheck, Leaf } from 'lucide-react';

export const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/resources/:id" element={<ResourceDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Industrial Operations */}
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
                  path="/publish-resource"
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
                  path="/requirements/new"
                  element={
                    <ProtectedRoute>
                      <PostRequirementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matching"
                  element={
                    <ProtectedRoute>
                      <MatchingResultsPage />
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
                  path="/exchanges/:id"
                  element={
                    <ProtectedRoute>
                      <NegotiationDetailsPage />
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

                {/* Administrator Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Industrial B2B Platform Footer */}
            <footer className="bg-navy-950 border-t border-slate-800 mt-16 text-slate-300 text-xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500 text-navy-950 flex items-center justify-center font-bold">
                        <Factory className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-white text-base">
                        Industrial Resource Exchange Platform (IREP)
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
                      A digital intermediary connecting manufacturing facilities to discover surplus by-products, negotiate commercial terms, and coordinate resource transfers for industrial circular symbiosis.
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-teal-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>Zero Landfill Mission</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PCB Regulatory Manifests</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
                      Circular Exchange
                    </h4>
                    <ul className="space-y-2 text-slate-400">
                      <li><Link to="/marketplace" className="hover:text-teal-400 transition-colors">Material Marketplace</Link></li>
                      <li><Link to="/requirements/new" className="hover:text-teal-400 transition-colors">Post Material Requirement</Link></li>
                      <li><Link to="/matching" className="hover:text-teal-400 transition-colors">Circular Matching Engine</Link></li>
                      <li><Link to="/add-resource" className="hover:text-teal-400 transition-colors">Publish Surplus By-Product</Link></li>
                      <li><Link to="/history" className="hover:text-teal-400 transition-colors">Transfer & Freight Tracking</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
                      Decoupled Microservices
                    </h4>
                    <ul className="space-y-2 text-slate-400 text-[11px] font-mono">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Resource Service (:5001)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        <span>Exchange Service (:5002)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>Client React Vite (:5173)</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500 pt-1 border-t border-slate-800">
                        <Server className="w-3 h-3 text-slate-400" />
                        <span>Inter-Service REST Protocol</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
                  <p>© {new Date().getFullYear()} Industrial Resource Exchange Platform (IREP). Full-Stack Architecture Demonstration.</p>
                  <p className="flex items-center gap-1.5 font-medium text-slate-400">
                    <span>Decoupled MERN Microservices</span>
                    <span>•</span>
                    <span>REST Coordination</span>
                    <span>•</span>
                    <span>Isolated Databases</span>
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
