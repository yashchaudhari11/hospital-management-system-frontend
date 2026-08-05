import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-md">
      <table className={`min-w-full divide-y divide-slate-200 text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const THead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-slate-50 text-slate-700 font-medium ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-200 bg-white ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TR = ({ children, className = '', ...props }) => {
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TH = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TD = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-4 py-3 text-slate-700 ${className}`} {...props}>
      {children}
    </td>
  );
};
