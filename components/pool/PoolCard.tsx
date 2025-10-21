'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Droplet } from 'lucide-react';

interface PoolCardProps {
  poolId: string;
  token0: string;
  token1: string;
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  change24h: number;
}

export default function PoolCard({
  poolId,
  token0,
  token1,
  tvl,
  volume24h,
  fees24h,
  apr,
  change24h,
}: PoolCardProps) {
  const isPositive = change24h >= 0;

  return (
    <Link href={`/pool/${poolId}`}>
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full -ml-3" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{token0}/{token1}</h3>
              <p className="text-gray-400 text-sm">0.3% Fee Tier</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 rounded-lg">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Active</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">TVL</p>
            <p className="text-white font-bold text-xl">
              ${(tvl / 1000000).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">24h Volume</p>
            <p className="text-white font-bold text-xl">
              ${(volume24h / 1000000).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">24h Fees</p>
            <p className="text-white font-bold">
              ${(fees24h / 1000).toFixed(1)}K
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">APR</p>
            <div className="flex items-center gap-2">
              <p className="text-green-400 font-bold">{apr.toFixed(2)}%</p>
              <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change24h).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Hint */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
            View Details →
          </p>
        </div>
      </div>
    </Link>
  );
}