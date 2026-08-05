import React from 'react';

const Badge = ({ children, status = 'default', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  const statusStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    pending_assignment: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_approval: 'bg-orange-50 text-orange-700 border-orange-200',
    approved: 'bg-green-50 text-green-800 border-green-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dispensed: 'bg-teal-50 text-teal-800 border-teal-200',
    rejected: 'bg-red-50 text-red-800 border-red-200',
    in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
    requested: 'bg-purple-50 text-purple-800 border-purple-200'
  };

  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : 'default';
  const styleClass = statusStyles[normalizedStatus] || statusStyles.default;

  return (
    <span className={`${baseStyle} ${styleClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
