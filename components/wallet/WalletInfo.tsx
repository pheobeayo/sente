'use client';

import React from 'react';
import { Wallet, TrendingUp, DollarSign, Copy, ExternalLink } from 'lucide-react';

interface WalletInfoProps {
  address: string;
  balance: number;
  portfolioValue: number;
  portfolioChange: number;
}

export default function WalletInfo({
  address,
  balance,
  portfolioValue,
  portfolioChange,
}: WalletInfoProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const isPositive = portfolioChange >= 0;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600/20 rounded-xl">
          <Wallet className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Wallet</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-mono text-sm">{formatAddress(address)}</span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-white/10 rounded transition-all"
            >
              <Copy className="w-3 h-3 text-gray-400" />
            </button>
            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded transition-all"
            >
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">ETH Balance</span>
          </div>
          <p className="text-white font-bold text-xl">{balance.toFixed(4)}</p>
          <p className="text-gray-400 text-sm mt-1">
            ≈ ${(balance * 2850).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Portfolio</span>
          </div>
          <p className="text-white font-bold text-xl">
            ${portfolioValue.toLocaleString()}
          </p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{portfolioChange.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}