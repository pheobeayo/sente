'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Star } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance: number;
  price: number;
}

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  tokens: Token[];
}

export default function TokenSelector({ isOpen, onClose, onSelect, tokens }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['ETH', 'USDC']);

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 rounded-3xl max-w-md w-full max-h-[80vh] border border-slate-800 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white mb-4">Select Token</h3>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or symbol"
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No tokens found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{token.symbol}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{token.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white font-medium">{token.balance}</p>
                      <p className="text-gray-400 text-sm">
                        ${(token.balance * token.price).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(token.symbol, e)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.includes(token.symbol)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full py-3 text-blue-400 hover:bg-white/5 rounded-lg transition-all font-medium">
            Manage Token Lists
          </button>
        </div>
      </div>
    </div>
  );
}