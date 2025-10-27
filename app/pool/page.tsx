'use client';

import React, { useState, useEffect } from 'react';
import { Search, Droplets, DollarSign, Activity, Plus, ArrowRight, AlertCircle, Loader2, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksPool } from '@/hooks/useStacksPool';
import { stacksDexContract } from '@/lib/contract';
import toast from 'react-hot-toast';
import stx from "@/public/stx.png";
import usdc from "@/public/usdc.png";
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
    pair: 'STX/USDT',
    token0: 'STX',
    token1: 'USDT',
    token0Address: 'STX',
    token1Address: 'token-usdt',
    token0Icon: stx,
    token1Icon: usdc,
    tvl: 0,
    volume24h: 0,
    fees24h: 0,
    apr: 0,
    change24h: 0,
    liquidity: 'Unknown'
  },
  {
    id: '2',
    pair: 'STX/ETH',
    token0: 'STX',
    token1: 'ETH',
    token0Address: 'STX',
    token1Address: 'ETH',
    token0Icon: stx,
    token1Icon: usdc,
    tvl: 0,
    volume24h: 0,
    fees24h: 0,
    apr: 0,
    change24h: 0,
    liquidity: 'Unknown'
  },
];

interface UserLiquidityData {
  liquidity: number;
  value: number;
}

interface PoolStatus {
  exists: boolean;
  hasLiquidity: boolean;
  reserve0: number;
  reserve1: number;
}

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
  onSuccess: () => void;
}

