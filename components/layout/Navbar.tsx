'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Wallet, ChevronDown, LogOut, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useStacksWallet } from '@/hooks/useStacksWallet';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    isConnected, 
    stxAddress, 
    connectWallet, 
    disconnectWallet,
    getBalance
  } = useStacksWallet();

  const navigation = [
    { name: 'Swap', href: '/swap' },
    { name: 'Pools', href: '/pool' },
    { name: 'Vote', href: '/vote' },
    { name: 'Charts', href: '/charts' },
    { name: 'Docs', href: '/docs' }
  ];

  // Load balance when connected
  useEffect(() => {
    if (isConnected && stxAddress) {
      loadBalance();
    }
  }, [isConnected, stxAddress]);

  const loadBalance = async () => {
    if (!stxAddress) return;
    try {
      const bal = await getBalance(stxAddress);
      // Convert from microSTX to STX
      const stxBalance = (parseFloat(bal) / 1000000).toFixed(2);
      setBalance(stxBalance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connectWallet();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowWalletMenu(false);
    setBalance('0');
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!stxAddress) return;
    try {
      await navigator.clipboard.writeText(stxAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying address:', error);
    }
  };

  const getExplorerUrl = (address: string) => {
    // Use testnet or mainnet based on your configuration
    return `https://explorer.stacks.co/address/${address}?chain=testnet`;
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">Sente</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Wallet Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            {isConnected && stxAddress ? (
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-all"
                >
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium text-sm">
                      {formatAddress(stxAddress)}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {balance} STX
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Wallet Dropdown Menu */}
                {showWalletMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowWalletMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Your Address</span>
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <button
                              onClick={copyAddress}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-white font-mono text-sm break-all">
                          {stxAddress}
                        </p>
                      </div>

                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Balance</span>
                          <span className="text-white font-bold">{balance} STX</span>
                        </div>
                      </div>

                      <div className="p-2">
                        <a
                          href={getExplorerUrl(stxAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Explorer
                        </a>
                        <button
                          onClick={handleDisconnect}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-300 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-5 h-5" />
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 px-4 space-y-3">
                {isConnected && stxAddress ? (
                  <>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Connected</span>
                        <Wallet className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-white font-medium text-sm mb-1">
                        {formatAddress(stxAddress)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Balance: {balance} STX
                      </p>
                    </div>

                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-lg border border-white/10 text-white transition-all"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Address
                        </>
                      )}
                    </button>

                    <a
                      href={getExplorerUrl(stxAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-lg border border-white/10 text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </a>

                    <button
                      onClick={() => {
                        handleDisconnect();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-3 rounded-lg border border-red-500/30 text-red-400 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-300 px-6 py-3 rounded-lg font-bold text-white disabled:opacity-50"
                  >
                    <Wallet className="w-5 h-5" />
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}