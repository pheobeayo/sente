'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Droplet, DollarSign, Activity, Users } from 'lucide-react';

interface PoolInfoProps {
  tvl: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  apr: number;
  change24h: number;
  totalLPs: number;
  poolToken: string;
}

export default function PoolInfo({
  tvl,
  volume24h,
  volume7d,
  fees24h,
  apr,
  change24h,
  totalLPs,
}: PoolInfoProps) {
  const isPositive = change24h >= 0;

  const stats = [
    {
      icon: <Droplet className="w-5 h-5 text-blue-400" />,
      label: 'Total Value Locked',
      value: `$${(tvl / 1000000).toFixed(2)}M`,
      change: null,
    },
    {
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      label: '24h Volume',
      value: `$${(volume24h / 1000000).toFixed(2)}M`,
      change: change24h,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      label: '7d Volume',
      value: `$${(volume7d / 1000000).toFixed(2)}M`,
      change: null,
    },
    {
      icon: <DollarSign className="w-5 h-5 text-yellow-400" />,
      label: '24h Fees',
      value: `$${(fees24h / 1000).toFixed(1)}K`,
      change: null,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      label: 'APR',
      value: `${apr.toFixed(2)}%`,
      change: null,
    },
    {
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      label: 'Total LPs',
      value: totalLPs.toLocaleString(),
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              {stat.icon}
            </div>
            <span className="text-gray-400 text-sm">{stat.label}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{stat.value}</span>
            {stat.change !== null && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stat.change).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}