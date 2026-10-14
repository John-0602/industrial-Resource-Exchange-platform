import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { RequestModal } from '../components/RequestModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { 
  MapPin, 
  Clock, 
  RefreshCw, 
  User, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Send, 
  ShieldCheck, 
  Calendar,
  BookOpen
} from 'lucide-react';

export const ResourceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await resourceApi.get(`/api/resources/${id}`);
        if (res.data.success) {
          setResource(res.data.data);
        }
      } catch (err) {
        error('Resource not found or failed to load');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate, error]);

  const isOwner = user && resource && (user.id === (resource.owner?.id || resource.owner?._id));

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await resourceApi.delete(`/api/resources/${id}`);
      success('Resource listing successfully removed');
      navigate('/my-listings');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading resource details...</p>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Image */}
        <div className="bg-slate-100 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
          {resource.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="max-h-96 w-full object-contain rounded-xl shadow-xs"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
              }}
            />
          ) : (
            <div className="text-center text-slate-400 py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">{resource.category}</p>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-navy-900 text-teal-400">
                {resource.listingType}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {resource.condition} Condition
              </span>
              <StatusBadge status={resource.availabilityStatus} />
            </div>

            {/* Title & Category */}
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                {resource.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {resource.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>

            {/* Specific terms */}
            {resource.lendingDuration && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-xs text-teal-900">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Lending Duration: <strong className="font-semibold">{resource.lendingDuration}</strong></span>
              </div>
            )}

            {resource.exchangePreference && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs text-indigo-900">
                <RefreshCw className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>Exchange Preference: <strong className="font-semibold">{resource.exchangePreference}</strong></span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Campus Pickup: <strong className="font-semibold text-slate-800">{resource.location}</strong></span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200">
            {isOwner ? (
              <div className="space-y-2">
                <p className="text-xs text-teal-700 font-semibold mb-2">You own this resource listing</p>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/edit-resource/${resource._id || resource.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-950 transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Listing</span>
                  </Link>
                  <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {resource.availabilityStatus === 'available' ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login', { state: { from: { pathname: `/resources/${id}` } } });
                      } else {
                        setRequestModalOpen(true);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request This Resource</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs text-slate-600 font-medium">
                    This item is currently {resource.availabilityStatus} and not accepting new requests.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Listed By Student
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-base overflow-hidden">
            <User className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{resource.owner?.name}</h3>
            <p className="text-xs text-slate-500">
              {resource.owner?.department} • {resource.owner?.collegeName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{resource.owner?.email}</p>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        resource={resource}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          // Refresh details
          resourceApi.get(`/api/resources/${id}`).then((r) => setResource(r.data.data));
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Delete Resource Listing?"
        message="Are you sure you want to permanently delete this listing from the marketplace? This cannot be undone."
        confirmLabel="Yes, Delete Listing"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
