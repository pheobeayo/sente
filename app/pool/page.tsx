'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Droplets, DollarSign, Activity, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksPool } from '@/hooks/useStacksPool';
import stx from "@/public/stx.png";
import usdc from "@/public/usdc.png";

interface Pool {
  id: string;
  pair: string;
  token0: string;
  token1: string;
  token0Address: string;
  token1Address: string;
  token0Icon: any;
  token1Icon: any;
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  change24h: number;
  liquidity: string;
}

const pools: Pool[] = [
  {
    id: '1',
    pair: 'STX/USDC',
    token0: 'STX',
    token1: 'USDC',
    token0Address: 'STX',
    token1Address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-usdc',
    token0Icon: stx,
    token1Icon: usdc,
    tvl: 5200000,
    volume24h: 1800000,
    fees24h: 5400,
    apr: 24.5,
    change24h: 12.5,
    liquidity: 'High'
  },
  {
    id: '2',
    pair: 'STX/XUSD',
    token0: 'STX',
    token1: 'XUSD',
    token0Address: 'STX',
    token1Address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.xusd-token',
    token0Icon: stx,
    token1Icon: usdc,
    tvl: 3800000,
    volume24h: 1200000,
    fees24h: 3600,
    apr: 18.2,
    change24h: -3.2,
    liquidity: 'High'
  },
  {
    id: '3',
    pair: 'USDC/XUSD',
    token0: 'USDC',
    token1: 'XUSD',
    token0Address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-usdc',
    token1Address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.xusd-token',
    token0Icon: usdc,
    token1Icon: usdc,
    tvl: 2900000,
    volume24h: 890000,
    fees24h: 2670,
    apr: 15.8,
    change24h: 8.7,
    liquidity: 'Medium'
  },
];

interface UserLiquidityData {
  liquidity: number;
  value: number;
}

export default function PoolPage() {
  const { isConnected, stxAddress } = useStacksWallet();
  const { getUserLiquidity } = useStacksPool();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume24h' | 'apr'>('tvl');
  const [userPools, setUserPools] = useState<Record<string, UserLiquidityData>>({});
  const [loadingUserData, setLoadingUserData] = useState(false);

  const filteredPools = pools.filter(pool =>
    pool.pair.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b[sortBy] - a[sortBy]);

  const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0);
  const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24h, 0);
  const totalFees = pools.reduce((sum, pool) => sum + pool.fees24h, 0);

  // Load user's liquidity positions
  useEffect(() => {
    const loadUserLiquidity = async () => {
      if (!stxAddress || !isConnected) return;
      
      setLoadingUserData(true);
      try {
        const liquidityData: Record<string, UserLiquidityData> = {};
        
        for (const pool of pools) {
          try {
            const userLiq = await getUserLiquidity(pool.token0Address, pool.token1Address);
            if (userLiq && userLiq.liquidity > 0) {
              liquidityData[pool.id] = {
                liquidity: userLiq.liquidity,
                value: userLiq.value
              };
            }
          } catch (err) {
            console.error(`Error loading liquidity for ${pool.pair}:`, err);
          }
        }
        
        setUserPools(liquidityData);
      } catch (err) {
        console.error('Error loading user liquidity:', err);
      } finally {
        setLoadingUserData(false);
      }
    };

    if (isConnected && stxAddress) {
      loadUserLiquidity();
    }
  }, [isConnected, stxAddress, getUserLiquidity]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">Liquidity Pools</h1>
            <p className="text-xl text-gray-300">Provide liquidity and earn trading fees</p>
          </div>
          <Link
            href="/pool/add"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Liquidity
          </Link>
        </div>

        {/* User's Positions (if connected) */}
        {isConnected && (
          <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Your Positions</h2>
            {loadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : Object.keys(userPools).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(userPools).map(([poolId, data]) => {
                  const pool = pools.find(p => p.id === poolId);
                  if (!pool) return null;
                  return (
                    <div key={poolId} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
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
                          <div className="text-gray-400 text-sm">Liquidity: {data.liquidity.toFixed(6)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${data.value.toLocaleString()}</div>
                        <Link 
                          href={`/pool/${poolId}`}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Manage →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Droplets className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-gray-400">You don't have any liquidity positions yet.</p>
                <Link 
                  href="/pool/add"
                  className="inline-block mt-3 text-purple-400 hover:text-purple-300 font-medium"
                >
                  Add your first position →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Not Connected Message */}
        {!isConnected && (
          <div className="mb-8 bg-blue-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-300">Connect your wallet to view your liquidity positions and add liquidity to pools.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Value Locked</span>
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">${(totalTVL / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-green-400 mt-1">+8.2% this week</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">24h Volume</span>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">${(totalVolume / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-green-400 mt-1">+15.3% from yesterday</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">24h Fees</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${(totalFees / 1000).toFixed(1)}K</p>
            <p className="text-sm text-green-400 mt-1">+12.7% from yesterday</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('tvl')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                sortBy === 'tvl'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              TVL
            </button>
            <button
              onClick={() => setSortBy('volume24h')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                sortBy === 'volume24h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setSortBy('apr')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                sortBy === 'apr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              APR
            </button>
          </div>
        </div>

        {/* Pools Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Pool</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">TVL</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">24h Volume</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">24h Fees</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">APR</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">24h Change</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPools.map((pool) => (
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
                          <div className="text-gray-400 text-xs">{pool.liquidity} liquidity</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <div className="text-white font-medium">
                        ${(pool.tvl / 1000000).toFixed(2)}M
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <div className="text-white font-medium">
                        ${(pool.volume24h / 1000000).toFixed(2)}M
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <div className="text-green-400 font-medium">
                        ${(pool.fees24h / 1000).toFixed(1)}K
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <div className="text-blue-400 font-bold">
                        {pool.apr.toFixed(1)}%
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <div className={`flex items-center justify-end gap-1 ${
                        pool.change24h > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pool.change24h > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">{Math.abs(pool.change24h)}%</span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-6">
                      <Link
                        href={`/pool/${pool.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                      >
                        Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">Why Provide Liquidity?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Earn a share of trading fees from every swap</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Receive LP tokens representing your pool share</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Withdraw your liquidity anytime</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-700/20 to-slate-600/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">Understanding Risks</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <span>Impermanent loss can occur when token prices diverge</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <span>Smart contract risks exist despite audits</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <span>Always do your own research before providing liquidity</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}