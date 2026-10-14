import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { ResourceCard } from '../components/ResourceCard';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { 
  BookOpen, 
  RefreshCw, 
  Clock, 
  Gift, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  ArrowRight,
  GraduationCap,
  Users
} from 'lucide-react';

export const LandingPage = () => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await resourceApi.get('/api/resources?limit=6&availability=available');
        if (res.data.success) {
          setFeaturedResources(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load featured resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-teal-400" />
            <span>Academic Resource Exchange • Full-Stack Microservices Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Share, Lend & Discover Academic Resources Across Campus
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate textbook waste and cut semester costs. A student-first microservice platform designed for college campuses to lend books, exchange components, and share notes securely.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-navy-950 text-sm font-bold hover:bg-teal-400 shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/add-resource"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-800/90 text-white text-sm font-semibold hover:bg-navy-800 border border-slate-700 transition-all"
            >
              <span>List a Resource</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 border-t border-slate-800/80 text-left">
            <div className="bg-navy-850/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-teal-400">4 Types</p>
              <p className="text-xs text-slate-400 mt-0.5">Lend, Exchange, Donate, Give</p>
            </div>
            <div className="bg-navy-850/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-teal-400">2 Services</p>
              <p className="text-xs text-slate-400 mt-0.5">Independent REST Microservices</p>
            </div>
            <div className="bg-navy-850/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-teal-400">100% Free</p>
              <p className="text-xs text-slate-400 mt-0.5">Zero student platform charges</p>
            </div>
            <div className="bg-navy-850/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-teal-400">Direct</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified on-campus handoffs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Listing Types Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Four Ways to Exchange on Campus
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Whether borrowing for a 2-week lab project or donating previous semester notes, ResourceHub supports every exchange format.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Lend & Borrow</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Lend textbooks or lab calculators for set durations (days/weeks) with verified return tracking.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Item Exchange</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Trade an engineering book or hardware board directly for another item needed this semester.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Donate</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pass forward study guides, solved university question banks, and notes to junior students.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Give Away</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Offer stationary, drafters, or spare electronics to anyone on campus free of charge.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recently Available on Campus</h2>
            <p className="text-xs text-slate-500 mt-1">Live listings posted by fellow engineering and science students</p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            <span>View All in Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : featuredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource._id || resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No active resources listed currently. Be the first to list one!</p>
            <Link
              to="/add-resource"
              className="inline-block mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
            >
              List Resource
            </Link>
          </div>
        )}
      </section>

      {/* Microservices Architecture Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950 text-teal-400 text-[11px] font-semibold border border-teal-800">
                <Server className="w-3.5 h-3.5" />
                <span>Microservice Architecture & REST API Coordination</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Powered by Decoupled, Independently Deployed Services
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Built with two autonomous backend microservices—<span className="text-teal-400 font-mono">Resource Service</span> and <span className="text-teal-400 font-mono">Exchange Service</span>—each with isolated MongoDB databases communicating via genuine server-to-server REST calls to prevent conflicting allocations.
              </p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-700">
                <span>Architecture</span>
                <span className="text-teal-400 font-mono">Decoupled REST</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-700">
                <span>Databases</span>
                <span className="text-teal-400 font-mono">2 Isolated DBs</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Inter-Service Call</span>
                <span className="text-teal-400 font-mono">Protected API Key</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
