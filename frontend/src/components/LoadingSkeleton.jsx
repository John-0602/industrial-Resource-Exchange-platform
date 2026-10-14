import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="h-44 bg-slate-200 w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded-full w-16" />
          </div>
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-6 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const CardGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 4 }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  );
};
