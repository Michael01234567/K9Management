import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  const hasCustomBg = className.includes('bg-');
  const hasCustomBorder = className.includes('border-');

  return (
    <div
      className={`rounded-lg shadow-md transition-all duration-200 ${!hasCustomBg ? 'bg-white' : ''} ${!hasCustomBorder ? 'border border-stone-200' : ''} ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
