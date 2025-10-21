'use client';

import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';

interface SwapButtonProps {
  isConnected: boolean;
  hasAmount: boolean;
  hasBalance: boolean;
  isLoading?: boolean;
  onConnect: () => void;
  onSwap: () => void;
}

export default function SwapButton({
  isConnected,
  hasAmount,
  hasBalance,
  isLoading = false,
  onConnect,
  onSwap,
}: SwapButtonProps) {
  const getButtonContent = () => {
    if (!isConnected) {
      return (
        <>
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </>
      );
    }

    if (!hasAmount) {
      return 'Enter Amount';
    }

    if (!hasBalance) {
      return (
        <>
          <AlertCircle className="w-5 h-5" />
          Insufficient Balance
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Swapping...
        </>
      );
    }

    return 'Swap';
  };

  const getButtonStyle = () => {
    if (!isConnected) {
      return 'bg-blue-600 hover:bg-blue-700';
    }

    if (!hasAmount || !hasBalance) {
      return 'bg-gray-600 cursor-not-allowed';
    }

    return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
  };

  const isDisabled = !isConnected ? false : !hasAmount || !hasBalance || isLoading;

  return (
    <button
      onClick={isConnected ? onSwap : onConnect}
      disabled={isDisabled && isConnected}
      className={`w-full ${getButtonStyle()} text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
    >
      {getButtonContent()}
    </button>
  );
}