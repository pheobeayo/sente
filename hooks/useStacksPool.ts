'use client';

import { useState, useCallback } from 'react';
import { useStacksWallet } from './useStacksWallet';
import { stacksDexContract } from '@/lib/contract';
import toast from 'react-hot-toast';

interface PoolInfo {
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  token0: string;
  token1: string;
}

interface UserLiquidity {
  liquidity: number;
  token0Amount: number;
  token1Amount: number;
  value: number;
  unclaimedFees: number;
}

export function useStacksPool() {
  const { stxAddress, isConnected } = useStacksWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  /**
   * Get pool information using get-pool
   */
  const getPoolInfo = useCallback(async (token0: string, token1: string): Promise<PoolInfo | null> => {
    if (!stxAddress) {
      console.error('No wallet connected');
      return null;
    }

    try {
      const result = await stacksDexContract.getPoolInfo(token0, token1, stxAddress);
      
      if (!result || !result.value) {
        console.error('Pool not found');
        return null;
      }
      
      const poolData = result.value;
      
      return {
        reserve0: Number(poolData['reserve-x'] || poolData.reserveX || 0),
        reserve1: Number(poolData['reserve-y'] || poolData.reserveY || 0),
        totalSupply: Number(poolData['shares-total'] || poolData.totalShares || 0),
        token0,
        token1,
      };
    } catch (error: any) {
      console.error('Error getting pool info:', error);
      return null;
    }
  }, [stxAddress]);

  /**
   * Get user's liquidity in a pool using get-user-shares
   */
  const getUserLiquidity = useCallback(async (token0: string, token1: string): Promise<UserLiquidity | null> => {
    if (!stxAddress) {
      console.error('No wallet connected');
      return null;
    }

    try {
      const [sharesResult, poolInfo] = await Promise.all([
        stacksDexContract.getUserShares(token0, token1, stxAddress),
        stacksDexContract.getPoolInfo(token0, token1, stxAddress)
      ]);
      
      const shares = Number(
        typeof sharesResult === 'object' && sharesResult !== null
          ? (sharesResult.value || sharesResult)
          : sharesResult || 0
      );

      if (!poolInfo || !poolInfo.value) {
        return {
          liquidity: 0,
          token0Amount: 0,
          token1Amount: 0,
          value: 0,
          unclaimedFees: 0,
        };
      }

      const poolData = poolInfo.value;
      const reserveX = Number(poolData['reserve-x'] || poolData.reserveX || 0);
      const reserveY = Number(poolData['reserve-y'] || poolData.reserveY || 0);
      const totalShares = Number(poolData['shares-total'] || poolData.totalShares || 1);

      // Calculate user's token amounts based on their share
      const sharePercentage = totalShares > 0 ? shares / totalShares : 0;
      const token0Amount = sharePercentage * reserveX;
      const token1Amount = sharePercentage * reserveY;
      
      // Calculate approximate value (assuming $0.85 per STX and $1 per stablecoin)
      const value = (token0Amount * 0.85) + token1Amount;
      
      return {
        liquidity: shares,
        token0Amount,
        token1Amount,
        value,
        unclaimedFees: 0, 
      };
    } catch (error: any) {
      console.error('Error getting user liquidity:', error);
      return null;
    }
  }, [stxAddress]);

  /**
   * Add liquidity to a pool
   */
  const addLiquidity = useCallback(async (
    token0: string,
    token1: string,
    amount0: number,
    amount1: number,
    minLiquidity: number
  ) => {
    if (!isConnected || !stxAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxId(null);

    try {
      await stacksDexContract.addLiquidity(
        token0,
        token1,
        Math.floor(amount0 * 1000000), // Convert to microunits
        Math.floor(amount1 * 1000000),
        Math.floor(minLiquidity * 1000000),
        stxAddress,
        (data) => {
          setTxId(data.txId);
          setIsLoading(false);
          toast.success('Liquidity added successfully!');
        },
        () => {
          setIsLoading(false);
          toast('Transaction cancelled');
        }
      );
    } catch (error: any) {
      setError(error.message || 'Failed to add liquidity');
      setIsLoading(false);
      toast.error(error.message || 'Failed to add liquidity');
    }
  }, [isConnected, stxAddress]);

  /**
   * Remove liquidity from a pool
   */
  const removeLiquidity = useCallback(async (
    token0: string,
    token1: string,
    liquidity: number,
    minAmount0: number,
    minAmount1: number
  ) => {
    if (!isConnected || !stxAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxId(null);

    try {
      await stacksDexContract.removeLiquidity(
        token0,
        token1,
        Math.floor(liquidity * 1000000), // Convert to microunits
        Math.floor(minAmount0 * 1000000),
        Math.floor(minAmount1 * 1000000),
        stxAddress,
        (data) => {
          setTxId(data.txId);
          setIsLoading(false);
          toast.success('Liquidity removed successfully!');
        },
        () => {
          setIsLoading(false);
          toast('Transaction cancelled');
        }
      );
    } catch (error: any) {
      setError(error.message || 'Failed to remove liquidity');
      setIsLoading(false);
      toast.error(error.message || 'Failed to remove liquidity');
    }
  }, [isConnected, stxAddress]);

  /**
   * Calculate LP tokens to receive when adding liquidity
   */
  const calculateLPTokens = useCallback((
    amount0: number,
    amount1: number,
    reserve0: number,
    reserve1: number,
    totalSupply: number
  ): number => {
    if (totalSupply === 0) {
      // First liquidity provider
      return Math.sqrt(amount0 * amount1);
    }

    // Subsequent liquidity providers
    const liquidity0 = (amount0 * totalSupply) / reserve0;
    const liquidity1 = (amount1 * totalSupply) / reserve1;
    
    return Math.min(liquidity0, liquidity1);
  }, []);

  /**
   * Calculate tokens to receive when removing liquidity
   */
  const calculateTokensFromLP = useCallback((
    liquidity: number,
    reserve0: number,
    reserve1: number,
    totalSupply: number
  ): { amount0: number; amount1: number } => {
    if (totalSupply === 0) {
      return { amount0: 0, amount1: 0 };
    }

    const amount0 = (liquidity * reserve0) / totalSupply;
    const amount1 = (liquidity * reserve1) / totalSupply;

    return { amount0, amount1 };
  }, []);

  return {
    isLoading,
    error,
    txId,
    getPoolInfo,
    getUserLiquidity,
    addLiquidity,
    removeLiquidity,
    calculateLPTokens,
    calculateTokensFromLP,
  };
}