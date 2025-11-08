import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center';

  const variants = {
    primary: 'bg-amber-900 text-white hover:bg-amber-800 focus:ring-amber-500 shadow-sm hover:shadow-md active:shadow-sm',
    secondary: 'bg-stone-200 text-stone-900 hover:bg-stone-300 focus:ring-stone-400 shadow-sm hover:shadow-md active:shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md active:shadow-sm',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 focus:ring-stone-300 active:bg-stone-200',
    outline: 'bg-white border-2 border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-400 focus:ring-stone-400 shadow-sm hover:shadow-md active:shadow-sm',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-sm min-h-[44px]',
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-3.5 text-lg min-h-[52px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
