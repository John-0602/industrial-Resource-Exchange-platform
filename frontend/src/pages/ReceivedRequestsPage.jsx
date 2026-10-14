import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { EmptyState } from '../components/EmptyState';
import { Inbox, CheckCircle, XCircle, Clock, MessageSquare, User, CheckSquare } from 'lucide-react';

export const ReceivedRequestsPage = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'Approved' | 'Rejected' | 'Completed'
  const [processing, setProcessing] = useState(false);

  const fetchReceived = async () => {
    setLoading(true);
    try {
      const res = await exchangeApi.get('/api/exchanges/received');
      if (res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      error('Failed to load incoming requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceived();
  }, []);

  const handleStatusChange = async () => {
    if (!actionTarget || !actionType) return;
    setProcessing(true);

    try {
      const res = await exchangeApi.patch(`/api/exchanges/${actionTarget._id || actionTarget.id}/status`, {
        status: actionType,
        note: `Status updated to ${actionType} by resource owner`
      });

      if (res.data.success) {
        success(
          actionType === 'Approved'
            ? 'Request Approved! The resource status was updated via inter-service REST call.'
            : `Request marked as ${actionType}.`
        );

        setRequests((prev) =>
          prev.map((r) =>
            (r._id || r.id) === (actionTarget._id || actionTarget.id)
              ? { ...r, status: actionType }
              : r
          )
        );

        setActionTarget(null);
        setActionType(null);
      }
    } catch (err) {
      error(err.response?.data?.message || `Failed to update request to ${actionType}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
          <Inbox className="w-3.5 h-3.5 text-teal-600" />
          <span>Inbound Requests</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Received Exchange Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review, approve, and manage borrow and trade requests from students for your resources
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading incoming requests...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === 'Pending';
            const isApproved = req.status === 'Approved';

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
                      Received on {new Date(req.createdAt).toLocaleDateString()}
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
                      <span className="font-semibold text-slate-700">Requester's Note:</span> "{req.requestMessage}"
                      {req.exchangeItemOffered && (
                        <p className="mt-1 text-teal-800">
                          <strong>Item Offered in Trade:</strong> {req.exchangeItemOffered}
                        </p>
                      )}
                      {req.durationRequested && (
                        <p className="mt-0.5 text-slate-500">
                          <strong>Duration Requested:</strong> {req.durationRequested}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Requested by <strong className="text-slate-800">{req.requesterName}</strong> ({req.requesterDepartment} • {req.requesterEmail})
                    </span>
                  </div>
                </div>

                {/* Owner Actions */}
                <div className="md:border-l md:border-slate-100 md:pl-5 flex flex-col gap-2 shrink-0">
                  {isPending && (
                    <div className="flex flex-row md:flex-col gap-2">
                      <button
                        onClick={() => {
                          setActionTarget(req);
                          setActionType('Approved');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Request</span>
                      </button>

                      <button
                        onClick={() => {
                          setActionTarget(req);
                          setActionType('Rejected');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => {
                        setActionTarget(req);
                        setActionType('Completed');
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-950 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Mark Completed / Returned</span>
                    </button>
                  )}

                  {!isPending && !isApproved && (
                    <span className="text-xs text-slate-400 italic">No further actions</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No incoming requests yet"
          description="When students browse the marketplace and request to borrow, exchange, or receive your items, their requests will appear here."
        />
      )}

      {/* Action Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!actionTarget && !!actionType}
        title={
          actionType === 'Approved'
            ? 'Approve Exchange Request?'
            : actionType === 'Rejected'
            ? 'Reject Exchange Request?'
            : 'Mark Exchange as Completed?'
        }
        message={
          actionType === 'Approved'
            ? `Approving this request will automatically contact the Resource Service over REST to lock the resource availability status to "reserved". Other pending requests for this item will be closed.`
            : actionType === 'Rejected'
            ? `Are you sure you want to decline this request from ${actionTarget?.requesterName}?`
            : `Confirm that this item was physically handed over and returned/completed.`
        }
        confirmLabel={
          actionType === 'Approved' ? 'Confirm Approval' : actionType === 'Rejected' ? 'Confirm Rejection' : 'Complete'
        }
        isDanger={actionType === 'Rejected'}
        isLoading={processing}
        onConfirm={handleStatusChange}
        onCancel={() => {
          setActionTarget(null);
          setActionType(null);
        }}
      />
    </div>
  );
};
