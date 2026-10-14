import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MaterialTable } from '../components/MaterialTable';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { 
  PlusCircle, 
  Layers, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const MyListingsPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await resourceApi.get('/api/resources?limit=100');
      if (res.data.success) {
        const myCompanyId = user?.id || user?._id;
        const filtered = (res.data.data || []).filter(
          (r) => r.supplierCompanyId === myCompanyId || r.supplierCompanyName === user?.companyName
        );
        setListings(filtered);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      await resourceApi.delete(`/api/resources/${selectedId}`);
      success('Material listing removed successfully');
      setListings((prev) => prev.filter((item) => (item._id || item.id) !== selectedId));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setSelectedId(null);
    }
  };

  const totalAvailable = listings.reduce((sum, item) => sum + (Number(item.availableQuantity) || 0), 0);
  const totalReserved = listings.reduce((sum, item) => sum + (Number(item.reservedQuantity) || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Enterprise Material Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your company's published surplus, scrap, and industrial by-product listings
          </p>
        </div>

        <Link
          to="/add-resource"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Material</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Published Items
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{listings.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active catalog entries</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Available Stock
          </span>
          <p className="text-2xl font-bold text-teal-700 mt-1">{totalAvailable.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Unreserved across inventory</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Reserved for Transfers
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{totalReserved.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Committed in accepted proposals</p>
        </div>
      </div>

      {/* Material Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Inventory Registry Details</h2>
          <span className="text-xs text-slate-500 font-medium">{listings.length} registered items</span>
        </div>

        <MaterialTable
          resources={listings}
          loading={loading}
          actionLabel="View Details"
        />
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Remove Material from Inventory?"
        message="Are you sure you want to permanently delete this listing? This will cancel any pending proposals."
        confirmLabel="Yes, Remove"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
};
