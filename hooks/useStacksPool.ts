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

interface PoolInfo {
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  token0: string;
  token1: string;
}

interface UserLiquidity {
  lpTokens: number;
  share: number;
  token0Amount: number;
  token1Amount: number;
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
    async (token0: string, token1: string): Promise<PoolInfo | null> => {
      if (!stxAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const poolInfo = await stacksDexContract.getPoolInfo(
          token0,
          token1,
          stxAddress
        );
        
        // Parse the pool info response based on your contract's return format
        return {
          reserve0: poolInfo.value?.reserve0?.value || 0,
          reserve1: poolInfo.value?.reserve1?.value || 0,
          totalSupply: poolInfo.value?.totalSupply?.value || 0,
          token0,
          token1,
        };
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
    async (token0: string, token1: string): Promise<UserLiquidity | null> => {
      if (!stxAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const [liquidity, poolInfo] = await Promise.all([
          stacksDexContract.getUserLiquidity(token0, token1, stxAddress),
          stacksDexContract.getPoolInfo(token0, token1, stxAddress),
        ]);

        const lpTokens = liquidity.value?.value || 0;
        const totalSupply = poolInfo.value?.totalSupply?.value || 0;
        const reserve0 = poolInfo.value?.reserve0?.value || 0;
        const reserve1 = poolInfo.value?.reserve1?.value || 0;

        const share = totalSupply > 0 ? (lpTokens / totalSupply) * 100 : 0;
        const token0Amount = (lpTokens * reserve0) / totalSupply || 0;
        const token1Amount = (lpTokens * reserve1) / totalSupply || 0;

        return {
          lpTokens,
          share,
          token0Amount,
          token1Amount,
        };
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
    ): number => {
      if (totalSupply === 0) {
        // First liquidity provision - use geometric mean
        return Math.floor(Math.sqrt(amount0 * amount1));
      }

      // Subsequent liquidity provisions - use minimum ratio
      const liquidity0 = (amount0 * totalSupply) / reserve0;
      const liquidity1 = (amount1 * totalSupply) / reserve1;
      return Math.floor(Math.min(liquidity0, liquidity1));
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
    ): { amount0: number; amount1: number } => {
      if (totalSupply === 0) {
        return { amount0: 0, amount1: 0 };
      }

      const amount0 = Math.floor((lpTokens * reserve0) / totalSupply);
      const amount1 = Math.floor((lpTokens * reserve1) / totalSupply);
      return { amount0, amount1 };
    },
    []
  );

  /**
   * Calculate optimal amounts for adding liquidity
   */
  const calculateOptimalAmounts = useCallback(
    (
      amount0Desired: number,
      amount1Desired: number,
      reserve0: number,
      reserve1: number
    ): { amount0: number; amount1: number } => {
      if (reserve0 === 0 || reserve1 === 0) {
        return { amount0: amount0Desired, amount1: amount1Desired };
      }

      const amount1Optimal = (amount0Desired * reserve1) / reserve0;
      
      if (amount1Optimal <= amount1Desired) {
        return { amount0: amount0Desired, amount1: Math.floor(amount1Optimal) };
      }

      const amount0Optimal = (amount1Desired * reserve0) / reserve1;
      return { amount0: Math.floor(amount0Optimal), amount1: amount1Desired };
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
    calculateOptimalAmounts,
    getTransactionStatus,
    resetPoolState,
  };
}