function CreatePoolModal({ isOpen, onClose, pool, onSuccess }: CreatePoolModalProps) {
  const { stxAddress, isConnected } = useStacksWallet();
  const [step, setStep] = useState<'create' | 'liquidity' | 'done'>('create');
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [amount0, setAmount0] = useState('1');
  const [amount1, setAmount1] = useState('1');

  const handleCreatePool = async () => {
    if (!isConnected || !stxAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsCreating(true);
    try {
      await stacksDexContract.createPool(
        pool.token0Address,
        pool.token1Address,
        stxAddress,
        (data) => {
          console.log('Pool created:', data);
          setIsCreating(false);
          setStep('liquidity');
          toast.success('Pool created! Now add initial liquidity.');
        },
        () => {
          setIsCreating(false);
          toast.error('Pool creation cancelled');
        }
      );
    } catch (error) {
      console.error('Error creating pool:', error);
      setIsCreating(false);
      toast.error(error instanceof Error ? error.message : 'Failed to create pool');
    }
  };

  const handleAddLiquidity = async () => {
    if (!isConnected || !stxAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    const amt0 = parseFloat(amount0);
    const amt1 = parseFloat(amount1);

    if (isNaN(amt0) || isNaN(amt1) || amt0 <= 0 || amt1 <= 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    setIsAddingLiquidity(true);
    try {
      await stacksDexContract.addLiquidity(
        pool.token0Address,
        pool.token1Address,
        Math.floor(amt0 * 1000000),
        Math.floor(amt1 * 1000000),
        0,
        stxAddress,
        (data) => {
          console.log('Liquidity added:', data);
          setIsAddingLiquidity(false);
          setStep('done');
          toast.success('Liquidity added successfully!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        },
        () => {
          setIsAddingLiquidity(false);
          toast.error('Liquidity addition cancelled');
        }
      );
    } catch (error) {
      console.error('Error adding liquidity:', error);
      setIsAddingLiquidity(false);
      toast.error(error instanceof Error ? error.message : 'Failed to add liquidity');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">Create Pool</h3>
            <p className="text-gray-400 text-sm mt-1">{pool.pair}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'create' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  🏊 This pool doesn&apos;t exist yet. Create it to enable trading for this pair.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Token Pair</span>
                  <span className="text-white font-medium">{pool.pair}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Fee Tier</span>
                  <span className="text-white font-medium">0.3%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Token 0</span>
                  <span className="text-white font-medium">{pool.token0Address}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Token 1</span>
                  <span className="text-white font-medium">{pool.token1Address}</span>
                </div>
              </div>

              <button
                onClick={handleCreatePool}
                disabled={!isConnected || isCreating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Pool...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Pool
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'liquidity' && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-purple-400 text-sm">
                  💧 Pool created! Now add initial liquidity to enable swaps.
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Amount {pool.token0} (in full units)
                </label>
                <input
                  type="number"
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0"
                  min="0"
                  step="0.1"
                  disabled={isAddingLiquidity}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Amount {pool.token1} (in full units)
                </label>
                <input
                  type="number"
                  value={amount1}
                  onChange={(e) => setAmount1(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0"
                  min="0"
                  step="0.1"
                  disabled={isAddingLiquidity}
                />
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">
                  Note: Amounts will be converted to microunits (multiplied by 1,000,000) automatically.
                </p>
              </div>

              <button
                onClick={handleAddLiquidity}
                disabled={!isConnected || isAddingLiquidity}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingLiquidity ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding Liquidity...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Liquidity
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                  <div>
                    <p className="text-green-400 font-bold text-lg">Success!</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Pool is now active and ready for trading.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Done
              </button>
            </div>
          )}

          {!isConnected && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">
                Please connect your wallet to proceed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PoolPage() {
  const { isConnected, stxAddress } = useStacksWallet();
  const { getUserLiquidity, getPoolInfo } = useStacksPool();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume24h' | 'apr'>('tvl');
  const [userPools, setUserPools] = useState<Record<string, UserLiquidityData>>({});
  const [poolStatuses, setPoolStatuses] = useState<Record<string, PoolStatus>>({});
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [loadingPoolData, setLoadingPoolData] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const filteredPools = pools.filter(pool =>
    pool.pair.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b[sortBy] - a[sortBy]);

  const loadPoolStatuses = async () => {
    if (!stxAddress) return;
    
    setLoadingPoolData(true);
    try {
      const statuses: Record<string, PoolStatus> = {};
      
      for (const pool of pools) {
        try {
          console.log(`Checking pool: ${pool.token0Address}/${pool.token1Address}`);
          const poolInfo = await getPoolInfo(pool.token0Address, pool.token1Address);
          
          if (poolInfo) {
            const hasLiquidity = poolInfo.reserve0 > 0 && poolInfo.reserve1 > 0;
            statuses[pool.id] = {
              exists: true,
              hasLiquidity,
              reserve0: poolInfo.reserve0,
              reserve1: poolInfo.reserve1
            };
          } else {
            statuses[pool.id] = {
              exists: false,
              hasLiquidity: false,
              reserve0: 0,
              reserve1: 0
            };
          }
        } catch (err) {
          console.error(`Error loading pool status for ${pool.pair}:`, err);
          statuses[pool.id] = {
            exists: false,
            hasLiquidity: false,
            reserve0: 0,
            reserve1: 0
          };
        }
      }
      
      setPoolStatuses(statuses);
    } catch (err) {
      console.error('Error loading pool statuses:', err);
    } finally {
      setLoadingPoolData(false);
    }
  };

  useEffect(() => {
    if (stxAddress) {
      loadPoolStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stxAddress]);

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

  const handleOpenCreateModal = (pool: Pool) => {
    setSelectedPool(pool);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setSelectedPool(null);
  };

  const handlePoolCreated = () => {
    loadPoolStatuses();
  };

  const totalTVL = Object.values(poolStatuses).reduce((sum, status) => {
    return sum + ((status.reserve0 / 1000000) * 0.85 * 2);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <span className="text-gray-400">Total TVL</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {loadingPoolData ? '...' : `$${totalTVL.toFixed(2)}`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="text-gray-400">Active Pools</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {Object.values(poolStatuses).filter(s => s.hasLiquidity).length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-6 h-6 text-purple-400" />
              <span className="text-gray-400">Your Positions</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {loadingUserData ? '...' : Object.keys(userPools).length}
            </div>
          </div>
        </div>

        {isConnected && Object.keys(userPools).length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Your Positions</h2>
            {loadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
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
                          <div className="text-gray-400 text-sm">
                            {(data.liquidity / 1000000).toFixed(4)} LP Tokens
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${data.value.toFixed(2)}</div>
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
            )}
          </div>
        )}

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

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Pool</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">Status</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6">Reserves</th>
                  <th className="text-right text-gray-400 font-medium py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPools.map((pool) => {
                  const status = poolStatuses[pool.id];
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
                              {pool.token0Address} / {pool.token1Address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-6">
                        {loadingPoolData ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : !status?.exists ? (
                          <span className="text-red-400 font-medium">Not Created</span>
                        ) : !status.hasLiquidity ? (
                          <span className="text-yellow-400 font-medium">No Liquidity</span>
                        ) : (
                          <span className="text-green-400 font-medium">● Active</span>
                        )}
                      </td>
                      <td className="text-right py-4 px-6">
                        {status?.hasLiquidity ? (
                          <div className="text-white font-medium">
                            <div>{(status.reserve0 / 1000000).toFixed(2)} {pool.token0}</div>
                            <div className="text-gray-400 text-sm">
                              {(status.reserve1 / 1000000).toFixed(2)} {pool.token1}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-right py-4 px-6">
                        {!status?.exists ? (
                          <button
                            onClick={() => handleOpenCreateModal(pool)}
                            disabled={!isConnected}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            Create Pool
                          </button>
                        ) : (
                          <Link
                            href={`/pool/${pool.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                          >
                            {!status.hasLiquidity ? 'Add Liquidity' : 'Manage'}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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

      {selectedPool && (
        <CreatePoolModal
          isOpen={createModalOpen}
          onClose={handleCloseCreateModal}
          pool={selectedPool}
          onSuccess={handlePoolCreated}
        />
      )}
    </div>
  );
}