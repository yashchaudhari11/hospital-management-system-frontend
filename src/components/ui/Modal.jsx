import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footerActions, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}></div>
      
      <div className={`relative w-full mx-4 my-6 bg-white border border-slate-200 rounded-md shadow-lg outline-none z-10 ${sizes[size]}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>
        
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        
        {footerActions && (
          <div className="flex justify-end gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-md">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
