import React from 'react';

const statusConfig = {
  // Material Inventory Availability
  available: {
    label: 'Fully Available',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  partially_reserved: {
    label: 'Partially Reserved',
    classes: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  reserved: {
    label: 'Fully Reserved',
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  transferred: {
    label: 'Transferred / Closed',
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  withdrawn: {
    label: 'Withdrawn',
    classes: 'bg-slate-100 text-slate-600 border-slate-200'
  },

  // Exchange & Transfer Lifecycle
  Pending: {
    label: 'Proposal Pending',
    classes: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  'Under Negotiation': {
    label: 'Under Negotiation',
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  Accepted: {
    label: 'Accepted (Stock Reserved)',
    classes: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  'In Transfer': {
    label: 'In Transit / Transfer',
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  Completed: {
    label: 'Transfer Completed',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  Rejected: {
    label: 'Proposal Declined',
    classes: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  Cancelled: {
    label: 'Cancelled',
    classes: 'bg-slate-100 text-slate-600 border-slate-200'
  }
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {config.label}
    </span>
  );
};
