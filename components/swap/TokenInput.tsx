import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TokenInputProps {
  label: string;
  token: string;
  amount: string;
  balance: string;
  onAmountChange: (value: string) => void;
  onTokenChange: (token: string) => void;
  readOnly?: boolean;
}

export default function TokenInput({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onTokenChange,
  readOnly = false
}: TokenInputProps) {
  return (
    <div className="mb-2">
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <input
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.0"
            readOnly={readOnly}
            className="bg-transparent text-2xl text-white font-bold outline-none flex-1"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
            <span className="text-white font-bold">{token}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Balance: {balance}</span>
          {!readOnly && (
            <button 
              onClick={() => onAmountChange(balance.replace(',', ''))}
              className="text-purple-400 hover:text-purple-300"
            >
              MAX
            </button>
          )}
        </div>
      </div>
    </div>
  );
}