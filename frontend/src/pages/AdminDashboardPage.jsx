import React, { useEffect, useState } from 'react';
import { resourceApi, exchangeApi } from '../api/client';
import { CompanyBadge } from '../components/CompanyBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Layers, 
  Users, 
  AlertOctagon,
  Clock,
  ExternalLink
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { success, error } = useToast();
  const [companies, setCompanies] = useState([]);
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'listings'
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [compRes, listRes] = await Promise.all([
        resourceApi.get('/api/auth/admin/companies').catch(() => ({ data: { data: [] } })),
        resourceApi.get('/api/resources?limit=100').catch(() => ({ data: { data: [] } }))
      ]);

      setCompanies(compRes.data?.data || []);
      setListings(listRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin moderation data:', err);
      error('Failed to load platform moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyCompany = async (companyId, newStatus) => {
    setActionLoadingId(companyId);
    try {
      const res = await resourceApi.patch(`/api/auth/admin/companies/${companyId}/verify`, {
        verificationStatus: newStatus
      });

      if (res.data.success) {
        success(`Enterprise status successfully updated to ${newStatus}`);
        setCompanies((prev) =>
          prev.map((c) => ((c._id || c.id) === companyId ? res.data.data : c))
        );
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update company verification status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this resource listing for non-compliance?')) return;
    try {
      await resourceApi.delete(`/api/resources/${listingId}`);
      success('Material listing removed by administrative moderation');
      setListings((prev) => prev.filter((l) => (l._id || l.id) !== listingId));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove listing');
    }
  };

  const pendingCompanies = companies.filter((c) => c.verificationStatus === 'Pending');

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Header */}
      <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Platform Governance & Regulatory Moderation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Administrator Control Console</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Verify corporate GSTIN credentials, monitor industrial waste compliance, and manage material listings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'companies'
                ? 'bg-amber-500 text-navy-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Company Verifications ({pendingCompanies.length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'listings'
                ? 'bg-amber-500 text-navy-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Listing Moderation ({listings.length})
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Registered Enterprises
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{companies.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Onboarded entities</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Verification Queue
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCompanies.length}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Awaiting GST review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Catalog Listings
          </span>
          <p className="text-2xl font-bold text-teal-700 mt-1">{listings.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all categories</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Compliance Status
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">100%</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Audited & monitored</p>
        </div>
      </div>

      {/* Tab 1: Company Verifications */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Enterprise Registration Applications
              </h2>
              <p className="text-xs text-slate-500">
                Review corporate credentials, tax reference identifiers, and issue verification approvals
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading company registry...</div>
          ) : companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Enterprise Name</th>
                    <th className="py-3 px-4">Sector & Ref</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {companies.map((c) => {
                    const cId = c._id || c.id;
                    const isActing = actionLoadingId === cId;

                    return (
                      <tr key={cId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {c.companyName}
                          <div className="text-[11px] text-slate-400 font-normal">
                            Joined {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{c.industrySector}</span>
                          <div className="text-[11px] font-mono uppercase text-slate-500">
                            {c.registrationNumber || 'Pending Ref'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{c.contactPerson}</span>
                          <div className="text-[11px] text-slate-500">{c.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          {c.city}, {c.state}
                        </td>
                        <td className="py-3 px-4">
                          <CompanyBadge status={c.verificationStatus} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.verificationStatus !== 'Verified' && (
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleVerifyCompany(cId, 'Verified')}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {c.verificationStatus !== 'Rejected' && (
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleVerifyCompany(cId, 'Rejected')}
                                className="px-2.5 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">No companies found.</div>
          )}
        </div>
      )}

      {/* Tab 2: Listing Moderation */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Catalog Listing Moderation
              </h2>
              <p className="text-xs text-slate-500">
                Inspect registered industrial by-products and remove flagged or non-compliant materials
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Material Listing</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Supplier Enterprise</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Hazard Class</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {listings.map((item) => {
                  const lId = item._id || item.id;

                  return (
                    <tr key={lId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.title}
                        <div className="text-[10px] text-slate-400 font-mono">ID: {lId}</div>
                      </td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.supplierCompanyDisplayName}
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-800">
                        {(item.availableQuantity || 0).toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        {item.compliance?.hazardousMaterial ? (
                          <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Hazardous
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Non-hazardous
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.availabilityStatus || 'available'} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(lId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
