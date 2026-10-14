import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { EmptyState } from '../components/EmptyState';
import { 
  Send, 
  Building2, 
  Scale, 
  DollarSign, 
  XCircle, 
  ArrowRight, 
  MessageSquare, 
  Truck,
  ExternalLink
} from 'lucide-react';

export const SentRequestsPage = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSent = async () => {
    setLoading(true);
    try {
      const res = await exchangeApi.get('/api/exchanges/sent');
      if (res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      error('Failed to load your sent proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSent();
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      const res = await exchangeApi.patch(`/api/exchanges/${cancelTarget._id || cancelTarget.id}/cancel`, {
        reason: 'Proposal withdrawn by purchasing entity'
      });

      if (res.data.success) {
        success('Proposal cancelled. Any reserved stock has been safely released over REST.');
        setRequests((prev) =>
          prev.map((r) =>
            (r._id || r.id) === (cancelTarget._id || cancelTarget.id)
              ? { ...r, status: 'Cancelled' }
              : r
          )
        );
        setCancelTarget(null);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel proposal');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>Outbound Procurement Proposals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Sent Exchange Proposals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor bids, negotiations, stock reservations, and logistics coordination with suppliers
          </p>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your sent proposals...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const reqId = req._id || req.id;
            const canCancel = req.status === 'Pending' || req.status === 'Under Negotiation' || req.status === 'Accepted';

            return (
              <div
                key={reqId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">
                      {req.materialCategory}
                    </span>
                    <span>•</span>
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-slate-400">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    Ref: {reqId.substring(0, 8)}...
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <Link
                      to={`/exchanges/${reqId}`}
                      className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>{req.resourceTitle}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target Supplier: <strong className="text-slate-800">{req.supplierCompanyName}</strong></span>
                      <span>({req.supplierEmail})</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/80">
                      <span className="font-semibold text-slate-700">Proposal Terms:</span> "{req.proposalMessage}"
                      {req.deliveryTerms && (
                        <p className="mt-1 text-slate-500">
                          <strong>Logistics Terms:</strong> {req.deliveryTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Commercial Quantity & Total */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs shrink-0 min-w-[200px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Volume:</span>
                      <span className="font-bold text-slate-900">{req.requestedQuantity} {req.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposed Rate:</span>
                      <span className="font-medium text-slate-700">₹{req.proposedPricePerUnit || 0} / {req.unit}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
                      <span>Total Value:</span>
                      <span className="text-emerald-700">₹{(req.totalProposedAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/exchanges/${reqId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Negotiation & Details ({req.negotiationNotes?.length || 0})</span>
                    </Link>

                    {(req.status === 'In Transfer' || req.status === 'Completed' || req.status === 'Accepted') && (
                      <Link
                        to="/history"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors border border-teal-200"
                      >
                        <Truck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Track Transfer</span>
                      </Link>
                    )}
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => setCancelTarget(req)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Withdraw Proposal</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title="No sent proposals found"
          description="Your enterprise has not submitted any procurement proposals yet. Search the industrial catalog or use the Circular Matching Engine to find feedstocks."
          actionLabel="Open Circular Matching Engine"
          actionTo="/matching"
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!cancelTarget}
        title="Withdraw Procurement Proposal?"
        message={`Are you sure you want to withdraw your proposal for "${cancelTarget?.resourceTitle}"? If stock was reserved on the Resource Service, it will be automatically released back to public availability.`}
        confirmLabel="Yes, Withdraw Proposal"
        isDanger={true}
        isLoading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};
