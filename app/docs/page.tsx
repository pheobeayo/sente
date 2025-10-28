'use client';

import React, { useState } from 'react';
import { Book, Code, Zap, Shield, TrendingUp, ArrowRight, Search, ChevronRight, ExternalLink } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: {
    title: string;
    description: string;
    link: string;
  }[];
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Book className="w-6 h-6" />,
    description: 'Learn the basics of using Sente',
    articles: [
      {
        title: 'Introduction to Sente',
        description: 'Overview of the protocol and its features',
        link: '#intro'
      },
      {
        title: 'Connecting Your Wallet',
        description: 'Step-by-step guide to connect MetaMask and other wallets',
        link: '#wallet'
      },
      {
        title: 'Your First Swap',
        description: 'Complete your first token swap in minutes',
        link: '#first-swap'
      },
      {
        title: 'Understanding Gas Fees',
        description: 'Learn about transaction costs and optimization',
        link: '#gas-fees'
      }
    ]
  },
  {
    id: 'trading',
    title: 'Trading',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Master token swapping and trading strategies',
    articles: [
      {
        title: 'How to Swap Tokens',
        description: 'Detailed guide on executing token swaps',
        link: '#swap'
      },
      {
        title: 'Slippage Tolerance',
        description: 'Understanding and setting slippage parameters',
        link: '#slippage'
      },
      {
        title: 'Price Impact',
        description: 'How large trades affect token prices',
        link: '#price-impact'
      },
      {
        title: 'Trading Tips & Best Practices',
        description: 'Optimize your trading experience',
        link: '#tips'
      }
    ]
  },
  {
    id: 'liquidity',
    title: 'Liquidity Provision',
    icon: <Zap className="w-6 h-6" />,
    description: 'Earn fees by providing liquidity',
    articles: [
      {
        title: 'What is Liquidity Provision?',
        description: 'Understanding liquidity pools and LP tokens',
        link: '#lp-intro'
      },
      {
        title: 'Adding Liquidity',
        description: 'Step-by-step guide to become a liquidity provider',
        link: '#add-liquidity'
      },
      {
        title: 'Removing Liquidity',
        description: 'How to withdraw your liquidity and earnings',
        link: '#remove-liquidity'
      },
      {
        title: 'Impermanent Loss Explained',
        description: 'Understanding risks in liquidity provision',
        link: '#impermanent-loss'
      },
      {
        title: 'Earning Trading Fees',
        description: 'How liquidity providers earn passive income',
        link: '#earning-fees'
      }
    ]
  },
  {
    id: 'governance',
    title: 'Governance',
    icon: <Shield className="w-6 h-6" />,
    description: 'Participate in protocol decisions',
    articles: [
      {
        title: 'Governance Overview',
        description: 'How Sente governance works',
        link: '#gov-overview'
      },
      {
        title: 'Voting on Proposals',
        description: 'Cast your vote and influence the protocol',
        link: '#voting'
      },
      {
        title: 'Creating Proposals',
        description: 'Submit proposals for community consideration',
        link: '#create-proposal'
      },
      {
        title: 'SENTE Token Utility',
        description: 'Understanding governance token benefits',
        link: '#token-utility'
      }
    ]
  },
  {
    id: 'developers',
    title: 'For Developers',
    icon: <Code className="w-6 h-6" />,
    description: 'Integrate Sente into your dApp',
    articles: [
      {
        title: 'Smart Contract Architecture',
        description: 'Deep dive into protocol contracts',
        link: '#architecture'
      },
      {
        title: 'SDK Documentation',
        description: 'Use our JavaScript/TypeScript SDK',
        link: '#sdk'
      },
      {
        title: 'API Reference',
        description: 'RESTful and GraphQL API endpoints',
        link: '#api'
      },
      {
        title: 'Integration Guide',
        description: 'Integrate Sente into your application',
        link: '#integration'
      },
      {
        title: 'Security Best Practices',
        description: 'Build secure integrations',
        link: '#security'
      }
    ]
  }
];

const quickLinks = [
  { title: 'Smart Contract Addresses', link: '#contracts', icon: <Code className="w-5 h-5" /> },
  { title: 'Audit Reports', link: '#audits', icon: <Shield className="w-5 h-5" /> },
  { title: 'FAQ', link: '#faq', icon: <Book className="w-5 h-5" /> },
  { title: 'Community Discord', link: '#discord', icon: <ExternalLink className="w-5 h-5" /> },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-gray-300 mb-8">Everything you need to know about Sente</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.link}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-blue-400 group-hover:text-purple-300 transition-colors">
                    {link.icon}
                  </div>
                  <span className="text-white font-medium">{link.title}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </div>
            </a>
          ))}
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${
                      selectedSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{section.title}</h2>
                    <p className="text-gray-400">{section.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {section.articles.map((article, index) => (
                    <a
                      key={index}
                      href={article.link}
                      className="block p-4 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-400">{article.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Need More Help?</h2>
            <p className="text-gray-300 mb-6">
              Can`&apos`t find what you`&apos`re looking for? Our community is here to help
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all">
                Join Discord
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all border border-white/20">
                Contact Support
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all border border-white/20">
                View Tutorials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}