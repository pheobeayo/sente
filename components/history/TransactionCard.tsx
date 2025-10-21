import React from 'react';
import { ArrowLeftRight, Plus, Minus, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Transaction {
  type: string;
  from: string;
  to: string;
  amount: number;
  time: string;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
  fee?: number;
}

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4 animate-pulse" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.toLowerCase().includes('swap')) {
      return <ArrowLeftRight className="w-5 h-5" />;
    } else if (type.toLowerCase().includes('add')) {
      return <Plus className="w-5 h-5" />;
    } else if (type.toLowerCase().includes('remove')) {
      return <Minus className="w-5 h-5" />;
    }
    return <ArrowLeftRight className="w-5 h-5" />;
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            {getTypeIcon(transaction.type)}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">{transaction.type}</h3>
            <p className="text-xs text-gray-400">{transaction.time}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(transaction.status)}`}>
          {getStatusIcon(transaction.status)}
          <span className="capitalize">{transaction.status}</span>
        </span>
      </div>

      <div className="bg-white/5 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Amount</span>
          <span className="text-white font-bold">{transaction.amount} {transaction.from} → {transaction.to}</span>
        </div>
        {transaction.fee && (
          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-gray-400">Fee</span>
            <span className="text-gray-300">{transaction.fee} STX</span>
          </div>
        )}
      </div>

      {transaction.txHash && (
        <a
          href={`https://explorer.stacks.co/txid/${transaction.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs transition-colors"
        >
          View on Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}