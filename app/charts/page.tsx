'use client';

import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Droplets, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Mock data for charts
const volumeData = [
  { date: 'Oct 12', volume: 2400000, transactions: 1240 },
  { date: 'Oct 13', volume: 3200000, transactions: 1680 },
  { date: 'Oct 14', volume: 2800000, transactions: 1450 },
  { date: 'Oct 15', volume: 4100000, transactions: 2100 },
  { date: 'Oct 16', volume: 3600000, transactions: 1820 },
  { date: 'Oct 17', volume: 4800000, transactions: 2450 },
  { date: 'Oct 18', volume: 5200000, transactions: 2680 }
];

const liquidityData = [
  { date: 'Oct 12', liquidity: 12500000 },
  { date: 'Oct 13', liquidity: 13200000 },
  { date: 'Oct 14', liquidity: 13800000 },
  { date: 'Oct 15', liquidity: 14500000 },
  { date: 'Oct 16', liquidity: 15200000 },
  { date: 'Oct 17', liquidity: 15800000 },
  { date: 'Oct 18', liquidity: 16500000 }
];

const poolDistribution = [
  { name: 'ETH/USDC', value: 35, color: '#8b5cf6' },
  { name: 'WBTC/ETH', value: 25, color: '#ec4899' },
  { name: 'DAI/USDC', value: 20, color: '#06b6d4' },
  { name: 'ETH/DAI', value: 15, color: '#10b981' },
  { name: 'Others', value: 5, color: '#6b7280' }
];

const topPairs = [
  { pair: 'ETH/USDC', volume: '1.8M', change: 12.5, tvl: '5.2M', fees: '5.4K' },
  { pair: 'WBTC/ETH', volume: '1.2M', change: -3.2, tvl: '3.8M', fees: '3.6K' },
  { pair: 'DAI/USDC', volume: '890K', change: 8.7, tvl: '2.9M', fees: '2.7K' },
  { pair: 'ETH/DAI', volume: '720K', change: 5.3, tvl: '2.1M', fees: '2.2K' },
  { pair: 'USDC/USDT', volume: '650K', change: -1.8, tvl: '1.8M', fees: '2.0K' }
];

const feesData = [
  { date: 'Oct 12', fees: 7200 },
  { date: 'Oct 13', fees: 9600 },
  { date: 'Oct 14', fees: 8400 },
  { date: 'Oct 15', fees: 12300 },
  { date: 'Oct 16', fees: 10800 },
  { date: 'Oct 17', fees: 14400 },
  { date: 'Oct 18', fees: 15600 }
];

export default function Charts() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Analytics</h1>
          <p className="text-xl text-gray-300">Real-time insights into Sente protocol performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Value Locked</span>
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">$16.5M</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+8.2%</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">24h Volume</span>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">$5.2M</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+15.3%</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">24h Fees</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">$15.6K</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+12.7%</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Transactions</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-white">2.68K</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+9.4%</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-4 mb-8">
          {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tf === 'all' ? 'All Time' : tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Trading Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#560ffcff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#560ffcff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, 'Volume']}
                />
                <Area type="monotone" dataKey="volume" stroke="#8b5cf6" fillOpacity={1} fill="url(#volumeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Liquidity Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Total Value Locked</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={liquidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, 'TVL']}
                />
                <Line type="monotone" dataKey="liquidity" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fees Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Protocol Fees</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${(value / 1000).toFixed(2)}K`, 'Fees']}
                />
                <Bar dataKey="fees" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pool Distribution */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Liquidity Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={poolDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {poolDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pairs Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Top Trading Pairs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Pair</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">24h Volume</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">24h Change</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">TVL</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">24h Fees</th>
                </tr>
              </thead>
              <tbody>
                {topPairs.map((pair, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">{pair.pair}</span>
                    </td>
                    <td className="text-right py-4 px-4 text-white">${pair.volume}</td>
                    <td className="text-right py-4 px-4">
                      <div className={`flex items-center justify-end gap-1 ${pair.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pair.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{Math.abs(pair.change)}%</span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 text-white">${pair.tvl}</td>
                    <td className="text-right py-4 px-4 text-green-400">${pair.fees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}