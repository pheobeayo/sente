'use client';

import React, { useState, useEffect } from 'react';
import { Search, Droplets, DollarSign, Activity, Plus, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { usePoolDetection } from '@/hooks/usePoolDetection';
import toast from 'react-hot-toast';
import stx from "@/public/stx.png";
import usdc from "@/public/usdc.png";
import eth from "@/public/eth.png";
import { StaticImageData } from 'next/image';

interface Pool {
  id: string;
  pair: string;
  token0: string;
  token1: string;
  token0Address: string;
  token1Address: string;
  token0Icon: StaticImageData;
  token1Icon: StaticImageData;
}

// Define your token pairs
const POOL_PAIRS: Pool[] = [
  {
    id: '1',
    pair: 'STX/USDT',
    token0: 'STX',
    token1: 'USDT',
    token0Address: 'STX',
    token1Address: 'ST2QXSK64YQX3CQPC530K79XWQ98XFAM9W3XKEH3N.token-usdt',
    token0Icon: stx,
    token1Icon: usdc,
  },
  {
    id: '2',
    pair: 'STX/ETH',
    token0: 'STX',
    token1: 'ETH',
    token0Address: 'STX',
    token1Address: 'ST1KNS2PT486RDG4FDPPCD87M1NK3XWTXA6WGQN98.wrapped-eth',
    token0Icon: stx,
    token1Icon: eth,
  },
];

export default function PoolPage() {
  const { isConnected, stxAddress } = useStacksWallet();
  const { pools, userPositions, isLoading, refreshPools } = usePoolDetection();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load pool data when wallet connects
  useEffect(() => {
    if (isConnected && stxAddress) {
      console.log('Wallet connected, loading pool data...');
      const tokenPairs = POOL_PAIRS.map(p => ({
        token0: p.token0Address,
        token1: p.token1Address,
      }));
      refreshPools(tokenPairs);
    }
  }, [isConnected, stxAddress, refreshPools]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected || !stxAddress) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing pools...');
      const tokenPairs = POOL_PAIRS.map(p => ({
        token0: p.token0Address,
        token1: p.token1Address,
      }));
      refreshPools(tokenPairs);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, stxAddress, refreshPools]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading('Refreshing pools...');
    
    const tokenPairs = POOL_PAIRS.map(p => ({
      token0: p.token0Address,
      token1: p.token1Address,
    }));
    
    await refreshPools(tokenPairs);
    
    toast.dismiss();
    toast.success('Pools refreshed!');
    setIsRefreshing(false);
  };

  // Filter pools based on search
  const filteredPools = POOL_PAIRS.filter(pool =>
    pool.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const activePools = Object.values(pools).filter(p => p.hasLiquidity).length;
  const totalTVL = Object.values(pools).reduce((sum, pool) => {
    if (!pool.hasLiquidity) return sum;
    return sum + ((pool.reserve0 / 1000000) * 0.85 * 2); // Rough estimate
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">Liquidity Pools</h1>
            <p className="text-xl text-gray-300">Provide liquidity and earn trading fees</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/pool/add"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Liquidity
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <span className="text-gray-400">Total TVL</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {isLoading ? '...' : `$${totalTVL.toFixed(2)}`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="text-gray-400">Active Pools</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {isLoading ? '...' : activePools}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-6 h-6 text-purple-400" />
              <span className="text-gray-400">Your Positions</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {isLoading ? '...' : userPositions.length}
            </div>
          </div>
        </div>

        {/* User Positions */}
        {isConnected && userPositions.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Your Positions</h2>
            <div className="space-y-3">
              {userPositions.map((position) => {
                const pool = POOL_PAIRS.find(
                  p => p.token0Address === position.token0 && p.token1Address === position.token1
                );
                if (!pool) return null;

                return (
                  <div key={position.poolId} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 relative">
                          <Image 
                            src={pool.token0Icon} 
                            alt={pool.token0} 
                            width={32} 
                            height={32} 
                            className="rounded-full border-2 border-slate-900"
                            priority
                          />
                        </div>
                        <div className="w-8 h-8 relative">
                          <Image 
                            src={pool.token1Icon} 
                            alt={pool.token1} 
                            width={32} 
                            height={32} 
                            className="rounded-full border-2 border-slate-900"
                            priority
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-white font-bold">{pool.pair}</div>
                        <div className="text-gray-400 text-sm">
                          {(position.shares / 1000000).toFixed(4)} LP Tokens
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${position.value.toFixed(2)}</div>
                      <Link
                        href={`/pool/${pool.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pools Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Pool</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">Status</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">Reserves</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">TVL</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && filteredPools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400">Loading pools...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPools.map((pool) => {
                    const poolId = `${pool.token0Address}-${pool.token1Address}`;
                    const poolData = pools[poolId];

                    return (
                      <tr
                        key={pool.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 relative">
                                <Image 
                                  src={pool.token0Icon} 
                                  alt={pool.token0} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full border-2 border-slate-900"
                                  priority
                                />
                              </div>
                              <div className="w-8 h-8 relative">
                                <Image 
                                  src={pool.token1Icon} 
                                  alt={pool.token1} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full border-2 border-slate-900"
                                  priority
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-white font-bold">{pool.pair}</div>
                              <div className="text-gray-400 text-xs">
                                {pool.token0Address.substring(0, 10)}... / {pool.token1Address.substring(0, 10)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-6">
                          {isLoading ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : !poolData?.exists ? (
                            <span className="text-red-400 font-medium">● Not Created</span>
                          ) : !poolData.hasLiquidity ? (
                            <span className="text-yellow-400 font-medium">● No Liquidity</span>
                          ) : (
                            <span className="text-green-400 font-medium">● Active</span>
                          )}
                        </td>
                        <td className="text-right py-4 px-6">
                          {poolData?.hasLiquidity ? (
                            <div className="text-white font-medium">
                              <div>{(poolData.reserve0 / 1000000).toFixed(2)} {pool.token0}</div>
                              <div className="text-gray-400 text-sm">
                                {(poolData.reserve1 / 1000000).toFixed(2)} {pool.token1}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-right py-4 px-6">
                          {poolData?.hasLiquidity ? (
                            <span className="text-white font-medium">
                              ${((poolData.reserve0 / 1000000) * 0.85 * 2).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">$0.00</span>
                          )}
                        </td>
                        <td className="text-right py-4 px-6">
                          {!poolData?.exists ? (
                            <Link
                              href={`/pool/${pool.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Create Pool
                            </Link>
                          ) : (
                            <Link
                              href={`/pool/${pool.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                            >
                              {!poolData.hasLiquidity ? 'Add Liquidity' : 'Manage'}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Banner */}
        {!isConnected && (
          <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                  Connect Wallet to Get Started
                </h3>
                <p className="text-gray-300">
                  Connect your wallet to view pool details, create pools, add liquidity, and start earning fees.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Info */}
        {isConnected && (
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              💡 Pool data auto-refreshes every 30 seconds. Click the refresh button to update manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}