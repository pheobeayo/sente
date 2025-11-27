'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ExternalLink, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import {
  fetchAddressTransactions,
  fetchContractTransactions,
  parseSwapTransactions,
  formatTimeAgo,
  getExplorerUrl,
  formatAddress,
  type ParsedSwapTransaction,
} from '@/services/TransactionService';

export default function RecentTransactions() {
  const { isConnected, stxAddress } = useStacksWallet();
  const [transactions, setTransactions] = useState<ParsedSwapTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from blockchain
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (stxAddress) {
        // Fetch transactions for specific address
        console.log('Fetching transactions for address:', stxAddress);
        response = await fetchAddressTransactions(stxAddress, 50);
      } else {
        // Fetch all transactions for the contract
        console.log('Fetching all contract transactions');
        response = await fetchContractTransactions(50);
      }

      console.log('Raw transaction response:', response);

      // Parse and filter swap transactions
      const parsed = parseSwapTransactions(response.results);
      console.log('Parsed swap transactions:', parsed);

      setTransactions(parsed);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [stxAddress]);

  // Load transactions on mount and when address changes
  useEffect(() => {
    if (isConnected) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [isConnected, stxAddress, fetchTransactions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, fetchTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <span className={`${color} capitalize text-xs font-medium`}>
        {status}
      </span>
    );
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
          <p className="text-gray-400">Connect wallet to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          {stxAddress ? 'Your Recent Swaps' : 'All Recent Swaps'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-medium">Error Loading Transactions</p>
            <p className="text-red-300 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading && transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading transactions from blockchain...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-gray-400">No swap transactions found</p>
            <p className="text-gray-500 text-sm mt-2">
              {stxAddress 
                ? 'Your swaps will appear here' 
                : 'Swap transactions will appear here'}
            </p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-white font-medium">
                    {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <span className="text-gray-400 text-xs">
                    {formatTimeAgo(tx.timestamp)}
                  </span>
                  {!stxAddress && (
                    <span className="text-gray-500 text-xs">
                      From: {formatAddress(tx.sender)}
                    </span>
                  )}
                  {getStatusBadge(tx.status)}
                  {tx.blockHeight && (
                    <span className="text-gray-500 text-xs">
                      Block {tx.blockHeight}
                    </span>
                  )}
                </div>
              </div>

              <a
                href={getExplorerUrl(tx.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="View on Stacks Explorer"
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

      {transactions.length > 0 && !loading && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-xs">
            ✓ Showing live on-chain transactions from Stacks blockchain
          </p>
        </div>
      )}
    </div>
  );
}