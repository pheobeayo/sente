'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  bordered = true,
}: CardProps) {
  const baseClasses = 'bg-white/5 backdrop-blur-lg rounded-2xl';
  const hoverClasses = hoverable ? 'hover:bg-white/10 transition-all cursor-pointer' : '';
  const borderClasses = bordered ? 'border border-white/10' : '';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`${baseClasses} ${hoverClasses} ${borderClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}