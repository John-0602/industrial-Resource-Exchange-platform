import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No resources found',
  description = 'Try adjusting your filters, search term, or check back later.',
  actionLabel,
  actionTo,
  onAction
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {(actionLabel && (actionTo || onAction)) && (
        <div className="mt-5">
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center justify-center px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-950 transition-colors shadow-sm"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-950 transition-colors shadow-sm"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
