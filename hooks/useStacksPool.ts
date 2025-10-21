'use client';

import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { stacksDexContract } from '@/lib/contract';
import { useStacksWallet } from './useStacksWallet';

interface PoolState {
  isLoading: boolean;
  error: string | null;
  txId: string | null;
}

export function useStacksPool() {
  const { stxAddress, isConnected, userSession } = useStacksWallet();
  const [poolState, setPoolState] = useState<PoolState>({
    isLoading: false,
    error: null,
    txId: null,
  });

  /**
   * Get pool information
   */
  const getPoolInfo = useCallback(
    async (token0: string, token1: string) => {
      if (!stxAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const poolInfo = await stacksDexContract.getPoolInfo(
          token0,
          token1,
          stxAddress
        );
        return poolInfo;
      } catch (error: any) {
        console.error('Error getting pool info:', error);
        throw error;
      }
    },
    [stxAddress]
  );

  /**
   * Get user's liquidity in pool
   */
  const getUserLiquidity = useCallback(
    async (token0: string, token1: string) => {
      if (!stxAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const liquidity = await stacksDexContract.getUserLiquidity(
          token0,
          token1,
          stxAddress
        );
        return liquidity;
      } catch (error: any) {
        console.error('Error getting user liquidity:', error);
        throw error;
      }
    },
    [stxAddress]
  );

  /**
   * Add liquidity to pool
   */
  const addLiquidity = useCallback(
    async (
      token0: string,
      token1: string,
      amount0: number,
      amount1: number,
      minLiquidity: number
    ) => {
      if (!stxAddress || !isConnected) {
        setPoolState({
          isLoading: false,
          error: 'Please connect your wallet first',
          txId: null,
        });
        return;
      }

      setPoolState({
        isLoading: true,
        error: null,
        txId: null,
      });

      try {
        const txOptions = await stacksDexContract.addLiquidity(
          token0,
          token1,
          amount0,
          amount1,
          minLiquidity,
          stxAddress
        );

        await openContractCall({
          ...txOptions,
          onFinish: (data) => {
            console.log('Add liquidity transaction broadcast:', data);
            setPoolState({
              isLoading: false,
              error: null,
              txId: data.txId,
            });
          },
          onCancel: () => {
            console.log('Add liquidity cancelled by user');
            setPoolState({
              isLoading: false,
              error: 'Transaction cancelled',
              txId: null,
            });
          },
        });
      } catch (error: any) {
        console.error('Add liquidity failed:', error);
        setPoolState({
          isLoading: false,
          error: error.message || 'Add liquidity failed',
          txId: null,
        });
        throw error;
      }
    },
    [stxAddress, isConnected]
  );

  /**
   * Remove liquidity from pool
   */
  const removeLiquidity = useCallback(
    async (
      token0: string,
      token1: string,
      liquidity: number,
      minAmount0: number,
      minAmount1: number
    ) => {
      if (!stxAddress || !isConnected) {
        setPoolState({
          isLoading: false,
          error: 'Please connect your wallet first',
          txId: null,
        });
        return;
      }

      setPoolState({
        isLoading: true,
        error: null,
        txId: null,
      });

      try {
        const txOptions = await stacksDexContract.removeLiquidity(
          token0,
          token1,
          liquidity,
          minAmount0,
          minAmount1,
          stxAddress
        );

        await openContractCall({
          ...txOptions,
          onFinish: (data) => {
            console.log('Remove liquidity transaction broadcast:', data);
            setPoolState({
              isLoading: false,
              error: null,
              txId: data.txId,
            });
          },
          onCancel: () => {
            console.log('Remove liquidity cancelled by user');
            setPoolState({
              isLoading: false,
              error: 'Transaction cancelled',
              txId: null,
            });
          },
        });
      } catch (error: any) {
        console.error('Remove liquidity failed:', error);
        setPoolState({
          isLoading: false,
          error: error.message || 'Remove liquidity failed',
          txId: null,
        });
        throw error;
      }
    },
    [stxAddress, isConnected]
  );

  /**
   * Calculate LP tokens to receive
   */
  const calculateLPTokens = useCallback(
    (
      amount0: number,
      amount1: number,
      reserve0: number,
      reserve1: number,
      totalSupply: number
    ) => {
      if (totalSupply === 0) {
        // First liquidity provision
        return Math.sqrt(amount0 * amount1);
      }

      // Subsequent liquidity provisions
      const liquidity0 = (amount0 * totalSupply) / reserve0;
      const liquidity1 = (amount1 * totalSupply) / reserve1;
      return Math.min(liquidity0, liquidity1);
    },
    []
  );

  /**
   * Calculate tokens to receive when removing liquidity
   */
  const calculateTokensFromLP = useCallback(
    (
      lpTokens: number,
      reserve0: number,
      reserve1: number,
      totalSupply: number
    ) => {
      const amount0 = (lpTokens * reserve0) / totalSupply;
      const amount1 = (lpTokens * reserve1) / totalSupply;
      return { amount0, amount1 };
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
   * Reset pool state
   */
  const resetPoolState = useCallback(() => {
    setPoolState({
      isLoading: false,
      error: null,
      txId: null,
    });
  }, []);

  return {
    ...poolState,
    getPoolInfo,
    getUserLiquidity,
    addLiquidity,
    removeLiquidity,
    calculateLPTokens,
    calculateTokensFromLP,
    getTransactionStatus,
    resetPoolState,
  };
}