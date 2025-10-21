'use client';

import React from 'react';
import { Droplet, TrendingUp, Wallet } from 'lucide-react';

interface EmptyStateProps {
  type?: 'pools' | 'transactions' | 'wallet';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = 'pools',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'pools':
        return <Droplet className="w-16 h-16 text-gray-600" />;
      case 'transactions':
        return <TrendingUp className="w-16 h-16 text-gray-600" />;
      case 'wallet':
        return <Wallet className="w-16 h-16 text-gray-600" />;
      default:
        return <Droplet className="w-16 h-16 text-gray-600" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'pools':
        return 'No Liquidity Positions';
      case 'transactions':
        return 'No Transactions Yet';
      case 'wallet':
        return 'Wallet Not Connected';
      default:
        return 'No Data Available';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'pools':
        return 'Add liquidity to a pool to start earning fees from trades';
      case 'transactions':
        return 'Your transaction history will appear here once you start trading';
      case 'wallet':
        return 'Connect your wallet to view your positions and start trading';
      default:
        return 'There is currently no data to display';
    }
  };

  const getDefaultActionLabel = () => {
    switch (type) {
      case 'pools':
        return 'Add Liquidity';
      case 'transactions':
        return 'Make Your First Trade';
      case 'wallet':
        return 'Connect Wallet';
      default:
        return 'Get Started';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-6 p-6 bg-white/5 rounded-full">
        {getIcon()}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        {title || getDefaultTitle()}
      </h3>
      <p className="text-gray-400 max-w-md mb-8">
        {description || getDefaultDescription()}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
        >
          {actionLabel || getDefaultActionLabel()}
        </button>
      )}
    </div>
  );
}