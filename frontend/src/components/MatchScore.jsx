import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const MatchScore = ({ score = 0, tier = 'Match', size = 'md' }) => {
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;

  const colorClasses = isHigh
    ? 'bg-teal-50 text-teal-800 border-teal-300 ring-teal-500/20'
    : isMedium
    ? 'bg-sky-50 text-sky-800 border-sky-300 ring-sky-500/20'
    : 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-400/20';

  const badgeSize = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border font-bold ${colorClasses} ${badgeSize} shadow-xs`}>
      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span>{score}% Compatibility</span>
      {tier && <span className="text-[10px] font-medium opacity-80 border-l pl-1.5 ml-0.5 border-current">({tier})</span>}
    </div>
  );
};
