import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { CompanyBadge } from '../components/CompanyBadge';
import { RequestModal } from '../components/RequestModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { 
  MapPin, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Send, 
  ShieldCheck, 
  Scale, 
  DollarSign, 
  Building2, 
  AlertCircle, 
  FileText, 
  Sparkles,
  ExternalLink,
  Layers
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
        error('Industrial material listing not found or unavailable');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate, error]);

  const supplierId = resource?.supplierCompanyId;
  const isOwner = user && (user.id === supplierId || user._id === supplierId);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await resourceApi.delete(`/api/resources/${id}`);
      success('Industrial listing removed successfully from the catalog.');
      navigate('/my-listings');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove material listing');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-semibold">Loading industrial specifications...</p>
      </div>
    );
  }

  if (!resource) return null;

  const priceStr = resource.pricePerUnit
    ? `${resource.currency || 'INR'} ${resource.pricePerUnit.toLocaleString()} / ${resource.unit}`
    : 'Free / By Exchange Terms';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Material Marketplace</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Image & Industrial Media */}
        <div className="bg-slate-900 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 relative">
          {resource.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="max-h-96 w-full object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80';
              }}
            />
          ) : (
            <div className="text-center text-slate-400 py-20">
              <Layers className="w-16 h-16 mx-auto mb-2 opacity-50 text-teal-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">{resource.category}</p>
              <p className="text-sm font-bold text-white mt-1">Industrial Surplus Material</p>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="w-full mt-4 bg-slate-800/90 rounded-xl p-3 border border-slate-700 grid grid-cols-2 gap-2 text-white text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Stock</span>
              <span className="text-base font-bold text-teal-400">
                {(resource.availableQuantity || 0).toLocaleString()} {resource.unit}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Indicative Rate</span>
              <span className="text-sm font-bold text-emerald-400">
                {priceStr}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Specifications */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-navy-900 text-teal-400">
                {resource.resourceType || 'By-product'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {resource.materialCondition || 'Industrial Grade'}
              </span>
              <StatusBadge status={resource.availabilityStatus || 'available'} />
            </div>

            {/* Title & Category */}
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                {resource.category}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {resource.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specification & Description</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>

            {/* Material Composition & Potential Applications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {resource.composition && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Composition</span>
                  <span className="text-slate-800 font-medium">{resource.composition}</span>
                </div>
              )}
              {resource.intendedUse && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Applications</span>
                  <span className="text-slate-800 font-medium">{resource.intendedUse}</span>
                </div>
              )}
            </div>

            {/* Logistics & Facility Location */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span>Pickup Facility: <strong className="font-semibold text-slate-800">
                  {resource.pickupLocation?.address ? `${resource.pickupLocation.address}, ` : ''}
                  {resource.pickupLocation?.city}, {resource.pickupLocation?.state}
                </strong></span>
                {resource.pickupLocation?.loadingEquipmentAvailable && (
                  <p className="text-[11px] text-teal-700 mt-0.5">✓ On-site crane/forklift loading facilities available</p>
                )}
              </div>
            </div>

            {/* Compliance & Safety */}
            <div className={`p-3 rounded-xl border text-xs ${
              resource.compliance?.hazardousMaterial
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {resource.compliance?.hazardousMaterial ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Hazardous Material Manifest Required</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Non-Hazardous Industrial By-Product</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {resource.safetyHandling || 'Standard industrial handling practices apply. Receiver must maintain valid handling facility.'}
              </p>
              {resource.compliance?.msdsUrl && (
                <a
                  href={resource.compliance.msdsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold mt-1.5 underline hover:text-navy-950"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Review Material Safety Data Sheet (MSDS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200">
            {isOwner ? (
              <div className="space-y-2">
                <p className="text-xs text-teal-700 font-semibold mb-2">
                  Your enterprise owns this registered material
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/edit-resource/${resource._id || resource.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-950 transition-colors shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Inventory Data</span>
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
                {resource.availabilityStatus === 'available' || resource.availabilityStatus === 'partially_reserved' ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login', { state: { from: { pathname: `/resources/${id}` } } });
                      } else {
                        setRequestModalOpen(true);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-teal-700 shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit B2B Exchange Proposal</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs text-slate-600 font-medium">
                    This material is fully reserved or transferred.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
          Listing Enterprise Profile
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 text-teal-400 flex items-center justify-center font-bold text-base shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {resource.supplierCompanyDisplayName}
                </h3>
                <CompanyBadge status={resource.supplierVerificationStatus || 'Verified'} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Facility Location: {resource.pickupLocation?.city}, {resource.pickupLocation?.state}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <span>Listing Reference: </span>
            <span className="font-mono text-slate-800 font-semibold">{resource._id || resource.id}</span>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        resource={resource}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          resourceApi.get(`/api/resources/${id}`).then((r) => setResource(r.data.data));
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Remove Material from Industrial Registry?"
        message="Are you sure you want to permanently delete this listing? Active exchange proposals associated with this resource may be impacted."
        confirmLabel="Yes, Remove Listing"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
