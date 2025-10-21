'use client';

import React from 'react';
import { Info, RefreshCw } from 'lucide-react';

interface SwapDetailsProps {
  fromToken: string;
  toToken: string;
  rate: number;
  priceImpact: string;
  fee: string;
  minimumReceived: string;
  slippage: number;
}

export default function SwapDetails({
  fromToken,
  toToken,
  rate,
  priceImpact,
  fee,
  minimumReceived,
  slippage,
}: SwapDetailsProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Rate</span>
        <div className="flex items-center gap-2">
          <span className="text-white">
            1 {fromToken} = {rate.toFixed(6)} {toToken}
          </span>
          <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-400">
          <span>Price Impact</span>
          <Info className="w-4 h-4" />
        </div>
        <span className={`font-medium ${parseFloat(priceImpact) > 3 ? 'text-red-400' : 'text-green-400'}`}>
          {priceImpact}%
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Trading Fee (0.3%)</span>
        <span className="text-white">{fee} {fromToken}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-400">
          <span>Minimum Received</span>
          <Info className="w-4 h-4" />
        </div>
        <span className="text-white">{minimumReceived} {toToken}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Slippage Tolerance</span>
        <span className="text-white">{slippage}%</span>
      </div>
    </div>
  );
}