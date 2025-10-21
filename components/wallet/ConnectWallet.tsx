'use client';

import React, { useState } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';

export default function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [address] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setShowDropdown(false);
  };

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-all"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-medium">{formatAddress(address)}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <p className="text-gray-400 text-xs mb-1">Connected Wallet</p>
              <p className="text-white font-mono text-sm">{formatAddress(address)}</p>
            </div>
            <div className="p-2">
              <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all">
                View on Explorer
              </button>
              <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all">
                Copy Address
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 rounded-lg transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}