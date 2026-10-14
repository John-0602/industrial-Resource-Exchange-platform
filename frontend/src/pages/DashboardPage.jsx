import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceApi, exchangeApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Layers, 
  Send, 
  Inbox, 
  CheckCircle, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  BookOpen,
  AlertCircle
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    myListingsCount: 0,
    sentCount: 0,
    receivedCount: 0,
    pendingReceivedCount: 0
  });
  const [recentSent, setRecentSent] = useState([]);
  const [recentReceived, setRecentReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;

        // Fetch student's listings from Resource Service
        const listingsRes = await resourceApi.get(`/api/resources?ownerId=${user.id}`);
        const myListings = listingsRes.data.data || [];

        // Fetch sent requests from Exchange Service
        const sentRes = await exchangeApi.get('/api/exchanges/sent');
        const sentList = sentRes.data.data || [];

        // Fetch received requests from Exchange Service
        const receivedRes = await exchangeApi.get('/api/exchanges/received');
        const receivedList = receivedRes.data.data || [];

        const pendingReceived = receivedList.filter((r) => r.status === 'Pending').length;

        setStats({
          myListingsCount: myListings.length,
          sentCount: sentList.length,
          receivedCount: receivedList.length,
          pendingReceivedCount: pendingReceived
        });

        setRecentSent(sentList.slice(0, 4));
        setRecentReceived(receivedList.slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Student Dashboard</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.department} • {user?.collegeName}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/add-resource"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Resource</span>
          </Link>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <span>Explore Market</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/my-listings"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">My Listings</span>
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.myListingsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active resources on marketplace</p>
        </Link>

        <Link
          to="/requests/received"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group relative"
        >
          {stats.pendingReceivedCount > 0 && (
            <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {stats.pendingReceivedCount} Action Needed
            </span>
          )}
          <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Received Requests</span>
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.receivedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">{stats.pendingReceivedCount} awaiting your approval</p>
        </Link>

        <Link
          to="/requests/sent"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sent Requests</span>
            <Send className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.sentCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Requests submitted to peers</p>
        </Link>

        <Link
          to="/history"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activity History</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.sentCount + stats.receivedCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total lifetime exchanges</p>
        </Link>
      </div>

      {/* Two-Column Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Requests Awaiting Approval */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Received Requests</h2>
              <p className="text-xs text-slate-500">Students requesting your listed resources</p>
            </div>
            <Link
              to="/requests/received"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading requests...</p>
          ) : recentReceived.length > 0 ? (
            <div className="space-y-3">
              {recentReceived.map((req) => (
                <div
                  key={req._id || req.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate max-w-[65%]">
                    <p className="font-semibold text-slate-800 truncate">{req.resourceTitle}</p>
                    <p className="text-slate-500 truncate">
                      From: <span className="font-medium text-slate-700">{req.requesterName}</span> ({req.requesterDepartment})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-300" />
              <span>No incoming requests yet for your items</span>
            </div>
          )}
        </div>

        {/* Sent Requests Status Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Sent Requests</h2>
              <p className="text-xs text-slate-500">Track the status of your borrow or exchange requests</p>
            </div>
            <Link
              to="/requests/sent"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading requests...</p>
          ) : recentSent.length > 0 ? (
            <div className="space-y-3">
              {recentSent.map((req) => (
                <div
                  key={req._id || req.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate max-w-[65%]">
                    <p className="font-semibold text-slate-800 truncate">{req.resourceTitle}</p>
                    <p className="text-slate-500 truncate">
                      Owner: <span className="font-medium text-slate-700">{req.ownerName}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              <Send className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-300" />
              <span>You haven't requested any resources yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
