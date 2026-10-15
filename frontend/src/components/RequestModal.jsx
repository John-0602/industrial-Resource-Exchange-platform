import React, { useState } from 'react';
import { exchangeApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Send, AlertCircle, Building2, Scale, DollarSign, Truck, CheckSquare } from 'lucide-react';

export const RequestModal = ({ resource, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [requestedQuantity, setRequestedQuantity] = useState(
    resource?.minOrderQuantity || Math.min(resource?.availableQuantity || 1, 100)
  );
  const [proposedPrice, setProposedPrice] = useState(resource?.pricePerUnit || 0);
  const [proposalMessage, setProposalMessage] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('Ex-Works facility pickup arranged by receiver');
  const [complianceAck, setComplianceAck] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen || !resource) return null;

  const resourceId = resource._id || resource.id;
  const supplierId = resource.supplierCompanyId || resource.supplier?.id || resource.supplier?._id;
  const myUserId = user?.id || user?._id;
  const isOwner = Boolean(user && supplierId && String(myUserId) === String(supplierId));

  const availableQty = resource.availableQuantity || 0;
  const totalAmount = (Number(requestedQuantity) || 0) * (Number(proposedPrice) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isAuthenticated) {
      setFormError('Please sign in with your enterprise account to submit an exchange proposal');
      return;
    }

    if (isOwner) {
      setFormError('An enterprise cannot submit exchange proposals for its own listed materials');
      return;
    }

    if (Number(requestedQuantity) <= 0) {
      setFormError('Requested quantity must be greater than zero');
      return;
    }

    if (Number(requestedQuantity) > availableQty) {
      setFormError(`Requested quantity cannot exceed currently unreserved stock (${availableQty.toLocaleString()} ${resource.unit})`);
      return;
    }

    if (!proposalMessage.trim()) {
      setFormError('Please provide details on your intended operational application and terms');
      return;
    }

    if (!complianceAck) {
      setFormError('You must acknowledge material compliance and safe handling requirements');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        resourceId,
        requestedQuantity: Number(requestedQuantity),
        unit: resource.unit,
        proposedPricePerUnit: Number(proposedPrice),
        currency: resource.currency || 'INR',
        proposalMessage: proposalMessage.trim(),
        deliveryTerms: deliveryTerms.trim(),
        complianceAck: true
      };

      const res = await exchangeApi.post('/api/exchanges', payload);

      if (res.data.success) {
        success('B2B Exchange proposal submitted successfully! The supplier has been notified.');
        setProposalMessage('');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit industrial exchange proposal';
      setFormError(errorMsg);
      error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-8">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
            Industrial Procurement Proposal
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1 line-clamp-1">
            {resource.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Supplier: <strong className="text-slate-700">{resource.supplierCompanyDisplayName}</strong></span>
            <span>•</span>
            <span>Unreserved Stock: <strong className="text-teal-700">{availableQty.toLocaleString()} {resource.unit}</strong></span>
          </div>
        </div>

        {isOwner && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You are the listing enterprise. You cannot submit exchange requests for your own materials.</span>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity & Proposed Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                Requested Quantity ({resource.unit}) *
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                max={availableQty}
                required
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Min order: {resource.minOrderQuantity || 1} {resource.unit}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Proposed Rate / {resource.unit} ({resource.currency || 'INR'})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Indicative rate: ₹{resource.pricePerUnit || 0} / {resource.unit}
              </span>
            </div>
          </div>

          {/* Computed Commercial Total */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Estimated Proposal Value:</span>
            <span className="text-base font-bold text-slate-900">
              {resource.currency || 'INR'} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Delivery & Logistics Terms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              Proposed Logistics & Transfer Terms *
            </label>
            <input
              type="text"
              required
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              placeholder="e.g. Ex-Works pickup via own fleet, or FOB destination"
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          {/* Proposal Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Application Details & Message to Supplier *
            </label>
            <textarea
              rows={3}
              required
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              placeholder="Describe your plant's recycling or processing capacity, intended intake schedule, and any technical clarification required..."
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Compliance & Handling Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="complianceCheck"
              checked={complianceAck}
              onChange={(e) => setComplianceAck(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="complianceCheck" className="text-xs text-slate-600 leading-snug cursor-pointer">
              Our enterprise confirms legal authority, environmental compliance, and adequate industrial handling facilities for this material category ({resource.category}).
            </label>
          </div>

          {/* Inter-service Notice */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-lg p-2.5 text-[11px] text-teal-900">
            ⚡ <span className="font-semibold">Microservices REST Transaction:</span> This request communicates from the Exchange Service to the Resource Service to confirm live quantity reservation without overselling.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOwner}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span>Submitting Proposal...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Industrial Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
