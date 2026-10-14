import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const industrialCategories = [
  'All',
  'Textile and fabric waste',
  'Metal scraps',
  'Plastic waste and reusable polymers',
  'Paper and cardboard',
  'Wood scraps and sawdust',
  'Agricultural by-products',
  'Construction and demolition materials',
  'Reusable industrial packaging',
  'Surplus raw materials',
  'Other recoverable industrial by-products'
];

export const resourceTypes = [
  'All',
  'By-product',
  'Scrap',
  'Surplus',
  'Reusable Material',
  'Recyclable Material'
];

export const materialConditions = [
  'All',
  'Virgin Surplus',
  'Production Scrap',
  'Reconditioned',
  'Recycled Aggregate',
  'Used/Secondary'
];

export const availabilities = [
  { value: 'All', label: 'All Inventory States' },
  { value: 'available', label: 'Fully Available' },
  { value: 'partially_reserved', label: 'Partially Reserved' },
  { value: 'reserved', label: 'Fully Reserved' }
];

export const FilterPanel = ({ filters, setFilters, onReset }) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Industrial Filters</span>
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

      {/* Industrial Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Material Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          {industrialCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Resource Classification
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {resourceTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('resourceType', type)}
              className={`px-2 py-1.5 rounded text-[11px] font-medium text-left transition-colors truncate ${
                filters.resourceType === type
                  ? 'bg-navy-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Material Condition */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Material Condition
        </label>
        <select
          value={filters.condition || 'All'}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          {materialConditions.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Inventory Availability
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

      {/* City or Location filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Hub / Location
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g. Coimbatore, Pune, Gujarat"
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        />
      </div>

      {/* Sort By */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Sort Order
        </label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        >
          <option value="newest">Recently Listed</option>
          <option value="oldest">Oldest First</option>
          <option value="quantity_desc">Highest Quantity Available</option>
          <option value="title_asc">Title (A - Z)</option>
        </select>
      </div>
    </div>
  );
};
