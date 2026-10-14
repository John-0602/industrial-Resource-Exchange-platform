import React, { useEffect, useState, useCallback } from 'react';
import { resourceApi } from '../api/client';
import { ResourceCard } from '../components/ResourceCard';
import { MaterialTable } from '../components/MaterialTable';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { SlidersHorizontal, ChevronLeft, ChevronRight, LayoutGrid, ListFilter } from 'lucide-react';

const initialFilters = {
  category: 'All',
  resourceType: 'All',
  availability: 'All',
  condition: 'All',
  location: '',
  sort: 'newest',
  page: 1,
  limit: 12
};

export const MarketplacePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/api/resources';
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        endpoint = '/api/resources/search';
        params.append('q', searchQuery.trim());
      } else {
        params.append('page', filters.page);
        params.append('limit', filters.limit);
        params.append('sort', filters.sort);
      }

      if (filters.category !== 'All') params.append('category', filters.category);
      if (filters.resourceType !== 'All') params.append('resourceType', filters.resourceType);
      if (filters.availability !== 'All') params.append('availability', filters.availability);
      if (filters.condition !== 'All') params.append('condition', filters.condition);
      if (filters.location?.trim()) params.append('location', filters.location.trim());

      const queryString = params.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;

      const res = await resourceApi.get(url);

      if (res.data.success) {
        setResources(res.data.data || []);
        if (res.data.totalPages !== undefined) {
          setPagination({
            page: res.data.page || 1,
            totalPages: res.data.totalPages || 1,
            total: res.data.total || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to load industrial marketplace catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Industrial Material & By-Product Marketplace
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Discover verified industrial surplus, manufacturing scraps, and recyclable feedstocks
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setFilters((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search by material, grade, chemical spec..."
            />
            
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-navy-900' : 'text-slate-400 hover:text-slate-700'}`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-xs text-navy-900' : 'text-slate-400 hover:text-slate-700'}`}
                title="Registry Table"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Collapsible */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 mb-4">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Catalog Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <span className="font-semibold text-slate-900">{resources.length}</span> {resources.length === 1 ? 'material' : 'materials'}
              {pagination.total > 0 && ` of ${pagination.total}`}
            </span>
            {(filters.category !== 'All' || filters.resourceType !== 'All' || filters.condition !== 'All' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-teal-700 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <CardGridSkeleton count={6} />
          ) : resources.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {resources.map((resource) => (
                  <ResourceCard key={resource._id || resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <MaterialTable resources={resources} />
            )
          ) : (
            <EmptyState
              title="No industrial materials match your search"
              description="We could not find any active listings matching your category, grade, or location parameters. Try broadening your criteria or reset filters."
              actionLabel="Reset Industrial Filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && !searchQuery && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
