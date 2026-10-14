import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { EmptyState } from '../components/EmptyState';
import { Send, Clock, User, XCircle, ArrowRight, MessageSquare } from 'lucide-react';

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
      error('Failed to load your sent requests');
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
        reason: 'Cancelled by requester'
      });

      if (res.data.success) {
        success('Request cancelled successfully. Resource availability has been updated.');
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
      error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>Outbound Requests</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sent Exchange Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your borrow, exchange, or donation requests sent to other students
          </p>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <span>Find More Resources</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your sent requests...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const canCancel = req.status === 'Pending' || req.status === 'Approved';

            return (
              <div
                key={req._id || req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-navy-900 text-teal-400">
                      {req.requestType}
                    </span>
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-slate-400">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/resources/${req.resourceId}`}
                    className="block font-bold text-slate-900 hover:text-teal-700 transition-colors text-base"
                  >
                    {req.resourceTitle}
                  </Link>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">Your Message:</span> "{req.requestMessage}"
                      {req.exchangeItemOffered && (
                        <p className="mt-1 text-teal-800">
                          <strong>Item Offered:</strong> {req.exchangeItemOffered}
                        </p>
                      )}
                      {req.durationRequested && (
                        <p className="mt-0.5 text-slate-500">
                          <strong>Duration Requested:</strong> {req.durationRequested}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Resource Owner: <strong className="text-slate-700">{req.ownerName}</strong> ({req.ownerEmail})</span>
                  </div>
                </div>

                {/* Cancel Action */}
                <div className="md:border-l md:border-slate-100 md:pl-5 flex flex-col justify-center items-start md:items-end gap-2">
                  {canCancel ? (
                    <button
                      onClick={() => setCancelTarget(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Request</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No further actions</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title="No sent requests found"
          description="You haven't requested any resources from the marketplace yet. Browse through available items to borrow or exchange!"
          actionLabel="Browse Marketplace"
          actionTo="/marketplace"
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!cancelTarget}
        title="Cancel This Request?"
        message={`Are you sure you want to cancel your request for "${cancelTarget?.resourceTitle}"? If it was approved, availability will be restored for other students.`}
        confirmLabel="Yes, Cancel Request"
        isDanger={true}
        isLoading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};
