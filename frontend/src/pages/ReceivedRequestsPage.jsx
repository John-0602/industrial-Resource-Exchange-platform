import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { EmptyState } from '../components/EmptyState';
import { 
  Inbox, 
  Building2, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Truck, 
  CheckCheck,
  Scale,
  DollarSign,
  ExternalLink
} from 'lucide-react';

export const ReceivedRequestsPage = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(''); // 'accept' | 'reject' | 'transfer' | 'complete'
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    carrierName: 'VRL Industrial Logistics',
    trackingRef: 'TRK-IREP-9921',
    transferNotes: 'Dispatched in palletized shrink-wrapped bundles.'
  });

  const fetchReceived = async () => {
    setLoading(true);
    try {
      const res = await exchangeApi.get('/api/exchanges/received');
      if (res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      error('Failed to load inbound proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceived();
  }, []);

  const handleStatusUpdate = async (reqId, newStatus, extraData = {}) => {
    setActionLoading(true);
    try {
      const res = await exchangeApi.patch(`/api/exchanges/${reqId}/status`, {
        status: newStatus,
        ...extraData
      });

      if (res.data.success) {
        success(`Proposal marked as "${newStatus}". Microservice inventory sync executed.`);
        setRequests((prev) =>
          prev.map((r) => ((r._id || r.id) === reqId ? res.data.data : r))
        );
        setActionTarget(null);
        setTrackingModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update proposal status';
      error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAction = () => {
    if (!actionTarget) return;
    const reqId = actionTarget._id || actionTarget.id;

    if (actionType === 'accept') {
      handleStatusUpdate(reqId, 'Accepted');
    } else if (actionType === 'reject') {
      handleStatusUpdate(reqId, 'Rejected');
    } else if (actionType === 'complete') {
      handleStatusUpdate(reqId, 'Completed');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
            <Inbox className="w-3.5 h-3.5 text-teal-600" />
            <span>Inbound Supplier Proposals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Inbound Exchange Proposals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming procurement bids, accept stock reservations, and coordinate material transfers
          </p>
        </div>

        <Link
          to="/my-listings"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <span>View My Inventory</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading inbound proposals...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const reqId = req._id || req.id;
            const isPending = req.status === 'Pending' || req.status === 'Under Negotiation';
            const isAccepted = req.status === 'Accepted';
            const isInTransfer = req.status === 'In Transfer';

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
                      Received {new Date(req.createdAt).toLocaleDateString()}
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
                      <span>Purchasing Enterprise: <strong className="text-slate-800">{req.receiverCompanyName}</strong></span>
                      <span>({req.receiverEmail})</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/80">
                      <span className="font-semibold text-slate-700">Proposal Application:</span> "{req.proposalMessage}"
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
                      <span className="text-slate-500">Requested:</span>
                      <span className="font-bold text-slate-900">{req.requestedQuantity} {req.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bid Rate:</span>
                      <span className="font-medium text-slate-700">₹{req.proposedPricePerUnit || 0} / {req.unit}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
                      <span>Total Value:</span>
                      <span className="text-emerald-700">₹{(req.totalProposedAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Notice */}
                {isAccepted && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-xs text-teal-900 flex items-center justify-between">
                    <span>
                      ✓ <strong>Stock Reserved on Resource Service:</strong> {req.requestedQuantity} {req.unit} is locked. Prepare consignment dispatch.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActionTarget(req);
                        setTrackingModalOpen(true);
                      }}
                      className="px-3 py-1 bg-navy-900 text-white rounded text-xs font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Dispatch & Enter Logistics
                    </button>
                  </div>
                )}

                {isInTransfer && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-between">
                    <span>
                      🚚 <strong>Consignment In Transit:</strong> Carrier: {req.transferTracking?.carrierName || 'Freight Carrier'} • Ref: {req.transferTracking?.trackingRef || 'N/A'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActionTarget(req);
                        setActionType('complete');
                      }}
                      className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors"
                    >
                      Confirm Delivery Completed
                    </button>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <Link
                    to={`/exchanges/${reqId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Negotiate / Open Thread ({req.negotiationNotes?.length || 0})</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setActionTarget(req);
                            setActionType('reject');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActionTarget(req);
                            setActionType('accept');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept & Reserve Stock</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No inbound proposals"
          description="Your enterprise has not received any procurement proposals yet. Publish more industrial by-products to attract industrial receivers."
          actionLabel="Publish Surplus Material"
          actionTo="/add-resource"
        />
      )}

      {/* Dispatch Tracking Modal */}
      {trackingModalOpen && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Dispatch Consignment: {actionTarget.resourceTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Enter freight carrier and consignment tracking details for the receiver enterprise
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Logistics / Freight Carrier
                </label>
                <input
                  type="text"
                  value={trackingData.carrierName}
                  onChange={(e) => setTrackingData((prev) => ({ ...prev, carrierName: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Waybill / Tracking Reference
                </label>
                <input
                  type="text"
                  value={trackingData.trackingRef}
                  onChange={(e) => setTrackingData((prev) => ({ ...prev, trackingRef: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={trackingData.transferNotes}
                  onChange={(e) => setTrackingData((prev) => ({ ...prev, transferNotes: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  handleStatusUpdate(actionTarget._id || actionTarget.id, 'In Transfer', {
                    transferTracking: {
                      ...trackingData,
                      dispatchDate: new Date()
                    }
                  })
                }
                className="px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Confirm Dispatch (In Transfer)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Accept / Reject / Complete */}
      <ConfirmationDialog
        isOpen={Boolean(actionTarget && !trackingModalOpen)}
        title={
          actionType === 'accept'
            ? 'Accept Proposal & Reserve Stock?'
            : actionType === 'reject'
            ? 'Decline Procurement Proposal?'
            : 'Confirm Transfer Completed?'
        }
        message={
          actionType === 'accept'
            ? `Accepting will coordinate with the Resource Service over REST to atomically reserve ${actionTarget?.requestedQuantity} ${actionTarget?.unit} of stock.`
            : actionType === 'reject'
            ? `Decline this proposal from ${actionTarget?.receiverCompanyName}?`
            : `Marking transfer as Completed will finalize the transaction and update the permanent circular exchange registry.`
        }
        confirmLabel={
          actionType === 'accept'
            ? 'Yes, Accept & Reserve'
            : actionType === 'reject'
            ? 'Decline Proposal'
            : 'Mark Transfer Completed'
        }
        isDanger={actionType === 'reject'}
        isLoading={actionLoading}
        onConfirm={confirmAction}
        onCancel={() => {
          setActionTarget(null);
          setActionType('');
        }}
      />
    </div>
  );
};
