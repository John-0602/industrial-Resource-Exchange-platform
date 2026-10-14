import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { MapPin, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export const MaterialTable = ({
  resources = [],
  loading = false,
  showActions = true,
  onActionClick = null,
  actionLabel = 'View Details'
}) => {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Loading industrial material registry data...
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No industrial materials match the selected criteria.
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Material & Specification</th>
              <th className="py-3 px-4">Category & Type</th>
              <th className="py-3 px-4">Available / Total</th>
              <th className="py-3 px-4">Indicative Rate</th>
              <th className="py-3 px-4">Facility Origin</th>
              <th className="py-3 px-4">Compliance</th>
              <th className="py-3 px-4">Status</th>
              {showActions && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {resources.map((item) => {
              const id = item._id || item.id;
              const formattedPrice = item.pricePerUnit
                ? `${item.currency || 'INR'} ${item.pricePerUnit.toLocaleString()} / ${item.unit}`
                : 'Free / By Terms';

              return (
                <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <Link
                      to={`/resources/${id}`}
                      className="hover:text-teal-700 transition-colors flex items-center gap-1.5 font-semibold text-slate-900"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.supplierCompanyDisplayName || item.supplierCompanyName || 'Industrial Enterprise'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{item.category}</div>
                    <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                      {item.resourceType || 'By-product'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {(item.availableQuantity || 0).toLocaleString()} {item.unit}
                    </div>
                    {item.reservedQuantity > 0 && (
                      <div className="text-[10px] text-amber-700">
                        {item.reservedQuantity.toLocaleString()} {item.unit} reserved
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {formattedPrice}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {item.pickupLocation?.city
                          ? `${item.pickupLocation.city}, ${item.pickupLocation.state || ''}`
                          : item.pickupLocation?.address || 'Industrial Zone'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.compliance?.hazardousMaterial ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Hazardous
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Non-hazardous
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.availabilityStatus || 'available'} />
                  </td>
                  {showActions && (
                    <td className="py-3.5 px-4 text-right">
                      {onActionClick ? (
                        <button
                          type="button"
                          onClick={() => onActionClick(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                        >
                          {actionLabel}
                        </button>
                      ) : (
                        <Link
                          to={`/resources/${id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
