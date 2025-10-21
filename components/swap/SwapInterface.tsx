'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDown, Settings, ChevronDown, AlertCircle } from 'lucide-react';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksSwap } from '@/hooks/useStacksSwap';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  address: string;
}

const defaultTokens: Token[] = [
  { symbol: 'STX', name: 'Stacks', balance: 0, price: 0.85, address: 'STX' },
  { symbol: 'USDC', name: 'USD Coin', balance: 0, price: 1, address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-usdc' },
];

export default function SwapInterface() {
  const { isConnected, stxAddress, connectWallet, getBalance } = useStacksWallet();
  const { 
    isSwapping, 
    error: swapError, 
    txId,
    getQuote, 
    executeSwap, 
    calculatePriceImpact,
    calculateMinOutput,
    resetSwapState 
  } = useStacksSwap();

  const [fromToken, setFromToken] = useState<Token>(defaultTokens[0]);
  const [toToken, setToToken] = useState<Token>(defaultTokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);

  // Load balances when connected
  useEffect(() => {
    if (isConnected && stxAddress) {
      loadBalances();
    }
  }, [isConnected, stxAddress]);

  const loadBalances = async () => {
    if (!stxAddress) return;
    
    try {
      const balance = await getBalance(stxAddress);
      // Update STX balance
      setFromToken(prev => ({ ...prev, balance: parseFloat(balance) / 1000000 }));
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    
    if (!value || isNaN(parseFloat(value)) || !isConnected) {
      setToAmount('');
      return;
    }

    setQuoteLoading(true);
    try {
      const quote = await getQuote(
        fromToken.address,
        toToken.address,
        parseFloat(value)
      );
      
      setToAmount(quote.amountOut.toString());
      
      // Calculate price impact
      const impact = calculatePriceImpact(
        parseFloat(value),
        quote.amountOut,
        quote.reserveIn,
        quote.reserveOut
      );
      setPriceImpact(impact);
    } catch (error) {
      console.error('Error getting quote:', error);
      setToAmount('');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = toToken.price / fromToken.price;
      setFromAmount((parseFloat(value) / rate).toFixed(6));
    } else {
      setFromAmount('');
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    handleFromAmountChange(fromToken.balance.toString());
  };

  const handleSwap = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!fromAmount || !toAmount) return;

    const minOut = calculateMinOutput(parseFloat(toAmount), slippage);

    try {
      await executeSwap(
        fromToken.address,
        toToken.address,
        parseFloat(fromAmount),
        minOut
      );
      
      // Reset form on success
      if (txId) {
        setFromAmount('');
        setToAmount('');
        setTimeout(() => loadBalances(), 3000);
      }
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const hasBalance = !fromAmount || parseFloat(fromAmount) <= fromToken.balance;
  const canSwap = isConnected && fromAmount && toAmount && hasBalance && !isSwapping;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Swap</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Error Display */}
      {swapError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Swap Failed</p>
            <p className="text-red-300 text-sm mt-1">{swapError}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {txId && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-400 font-medium">Swap Successful!</p>
          <p className="text-green-300 text-sm mt-1">Transaction ID: {txId}</p>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-medium mb-3">Slippage Tolerance</h3>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  slippage === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* From Token Input */}
      <div className="bg-white/5 rounded-2xl p-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">From</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">
              Balance: {isConnected ? fromToken.balance.toFixed(4) : '0.0'} {fromToken.symbol}
            </span>
            <button
              onClick={handleMaxClick}
              disabled={!isConnected}
              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded transition-all disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
            <span className="text-white font-bold">{fromToken.symbol}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            placeholder="0.0"
            disabled={isSwapping}
            className="flex-1 bg-transparent text-white text-3xl font-bold focus:outline-none text-right disabled:opacity-50"
          />
        </div>
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <div className="text-right text-gray-400 text-sm mt-2">
            ≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}
          </div>
        )}
      </div>

      {/* Switch Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={switchTokens}
          disabled={isSwapping}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg disabled:opacity-50"
        >
          <ArrowDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* To Token Input */}
      <div className="bg-white/5 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">To</span>
          <span className="text-gray-400 text-sm">
            Balance: {isConnected ? toToken.balance.toFixed(4) : '0.0'} {toToken.symbol}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
            <span className="text-white font-bold">{toToken.symbol}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <input
            type="number"
            value={toAmount}
            readOnly
            placeholder={quoteLoading ? 'Loading...' : '0.0'}
            className="flex-1 bg-transparent text-white text-3xl font-bold focus:outline-none text-right"
          />
        </div>
        {toAmount && parseFloat(toAmount) > 0 && (
          <div className="text-right text-gray-400 text-sm mt-2">
            ≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)}
          </div>
        )}
      </div>

      {/* Swap Details */}
      {fromAmount && toAmount && isConnected && (
        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Rate</span>
            <span className="text-white">
              1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Price Impact</span>
            <span className={priceImpact > 5 ? 'text-red-400' : 'text-green-400'}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Trading Fee (0.3%)</span>
            <span className="text-white">
              {(parseFloat(fromAmount) * 0.003).toFixed(4)} {fromToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Minimum Received</span>
            <span className="text-white">
              {calculateMinOutput(parseFloat(toAmount), slippage).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Slippage Tolerance</span>
            <span className="text-white">{slippage}%</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button 
        onClick={handleSwap}
        disabled={isSwapping || (isConnected && (!fromAmount || !toAmount || !hasBalance))}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
          !isConnected 
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : !fromAmount || !toAmount
            ? 'bg-gray-600 text-white cursor-not-allowed opacity-50'
            : !hasBalance
            ? 'bg-gray-600 text-white cursor-not-allowed opacity-50'
            : isSwapping
            ? 'bg-gray-600 text-white cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
        }`}
      >
        {!isConnected ? (
          'Connect Wallet'
        ) : isSwapping ? (
          'Swapping...'
        ) : !fromAmount || !toAmount ? (
          'Enter Amount'
        ) : !hasBalance ? (
          'Insufficient Balance'
        ) : (
          'Swap'
        )}
      </button>
    </div>
  );
}