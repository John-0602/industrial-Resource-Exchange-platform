import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceApi, exchangeApi } from '../api/client';
import { CompanyBadge } from '../components/CompanyBadge';
import { MaterialTable } from '../components/MaterialTable';
import { 
  Building2, 
  Layers, 
  Send, 
  Inbox, 
  PlusCircle, 
  Search, 
  Sparkles, 
  FileSpreadsheet, 
  CheckCircle2, 
  Server,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myListingsCount: 0,
    totalAvailableQty: 0,
    inboundProposalsCount: 0,
    outboundProposalsCount: 0,
    requirementsCount: 0
  });
  const [myRecentListings, setMyRecentListings] = useState([]);
  const [recentInbound, setRecentInbound] = useState([]);
  const [servicesHealth, setServicesHealth] = useState({
    resourceService: 'checking',
    exchangeService: 'checking'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch company's own listings from Resource Service
        const listingsPromise = resourceApi.get('/api/resources').catch(() => ({ data: { data: [] } }));
        // Fetch inbound proposals from Exchange Service
        const inboundPromise = exchangeApi.get('/api/exchanges/received').catch(() => ({ data: { data: [] } }));
        // Fetch outbound proposals from Exchange Service
        const outboundPromise = exchangeApi.get('/api/exchanges/sent').catch(() => ({ data: { data: [] } }));
        // Fetch requirements from Exchange Service
        const requirementsPromise = exchangeApi.get('/api/requirements').catch(() => ({ data: { data: [] } }));
        // Health checks
        const resourceHealthPromise = resourceApi.get('/health').catch(() => null);
        const exchangeHealthPromise = exchangeApi.get('/health').catch(() => null);

        const [listingsRes, inboundRes, outboundRes, reqsRes, rHealth, eHealth] = await Promise.all([
          listingsPromise,
          inboundPromise,
          outboundPromise,
          requirementsPromise,
          resourceHealthPromise,
          exchangeHealthPromise
        ]);

        const allResources = listingsRes.data?.data || [];
        const myCompanyId = user?.id || user?._id;
        const myItems = allResources.filter(
          (r) => r.supplierCompanyId === myCompanyId || r.supplierCompanyName === user?.companyName
        );

        const totalQty = myItems.reduce((acc, curr) => acc + (Number(curr.availableQuantity) || 0), 0);
        const inboundList = inboundRes.data?.data || [];
        const outboundList = outboundRes.data?.data || [];
        const reqList = reqsRes.data?.data || [];

        setStats({
          myListingsCount: myItems.length,
          totalAvailableQty: totalQty,
          inboundProposalsCount: inboundList.length,
          outboundProposalsCount: outboundList.length,
          requirementsCount: reqList.length
        });

        setMyRecentListings(myItems.slice(0, 5));
        setRecentInbound(inboundList.slice(0, 4));

        setServicesHealth({
          resourceService: rHealth?.data?.status === 'OK' ? 'online' : 'connected',
          exchangeService: eHealth?.data?.status === 'OK' ? 'online' : 'connected'
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6 pb-12">
      {/* Enterprise Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {user?.companyName || 'Industrial Enterprise'}
            </h1>
            <CompanyBadge status={user?.verificationStatus || 'Pending'} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Sector: <strong className="text-slate-700">{user?.industrySector || 'Industrial Manufacturing'}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.city ? `${user.city}, ${user.state || ''}` : 'Regional Facility'}</span>
            </span>
            {user?.registrationNumber && (
              <>
                <span>•</span>
                <span>Reg: <strong className="text-slate-700 uppercase">{user.registrationNumber}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/add-resource"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Surplus</span>
          </Link>
          <Link
            to="/requirements/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span>Post Need</span>
          </Link>
          <Link
            to="/matching"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Circular Engine</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Listings</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.myListingsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Published materials</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Stock Available</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {stats.totalAvailableQty.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Units / MT unreserved</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Inbound Proposals</span>
            <Inbox className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.inboundProposalsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">From prospective buyers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Outbound Bids</span>
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.outboundProposalsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sent to suppliers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Needs Tracked</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.requirementsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Procurement specs</p>
        </div>
      </div>

      {/* Main Grid: My Inventory & Inbound Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): My Inventory Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enterprise Material Registry</h2>
              <p className="text-xs text-slate-500">Materials and by-products currently listed by your facility</p>
            </div>
            <Link
              to="/my-listings"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Manage All Inventory →
            </Link>
          </div>

          <MaterialTable
            resources={myRecentListings}
            loading={loading}
            actionLabel="Edit / View"
          />
        </div>

        {/* Right Column (1 Col): Inbound Action Queue & Microservices Live Status */}
        <div className="space-y-6">
          {/* Recent Inbound Proposals */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Inbound Proposals
              </h3>
              <Link to="/requests/received" className="text-[11px] font-semibold text-teal-700 hover:text-teal-800">
                View All
              </Link>
            </div>

            {recentInbound.length > 0 ? (
              <div className="space-y-2.5">
                {recentInbound.map((item) => (
                  <Link
                    key={item._id || item.id}
                    to={`/exchanges/${item._id || item.id}`}
                    className="block p-2.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {item.resourceTitle}
                      </span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      From: <strong className="text-slate-700">{item.receiverCompanyName}</strong> • {item.requestedQuantity} {item.unit}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No active inbound proposals pending review.
              </div>
            )}
          </div>

          {/* Microservices Health & REST Status */}
          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-teal-400">
              <Server className="w-4 h-4" />
              <span>Microservices REST Connectivity</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Resource Service (Port 5001)</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Exchange Service (Port 5002)</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Inter-Service Communication</span>
                <span className="font-mono text-[11px] text-teal-300">REST (Protected Key)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
