import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { ResourceCard } from '../components/ResourceCard';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { 
  Factory, 
  Recycle, 
  Leaf, 
  Building2, 
  Server, 
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles
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
        console.error('Failed to load featured industrial resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const circularPillars = [
    {
      title: 'Industrial Symbiosis',
      desc: 'Connect manufacturing facilities so surplus materials and production scrap become primary feedstocks for secondary industries.',
      icon: Factory,
      accent: 'text-teal-400 bg-teal-950/60 border-teal-800'
    },
    {
      title: 'Multi-Criteria Circular Matching',
      desc: 'Automated algorithms compare material grades, quantities, logistics proximity, and regulatory handling requirements.',
      icon: Sparkles,
      accent: 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
    },
    {
      title: 'Decarbonization & ESG Reporting',
      desc: 'Track landfill diversion metrics, avoided virgin resource extraction, and verified carbon abatement across corporate supply chains.',
      icon: Leaf,
      accent: 'text-sky-400 bg-sky-950/60 border-sky-800'
    },
    {
      title: 'Compliance & Safety Assured',
      desc: 'Enforce Pollution Control Board (PCB) certification, hazardous waste manifests, and material safety data sheet (MSDS) standards.',
      icon: Recycle,
      accent: 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-slate-900 to-navy-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl border-b border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-teal-500/40 text-teal-300 text-xs font-semibold backdrop-blur-sm shadow-sm">
            <Factory className="w-4 h-4 text-teal-400" />
            <span>Industrial Circular Economy Marketplace • Dual REST Microservices Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Industrial Resource Exchange Platform (IREP)
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Connecting industrial enterprises with surplus, by-product, and recoverable materials to secondary manufacturers. Transform industrial waste streams into circular raw material inputs through verified B2B exchanges.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-500 shadow-lg shadow-teal-700/30 transition-all hover:-translate-y-0.5"
            >
              <span>Explore Material Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/requirements/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 border border-slate-700 transition-all"
            >
              <span>Post Material Need</span>
            </Link>

            <Link
              to="/add-resource"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent text-teal-300 text-sm font-semibold hover:bg-slate-800/50 border border-teal-500/30 transition-all"
            >
              <span>Publish By-Product</span>
            </Link>
          </div>

          {/* Industrial Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-slate-800/80 text-left">
            <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>By-Products Diverted</span>
              </div>
              <p className="text-2xl font-bold text-teal-400 mt-1">45,000+ MT</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Recycled into production</p>
            </div>

            <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Carbon Abatement</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-1">18,200 tCO₂e</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Avoided extraction</p>
            </div>

            <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Enterprise Entities</span>
              </div>
              <p className="text-2xl font-bold text-sky-400 mt-1">120+ Plants</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Textile, Steel, Plastics, Wood</p>
            </div>

            <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span>Microservice Feeds</span>
              </div>
              <p className="text-2xl font-bold text-amber-400 mt-1">2 REST APIs</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Resource & Exchange services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Circular Economy Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Circular Industrial Flow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Empowering B2B Industrial Symbiosis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            One plant's surplus or production residue becomes another factory's primary input, cutting disposal liabilities and virgin procurement costs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {circularPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border ${pillar.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Available Industrial Resources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Verified Industrial Listings</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Available Surplus & By-Product Registry</h2>
            <p className="text-xs text-slate-500 mt-1">Live listings posted by verified manufacturing enterprises</p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            <span>View All Materials in Catalog</span>
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
            <p className="text-sm text-slate-500">No active industrial materials registered yet.</p>
            <Link
              to="/add-resource"
              className="inline-block mt-3 px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              Publish First By-Product
            </Link>
          </div>
        )}
      </section>

      {/* Microservices Architecture Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950 text-teal-400 text-[11px] font-semibold border border-teal-800">
                <Server className="w-3.5 h-3.5" />
                <span>Microservice Architecture & REST API Coordination</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Two Autonomous Cloud Microservices with Isolated Databases
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                IREP operates on two independent backend services: the <span className="text-teal-400 font-mono">Resource Service (Port 5001)</span> managing material inventories, and the <span className="text-teal-400 font-mono">Exchange Service (Port 5002)</span> managing procurement matching and proposals. All cross-service operations—including matching queries and quantity reservations—are executed over real authenticated HTTP REST endpoints.
              </p>
            </div>
            <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-xs space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-700">
                <span>Resource DB</span>
                <span className="text-teal-400 font-mono font-semibold">irep_resources_db</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-700">
                <span>Exchange DB</span>
                <span className="text-teal-400 font-mono font-semibold">irep_exchanges_db</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-700">
                <span>Inter-Service REST</span>
                <span className="text-emerald-400 font-mono font-semibold">x-service-api-key</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Reservation Strategy</span>
                <span className="text-sky-400 font-mono font-semibold">Atomic Guarded</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
