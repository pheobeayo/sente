'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp, Users, DollarSign, Activity} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Execute trades instantly with our optimized smart contracts and low latency infrastructure'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Audited',
      description: 'Multiple security audits and battle-tested smart contracts keep your funds safe'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Lowest Fees',
      description: 'Industry-leading 0.3% trading fee with significant discounts for high-volume traders'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Earn Yield',
      description: 'Provide liquidity and earn passive income from trading fees and liquidity mining rewards'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Governed',
      description: 'SENTE token holders have full control over protocol parameters and treasury'
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Deep Liquidity',
      description: 'Access millions in liquidity across major trading pairs with minimal slippage'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$16.5M', change: '+8.2%' },
    { label: '24h Trading Volume', value: '$5.2M', change: '+15.3%' },
    { label: 'Total Traders', value: '12.4K', change: '+22.1%' },
    { label: 'Liquidity Providers', value: '3.2K', change: '+18.5%' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect Wallet',
      description: 'Connect your Web3 wallet in seconds using MetaMask, WalletConnect, or Coinbase Wallet'
    },
    {
      number: '02',
      title: 'Select Tokens',
      description: 'Choose from hundreds of tokens across multiple chains with real-time pricing'
    },
    {
      number: '03',
      title: 'Swap or Provide Liquidity',
      description: 'Execute instant swaps or add liquidity to earn fees from every trade'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-700/20 rounded-3xl p-16 backdrop-blur-sm border border-slate-700/50 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trade Crypto with
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Lightning Speed
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The most efficient decentralized exchange. Swap tokens, provide liquidity, and earn rewards with the lowest fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/swap"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
              >
                Start Trading
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pool"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all border border-slate-700"
              >
                Provide Liquidity
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="text-gray-400 text-sm mb-2">{stat.label}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-green-400 text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Sente?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of decentralized trading with features designed for both beginners and professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-800/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                  <div className="text-6xl font-bold text-blue-600/30 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-3xl p-12 md:p-16 border border-slate-700/50">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of traders who trust Sente for fast, secure, and efficient token swaps
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/swap"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
                >
                  Launch App
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all border border-slate-700"
                >
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Sente offers the best trading experience I've had on any DEX. Fast, reliable, and with great liquidity.",
                author: "Alex Chen",
                role: "DeFi Trader"
              },
              {
                quote: "As a liquidity provider, I appreciate the transparent fee structure and consistent returns. Highly recommended!",
                author: "Sarah Miller",
                role: "LP Provider"
              },
              {
                quote: "The governance system is truly community-driven. It's great to have a voice in the protocol's future.",
                author: "Marcus Johnson",
                role: "SENTE Holder"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="text-white font-bold">{testimonial.author}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Start earning with Sente today
              </h3>
              <p className="text-purple-100">
                Trade, provide liquidity, and participate in governance
              </p>
            </div>
            <Link
              href="/swap"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg whitespace-nowrap"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}