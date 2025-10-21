'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  if (!isOpen) return null;

  const wallets = [
    {
      name: 'MetaMask',
      description: 'Connect using MetaMask browser extension',
      icon: '🦊',
      popular: true,
    },
    {
      name: 'WalletConnect',
      description: 'Scan with mobile wallet',
      icon: '📱',
      popular: true,
    },
    {
      name: 'Coinbase Wallet',
      description: 'Connect with Coinbase Wallet',
      icon: '💼',
      popular: false,
    },
    {
      name: 'Trust Wallet',
      description: 'Connect using Trust Wallet',
      icon: '🛡️',
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 rounded-3xl max-w-md w-full border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Choose your preferred wallet to connect to SenteDex
          </p>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{wallet.icon}</div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{wallet.name}</span>
                      {wallet.popular && (
                        <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{wallet.description}</p>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
            <p className="text-blue-400 text-sm">
              <span className="font-bold">New to Ethereum?</span> Learn more about wallets and how to get started
            </p>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}