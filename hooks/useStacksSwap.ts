'use client';

import { useState, useCallback } from 'react';
import { useStacksWallet } from './useStacksWallet';
import { stacksDexContract } from '@/lib/contract';
import toast from 'react-hot-toast';

interface SwapState {
  isSwapping: boolean;
  error: string | null;
  txId: string | null;
}

interface SwapQuote {
  amountOut: number;
  priceImpact: number;
  fee: number;
}

export function useStacksSwap() {
  const { stxAddress, isConnected } = useStacksWallet();
  const [swapState, setSwapState] = useState<SwapState>({
    isSwapping: false,
    error: null,
    txId: null,
  });

  /**
   * Check if pool exists before getting quote
   */
  const checkPoolExists = useCallback(
    async (tokenIn: string, tokenOut: string): Promise<boolean> => {
      if (!stxAddress) return false;

      try {
        const poolData = await stacksDexContract.getPoolInfo(tokenIn, tokenOut, stxAddress);
        
        if (!poolData) {
          console.log('Pool does not exist');
          return false;
        }

        const poolInfo = poolData.value || poolData;
        const reserveX = Number(poolInfo['reserve-x'] || poolInfo.reserveX || 0);
        const reserveY = Number(poolInfo['reserve-y'] || poolInfo.reserveY || 0);

        return reserveX > 0 && reserveY > 0;
      } catch (error) {
        console.error('Error checking pool:', error);
        return false;
      }
    },
    [stxAddress]
  );

  /**
   * Get swap quote with better error handling
   */
  const getQuote = useCallback(
    async (tokenIn: string, tokenOut: string, amountIn: number): Promise<SwapQuote | null> => {
      if (!stxAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        console.log('Getting quote for:', { tokenIn, tokenOut, amountIn, stxAddress });
        
        // First check if pool exists
        const poolExists = await checkPoolExists(tokenIn, tokenOut);
        
        if (!poolExists) {
          throw new Error('Pool does not exist or has no liquidity. Please create the pool first or add liquidity.');
        }

        // Get pool information
        const poolData = await stacksDexContract.getPoolInfo(tokenIn, tokenOut, stxAddress);
        
        if (!poolData) {
          throw new Error('Unable to fetch pool data. Please try again.');
        }

        // Handle different response structures
        const poolInfo = poolData.value || poolData;
        
        const reserveX = Number(poolInfo['reserve-x'] || poolInfo.reserveX || 0);
        const reserveY = Number(poolInfo['reserve-y'] || poolInfo.reserveY || 0);

        console.log('Pool reserves:', { reserveX, reserveY });

        if (reserveX === 0 || reserveY === 0) {
          throw new Error('Pool has no liquidity. Please add liquidity first to enable swaps.');
        }

        // Calculate output using the contract's constant product formula
        const amountOut = await stacksDexContract.getSwapOutput(
          amountIn,
          reserveX,
          reserveY,
          stxAddress
        );
        
        console.log('Swap output received:', amountOut);
        
        // Parse the response
        let outputAmount = 0;
        
        if (typeof amountOut === 'number') {
          outputAmount = amountOut;
        } else if (typeof amountOut === 'object' && amountOut !== null) {
          outputAmount = Number(amountOut.value || amountOut.amount || amountOut);
        } else {
          outputAmount = Number(amountOut);
        }
        
        console.log('Parsed output amount:', outputAmount);
        
        if (isNaN(outputAmount) || outputAmount <= 0) {
          throw new Error('Unable to calculate swap output. Please try again.');
        }
        
        // Calculate price impact
        const spotPrice = reserveY / reserveX;
        const effectivePrice = outputAmount / amountIn;
        const priceImpact = Math.abs((spotPrice - effectivePrice) / spotPrice) * 100;
        
        const quote = {
          amountOut: outputAmount,
          priceImpact: Math.min(priceImpact, 100),
          fee: 0.003, 
        };

        console.log('Final quote:', quote);
        
        return quote;
      } catch (error: any) {
        console.error('Error getting quote:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Pool does not exist')) {
          throw new Error('This trading pair does not exist yet. Go to the Pool page to create it.');
        } else if (error.message.includes('no liquidity')) {
          throw new Error('This pool has no liquidity. Add liquidity first to enable trading.');
        } else {
          throw error;
        }
      }
    },
    [stxAddress, checkPoolExists]
  );

  /**
   * Execute token swap
   */
  const executeSwap = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: number,
      minAmountOut: number
    ) => {
      if (!stxAddress || !isConnected) {
        setSwapState({
          isSwapping: false,
          error: 'Please connect your wallet first',
          txId: null,
        });
        toast.error('Please connect your wallet first');
        return;
      }

      setSwapState({
        isSwapping: true,
        error: null,
        txId: null,
      });

      try {
        // Check pool exists before swapping
        const poolExists = await checkPoolExists(tokenIn, tokenOut);
        
        if (!poolExists) {
          throw new Error('Pool does not exist or has no liquidity. Cannot execute swap.');
        }

        await stacksDexContract.swapTokens(
          tokenIn,
          tokenOut,
          amountIn,
          minAmountOut,
          stxAddress,
          (data) => {
            console.log('Swap transaction broadcast:', data);
            setSwapState({
              isSwapping: false,
              error: null,
              txId: data.txId,
            });
            toast.success('Swap successful!');
          },
          () => {
            console.log('Swap cancelled by user');
            setSwapState({
              isSwapping: false,
              error: null,
              txId: null,
            });
            toast('Swap cancelled');
          }
        );
      } catch (error: any) {
        console.error('Swap failed:', error);
        const errorMessage = error.message || 'Swap failed';
        setSwapState({
          isSwapping: false,
          error: errorMessage,
          txId: null,
        });
        toast.error(errorMessage);
        throw error;
      }
    },
    [stxAddress, isConnected, checkPoolExists]
  );

  /**
   * Calculate price impact
   */
  const calculatePriceImpact = useCallback(
    (amountIn: number, amountOut: number, reserveIn: number, reserveOut: number): number => {
      if (reserveIn === 0 || reserveOut === 0) return 0;

      const spotPrice = reserveOut / reserveIn;
      const effectivePrice = amountOut / amountIn;
      const priceImpact = ((spotPrice - effectivePrice) / spotPrice) * 100;

      return Math.abs(priceImpact);
    },
    []
  );

  /**
   * Calculate minimum output with slippage
   */
  const calculateMinOutput = useCallback(
    (amountOut: number, slippageTolerance: number): number => {
      return Math.floor(amountOut * (1 - slippageTolerance / 100));
    },
    []
  );

  /**
   * Get transaction status
   */
  const getTransactionStatus = useCallback(
    async (txId: string) => {
      try {
        return await stacksDexContract.getTransactionStatus(txId);
      } catch (error) {
        console.error('Error fetching transaction status:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Reset swap state
   */
  const resetSwapState = useCallback(() => {
    setSwapState({
      isSwapping: false,
      error: null,
      txId: null,
    });
  }, []);

  return {
    ...swapState,
    getQuote,
    executeSwap,
    calculatePriceImpact,
    calculateMinOutput,
    getTransactionStatus,
    resetSwapState,
    checkPoolExists,
  };
}