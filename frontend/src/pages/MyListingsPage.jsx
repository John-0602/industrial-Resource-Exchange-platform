import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { EmptyState } from '../components/EmptyState';
import { Layers, PlusCircle, Edit3, Trash2, Eye, MapPin } from 'lucide-react';

export const MyListingsPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await resourceApi.get(`/api/resources?ownerId=${user.id}&limit=50`);
      if (res.data.success) {
        setListings(res.data.data || []);
      }
    } catch (err) {
      error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await resourceApi.delete(`/api/resources/${deleteTarget._id || deleteTarget.id}`);
      success('Resource listing deleted');
      setListings((prev) => prev.filter((item) => (item._id || item.id) !== (deleteTarget._id || deleteTarget.id)));
      setDeleteTarget(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-1">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Inventory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Resource Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your shared textbooks, notes, lab items, and availability statuses
          </p>
        </div>

        <Link
          to="/add-resource"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your listings...</div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    {item.category}
                  </span>
                  <StatusBadge status={item.availabilityStatus} />
                </div>

                <h3 className="font-bold text-slate-900 line-clamp-1 text-base">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                    {item.listingType} • {item.condition}
                  </span>
                  <div className="flex items-center gap-1 truncate max-w-[50%]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/resources/${item._id || item.id}`}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-navy-950 font-medium py-1.5 px-2.5 rounded hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <div className="flex items-center gap-1">
                  <Link
                    to={`/edit-resource/${item._id || item.id}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-teal-700 font-medium py-1.5 px-2.5 rounded hover:bg-teal-50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium py-1.5 px-2.5 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="You haven't listed any resources yet"
          description="Have textbooks, electronics, notes, or calculators lying around? List them now to share with college peers!"
          actionLabel="List Your First Resource"
          actionTo="/add-resource"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        title="Delete Resource Listing?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
