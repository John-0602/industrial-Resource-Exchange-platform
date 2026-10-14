import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { MapPin, Building2, ShieldCheck, AlertCircle, Scale, Tag } from 'lucide-react';

const resourceTypeBadges = {
  'By-product': {
    classes: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  'Scrap': {
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  'Surplus': {
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  'Reusable Material': {
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  'Recyclable Material': {
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
};

export const ResourceCard = ({ resource }) => {
  const typeConfig = resourceTypeBadges[resource.resourceType] || {
    classes: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const id = resource._id || resource.id;
  const locationStr = resource.pickupLocation?.city
    ? `${resource.pickupLocation.city}, ${resource.pickupLocation.state || ''}`
    : resource.pickupLocation?.address || 'Industrial Facility';

  const priceStr = resource.pricePerUnit
    ? `${resource.currency || 'INR'} ${resource.pricePerUnit.toLocaleString()} / ${resource.unit}`
    : 'Free / By Terms';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Thumbnail or Category Banner */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden border-b border-slate-100">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300 p-4 text-center">
            <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold mb-1">
              Industrial By-Product
            </span>
            <span className="text-sm font-bold text-white line-clamp-2">{resource.category}</span>
          </div>
        )}

        {/* Resource Type Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-sm bg-white/95 shadow-xs ${typeConfig.classes}`}>
            <Tag className="w-3 h-3" />
            {resource.resourceType || 'By-product'}
          </span>
        </div>

        {/* Condition */}
        <div className="absolute top-2.5 right-2.5">
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-sm border border-slate-700">
            {resource.materialCondition || 'Industrial Grade'}
          </span>
        </div>

        {/* Quantity Overlay Ribbon */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded">
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-teal-300" />
            <strong className="font-semibold">{(resource.availableQuantity || 0).toLocaleString()} {resource.unit}</strong> available
          </span>
          <span className="font-medium text-emerald-300">{priceStr}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">
              {resource.category}
            </span>
            <StatusBadge status={resource.availabilityStatus || 'available'} />
          </div>

          <Link to={`/resources/${id}`} className="block">
            <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 text-base">
              {resource.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Supplier & Location Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-800">
                {resource.supplierCompanyDisplayName || 'Industrial Supplier'}
              </span>
            </div>
            {resource.compliance?.hazardousMaterial ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <AlertCircle className="w-3 h-3" /> Haz
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Safe
              </span>
            )}
          </div>

          <div className="flex items-center text-xs text-slate-500 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{locationStr}</span>
          </div>
        </div>

        {/* Card Footer Action */}
        <div className="mt-3 pt-2">
          <Link
            to={`/resources/${id}`}
            className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
          >
            Review Specifications & Request
          </Link>
        </div>
      </div>
    </div>
  );
};
