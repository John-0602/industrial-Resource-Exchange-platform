import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Edit3, AlertCircle, ArrowLeft } from 'lucide-react';

export const EditResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Textbooks',
    listingType: 'Lend',
    condition: 'Good',
    imageUrl: '',
    lendingDuration: '',
    exchangePreference: '',
    location: '',
    availabilityStatus: 'available'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await resourceApi.get(`/api/resources/${id}`);
        if (res.data.success) {
          const item = res.data.data;
          // Verify owner
          if (user && item.owner?.id !== user.id && item.owner?._id !== user.id) {
            error('Unauthorized: You are not the owner of this listing');
            navigate('/marketplace');
            return;
          }

          setFormData({
            title: item.title,
            description: item.description,
            category: item.category,
            listingType: item.listingType,
            condition: item.condition,
            imageUrl: item.imageUrl || '',
            lendingDuration: item.lendingDuration || '',
            exchangePreference: item.exchangePreference || '',
            location: item.location || '',
            availabilityStatus: item.availabilityStatus || 'available'
          });
        }
      } catch (err) {
        error('Failed to load resource for editing');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, user, navigate, error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await resourceApi.put(`/api/resources/${id}`, formData);
      if (res.data.success) {
        success('Resource updated successfully');
        navigate(`/resources/${id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update resource';
      setFormError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading resource details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="pb-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Edit Listing</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Update Resource</h1>
          </div>
          <button
            onClick={() => navigate(`/resources/${id}`)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              >
                <option value="Textbooks">Textbooks</option>
                <option value="Notes & Study Materials">Notes & Study Materials</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Stationery">Stationery</option>
                <option value="Calculators & Tools">Calculators & Tools</option>
                <option value="Electronics & Hardware">Electronics & Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Listing Type *
              </label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              >
                <option value="Lend">Lend</option>
                <option value="Exchange">Exchange</option>
                <option value="Donate">Donate</option>
                <option value="Give Away">Give Away</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Availability Status
              </label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800 font-semibold"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="exchanged">Exchanged / Completed</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Campus Pickup Location *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Photo URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(`/resources/${id}`)}
              disabled={submitting}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-bold hover:bg-navy-950 transition-colors shadow-sm disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" />
              <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
