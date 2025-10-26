'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ExternalLink, Clock, AlertCircle } from 'lucide-react';
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
            const newStatus: Transaction['status'] = status && status.tx_status === 'success' ? 'confirmed' : 'pending';
            return { ...tx, status: newStatus };
          } catch {
            return tx;
          }
        }
        return tx;
      })
    );
    setTransactions(updatedTxs);
    
    // Save updated transactions to localStorage
    if (stxAddress) {
      try {
        localStorage.setItem(`transactions_${stxAddress}`, JSON.stringify(updatedTxs));
      } catch (error) {
        console.error('Failed to save transactions:', error);
      }
    }
  }, [stxAddress, getTransactionStatus]);

  const loadTransactions = useCallback(async () => {
    if (!stxAddress) return;
    
    setLoading(true);
    try {
      const stored = localStorage.getItem(`transactions_${stxAddress}`);
      if (stored) {
        const txs: Transaction[] = JSON.parse(stored);
        setTransactions(txs);
        
        // Update transaction statuses for pending transactions
        const hasPending = txs.some(tx => tx.status === 'pending');
        if (hasPending) {
          await updateTransactionStatuses(txs);
        }
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
      
      // Refresh transaction status every 30 seconds
      const interval = setInterval(() => {
        if (transactions.some(tx => tx.status === 'pending')) {
          updateTransactionStatuses(transactions);
        }
      }, 30000);
      
      return () => clearInterval(interval);
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
    return `https://explorer.hiro.so/txid/${txHash}?chain=testnet`;
  };

  if (!isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Swaps</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
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
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-6 h-6 text-purple-400" />
            </div>
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