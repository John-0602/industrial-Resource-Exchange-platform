import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { MapPin, BookOpen, Clock, RefreshCw, Gift, Sparkles, User } from 'lucide-react';

const listingTypeBadges = {
  Lend: {
    label: 'Lend',
    icon: Clock,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  Exchange: {
    label: 'Exchange',
    icon: RefreshCw,
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  Donate: {
    label: 'Donate',
    icon: Sparkles,
    classes: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  'Give Away': {
    label: 'Give Away',
    icon: Gift,
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  }
};

export const ResourceCard = ({ resource }) => {
  const badge = listingTypeBadges[resource.listingType] || {
    label: resource.listingType,
    icon: BookOpen,
    classes: 'bg-slate-50 text-slate-700 border-slate-200'
  };
  const TypeIcon = badge.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
            <BookOpen className="w-10 h-10 mb-1 opacity-40" />
            <span className="text-xs font-medium">{resource.category}</span>
          </div>
        )}

        {/* Listing Type Top Left */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border backdrop-blur-sm bg-white/90 shadow-sm ${badge.classes}`}>
            <TypeIcon className="w-3 h-3" />
            {badge.label}
          </span>
        </div>

        {/* Condition Top Right */}
        <div className="absolute top-2.5 right-2.5">
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/90 text-slate-700 border border-slate-200 backdrop-blur-sm shadow-sm">
            {resource.condition}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-teal-700 uppercase tracking-wide">
              {resource.category}
            </span>
            <StatusBadge status={resource.availabilityStatus} />
          </div>

          <Link to={`/resources/${resource._id || resource.id}`} className="block">
            <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 text-base">
              {resource.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Details & Location */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center text-xs text-slate-500 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{resource.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate max-w-[65%]">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{resource.owner?.name || 'Student'}</span>
            </div>
            {resource.lendingDuration && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {resource.lendingDuration}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Action */}
        <div className="mt-3 pt-2">
          <Link
            to={`/resources/${resource._id || resource.id}`}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            View Details & Request
          </Link>
        </div>
      </div>
    </div>
  );
};
