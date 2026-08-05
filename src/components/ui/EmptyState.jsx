import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No data available', description = '', icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-md bg-white">
      <Icon className="h-10 w-10 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>}
    </div>
  );
};

export default EmptyState;
