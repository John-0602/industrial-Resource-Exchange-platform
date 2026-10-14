import React, { useState } from 'react';
import { exchangeApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Send, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export const RequestModal = ({ resource, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [message, setMessage] = useState('');
  const [exchangeItem, setExchangeItem] = useState('');
  const [duration, setDuration] = useState(resource?.lendingDuration || '');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen || !resource) return null;

  const isOwner = user && (user.id === (resource.owner?.id || resource.owner?._id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isAuthenticated) {
      setFormError('Please sign in to submit an exchange request');
      return;
    }

    if (isOwner) {
      setFormError('You cannot request your own listed resource');
      return;
    }

    if (!message.trim()) {
      setFormError('Please enter a short message explaining your request');
      return;
    }

    setLoading(true);
    try {
      const res = await exchangeApi.post('/api/exchanges', {
        resourceId: resource._id || resource.id,
        requestMessage: message.trim(),
        exchangeItemOffered: exchangeItem.trim(),
        durationRequested: duration.trim()
      });

      if (res.data.success) {
        success('Request submitted successfully! The owner will be notified.');
        setMessage('');
        setExchangeItem('');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit exchange request';
      setFormError(errorMsg);
      error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
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
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            {resource.listingType} Request
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1 line-clamp-1">
            {resource.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Owned by <span className="font-semibold text-slate-700">{resource.owner?.name}</span> ({resource.owner?.department})
          </p>
        </div>

        {isOwner && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You are the owner of this resource. You cannot request your own listing.</span>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Message to Owner *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I am preparing for exams and would love to borrow/exchange this resource. When can we meet?"
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Conditional: Exchange Item */}
          {resource.listingType === 'Exchange' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                What are you offering in return?
              </label>
              <input
                type="text"
                value={exchangeItem}
                onChange={(e) => setExchangeItem(e.target.value)}
                placeholder="e.g. Microprocessors 8086 textbook or breadboard kit"
                className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
              {resource.exchangePreference && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Owner's preference: <span className="italic">{resource.exchangePreference}</span>
                </p>
              )}
            </div>
          )}

          {/* Conditional: Lending Duration */}
          {resource.listingType === 'Lend' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Requested Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 14 days, 2 weeks, until mid-semester"
                className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          )}

          {/* Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-500">
            ℹ️ <span className="font-medium text-slate-700">Microservice REST Coordination:</span> Submitting this request calls the Exchange Service, which automatically verifies resource availability on the Resource Service over REST.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOwner}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span>Sending Request...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
