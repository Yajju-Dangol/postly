import React from 'react';

export const BentoGrid = ({ children }) => {
  return (
    <div className="bento-grid max-w-[1400px] mx-auto animate-fade-in">
      {children}
    </div>
  );
};

export const BentoItem = ({ children, className = '', title, icon: Icon }) => {
  return (
    <div className={`bento-item ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold tracking-wider text-text-muted uppercase">{title}</h3>
          {Icon && <Icon size={18} className="text-text-muted" />}
        </div>
      )}
      {children}
    </div>
  );
};
