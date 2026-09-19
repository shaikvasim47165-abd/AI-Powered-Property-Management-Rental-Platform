import React from 'react';

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="aspect-[16/10] bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-slate-200 rounded w-16" />
          <div className="h-5 bg-slate-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};
