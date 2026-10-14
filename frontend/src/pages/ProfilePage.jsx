import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceApi, exchangeApi } from '../api/client';
import { CompanyBadge } from '../components/CompanyBadge';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Layers, 
  Send, 
  Inbox, 
  FileCheck2, 
  ShieldCheck, 
  Factory 
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profileStats, setProfileStats] = useState({
    listings: 0,
    sent: 0,
    received: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const [listingsRes, sentRes, receivedRes] = await Promise.all([
          resourceApi.get('/api/resources?limit=100').catch(() => ({ data: { data: [] } })),
          exchangeApi.get('/api/exchanges/sent').catch(() => ({ data: { data: [] } })),
          exchangeApi.get('/api/exchanges/received').catch(() => ({ data: { data: [] } }))
        ]);

        const myCompanyId = user.id || user._id;
        const myListings = (listingsRes.data?.data || []).filter(
          (r) => r.supplierCompanyId === myCompanyId || r.supplierCompanyName === user.companyName
        );

        setProfileStats({
          listings: myListings.length,
          sent: sentRes.data?.data?.length || 0,
          received: receivedRes.data?.data?.length || 0
        });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Industrial Banner */}
        <div className="h-32 bg-gradient-to-r from-navy-950 via-slate-900 to-teal-900" />

        {/* Profile Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-navy-900 text-teal-400 flex items-center justify-center font-bold text-2xl">
                <Factory className="w-12 h-12" />
              </div>
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {user.companyName}
                  </h1>
                  <CompanyBadge status={user.verificationStatus || 'Pending'} />
                </div>
                <p className="text-xs text-slate-500 font-medium">{user.industrySector}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Ref / GSTIN</p>
                <p className="text-xs font-semibold text-slate-900 font-mono uppercase">
                  {user.registrationNumber || 'GSTIN-PENDING'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</p>
                <p className="text-xs font-semibold text-slate-900">{user.contactPerson || 'Authorized Representative'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corporate Email</p>
                <p className="text-xs font-semibold text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plant Facility Location</p>
                <p className="text-xs font-semibold text-slate-900">
                  {user.address ? `${user.address}, ` : ''}{user.city}, {user.state || 'India'}
                </p>
              </div>
            </div>
          </div>

          {/* Company Description */}
          {user.description && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px]">
                Operations Overview & Circular Capacity
              </span>
              <p>{user.description}</p>
            </div>
          )}

          {/* Activity Counters */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Layers className="w-5 h-5 mx-auto mb-1 text-teal-600" />
              <p className="text-xl font-bold text-slate-900">{profileStats.listings}</p>
              <p className="text-[11px] text-slate-500">Materials Published</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Send className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-xl font-bold text-slate-900">{profileStats.sent}</p>
              <p className="text-[11px] text-slate-500">Proposals Submitted</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Inbox className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
              <p className="text-xl font-bold text-slate-900">{profileStats.received}</p>
              <p className="text-[11px] text-slate-500">Inbound Requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
