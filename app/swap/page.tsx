'use client';

import React from 'react';
import { Clock, Zap, TrendingUp } from 'lucide-react';
import SwapInterface from '@/components/swap/SwapInterface';
import RecentTransactions from '@/components/swap/RecentTransactions';

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Swap Interface */}
          <div className="lg:col-span-2">
            <SwapInterface />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Market Info */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Market Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">24h Volume</span>
                  <span className="text-white font-bold">$5.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">24h Fees</span>
                  <span className="text-green-400 font-bold">$15.6K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">TVL</span>
                  <span className="text-white font-bold">$16.5M</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Instant Swap</span>
                  </div>
                  <span className="text-gray-400 text-sm">Best rate</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Limit Order</span>
                  </div>
                  <span className="text-gray-400 text-sm">Set price</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">View Charts</span>
                  </div>
                  <span className="text-gray-400 text-sm">Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <RecentTransactions />
          </div>
        </div>
      </div>
    </div>
  );
}