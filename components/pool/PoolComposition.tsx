'use client';

import React from 'react';
import { PieChart } from 'lucide-react';

interface PoolCompositionProps {
  token0: string;
  token1: string;
  token0Amount: number;
  token1Amount: number;
  token0Price: number;
  token1Price: number;
}

export default function PoolComposition({
  token0,
  token1,
  token0Amount,
  token1Amount,
  token0Price,
  token1Price,
}: PoolCompositionProps) {
  const token0Value = token0Amount * token0Price;
  const token1Value = token1Amount * token1Price;
  const totalValue = token0Value + token1Value;
  
  const token0Percentage = (token0Value / totalValue) * 100;
  const token1Percentage = (token1Value / totalValue) * 100;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Pool Composition</h3>
      </div>

      {/* Visual Composition Bar */}
      <div className="mb-6">
        <div className="h-12 bg-white/5 rounded-xl overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center"
            style={{ width: `${token0Percentage}%` }}
          >
            {token0Percentage > 15 && (
              <span className="text-white font-bold text-sm">{token0Percentage.toFixed(1)}%</span>
            )}
          </div>
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
            style={{ width: `${token1Percentage}%` }}
          >
            {token1Percentage > 15 && (
              <span className="text-white font-bold text-sm">{token1Percentage.toFixed(1)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Token Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
            <div>
              <div className="text-white font-bold">{token0}</div>
              <div className="text-gray-400 text-sm">{token0Percentage.toFixed(2)}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{token0Amount.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">${token0Value.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
            <div>
              <div className="text-white font-bold">{token1}</div>
              <div className="text-gray-400 text-sm">{token1Percentage.toFixed(2)}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{token1Amount.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">${token1Value.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Pool Value</span>
          <span className="text-white font-bold text-xl">${totalValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}