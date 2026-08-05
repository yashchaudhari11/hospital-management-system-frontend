import React from 'react';

const Button = ({ children, type = 'button', variant = 'primary', onClick, disabled, className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600 border border-transparent',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-teal-600 border border-slate-300 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
    outline: 'border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 focus:ring-teal-600',
    link: 'bg-transparent text-teal-700 hover:text-teal-900 border-none p-0 shadow-none hover:underline focus:ring-0 focus:ring-offset-0'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
