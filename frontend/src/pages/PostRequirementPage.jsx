import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { industrialCategories, materialConditions } from '../components/FilterPanel';
import { 
  FileSpreadsheet, 
  Scale, 
  MapPin, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Sparkles,
  Send
} from 'lucide-react';

const units = ['kg', 'tonnes', 'litres', 'units', 'meters', 'drums'];

export const PostRequirementPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialCategory: industrialCategories[1], // Textile and fabric waste
    materialTitle: '',
    specificationDetails: '',
    requiredQuantity: 500,
    unit: 'kg',
    acceptableCondition: 'Any Usable Grade',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'India',
    facilityAddress: user?.address || '',
    maxBudgetPerUnit: 30,
    currency: 'INR',
    requiredByDate: '',
    handlingRequirements: 'Standard industrial receiving dock'
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Synchronize form with logged in enterprise facility profile
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        facilityAddress: prev.facilityAddress || user.address || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        country: prev.country || user.country || 'India'
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.materialTitle.trim()) {
      setFormError('Please enter the target material title');
      return;
    }

    if (!formData.specificationDetails.trim()) {
      setFormError('Please enter specification and quality acceptance parameters');
      return;
    }

    if (Number(formData.requiredQuantity) <= 0) {
      setFormError('Required quantity must be greater than zero');
      return;
    }

    if (!formData.city.trim()) {
      setFormError('Please enter the destination receiving city / hub');
      return;
    }

    if (!formData.state.trim()) {
      setFormError('Please enter the destination receiving state / province');
      return;
    }

    setLoading(true);
    try {
      const deliveryAddress = formData.facilityAddress.trim() || `${formData.city.trim()} Receiving Facility`;

      const payload = {
        title: formData.materialTitle.trim(),
        materialTitle: formData.materialTitle.trim(),
        materialCategory: formData.materialCategory,
        category: formData.materialCategory,
        specifications: formData.specificationDetails.trim(),
        specificationDetails: formData.specificationDetails.trim(),
        requiredQuantity: Number(formData.requiredQuantity),
        unit: formData.unit,
        acceptableCondition: formData.acceptableCondition,
        condition: formData.acceptableCondition,
        deliveryLocation: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim() || 'India',
          address: deliveryAddress,
          facilityAddress: deliveryAddress
        },
        maxBudget: Number(formData.maxBudgetPerUnit) || 0,
        maxBudgetPerUnit: Number(formData.maxBudgetPerUnit) || 0,
        currency: formData.currency,
        requiredByDate: formData.requiredByDate || undefined,
        additionalHandling: formData.handlingRequirements.trim(),
        handlingRequirements: formData.handlingRequirements.trim()
      };

      const res = await exchangeApi.post('/api/requirements', payload);

      if (res.data.success) {
        success('Procurement requirement registered! Running circular matching engine...');
        const reqId = res.data.data?._id || res.data.data?.id;
        navigate(`/matching?requirementId=${reqId}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit material requirement';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Post Material Procurement Requirement</h1>
            <p className="text-xs text-slate-500">
              Broadcast your facility's input needs to automatically match with available industrial by-products
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
        {/* Material Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Target Material & Intake Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Required Material Category *
              </label>
              <select
                name="materialCategory"
                value={formData.materialCategory}
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
                Material Title or Keyword *
              </label>
              <input
                type="text"
                name="materialTitle"
                required
                value={formData.materialTitle}
                onChange={handleChange}
                placeholder="e.g. Cotton fabric scraps or Steel turning scrap"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Specifications & Quality Thresholds
            </label>
            <textarea
              name="specificationDetails"
              rows={3}
              value={formData.specificationDetails}
              onChange={handleChange}
              placeholder="Specify allowable contamination levels, moisture limits, fiber lengths, chemical purity requirements..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Acceptable Material Condition
              </label>
              <select
                name="acceptableCondition"
                value={formData.acceptableCondition}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              >
                <option value="Any Usable Grade">Any Usable Grade (Broad Match)</option>
                {materialConditions.filter((c) => c !== 'All').map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Required By Date
              </label>
              <input
                type="date"
                name="requiredByDate"
                value={formData.requiredByDate}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Quantity & Budget */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Required Quantities & Maximum Budget
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                Required Quantity *
              </label>
              <input
                type="number"
                name="requiredQuantity"
                min="0.1"
                step="any"
                required
                value={formData.requiredQuantity}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unit of Measure *
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
                Max Budget / Unit ({formData.currency})
              </label>
              <input
                type="number"
                name="maxBudgetPerUnit"
                min="0"
                step="any"
                value={formData.maxBudgetPerUnit}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Delivery Destination */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Intake Facility & Delivery Hub
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Intake City / Hub *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Coimbatore"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                State / Province *
              </label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Tamil Nadu"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Receiving Facility Address
              </label>
              <input
                type="text"
                name="facilityAddress"
                value={formData.facilityAddress}
                onChange={handleChange}
                placeholder="Factory address or unloading gate"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Broadcasting Need...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save & Find Compatible Matches</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
