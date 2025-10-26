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
   * Get swap quote using real contract functions
   */
  const getQuote = useCallback(
    async (tokenIn: string, tokenOut: string, amountIn: number): Promise<SwapQuote | null> => {
      if (!stxAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        // Get pool information
        const poolData = await stacksDexContract.getPoolInfo(tokenIn, tokenOut, stxAddress);
        
        if (!poolData || !poolData.value) {
          throw new Error('Pool not found');
        }

        // Extract reserves - check multiple possible property names
        const reserveX = Number(
          poolData.value['reserve-x'] || 
          poolData.value.reserveX || 
          poolData.value['reserveA'] ||
          0
        );
        
        const reserveY = Number(
          poolData.value['reserve-y'] || 
          poolData.value.reserveY || 
          poolData.value['reserveB'] ||
          0
        );

        if (reserveX === 0 || reserveY === 0) {
          throw new Error('Pool has no liquidity');
        }

        // Calculate output using the contract's constant product formula
        const amountOut = await stacksDexContract.getSwapOutput(
          amountIn,
          reserveX,
          reserveY,
          stxAddress
        );
        
        // Parse the response
        const outputAmount = Number(
          typeof amountOut === 'object' && amountOut !== null 
            ? (amountOut.value || amountOut)
            : amountOut
        );
        
        // Calculate price impact
        const spotPrice = reserveY / reserveX;
        const effectivePrice = outputAmount / amountIn;
        const priceImpact = Math.abs((spotPrice - effectivePrice) / spotPrice) * 100;
        
        return {
          amountOut: outputAmount,
          priceImpact: Math.min(priceImpact, 100), // Cap at 100%
          fee: 0.003, 
        };
      } catch (error: any) {
        console.error('Error getting quote:', error);
        throw error;
      }
    },
    [stxAddress]
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
    [stxAddress, isConnected]
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
  };
}