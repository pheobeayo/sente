'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ExternalLink, Clock } from 'lucide-react';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksSwap } from '@/hooks/useStacksSwap';

interface Transaction {
  id: string;
  type: 'swap' | 'add' | 'remove';
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
}

export default function RecentTransactions() {
  const { isConnected, stxAddress } = useStacksWallet();
  const { getTransactionStatus } = useStacksSwap();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const updateTransactionStatuses = useCallback(async (txs: Transaction[]) => {
    const updatedTxs: Transaction[] = await Promise.all(
      txs.map(async (tx) => {
        if (tx.status === 'pending') {
          try {
            const status = await getTransactionStatus(tx.txHash);
            const newStatus: Transaction['status'] = status && status.confirmed ? 'confirmed' : 'pending';
            return { ...tx, status: newStatus };
          } catch {
            return tx;
          }
        }
        return tx;
      })
    );
    setTransactions(updatedTxs);
    
    // Save updated transactions
    if (stxAddress) {
      localStorage.setItem(`transactions_${stxAddress}`, JSON.stringify(updatedTxs));
    }
  }, [stxAddress, getTransactionStatus]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Load user's recent transactions from local storage or API
      const stored = localStorage.getItem(`transactions_${stxAddress}`);
      if (stored) {
        const txs: Transaction[] = JSON.parse(stored);
        setTransactions(txs);
        
        // Update transaction statuses
        await updateTransactionStatuses(txs);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [stxAddress, updateTransactionStatuses]);

  useEffect(() => {
    if (isConnected && stxAddress) {
      loadTransactions();
    }
  }, [isConnected, stxAddress, loadTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getExplorerUrl = (txHash: string) => {
    // Use testnet or mainnet based on your configuration
    return `https://explorer.stacks.co/txid/${txHash}?chain=testnet`;
  };

  if (!isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Swaps</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">Connect wallet to view your transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Swaps</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent transactions</p>
            <p className="text-gray-500 text-sm mt-2">Your swaps will appear here</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">
                    {tx.fromAmount.toFixed(4)} {tx.fromToken} → {tx.toAmount.toFixed(4)} {tx.toToken}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">{tx.timestamp}</span>
                  <span className={`capitalize ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>

              <a
                href={getExplorerUrl(tx.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          ))
        )}
      </div>

      {transactions.length > 5 && (
        <button 
          onClick={() => window.location.href = '/transactions'}
          className="w-full mt-4 py-3 text-blue-400 hover:bg-white/5 rounded-lg transition-all font-medium"
        >
          View All Transactions ({transactions.length})
        </button>
      )}
    </div>
  );
}