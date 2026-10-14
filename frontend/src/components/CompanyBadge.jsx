import React from 'react';
import { ShieldCheck, Clock, AlertOctagon } from 'lucide-react';

export const CompanyBadge = ({ status = 'Pending', showLabel = true }) => {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {showLabel && <span>Verified Enterprise</span>}
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        {showLabel && <span>Verification Rejected</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      {showLabel && <span>Verification Pending</span>}
    </span>
  );
};
