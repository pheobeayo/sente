'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDownUp,
  Settings,
  Info,
  ChevronDown,
  AlertCircle,
  Loader2,
  TrendingDown,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksSwap } from '@/hooks/useStacksSwap';
import { TOKENS } from '@/constants/Tokens';
import toast from 'react-hot-toast';

export default function SwapInterface() {
  const { stxAddress, isConnected, balance: walletBalance } = useStacksWallet();
  const {
    isSwapping,
    error: swapError,
    txId,
    getQuote,
    executeSwap,
    calculateMinOutput,
    resetSwapState,
    checkPoolExists
  } = useStacksSwap();

  // State
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromBalance, setFromBalance] = useState('0');
  const [toBalance, setToBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showFromTokenList, setShowFromTokenList] = useState(false);
  const [showToTokenList, setShowToTokenList] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [poolExists, setPoolExists] = useState<boolean | null>(null);
  const [isCheckingPool, setIsCheckingPool] = useState(false);

  // Check if pool exists when tokens change
  useEffect(() => {
    const checkPool = async () => {
      if (!fromToken || !toToken || !stxAddress || fromToken.symbol === toToken.symbol) {
        setPoolExists(null);
        return;
      }

      setIsCheckingPool(true);
      try {
        const exists = await checkPoolExists(fromToken.address, toToken.address);
        setPoolExists(exists);
        
        if (!exists) {
          setToAmount('');
          setPriceImpact(0);
        }
      } catch (error) {
        console.error('Error checking pool:', error);
        setPoolExists(false);
      } finally {
        setIsCheckingPool(false);
      }
    };

    if (isConnected && stxAddress) {
      checkPool();
    }
  }, [fromToken, toToken, stxAddress, isConnected, checkPoolExists]);

  // Load balances when tokens or wallet changes
  const loadBalances = useCallback(async () => {
    if (!fromToken || !toToken || !stxAddress) return;

    setIsLoadingBalances(true);
    try {
      if (fromToken.symbol === 'STX') {
        setFromBalance(walletBalance);
      } else {
        setFromBalance('0');
      }

      if (toToken.symbol === 'STX') {
        setToBalance(walletBalance);
      } else {
        setToBalance('0');
      }
    } catch (error) {
      console.error('Error loading balances:', error);
      setFromBalance('0');
      setToBalance('0');
    } finally {
      setIsLoadingBalances(false);
    }
  }, [fromToken, toToken, stxAddress, walletBalance]);

  useEffect(() => {
    if (isConnected && stxAddress) {
      loadBalances();
    }
  }, [isConnected, stxAddress, loadBalances]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetSwapState();
    };
  }, [resetSwapState]);

  // Get quote when fromAmount changes
  const handleFromAmountChange = useCallback(async (value: string) => {
    setFromAmount(value);

    if (!value || parseFloat(value) <= 0) {
      setToAmount('');
      setPriceImpact(0);
      return;
    }

    if (!stxAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Don't try to get quote if pool doesn't exist
    if (poolExists === false) {
      setToAmount('');
      setPriceImpact(0);
      return;
    }

    setIsLoadingQuote(true);
    try {
      const quote = await getQuote(
        fromToken.address,
        toToken.address,
        parseFloat(value) * 1000000
      );

      if (quote) {
        setToAmount((quote.amountOut / 1000000).toFixed(6));
        setPriceImpact(quote.priceImpact);
      }
    } catch (error: any) {
      console.error('Error getting quote:', error);
      const errorMsg = error.message || 'Failed to get quote';
      
      // Show user-friendly error
      if (errorMsg.includes('does not exist')) {
        toast.error('Pool does not exist. Create it first!');
      } else if (errorMsg.includes('no liquidity')) {
        toast.error('Pool has no liquidity. Add liquidity first!');
      } else {
        toast.error('Failed to get quote');
      }
      
      setToAmount('');
      setPriceImpact(0);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [fromToken, toToken, stxAddress, getQuote, poolExists]);

  // Handle swap button click
  const handleSwap = async () => {
    if (!canSwap) return;

    if (!isConnected || !stxAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (poolExists === false) {
      toast.error('Pool does not exist. Create it first!');
      return;
    }

    const minAmountOut = calculateMinOutput(
      parseFloat(toAmount) * 1000000,
      slippage
    );

    try {
      await executeSwap(
        fromToken.address,
        toToken.address,
        Math.floor(parseFloat(fromAmount) * 1000000),
        Math.floor(minAmountOut)
      );

      if (txId) {
        setFromAmount('');
        setToAmount('');
        loadBalances();
      }
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  // Swap from and to tokens
  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromBalance(toBalance);
    setToBalance(fromBalance);
  };

  // Select token
  const handleSelectFromToken = (token: typeof TOKENS[0]) => {
    if (token.symbol === toToken.symbol) {
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromTokenList(false);
    setFromAmount('');
    setToAmount('');
  };

  const handleSelectToToken = (token: typeof TOKENS[0]) => {
    if (token.symbol === fromToken.symbol) {
      setFromToken(toToken);
    }
    setToToken(token);
    setShowToTokenList(false);
    setFromAmount('');
    setToAmount('');
  };

  // Check if swap is possible
  const canSwap = Boolean(
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    parseFloat(fromAmount) <= parseFloat(fromBalance) &&
    toAmount &&
    parseFloat(toAmount) > 0 &&
    !isSwapping &&
    !isLoadingQuote &&
    isConnected &&
    poolExists === true
  );

  const insufficientBalance = Boolean(fromAmount && parseFloat(fromAmount) > parseFloat(fromBalance));

  if (!isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-gray-400">Please connect your wallet to start swapping tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Swap</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Slippage Tolerance</span>
            <span className="text-white font-medium">{slippage}%</span>
          </div>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0, 3.0].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  slippage === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pool Status Warning */}
      {poolExists === false && !isCheckingPool && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 font-medium">Pool Doesn't Exist</p>
              <p className="text-yellow-300 text-sm mt-1">
                The {fromToken.symbol}/{toToken.symbol} pool hasn't been created yet.
              </p>
              <Link
                href="/pool"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Pool
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {swapError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Transaction Failed</p>
            <p className="text-red-300 text-sm mt-1">{swapError}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {txId && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-400 font-medium">Swap Successful!</p>
          <p className="text-green-300 text-sm mt-1 break-all">TX: {txId}</p>
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 text-sm mt-2 inline-block"
          >
            View on Explorer →
          </a>
        </div>
      )}

      {/* From Token */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">From</span>
          <span className="text-gray-400 text-sm">
            Balance: {isLoadingBalances ? '...' : parseFloat(fromBalance).toFixed(4)}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFromTokenList(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <div className="w-6 h-6 relative">
                <Image 
                  src={fromToken.icon} 
                  alt={fromToken.symbol} 
                  width={24} 
                  height={24} 
                  className="rounded-full"
                  priority
                />
              </div>
              <span className="text-white font-bold">{fromToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.0"
              disabled={isSwapping || poolExists === false}
              className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-600 disabled:opacity-50"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-sm">
              ${fromAmount ? (parseFloat(fromAmount) * 0.85).toFixed(2) : '0.00'}
            </span>
            {!isLoadingBalances && parseFloat(fromBalance) > 0 && (
              <button
                onClick={() => handleFromAmountChange(fromBalance)}
                disabled={poolExists === false}
                className="text-blue-400 text-sm hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                MAX
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleSwitchTokens}
          disabled={isSwapping}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50"
        >
          <ArrowDownUp className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* To Token */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">To</span>
          <span className="text-gray-400 text-sm">
            Balance: {isLoadingBalances ? '...' : parseFloat(toBalance).toFixed(4)}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowToTokenList(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <div className="w-6 h-6 relative">
                <Image 
                  src={toToken.icon} 
                  alt={toToken.symbol} 
                  width={24} 
                  height={24} 
                  className="rounded-full"
                  priority
                />
              </div>
              <span className="text-white font-bold">{toToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex-1 text-right">
              {isLoadingQuote || isCheckingPool ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin ml-auto" />
              ) : (
                <div className="text-white text-2xl font-bold">
                  {toAmount || '0.0'}
                </div>
              )}
            </div>
          </div>
          <div className="text-right mt-2">
            <span className="text-gray-400 text-sm">
              ${toAmount ? (parseFloat(toAmount) * 1.0).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Info */}
      {fromAmount && toAmount && !isLoadingQuote && poolExists && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Rate</span>
            <span className="text-white font-medium">
              1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Price Impact</span>
            <span className={`font-medium flex items-center gap-1 ${
              priceImpact > 5 ? 'text-red-400' : priceImpact > 2 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {priceImpact > 2 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Minimum Received</span>
            <span className="text-white font-medium">
              {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Network Fee</span>
            <span className="text-white font-medium">~0.2 STX</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!canSwap || insufficientBalance || poolExists === false}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all"
      >
        {poolExists === false ? 'Pool Does Not Exist' :
          insufficientBalance ? 'Insufficient Balance' :
          !fromAmount ? 'Enter an amount' :
          isSwapping ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Swapping...
            </span>
          ) : 'Swap'}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-300 text-xs">
          Swaps are executed on-chain. Make sure you have enough STX for network fees.
        </p>
      </div>

      {/* Token Selection Modals */}
      {showFromTokenList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Select Token</h3>
              <button
                onClick={() => setShowFromTokenList(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {TOKENS.map((token) => (
                <button
                  key={token.symbol + token.address}
                  onClick={() => handleSelectFromToken(token)}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <div className="w-10 h-10 relative">
                    <Image 
                      src={token.icon} 
                      alt={token.symbol} 
                      width={40} 
                      height={40} 
                      className="rounded-full"
                      priority
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold">{token.symbol}</div>
                    <div className="text-gray-400 text-sm">{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showToTokenList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Select Token</h3>
              <button
                onClick={() => setShowToTokenList(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {TOKENS.map((token) => (
                <button
                  key={token.symbol + token.address}
                  onClick={() => handleSelectToToken(token)}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <div className="w-10 h-10 relative">
                    <Image 
                      src={token.icon} 
                      alt={token.symbol} 
                      width={40} 
                      height={40} 
                      className="rounded-full"
                      priority
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold">{token.symbol}</div>
                    <div className="text-gray-400 text-sm">{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}