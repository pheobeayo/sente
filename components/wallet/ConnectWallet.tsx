"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react";
import {
  connect,
  isConnected,
  disconnect,
  getLocalStorage,
} from "@stacks/connect";
import toast from "react-hot-toast";

export default function ConnectWallet() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Fetch balance
  const fetchBalance = async (addr: string) => {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${addr}/balances`
      );
      const data = await response.json();
      const stxBalance = (parseInt(data.stx.balance) / 1000000).toFixed(2);
      setBalance(stxBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  // Check connection on mount
  useEffect(() => {
    const checkConnection = () => {
      const connected = isConnected();
      if (connected) {
        setWalletConnected(true);
        const data = getLocalStorage();
        const stxAddress = data?.addresses?.stx?.[0]?.address;
        if (stxAddress && typeof stxAddress === 'string') {
          setAddress(stxAddress);
          fetchBalance(stxAddress);
        }
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      await connect({
        forceWalletSelect: true,
      });
      
      const connected = isConnected();
      if (connected) {
        setWalletConnected(true);
        const data = getLocalStorage();
        const stxAddress = data?.addresses?.stx?.[0]?.address;
        
        if (stxAddress && typeof stxAddress === 'string') {
          setAddress(stxAddress);
          fetchBalance(stxAddress);
          toast.success('Wallet connected successfully!');
          console.log("Connected STX Address:", stxAddress);
        } else {
          toast.error('Could not get wallet address');
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setWalletConnected(false);
    setShowDropdown(false);
    setAddress(null);
    setBalance('0');
    toast.success('Wallet disconnected');
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const getExplorerUrl = () => {
    return `https://explorer.hiro.so/address/${address}?chain=testnet`;
  };

  return (
    <div>
      {!walletConnected ? (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-mono">{formatAddress(address!)}</span>
            </div>
            <div className="text-sm text-gray-400">{balance} STX</div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Connected Wallet</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-400 text-xs">Active</span>
                    </div>
                  </div>
                  <p className="text-white font-mono text-sm break-all">{address}</p>
                </div>

                {/* Balance */}
                <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                  <div className="text-gray-400 text-sm mb-1">Balance</div>
                  <div className="text-2xl font-bold text-white">{balance} STX</div>
                  <div className="text-gray-400 text-sm mt-1">
                    ≈ ${(parseFloat(balance) * 0.85).toFixed(2)} USD
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={handleCopyAddress}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </button>

                  <a
                    href={getExplorerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on Explorer</span>
                  </a>

                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}