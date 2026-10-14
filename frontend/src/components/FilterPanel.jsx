import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const categories = [
  'All',
  'Textbooks',
  'Notes & Study Materials',
  'Lab Equipment',
  'Stationery',
  'Calculators & Tools',
  'Electronics & Hardware',
  'Other'
];

export const listingTypes = ['All', 'Lend', 'Exchange', 'Donate', 'Give Away'];
export const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];
export const availabilities = [
  { value: 'All', label: 'All Statuses' },
  { value: 'available', label: 'Available Only' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'exchanged', label: 'Completed' }
];

export const FilterPanel = ({ filters, setFilters, onReset }) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filters & Categories</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-700 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Listing Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {listingTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('listingType', type)}
              className={`px-2 py-1.5 rounded text-xs font-medium text-left transition-colors ${
                filters.listingType === type
                  ? 'bg-navy-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Availability
        </label>
        <select
          value={filters.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          {availabilities.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Condition
        </label>
        <select
          value={filters.condition}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          {conditions.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Sort Order
        </label>
        <select
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          <option value="newest">Recently Listed</option>
          <option value="oldest">Oldest First</option>
          <option value="title_asc">Title (A - Z)</option>
        </select>
      </div>
    </div>
  );
};
