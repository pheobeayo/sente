'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Minus, ExternalLink, Copy, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksPool } from '@/hooks/useStacksPool';
import toast from 'react-hot-toast';

const poolData = {
  id: '1',
  pair: 'STX/USDC',
  token0: { symbol: 'STX', amount: 1825, value: 5200000, address: 'STX' },
  token1: { symbol: 'USDC', amount: 5200000, value: 5200000, address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-usdc' },
  tvl: 10400000,
  volume24h: 1800000,
  fees24h: 5400,
  apr: 24.5,
  change24h: 12.5,
  contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.dex-contract'
};

const liquidityHistory = [
  { date: 'Oct 12', tvl: 9500000 },
  { date: 'Oct 13', tvl: 9800000 },
  { date: 'Oct 14', tvl: 10100000 },
  { date: 'Oct 15', tvl: 10000000 },
  { date: 'Oct 16', tvl: 10200000 },
  { date: 'Oct 17', tvl: 10300000 },
  { date: 'Oct 18', tvl: 10400000 }
];

const volumeHistory = [
  { date: 'Oct 12', volume: 1600000 },
  { date: 'Oct 13', volume: 1900000 },
  { date: 'Oct 14', volume: 1700000 },
  { date: 'Oct 15', volume: 2100000 },
  { date: 'Oct 16', volume: 1850000 },
  { date: 'Oct 17', volume: 2000000 },
  { date: 'Oct 18', volume: 1800000 }
];

const recentTransactions = [
  { type: 'Swap', from: 'STX', to: 'USDC', amount: '2.5 STX', value: '$2.13', time: '2 min ago', hash: '0xabc...123' },
  { type: 'Add', from: 'STX', to: 'USDC', amount: '1.2 STX', value: '$1.02', time: '5 min ago', hash: '0xdef...456' },
  { type: 'Swap', from: 'USDC', to: 'STX', amount: '10 USDC', value: '$10', time: '8 min ago', hash: '0xghi...789' },
  { type: 'Remove', from: 'STX', to: 'USDC', amount: '0.8 STX', value: '$0.68', time: '12 min ago', hash: '0xjkl...012' },
  { type: 'Swap', from: 'STX', to: 'USDC', amount: '5.0 STX', value: '$4.25', time: '15 min ago', hash: '0xmno...345' }
];

interface PoolInfo {
  reserve0: number;
  reserve1: number;
  totalSupply: number;
}

interface UserLiquidity {
  liquidity: number;
  token0Amount?: number;
  token1Amount?: number;
  value: number;
  unclaimedFees?: number;
}

export default function PoolDetailPage() {
  const { isConnected, stxAddress } = useStacksWallet();
  const { 
    isLoading, 
    error, 
    txId,
    getPoolInfo, 
    getUserLiquidity, 
    addLiquidity, 
    removeLiquidity,
    calculateLPTokens,
    calculateTokensFromLP
  } = useStacksPool();

  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [removePercent, setRemovePercent] = useState(50);
  const [userLiquidity, setUserLiquidity] = useState<UserLiquidity | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Load pool and user data
  useEffect(() => {
    const loadPoolData = async () => {
      if (!stxAddress) return;

      setLoadingData(true);
      try {
        // Load pool information
        const info = await getPoolInfo(poolData.token0.address, poolData.token1.address);
        if (info) {
          setPoolInfo(info);
        }

        // Load user's liquidity
        const userLiq = await getUserLiquidity(poolData.token0.address, poolData.token1.address);
        if (userLiq) {
          setUserLiquidity(userLiq);
        }
      } catch (err) {
        console.error('Error loading pool data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    if (isConnected && stxAddress) {
      loadPoolData();
    }
  }, [isConnected, stxAddress, getPoolInfo, getUserLiquidity]);

  // Reload data after successful transaction
  useEffect(() => {
    if (txId && stxAddress) {
      // Wait a bit for transaction to be mined, then reload
      const timeout = setTimeout(async () => {
        const info = await getPoolInfo(poolData.token0.address, poolData.token1.address);
        if (info) setPoolInfo(info);
        const userLiq = await getUserLiquidity(poolData.token0.address, poolData.token1.address);
        if (userLiq) setUserLiquidity(userLiq);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [txId, stxAddress, getPoolInfo, getUserLiquidity]);

  const handleAddLiquidity = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount0 || !amount1) {
      toast.error('Please enter amounts for both tokens');
      return;
    }

    const amount0Num = parseFloat(amount0);
    const amount1Num = parseFloat(amount1);

    if (amount0Num <= 0 || amount1Num <= 0) {
      toast.error('Amounts must be greater than 0');
      return;
    }

    // Calculate minimum LP tokens with 0.5% slippage
    const expectedLP = calculateLPTokens(
      amount0Num,
      amount1Num,
      poolInfo?.reserve0 || 0,
      poolInfo?.reserve1 || 0,
      poolInfo?.totalSupply || 0
    );
    const minLP = expectedLP * 0.995;

    await addLiquidity(
      poolData.token0.address,
      poolData.token1.address,
      amount0Num,
      amount1Num,
      minLP
    );

    // Clear inputs on success
    if (!error) {
      setAmount0('');
      setAmount1('');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!userLiquidity || userLiquidity.liquidity <= 0) {
      toast.error('No liquidity to remove');
      return;
    }

    if (removePercent <= 0) {
      toast.error('Please select an amount to remove');
      return;
    }

    const liquidityToRemove = (userLiquidity.liquidity * removePercent) / 100;
    
    // Calculate expected token amounts
    const { amount0: expectedAmount0, amount1: expectedAmount1 } = calculateTokensFromLP(
      liquidityToRemove,
      poolInfo?.reserve0 || 0,
      poolInfo?.reserve1 || 0,
      poolInfo?.totalSupply || 0
    );

    // Apply 0.5% slippage
    const minAmount0 = expectedAmount0 * 0.995;
    const minAmount1 = expectedAmount1 * 0.995;

    await removeLiquidity(
      poolData.token0.address,
      poolData.token1.address,
      liquidityToRemove,
      minAmount0,
      minAmount1
    );
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(poolData.contractAddress);
    toast.success('Address copied to clipboard');
  };

  const myPosition = userLiquidity?.value || 0;
  const myShare = poolInfo?.totalSupply && poolInfo.totalSupply > 0 
    ? (userLiquidity?.liquidity || 0) / poolInfo.totalSupply * 100 
    : 0;

  // Show connection message if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/pool"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Pools
          </Link>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to view and manage liquidity</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/pool"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Pools
        </Link>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Transaction Failed</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {txId && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 font-medium">Transaction Successful!</p>
            <p className="text-green-300 text-sm mt-1 break-all">Transaction ID: {txId}</p>
            <a 
              href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-sm mt-2 inline-flex items-center gap-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Pool Header */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-slate-900" />
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full border-4 border-slate-900" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{poolData.pair}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-sm">{poolData.contractAddress.slice(0, 20)}...</span>
                  <button onClick={copyAddress} className="text-gray-400 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <a 
                    href={`https://explorer.hiro.so/address/${poolData.contractAddress}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setActiveTab('add')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Liquidity
              </button>
              <button 
                onClick={() => setActiveTab('remove')}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/20 flex items-center gap-2"
              >
                <Minus className="w-5 h-5" />
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Total Value Locked</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${(poolData.tvl / 1000000).toFixed(2)}M
            </div>
            <div className={`flex items-center gap-1 text-sm ${poolData.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {poolData.change24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(poolData.change24h)}% (24h)
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">24h Volume</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${(poolData.volume24h / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-gray-400">
              {((poolData.volume24h / poolData.tvl) * 100).toFixed(1)}% of TVL
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">24h Fees</div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              ${(poolData.fees24h / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-gray-400">0.3% per trade</div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">APR</div>
            <div className="text-3xl font-bold text-purple-400 mb-1">{poolData.apr}%</div>
            <div className="text-sm text-gray-400">Annual return</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pool Composition */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Pool Composition</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                    <div>
                      <div className="text-white font-bold">{poolData.token0.symbol}</div>
                      <div className="text-gray-400 text-sm">
                        {loadingData ? '...' : (poolInfo?.reserve0 || poolData.token0.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${(poolData.token0.value / 1000000).toFixed(2)}M</div>
                    <div className="text-gray-400 text-sm">50%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
                    <div>
                      <div className="text-white font-bold">{poolData.token1.symbol}</div>
                      <div className="text-gray-400 text-sm">
                        {loadingData ? '...' : (poolInfo?.reserve1 || poolData.token1.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${(poolData.token1.value / 1000000).toFixed(2)}M</div>
                    <div className="text-gray-400 text-sm">50%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Liquidity & Volume</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white font-medium mb-4">Total Value Locked (7d)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={liquidityHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M`, 'TVL']}
                      />
                      <Line type="monotone" dataKey="tvl" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-4">Trading Volume (7d)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={volumeHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
                      />
                      <Line type="monotone" dataKey="volume" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium py-3 px-2">Type</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-2">Token Amount</th>
                      <th className="text-right text-gray-400 font-medium py-3 px-2">Total Value</th>
                      <th className="text-right text-gray-400 font-medium py-3 px-2">Time</th>
                      <th className="text-right text-gray-400 font-medium py-3 px-2">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tx.type === 'Swap' ? 'bg-blue-500/20 text-blue-400' :
                            tx.type === 'Add' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="text-white py-3 px-2">
                          {tx.amount}
                          <span className="text-gray-400 text-sm ml-2">→ {tx.to}</span>
                        </td>
                        <td className="text-right text-white py-3 px-2">{tx.value}</td>
                        <td className="text-right text-gray-400 text-sm py-3 px-2">{tx.time}</td>
                        <td className="text-right py-3 px-2">
                          <a href="#" className="text-purple-400 hover:text-purple-300 text-sm font-mono">
                            {tx.hash}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Liquidity */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">My Liquidity</h3>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">My Position</div>
                    <div className="text-2xl font-bold text-white">
                      ${myPosition.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Pool Share</div>
                    <div className="text-xl font-bold text-purple-400">
                      {myShare.toFixed(2)}%
                    </div>
                  </div>
                  {userLiquidity && userLiquidity.liquidity > 0 && (
                    <>
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">{poolData.token0.symbol}</span>
                          <span className="text-white font-medium">{userLiquidity.token0Amount?.toFixed(4) || '0.0000'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{poolData.token1.symbol}</span>
                          <span className="text-white font-medium">{userLiquidity.token1Amount?.toFixed(4) || '0.0000'}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="text-gray-400 text-sm mb-1">Unclaimed Fees</div>
                        <div className="text-xl font-bold text-green-400">${userLiquidity.unclaimedFees?.toFixed(2) || '0.00'}</div>
                        <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-all">
                          Claim Fees
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Add/Remove Liquidity */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('add')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'add'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Add
                </button>
                <button
                  onClick={() => setActiveTab('remove')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'remove'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Remove
                </button>
              </div>

              {activeTab === 'add' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      {poolData.token0.symbol} Amount
                    </label>
                    <input
                      type="number"
                      value={amount0}
                      onChange={(e) => setAmount0(e.target.value)}
                      placeholder="0.0"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      {poolData.token1.symbol} Amount
                    </label>
                    <input
                      type="number"
                      value={amount1}
                      onChange={(e) => setAmount1(e.target.value)}
                      placeholder="0.0"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>
                  {amount0 && amount1 && poolInfo && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-400 text-sm mb-1">You will receive (estimated)</div>
                      <div className="text-white font-bold">
                        {calculateLPTokens(
                          parseFloat(amount0),
                          parseFloat(amount1),
                          poolInfo.reserve0,
                          poolInfo.reserve1,
                          poolInfo.totalSupply
                        ).toFixed(6)} LP Tokens
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={handleAddLiquidity}
                    disabled={isLoading || !amount0 || !amount1}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : 'Add Liquidity'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Amount (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={removePercent}
                      onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                      disabled={isLoading || !userLiquidity?.liquidity}
                      className="w-full disabled:opacity-50"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-400 text-sm">0%</span>
                      <span className="text-white font-medium">{removePercent}%</span>
                      <span className="text-gray-400 text-sm">100%</span>
                    </div>
                  </div>
                  {userLiquidity && userLiquidity.liquidity > 0 && poolInfo && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">You will receive:</span>
                      </div>
                      <div className="space-y-1">
                        {(() => {
                          const liquidityToRemove = (userLiquidity.liquidity * removePercent) / 100;
                          const { amount0, amount1 } = calculateTokensFromLP(
                            liquidityToRemove,
                            poolInfo.reserve0,
                            poolInfo.reserve1,
                            poolInfo.totalSupply
                          );
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white">{amount0.toFixed(4)} {poolData.token0.symbol}</span>
                                <span className="text-gray-400">≈ ${(amount0 * 0.85).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white">{amount1.toFixed(4)} {poolData.token1.symbol}</span>
                                <span className="text-gray-400">≈ ${amount1.toFixed(2)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={handleRemoveLiquidity}
                    disabled={isLoading || !userLiquidity?.liquidity || removePercent === 0}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : !userLiquidity?.liquidity ? 'No Liquidity' : 'Remove Liquidity'}
                  </button>
                </div>
              )}
            </div>

            {/* Pool Info */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Pool Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fee Tier</span>
                  <span className="text-white font-medium">0.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="text-white font-medium">12,458</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">7d Volume</span>
                  <span className="text-white font-medium">$12.8M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">7d Fees</span>
                  <span className="text-green-400 font-medium">$38.4K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total LP Tokens</span>
                  <span className="text-white font-medium">
                    {loadingData ? '...' : poolInfo?.totalSupply?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}