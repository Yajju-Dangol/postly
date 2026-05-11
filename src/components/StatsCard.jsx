import React from 'react';

export const StatsCard = ({ label, value, trend, icon: Icon }) => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-[#0a0a0a] rounded-xl border border-border">
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-success' : 'text-red-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-text-muted font-medium mb-1">{label}</p>
        <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
      </div>
    </div>
  );
};
