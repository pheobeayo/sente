'use client';

import React, { useState } from 'react';
import { X, Plus, Info } from 'lucide-react';

interface AddLiquidityProps {
  isOpen: boolean;
  onClose: () => void;
  token0: string;
  token1: string;
}

export default function AddLiquidity({ isOpen, onClose, token0, token1 }: AddLiquidityProps) {
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  if (!isOpen) return null;

  const handleAmount0Change = (value: string) => {
    setAmount0(value);
    if (value && !isNaN(parseFloat(value))) {
      setAmount1((parseFloat(value) * 1.5).toFixed(6));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">Add Liquidity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Pool Info */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full -ml-2" />
              </div>
              <span className="text-white font-bold text-lg">{token0}/{token1}</span>
            </div>
            <p className="text-gray-400 text-sm">0.3% Fee Tier • Concentrated Liquidity</p>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-white font-medium mb-3 block">Set Price Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Min Price</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Max Price</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button className="w-full mt-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all">
              Full Range
            </button>
          </div>

          {/* Token Amounts */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-medium">Amount</label>
                <span className="text-gray-400 text-sm">Balance: 2.5 {token0}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={amount0}
                    onChange={(e) => handleAmount0Change(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-white text-2xl font-bold focus:outline-none flex-1"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
                    <span className="text-white font-bold">{token0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-2 bg-white/5 rounded-lg">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-medium">Amount</label>
                <span className="text-gray-400 text-sm">Balance: 5000 {token1}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={amount1}
                    onChange={(e) => setAmount1(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-white text-2xl font-bold focus:outline-none flex-1"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                    <span className="text-white font-bold">{token1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {amount0 && amount1 && (
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Share of Pool</span>
                <span className="text-white font-medium">0.045%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Current Price</span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-white font-medium">1 {token0} = 1.5 {token1}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Estimated APR</span>
                <span className="text-green-400 font-bold">24.5%</span>
              </div>
            </div>
          )}

          {/* Add Button */}
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all">
            {amount0 && amount1 ? 'Add Liquidity' : 'Enter Amounts'}
          </button>
        </div>
      </div>
    </div>
  );
}