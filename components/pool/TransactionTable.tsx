'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'swap' | 'add' | 'remove';
  token0Amount: number;
  token0Symbol: string;
  token1Amount: number;
  token1Symbol: string;
  totalValue: number;
  account: string;
  timestamp: string;
  txHash: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'swap',
    token0Amount: 1.5,
    token0Symbol: 'ETH',
    token1Amount: 4275,
    token1Symbol: 'USDC',
    totalValue: 4275,
    account: '0x742d35Cc',
    timestamp: '2 mins ago',
    txHash: '0x123...456',
  },
  {
    id: '2',
    type: 'add',
    token0Amount: 2.0,
    token0Symbol: 'ETH',
    token1Amount: 5700,
    token1Symbol: 'USDC',
    totalValue: 11400,
    account: '0x8f3a92Bc',
    timestamp: '5 mins ago',
    txHash: '0x789...abc',
  },
  {
    id: '3',
    type: 'remove',
    token0Amount: 0.8,
    token0Symbol: 'ETH',
    token1Amount: 2280,
    token1Symbol: 'USDC',
    totalValue: 4560,
    account: '0x5c2e81Dd',
    timestamp: '12 mins ago',
    txHash: '0xdef...123',
  },
];

export default function TransactionTable() {
 
  const getTypeBadge = (type: string) => {
    const badges = {
      swap: 'bg-blue-600/20 text-blue-400',
      add: 'bg-green-600/20 text-green-400',
      remove: 'bg-red-600/20 text-red-400',
    };
    return badges[type as keyof typeof badges] || badges.swap;
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total Value</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Token Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Account</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Time</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${getTypeBadge(tx.type)}`}>
                      {tx.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-medium">${tx.totalValue.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white">
                    <div>{tx.token0Amount} {tx.token0Symbol}</div>
                    <div className="text-gray-400 text-sm">{tx.token1Amount} {tx.token1Symbol}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-blue-400 font-mono text-sm">{tx.account}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-400 text-sm">{tx.timestamp}</span>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`https://etherscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}