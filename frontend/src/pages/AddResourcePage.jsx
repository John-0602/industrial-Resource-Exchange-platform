import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { industrialCategories, resourceTypes, materialConditions } from '../components/FilterPanel';
import { 
  Factory, 
  Scale, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  PlusCircle 
} from 'lucide-react';

const units = ['kg', 'tonnes', 'litres', 'units', 'meters', 'drums'];

export const AddResourcePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: industrialCategories[1], // Textile and fabric waste
    resourceType: 'By-product',
    description: '',
    totalQuantity: 1000,
    unit: 'kg',
    materialCondition: 'Production Scrap',
    composition: '',
    intendedUse: '',
    pricePerUnit: 25,
    currency: 'INR',
    minOrderQuantity: 100,
    facilityAddress: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'India',
    postalCode: '',
    loadingEquipmentAvailable: true,
    safetyHandling: 'Store in dry shaded industrial shed. Keep away from direct ignition sources.',
    hazardousMaterial: false,
    pcbCategory: 'Green (Non-hazardous residue)',
    msdsUrl: '',
    imageUrl: ''
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter a material title & specification');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Please enter a detailed industrial description');
      return;
    }

    if (Number(formData.totalQuantity) <= 0) {
      setFormError('Total quantity must be greater than zero');
      return;
    }

    if (!formData.city.trim()) {
      setFormError('Please specify the city / industrial hub for logistics pickup');
      return;
    }

    if (!formData.state.trim()) {
      setFormError('Please specify the state / province for logistics pickup');
      return;
    }

    setLoading(true);
    try {
      const pickupAddress = formData.facilityAddress.trim() || `${formData.city.trim()} Industrial Hub Logistics Gate`;
      const handlingNotes = formData.safetyHandling.trim() || 'Store in dry covered facility away from spark sources. Non-hazardous industrial commodity.';

      const payload = {
        title: formData.title.trim(),
        materialCategory: formData.category,
        category: formData.category,
        resourceType: formData.resourceType,
        description: formData.description.trim(),
        totalQuantity: Number(formData.totalQuantity),
        availableQuantity: Number(formData.totalQuantity),
        unit: formData.unit,
        condition: formData.materialCondition,
        materialCondition: formData.materialCondition,
        chemicalComposition: formData.composition.trim(),
        composition: formData.composition.trim(),
        intendedUse: formData.intendedUse.trim(),
        indicativePrice: Number(formData.pricePerUnit) || 0,
        pricePerUnit: Number(formData.pricePerUnit) || 0,
        currency: formData.currency,
        minOrderQuantity: Number(formData.minOrderQuantity) || 1,
        pickupLocation: {
          address: pickupAddress,
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim() || 'India',
          postalCode: formData.postalCode.trim(),
          pincode: formData.postalCode.trim(),
          loadingEquipmentAvailable: Boolean(formData.loadingEquipmentAvailable)
        },
        handlingStorageInfo: handlingNotes,
        safetyHandling: handlingNotes,
        complianceInfo: formData.pcbCategory ? `${formData.pcbCategory}. ${formData.hazardousMaterial ? 'Hazardous waste.' : 'Non-hazardous residue.'}` : 'Complies with industrial waste regulations',
        compliance: {
          hazardousMaterial: Boolean(formData.hazardousMaterial),
          pcbCategory: formData.pcbCategory.trim(),
          msdsUrl: formData.msdsUrl.trim()
        },
        documentationUrl: formData.msdsUrl.trim(),
        imageUrl: formData.imageUrl.trim()
      };

      const res = await resourceApi.post('/api/resources', payload);

      if (res.data.success) {
        success('Industrial surplus material published successfully to catalog!');
        navigate('/my-listings');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to publish material listing';
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
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-teal-400 flex items-center justify-center shadow-xs">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Publish Industrial Surplus / By-Product</h1>
            <p className="text-xs text-slate-500">
              Register recoverable materials, production scraps, or secondary raw materials to the circular exchange
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
        {/* Core Material Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Material Classification & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Material Title & Specification *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 100% Cotton Comber Noil Scraps (Post-Spinning)"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Material Category *
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
                Resource Type *
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
              Detailed Industrial Description *
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe production source, grade, moisture content, contamination limits, packaging mode (e.g. baled, drummed, palletized)..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Material Condition *
              </label>
              <select
                name="materialCondition"
                value={formData.materialCondition}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              >
                {materialConditions.filter((c) => c !== 'All').map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Composition / Polymer Grade
              </label>
              <input
                type="text"
                name="composition"
                value={formData.composition}
                onChange={handleChange}
                placeholder="e.g. 100% Cellulose or EN8 Carbon Steel"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Intended Applications
              </label>
              <input
                type="text"
                name="intendedUse"
                value={formData.intendedUse}
                onChange={handleChange}
                placeholder="e.g. Thermal insulation, yarn reprocessing"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Quantities & Pricing */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Quantities & Commercial Terms
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                Total Quantity Available *
              </label>
              <input
                type="number"
                name="totalQuantity"
                min="0.1"
                step="any"
                required
                value={formData.totalQuantity}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Measurement Unit *
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
                placeholder="0 for negotiable/free"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Min Order Quantity
              </label>
              <input
                type="number"
                name="minOrderQuantity"
                min="1"
                step="any"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Location & Facility */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Logistics Origin & Facility Specs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Facility Pickup Address
              </label>
              <input
                type="text"
                name="facilityAddress"
                value={formData.facilityAddress}
                onChange={handleChange}
                placeholder="Industrial Plot, Sector, Phase..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                City / Industrial Hub *
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

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  name="loadingEquipmentAvailable"
                  checked={formData.loadingEquipmentAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Forklift / Overhead Crane on site</span>
              </label>
            </div>
          </div>
        </div>

        {/* Environmental Compliance & Safety */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            4. Environmental Compliance & Material Safety
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Handling & Storage Instructions
              </label>
              <textarea
                name="safetyHandling"
                rows={2}
                value={formData.safetyHandling}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="hazardousMaterial"
                  id="hazardousMaterial"
                  checked={formData.hazardousMaterial}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="hazardousMaterial" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Material Classified as Hazardous Waste (Requires Form 10 Manifest)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  MSDS / Certificate Document URL
                </label>
                <input
                  type="url"
                  name="msdsUrl"
                  value={formData.msdsUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/... or cloud PDF"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Sample Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/... or storage URL"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Publishing Material...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Publish Material Listing</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
