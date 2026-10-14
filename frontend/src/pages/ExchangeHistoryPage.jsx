import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { 
  Truck, 
  History, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  PackageCheck,
  Clock
} from 'lucide-react';

export const ExchangeHistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'in_transfer' | 'completed'

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
        console.error('Failed to load transfer history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = historyItems.filter((item) => {
    if (filterType === 'in_transfer') return item.status === 'In Transfer' || item.status === 'Accepted';
    if (filterType === 'completed') return item.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
            <Truck className="w-3.5 h-3.5 text-teal-600" />
            <span>Industrial Logistics & Lifecycle Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Transfer Tracking & Exchange History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time consignment dispatch tracking, freight manifests, and permanent circular exchange logs
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
            All Logs ({historyItems.length})
          </button>
          <button
            onClick={() => setFilterType('in_transfer')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'in_transfer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active In-Transit
          </button>
          <button
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed Exchanges
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading freight logs...</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const reqId = item._id || item.id;
            const tracking = item.transferTracking || {};

            return (
              <div
                key={reqId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
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
                          <span>Outbound Procurement</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Inbound Supply Proposal</span>
                        </>
                      )}
                    </span>
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">
                      Volume: <strong className="text-slate-700">{item.requestedQuantity} {item.unit}</strong> (₹{(item.totalProposedAmount || 0).toLocaleString()})
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    ID: {reqId.substring(0, 8)}...
                  </span>
                </div>

                {/* Content row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Link
                      to={`/exchanges/${reqId}`}
                      className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors flex items-center gap-1"
                    >
                      <span>{item.resourceTitle}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>
                        Supplier: <strong className="text-slate-700">{item.supplierCompanyName}</strong>
                      </p>
                      <p>
                        Receiver: <strong className="text-slate-700">{item.receiverCompanyName}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Terms: {item.deliveryTerms || 'Facility Ex-Works pickup'}
                      </p>
                    </div>
                  </div>

                  {/* Logistics Progress Stepper */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Transfer & Logistics Manifest
                    </span>

                    {tracking.carrierName ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Carrier:</span>
                          <strong className="text-slate-900">{tracking.carrierName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tracking Ref:</span>
                          <span className="font-mono font-semibold text-teal-800">{tracking.trackingRef || 'Assigned'}</span>
                        </div>
                        {tracking.dispatchDate && (
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Dispatched:</span>
                            <span>{new Date(tracking.dispatchDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {tracking.transferNotes && (
                          <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                            "{tracking.transferNotes}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="py-2 text-slate-400 italic text-[11px]">
                        {item.status === 'Accepted'
                          ? 'Stock reserved on Resource Service. Awaiting supplier freight dispatch details.'
                          : item.status === 'Completed'
                          ? 'Transfer complete. Consignment intake finalized.'
                          : 'Freight manifest will generate upon proposal acceptance.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    Updated {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                  </span>

                  <Link
                    to={`/exchanges/${reqId}`}
                    className="font-semibold text-teal-700 hover:text-teal-800"
                  >
                    Open Negotiation Thread & Audit Log →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Truck}
          title="No transfer records found"
          description="Consignments in transit and historical completed exchanges will be recorded here with freight waybill references."
        />
      )}
    </div>
  );
};
