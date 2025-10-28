'use client';

import React, { useState } from 'react';
import { ChevronRight, TrendingUp, Clock, CheckCircle2, XCircle, Users, Vote } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endDate: string;
  proposer: string;
  category: string;
}

type FilterType = 'all' | 'active' | 'passed' | 'rejected';

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Reduce Trading Fees to 0.25%',
    description: 'Proposal to reduce trading fees from 0.3% to 0.25% to increase trading volume and competitiveness.',
    status: 'active',
    votesFor: 1250000,
    votesAgainst: 450000,
    totalVotes: 1700000,
    endDate: '2025-10-25',
    proposer: '0x742d...4f2a',
    category: 'Fee Structure'
  },
  {
    id: '2',
    title: 'Add USDT/USDC Liquidity Pool',
    description: 'Create a new liquidity pool for USDT/USDC pair with optimized parameters for stablecoin trading.',
    status: 'active',
    votesFor: 890000,
    votesAgainst: 310000,
    totalVotes: 1200000,
    endDate: '2025-10-22',
    proposer: '0x8b3c...9d1e',
    category: 'Pool Management'
  },
  {
    id: '3',
    title: 'Increase Liquidity Mining Rewards',
    description: 'Boost liquidity mining rewards by 20% for the next quarter to incentivize more liquidity providers.',
    status: 'passed',
    votesFor: 2100000,
    votesAgainst: 600000,
    totalVotes: 2700000,
    endDate: '2025-10-15',
    proposer: '0x1a2b...5c6d',
    category: 'Rewards'
  },
  {
    id: '4',
    title: 'Implement Multi-Chain Support',
    description: 'Expand Sente to Polygon and Arbitrum networks to reduce gas fees and increase accessibility.',
    status: 'rejected',
    votesFor: 800000,
    votesAgainst: 1500000,
    totalVotes: 2300000,
    endDate: '2025-10-10',
    proposer: '0x9f8e...2b3c',
    category: 'Infrastructure'
  }
];

export default function VotePage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [votingPower] = useState(25000);

  const filteredProposals = mockProposals.filter(p => 
    filter === 'all' ? true : p.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'passed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'passed': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Vote className="w-4 h-4" />;
    }
  };

  const filterOptions: FilterType[] = ['all', 'active', 'passed', 'rejected'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Governance</h1>
          <p className="text-xl text-gray-300">Shape the future of Sente through community voting</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Your Voting Power</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{votingPower.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">SENTE tokens</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Proposals</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {mockProposals.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-green-400 mt-1">Vote now</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Proposals</span>
              <Vote className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-white">{mockProposals.length}</p>
            <p className="text-sm text-gray-400 mt-1">All time</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Participation Rate</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">68%</p>
            <p className="text-sm text-green-400 mt-1">+5% this month</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {filteredProposals.map((proposal) => {
            const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100;
            const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100;

            return (
              <div
                key={proposal.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{proposal.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        {proposal.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{proposal.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Ends: {new Date(proposal.endDate).toLocaleDateString()}
                      </span>
                      <span>Category: {proposal.category}</span>
                      <span>By: {proposal.proposer}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>

                {/* Voting Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400 font-medium">For: {proposal.votesFor.toLocaleString()}</span>
                    <span className="text-gray-400">{forPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all"
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-400 font-medium">Against: {proposal.votesAgainst.toLocaleString()}</span>
                    <span className="text-gray-400">{againstPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-full transition-all"
                      style={{ width: `${againstPercentage}%` }}
                    />
                  </div>
                </div>

                {proposal.status === 'active' && (
                  <div className="flex gap-4 mt-6">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                      Vote For
                    </button>
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                      Vote Against
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Proposal Button */}
        <div className="mt-12 text-center">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg">
            Create New Proposal
          </button>
        </div>
      </div>
    </div>
  );
}