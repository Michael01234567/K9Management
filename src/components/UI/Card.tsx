import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer active:scale-[0.99]' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-stone-200 transition-all duration-150 ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
