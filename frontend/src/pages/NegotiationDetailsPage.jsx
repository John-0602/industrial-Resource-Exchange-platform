import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ArrowLeft, 
  Building2, 
  Send, 
  DollarSign, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ExternalLink,
  Scale
} from 'lucide-react';

export const NegotiationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [revisedPrice, setRevisedPrice] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchExchange = async () => {
    try {
      const res = await exchangeApi.get(`/api/exchanges/${id}`);
      if (res.data.success) {
        setExchange(res.data.data);
      }
    } catch (err) {
      error('Failed to load exchange proposal details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchange();
  }, [id]);

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmittingNote(true);
    try {
      const payload = {
        message: replyMessage.trim(),
        proposedPrice: revisedPrice ? Number(revisedPrice) : undefined
      };

      const res = await exchangeApi.post(`/api/exchanges/${id}/negotiate`, payload);

      if (res.data.success) {
        success('Negotiation message transmitted to enterprise partner');
        setReplyMessage('');
        setRevisedPrice('');
        setExchange(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send negotiation message');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-semibold">Loading negotiation thread...</p>
      </div>
    );
  }

  if (!exchange) return null;

  const currentUserId = user?.id || user?._id;
  const isSupplier = currentUserId === exchange.supplierCompanyId;
  const isReceiver = currentUserId === exchange.receiverCompanyId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </button>
      </div>

      {/* Proposal Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">
                {exchange.materialCategory}
              </span>
              <span>•</span>
              <StatusBadge status={exchange.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              {exchange.resourceTitle}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Estimated Amount</span>
            <span className="text-lg font-bold text-emerald-700">
              ₹{(exchange.totalProposedAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Counterparty & Commercial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Supplier Entity</span>
            <strong className="text-slate-900 text-sm block">{exchange.supplierCompanyName}</strong>
            <span className="text-slate-500">{exchange.supplierEmail}</span>
            {isSupplier && <span className="inline-block mt-1 text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded">Your Company</span>}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Procuring Receiver</span>
            <strong className="text-slate-900 text-sm block">{exchange.receiverCompanyName}</strong>
            <span className="text-slate-500">{exchange.receiverEmail}</span>
            {isReceiver && <span className="inline-block mt-1 text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded">Your Company</span>}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Volume & Rate</span>
            <strong className="text-slate-900 text-sm block">{exchange.requestedQuantity} {exchange.unit}</strong>
            <span className="text-slate-600">₹{exchange.proposedPricePerUnit || 0} / {exchange.unit}</span>
          </div>
        </div>

        {/* Logistics Terms */}
        <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900">
          <strong>Logistics Terms:</strong> {exchange.deliveryTerms || 'Ex-Works pickup arranged by receiver facility'}
        </div>
      </div>

      {/* Negotiation Thread */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Negotiation Thread & Price Discussion
          </h2>
        </div>

        {/* Initial Proposal Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-bold text-slate-800">
              {exchange.receiverCompanyName} <span className="text-[10px] font-normal text-slate-500">(Initial Proposal)</span>
            </span>
            <span>{new Date(exchange.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-slate-700 leading-relaxed pt-1">
            "{exchange.proposalMessage}"
          </p>
        </div>

        {/* Negotiation Message History */}
        {exchange.negotiationNotes && exchange.negotiationNotes.length > 0 && (
          <div className="space-y-3">
            {exchange.negotiationNotes.map((note, idx) => {
              const isMine = note.senderId === currentUserId;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isMine
                      ? 'bg-teal-50/70 border-teal-200 ml-4 sm:ml-8'
                      : 'bg-slate-50 border-slate-200 mr-4 sm:mr-8'
                  }`}
                >
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-bold text-slate-900">
                      {note.senderName} {isMine && '(You)'}
                    </span>
                    <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed pt-0.5">{note.message}</p>

                  {note.proposedPrice !== undefined && note.proposedPrice !== null && (
                    <div className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200">
                      Counter Offer: ₹{note.proposedPrice} / {exchange.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Post Message Form */}
        {exchange.status !== 'Completed' && exchange.status !== 'Cancelled' && (
          <form onSubmit={handleSendNote} className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Post Counter-Offer or Clarification Message
              </label>
              <textarea
                rows={3}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Discuss transport schedules, quality certificates, or revised price..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  Revised Rate / {exchange.unit} (₹):
                </label>
                <input
                  type="number"
                  step="any"
                  value={revisedPrice}
                  onChange={(e) => setRevisedPrice(e.target.value)}
                  placeholder={`Optional counter-price`}
                  className="w-36 text-xs p-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={submittingNote}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingNote ? 'Transmitting...' : 'Send Negotiation Message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Audit Log & Status History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Transaction Lifecycle & Microservices Audit Trail
        </h3>
        <div className="space-y-2">
          {exchange.statusHistory?.map((hist, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-b-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold text-slate-800">{hist.status}</span>
                {hist.note && <span className="text-slate-500">({hist.note})</span>}
              </div>
              <span className="text-slate-400 text-[11px]">
                {new Date(hist.changedAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
