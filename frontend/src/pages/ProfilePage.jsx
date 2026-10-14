import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceApi, exchangeApi } from '../api/client';
import { User, Mail, GraduationCap, Building2, Calendar, Layers, Send, Inbox, ShieldCheck } from 'lucide-react';

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
          resourceApi.get(`/api/resources?ownerId=${user.id}`),
          exchangeApi.get('/api/exchanges/sent'),
          exchangeApi.get('/api/exchanges/received')
        ]);

        setProfileStats({
          listings: listingsRes.data.data?.length || 0,
          sent: sentRes.data.data?.length || 0,
          received: receivedRes.data.data?.length || 0
        });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-navy-900 via-navy-850 to-teal-800" />

        {/* Profile Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <img
                src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
              />
              <div className="space-y-0.5 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-500">{user.department}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-xs font-semibold text-slate-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">College / University</p>
                <p className="text-xs font-semibold text-slate-800">{user.collegeName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <GraduationCap className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Department</p>
                <p className="text-xs font-semibold text-slate-800">{user.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Account Created</p>
                <p className="text-xs font-semibold text-slate-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Counters */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Layers className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <p className="text-xl font-bold text-slate-900">{profileStats.listings}</p>
              <p className="text-[11px] text-slate-500">Listings Posted</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Send className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <p className="text-xl font-bold text-slate-900">{profileStats.sent}</p>
              <p className="text-[11px] text-slate-500">Requests Sent</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Inbox className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <p className="text-xl font-bold text-slate-900">{profileStats.received}</p>
              <p className="text-[11px] text-slate-500">Requests Received</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
