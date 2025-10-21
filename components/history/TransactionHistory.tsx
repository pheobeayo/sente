import React from 'react';
import { ArrowLeftRight, Plus, Minus, RefreshCw, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Transaction {
  type: string;
  from: string;
  to: string;
  amount: number;
  time: string;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function TransactionHistory({ transactions, onRefresh }: TransactionHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5 animate-pulse" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.toLowerCase().includes('swap')) {
      return <ArrowLeftRight className="w-5 h-5 text-purple-400" />;
    } else if (type.toLowerCase().includes('add')) {
      return <Plus className="w-5 h-5 text-blue-400" />;
    } else if (type.toLowerCase().includes('remove')) {
      return <Minus className="w-5 h-5 text-orange-400" />;
    }
    return <ArrowLeftRight className="w-5 h-5 text-gray-400" />;
  };

  const getTypeBgColor = (type: string) => {
    if (type.toLowerCase().includes('swap')) {
      return 'bg-purple-500/20';
    } else if (type.toLowerCase().includes('add')) {
      return 'bg-blue-500/20';
    } else if (type.toLowerCase().includes('remove')) {
      return 'bg-orange-500/20';
    }
    return 'bg-gray-500/20';
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Transaction History</h2>
          <p className="text-gray-400 mt-1 text-sm">Your recent DEX activity</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors self-start sm:self-auto"
          aria-label="Refresh transactions"
        >
          <RefreshCw className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="divide-y divide-white/5">
          {transactions.map((tx, i) => (
            <div
              key={i}
              className="p-4 sm:p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBgColor(tx.type)}`}>
                  {getTypeIcon(tx.type)}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-white font-bold text-sm sm:text-base">{tx.type}</h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mt-1">
                        <span className="truncate">{tx.amount} {tx.from}</span>
                        <ArrowLeftRight className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{tx.to}</span>
                      </div>
                    </div>

                    {/* Status Badge - Desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        <span className="text-sm font-medium capitalize">{tx.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400">
                      <span>{tx.time}</span>
                      {tx.txHash && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <a
                            href={`https://explorer.stacks.co/txid/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>

                    {/* Status Badge - Mobile */}
                    <div className="sm:hidden flex items-center gap-1.5">
                      <div className={`${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                      </div>
                    </div>
                  </div>

                  {/* Explorer Link - Mobile */}
                  {tx.txHash && (
                    <a
                      href={`https://explorer.stacks.co/txid/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm:hidden inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors text-xs mt-2"
                    >
                      View on Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <ArrowLeftRight className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Transactions Yet</h3>
          <p className="text-sm sm:text-base text-gray-400 text-center max-w-sm">
            Your transaction history will appear here once you start trading
          </p>
        </div>
      )}

      {/* Load More Button - Optional */}
      {transactions.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-white/10">
          <button className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors">
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  );
}
