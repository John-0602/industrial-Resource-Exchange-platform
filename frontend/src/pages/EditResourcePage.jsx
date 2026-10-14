import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { industrialCategories, resourceTypes, materialConditions } from '../components/FilterPanel';
import { Factory, Scale, DollarSign, AlertCircle, Save, ArrowLeft } from 'lucide-react';

const units = ['kg', 'tonnes', 'litres', 'units', 'meters', 'drums'];

export const EditResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: industrialCategories[1],
    resourceType: 'By-product',
    description: '',
    totalQuantity: 1000,
    availableQuantity: 1000,
    unit: 'kg',
    materialCondition: 'Production Scrap',
    composition: '',
    intendedUse: '',
    pricePerUnit: 0,
    currency: 'INR',
    minOrderQuantity: 1,
    facilityAddress: '',
    city: '',
    state: '',
    country: 'India',
    loadingEquipmentAvailable: true,
    safetyHandling: '',
    hazardousMaterial: false,
    pcbCategory: '',
    msdsUrl: '',
    imageUrl: '',
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
          const r = res.data.data;
          setFormData({
            title: r.title || '',
            category: r.category || industrialCategories[1],
            resourceType: r.resourceType || 'By-product',
            description: r.description || '',
            totalQuantity: r.totalQuantity || r.availableQuantity || 0,
            availableQuantity: r.availableQuantity || 0,
            unit: r.unit || 'kg',
            materialCondition: r.materialCondition || 'Production Scrap',
            composition: r.composition || '',
            intendedUse: r.intendedUse || '',
            pricePerUnit: r.pricePerUnit || 0,
            currency: r.currency || 'INR',
            minOrderQuantity: r.minOrderQuantity || 1,
            facilityAddress: r.pickupLocation?.address || '',
            city: r.pickupLocation?.city || '',
            state: r.pickupLocation?.state || '',
            country: r.pickupLocation?.country || 'India',
            loadingEquipmentAvailable: Boolean(r.pickupLocation?.loadingEquipmentAvailable),
            safetyHandling: r.safetyHandling || '',
            hazardousMaterial: Boolean(r.compliance?.hazardousMaterial),
            pcbCategory: r.compliance?.pcbCategory || '',
            msdsUrl: r.compliance?.msdsUrl || '',
            imageUrl: r.imageUrl || '',
            availabilityStatus: r.availabilityStatus || 'available'
          });
        }
      } catch (err) {
        error('Failed to load resource for editing');
        navigate('/my-listings');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate, error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        resourceType: formData.resourceType,
        description: formData.description.trim(),
        totalQuantity: Number(formData.totalQuantity),
        availableQuantity: Number(formData.availableQuantity),
        unit: formData.unit,
        materialCondition: formData.materialCondition,
        composition: formData.composition.trim(),
        intendedUse: formData.intendedUse.trim(),
        pricePerUnit: Number(formData.pricePerUnit) || 0,
        currency: formData.currency,
        minOrderQuantity: Number(formData.minOrderQuantity) || 1,
        pickupLocation: {
          address: formData.facilityAddress.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          loadingEquipmentAvailable: Boolean(formData.loadingEquipmentAvailable)
        },
        safetyHandling: formData.safetyHandling.trim(),
        compliance: {
          hazardousMaterial: Boolean(formData.hazardousMaterial),
          pcbCategory: formData.pcbCategory.trim(),
          msdsUrl: formData.msdsUrl.trim()
        },
        imageUrl: formData.imageUrl.trim(),
        availabilityStatus: formData.availabilityStatus
      };

      const res = await resourceApi.put(`/api/resources/${id}`, payload);

      if (res.data.success) {
        success('Industrial listing updated successfully');
        navigate(`/resources/${id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update material';
      setFormError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-semibold">Loading listing editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Material</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-teal-400 flex items-center justify-center shadow-xs">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Material Listing</h1>
            <p className="text-xs text-slate-500">
              Update inventory quantities, indicative rates, or technical specifications
            </p>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Material Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            >
              {industrialCategories.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Resource Type
            </label>
            <select
              name="resourceType"
              value={formData.resourceType}
              onChange={handleChange}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            >
              {resourceTypes.filter((t) => t !== 'All').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
          />
        </div>

        {/* Quantities & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              Available Stock ({formData.unit})
            </label>
            <input
              type="number"
              name="availableQuantity"
              min="0"
              step="any"
              required
              value={formData.availableQuantity}
              onChange={handleChange}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Measurement Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Rate per Unit ({formData.currency})
            </label>
            <input
              type="number"
              name="pricePerUnit"
              min="0"
              step="any"
              value={formData.pricePerUnit}
              onChange={handleChange}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Inventory Status
            </label>
            <select
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleChange}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            >
              <option value="available">Fully Available</option>
              <option value="partially_reserved">Partially Reserved</option>
              <option value="reserved">Fully Reserved</option>
              <option value="transferred">Transferred / Closed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Updates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
