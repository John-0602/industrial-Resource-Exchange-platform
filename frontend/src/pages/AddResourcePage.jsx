import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Image, AlertCircle, Sparkles } from 'lucide-react';

const sampleImages = [
  { label: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Arduino / IoT', url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Study Notes', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Stationery', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80' },
];

export const AddResourcePage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Textbooks',
    listingType: 'Lend',
    condition: 'Good',
    imageUrl: sampleImages[0].url,
    lendingDuration: '14 days',
    exchangePreference: '',
    location: 'Central Campus Library, Floor 2'
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await resourceApi.post('/api/resources', formData);
      if (res.data.success) {
        success('Resource listed successfully on the campus marketplace!');
        navigate(`/resources/${res.data.data._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to list resource';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
            <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>New Marketplace Item</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">List an Academic Resource</h1>
          <p className="text-xs text-slate-500 mt-1">
            Share textbooks, lab tools, drawing boards, or notes with other students on campus
          </p>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
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
              placeholder="e.g. Signals and Systems by Oppenheim (2nd Edition)"
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          {/* Category & Listing Type */}
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
                <option value="Lend">Lend (Borrow for duration)</option>
                <option value="Exchange">Exchange (Item for item trade)</option>
                <option value="Donate">Donate (Pass to junior students)</option>
                <option value="Give Away">Give Away (Free for anyone)</option>
              </select>
            </div>
          </div>

          {/* Condition & Pickup Location */}
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
                <option value="New">New (Unused / mint)</option>
                <option value="Like New">Like New (Minimal wear)</option>
                <option value="Good">Good (Minor highlights / clean)</option>
                <option value="Fair">Fair (Readable, visible wear)</option>
              </select>
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
                placeholder="e.g. Innovation Lab / CS Dept Lounge"
                className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>

          {/* Conditional: Lending Duration */}
          {formData.listingType === 'Lend' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Lending Duration
              </label>
              <input
                type="text"
                name="lendingDuration"
                value={formData.lendingDuration}
                onChange={handleChange}
                placeholder="e.g. 14 days, 3 weeks, until midterms"
                className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          )}

          {/* Conditional: Exchange Preference */}
          {formData.listingType === 'Exchange' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Exchange Preference
              </label>
              <input
                type="text"
                name="exchangePreference"
                value={formData.exchangePreference}
                onChange={handleChange}
                placeholder="e.g. Willing to trade for Database Management Systems textbook or FPGA kit"
                className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the edition, syllabus coverage, condition of pages/parts, or any included accessories..."
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none text-slate-800"
            />
          </div>

          {/* Image URL & Preset Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Photo URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/item.jpg"
                className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" />
                Quick presets:
              </span>
              {sampleImages.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                    formData.imageUrl === img.url
                      ? 'bg-teal-50 text-teal-700 border-teal-300 font-medium'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              disabled={loading}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish Resource'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
