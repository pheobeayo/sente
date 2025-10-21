'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus, TrendingUp, TrendingDown, Droplet } from 'lucide-react';

interface Pool {
  poolId: string;
  token0: string;
  token1: string;
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  change24h: number;
}

const mockPools: Pool[] = [
  {
    poolId: '1',
    token0: 'ETH',
    token1: 'USDC',
    tvl: 16500000,
    volume24h: 5200000,
    fees24h: 15600,
    apr: 24.5,
    change24h: 8.2,
  },
  {
    poolId: '2',
    token0: 'WBTC',
    token1: 'ETH',
    tvl: 8200000,
    volume24h: 2800000,
    fees24h: 8400,
    apr: 18.3,
    change24h: -3.5,
  },
  {
    poolId: '3',
    token0: 'DAI',
    token1: 'USDC',
    tvl: 12000000,
    volume24h: 3500000,
    fees24h: 10500,
    apr: 12.7,
    change24h: 5.1,
  },
  {
    poolId: '4',
    token0: 'ETH',
    token1: 'DAI',
    tvl: 6500000,
    volume24h: 1800000,
    fees24h: 5400,
    apr: 15.9,
    change24h: 12.3,
  },
  {
    poolId: '5',
    token0: 'USDT',
    token1: 'USDC',
    tvl: 9800000,
    volume24h: 4100000,
    fees24h: 12300,
    apr: 8.4,
    change24h: 2.1,
  },
  {
    poolId: '6',
    token0: 'LINK',
    token1: 'ETH',
    tvl: 4200000,
    volume24h: 980000,
    fees24h: 2940,
    apr: 21.6,
    change24h: -1.8,
  },
];

function PoolCard({ pool }: { pool: Pool }) {
  const isPositive = pool.change24h >= 0;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full -ml-3" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{pool.token0}/{pool.token1}</h3>
            <p className="text-gray-400 text-sm">0.3% Fee Tier</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 rounded-lg">
          <Droplet className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">TVL</p>
          <p className="text-white font-bold text-xl">
            ${(pool.tvl / 1000000).toFixed(2)}M
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">24h Volume</p>
          <p className="text-white font-bold text-xl">
            ${(pool.volume24h / 1000000).toFixed(2)}M
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">24h Fees</p>
          <p className="text-white font-bold">
            ${(pool.fees24h / 1000).toFixed(1)}K
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">APR</p>
          <div className="flex items-center gap-2">
            <p className="text-green-400 font-bold">{pool.apr.toFixed(2)}%</p>
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(pool.change24h).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
          View Details →
        </p>
      </div>
    </div>
  );
}

export default function PoolPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apr'>('tvl');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPools = mockPools
    .filter(pool =>
      pool.token0.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.token1.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'tvl') return b.tvl - a.tvl;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      if (sortBy === 'apr') return b.apr - a.apr;
      return 0;
    });

  const totalStats = {
    tvl: mockPools.reduce((sum, pool) => sum + pool.tvl, 0),
    volume24h: mockPools.reduce((sum, pool) => sum + pool.volume24h, 0),
    fees24h: mockPools.reduce((sum, pool) => sum + pool.fees24h, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Liquidity Pools</h1>
          <p className="text-gray-300 text-lg">
            Provide liquidity and earn fees from every trade
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Droplet className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Value Locked</span>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(totalStats.tvl / 1000000).toFixed(2)}M
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">24h Volume</span>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(totalStats.volume24h / 1000000).toFixed(2)}M
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-400 text-sm">24h Fees</span>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(totalStats.fees24h / 1000).toFixed(1)}K
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pools by token..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="tvl">Sort by TVL</option>
              <option value="volume">Sort by Volume</option>
              <option value="apr">Sort by APR</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            </button>

            {/* Add Liquidity Button */}
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap">
              <Plus className="w-5 h-5" />
              New Position
            </button>
          </div>

          {/* Advanced Filters (Optional) */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-white font-medium mb-4">Filter Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm">
                  All Pools
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm">
                  Stablecoin Pools
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm">
                  High APR
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm">
                  My Positions
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pool List */}
        {filteredPools.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
            <Droplet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Pools Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Showing {filteredPools.length} of {mockPools.length} pools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPools.map((pool) => (
                <PoolCard key={pool.poolId} pool={pool} />
              ))}
            </div>
          </>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-600/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/30 rounded-xl">
              <Droplet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-2">
                New to Liquidity Providing?
              </h3>
              <p className="text-gray-300 mb-4">
                Learn how to earn passive income by providing liquidity to trading pools. 
                Earn a share of trading fees proportional to your stake in the pool.
              </p>
              <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}