'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md' 
}: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-600/20 text-green-400 border-green-600/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    error: 'bg-red-600/20 text-red-400 border-red-600/30',
    info: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    default: 'bg-white/10 text-gray-300 border-white/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}