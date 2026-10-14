import React, { useEffect, useState } from 'react';
import { exchangeApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { History, Calendar, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const ExchangeHistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'sent' | 'received'

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [sentRes, receivedRes] = await Promise.all([
          exchangeApi.get('/api/exchanges/sent'),
          exchangeApi.get('/api/exchanges/received')
        ]);

        const sent = (sentRes.data.data || []).map((i) => ({ ...i, direction: 'sent' }));
        const received = (receivedRes.data.data || []).map((i) => ({ ...i, direction: 'received' }));

        const combined = [...sent, ...received].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        setHistoryItems(combined);
      } catch (err) {
        console.error('Failed to load exchange history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = historyItems.filter((item) => {
    if (filterType === 'sent') return item.direction === 'sent';
    if (filterType === 'received') return item.direction === 'received';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Exchange Activity & History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full historical record of all sent and received resource transactions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Activity ({historyItems.length})
          </button>
          <button
            onClick={() => setFilterType('sent')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'sent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sent Requests
          </button>
          <button
            onClick={() => setFilterType('received')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'received' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Received
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading history logs...</div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {filtered.map((item) => (
            <div key={item._id || item.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.direction === 'sent'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {item.direction === 'sent' ? (
                        <>
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Sent Request</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Received Request</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {item.requestType}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{item.resourceTitle}</h3>

                  <p className="text-xs text-slate-500">
                    {item.direction === 'sent' ? (
                      <>Requested from <strong className="text-slate-700">{item.ownerName}</strong></>
                    ) : (
                      <>Requested by <strong className="text-slate-700">{item.requesterName}</strong> ({item.requesterDepartment})</>
                    )}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-400">
                  <div className="flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Last updated {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {item.statusHistory && item.statusHistory.length > 0 && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      "{item.statusHistory[item.statusHistory.length - 1].note || 'No notes'}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No exchange history records"
          description="Your completed, active, and past exchange interactions will be cataloged here."
        />
      )}
    </div>
  );
};
