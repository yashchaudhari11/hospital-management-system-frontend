import React from 'react';

const Select = ({ label, id, error, children, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 shadow-sm disabled:bg-slate-50"
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
    </div>
  );
};

export default Select;
