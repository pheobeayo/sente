'use client';

import React, { useState } from 'react';
import { X, Minus, AlertCircle } from 'lucide-react';

interface RemoveLiquidityProps {
  isOpen: boolean;
  onClose: () => void;
  token0: string;
  token1: string;
  pooledToken0: number;
  pooledToken1: number;
  shareOfPool: number;
}

export default function RemoveLiquidity({
  isOpen,
  onClose,
  token0,
  token1,
  pooledToken0,
  pooledToken1,
  shareOfPool,
}: RemoveLiquidityProps) {
  const [percentage, setPercentage] = useState(50);

  if (!isOpen) return null;

  const token0Receive = (pooledToken0 * percentage) / 100;
  const token1Receive = (pooledToken1 * percentage) / 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">Remove Liquidity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount Section */}
          <div>
            <label className="text-white font-medium mb-4 block">Amount to Remove</label>
            
            {/* Percentage Display */}
            <div className="bg-white/5 rounded-2xl p-8 text-center mb-4">
              <div className="text-6xl font-bold text-white mb-2">{percentage}%</div>
              <div className="text-gray-400">of your position</div>
            </div>

            {/* Percentage Slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[25, 50, 75, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => setPercentage(value)}
                  className={`py-2 rounded-lg font-medium transition-all ${
                    percentage === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Receive Summary */}
          <div className="space-y-3">
            <label className="text-white font-medium block">You Will Receive</label>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
                  <div>
                    <div className="text-white font-bold text-xl">{token0Receive.toFixed(6)}</div>
                    <div className="text-gray-400 text-sm">{token0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-2 bg-white/5 rounded-lg">
                <Minus className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                  <div>
                    <div className="text-white font-bold text-xl">{token1Receive.toFixed(6)}</div>
                    <div className="text-gray-400 text-sm">{token1}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Position Info */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Current Share of Pool</span>
              <span className="text-white font-medium">{shareOfPool.toFixed(4)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Share After Removal</span>
              <span className="text-white font-medium">
                {((shareOfPool * (100 - percentage)) / 100).toFixed(4)}%
              </span>
            </div>
          </div>

          {/* Warning */}
          {percentage === 100 && (
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-medium mb-1">
                  Removing All Liquidity
                </p>
                <p className="text-yellow-400/80 text-sm">
                  You are removing 100% of your position. This will close your position entirely.
                </p>
              </div>
            </div>
          )}

          {/* Remove Button */}
          <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all">
            Remove Liquidity
          </button>
        </div>
      </div>
    </div>
  );
}