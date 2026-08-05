import React from 'react';

const LoadingSpinner = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };
  return (
    <div className="flex items-center justify-center py-6">
      <div className={`animate-spin rounded-full border-t-teal-700 border-slate-200 ${sizes[size]} ${className}`}></div>
    </div>
  );
};

export default LoadingSpinner;
