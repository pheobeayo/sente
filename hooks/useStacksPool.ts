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
   * Get pool information using get-pool (matches the actual contract function)
   */
  const getPoolInfo = useCallback(async (token0: string, token1: string): Promise<PoolInfo | null> => {
    if (!stxAddress) {
      console.error('No wallet connected');
      return null;
    }

    try {
      console.log('Getting pool info for:', { token0, token1 });
      
      const result = await stacksDexContract.getPoolInfo(token0, token1, stxAddress);
      
      console.log('Pool info result:', result);
      
      if (!result) {
        console.log('Pool not found - result is null/undefined');
        return null;
      }
      
      // Handle both direct object and nested value structures
      const poolData = result.value || result;
      
      if (!poolData) {
        console.log('Pool not found - no pool data');
        return null;
      }
      
      const reserve0 = Number(poolData['reserve-x'] || poolData.reserveX || 0);
      const reserve1 = Number(poolData['reserve-y'] || poolData.reserveY || 0);
      const totalSupply = Number(poolData['shares-total'] || poolData.totalShares || 0);
      
      console.log('Parsed pool data:', { reserve0, reserve1, totalSupply });
      
      // If reserves are 0, pool exists but has no liquidity
      if (reserve0 === 0 && reserve1 === 0) {
        console.log('Pool exists but has no liquidity');
        return {
          reserve0: 0,
          reserve1: 0,
          totalSupply: 0,
          token0,
          token1,
        };
      }
      
      return {
        reserve0,
        reserve1,
        totalSupply,
        token0,
        token1,
      };
    } catch (error: any) {
      console.error('Error getting pool info:', error);
      console.error('Error details:', {
        message: error.message,
        token0,
        token1,
      });
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
      console.log('Getting user liquidity for:', { token0, token1, user: stxAddress });
      
      const [sharesResult, poolInfo] = await Promise.all([
        stacksDexContract.getUserShares(token0, token1, stxAddress),
        stacksDexContract.getPoolInfo(token0, token1, stxAddress)
      ]);
      
      console.log('User shares result:', sharesResult);
      console.log('Pool info for liquidity:', poolInfo);
      
      const shares = Number(
        typeof sharesResult === 'object' && sharesResult !== null
          ? (sharesResult.value || sharesResult)
          : sharesResult || 0
      );

      console.log('Parsed shares:', shares);

      // Handle pool not found or no data
      if (!poolInfo) {
        console.log('Pool not found when getting user liquidity');
        return {
          liquidity: 0,
          token0Amount: 0,
          token1Amount: 0,
          value: 0,
          unclaimedFees: 0,
        };
      }

      const poolData = poolInfo.value || poolInfo;
      
      if (!poolData) {
        console.log('No pool data available');
        return {
          liquidity: 0,
          token0Amount: 0,
          token1Amount: 0,
          value: 0,
          unclaimedFees: 0,
        };
      }

      const reserveX = Number(poolData['reserve-x'] || poolData.reserveX || 0);
      const reserveY = Number(poolData['reserve-y'] || poolData.reserveY || 0);
      const totalShares = Number(poolData['shares-total'] || poolData.totalShares || 1);

      console.log('Pool reserves for liquidity calc:', { reserveX, reserveY, totalShares });

      // Calculate user's token amounts based on their share
      const sharePercentage = totalShares > 0 ? shares / totalShares : 0;
      const token0Amount = sharePercentage * reserveX;
      const token1Amount = sharePercentage * reserveY;
      
      console.log('User liquidity calculated:', {
        sharePercentage,
        token0Amount,
        token1Amount,
      });
      
      // Calculate approximate value (assuming $0.85 per STX and $1 per stablecoin)
      const value = (token0Amount * 0.85) + token1Amount;
      
      return {
        liquidity: shares,
        token0Amount,
        token1Amount,
        value,
        unclaimedFees: 0, // Contract may not track this
      };
    } catch (error: any) {
      console.error('Error getting user liquidity:', error);
      console.error('Error details:', {
        message: error.message,
        token0,
        token1,
      });
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

    console.log('Adding liquidity:', {
      token0,
      token1,
      amount0,
      amount1,
      minLiquidity,
    });

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
          console.log('Liquidity added successfully:', data);
          setTxId(data.txId);
          setIsLoading(false);
          toast.success('Liquidity added successfully!');
        },
        () => {
          console.log('Add liquidity transaction cancelled');
          setIsLoading(false);
          toast('Transaction cancelled');
        }
      );
    } catch (error: any) {
      console.error('Error adding liquidity:', error);
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

    console.log('Removing liquidity:', {
      token0,
      token1,
      liquidity,
      minAmount0,
      minAmount1,
    });

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
          console.log('Liquidity removed successfully:', data);
          setTxId(data.txId);
          setIsLoading(false);
          toast.success('Liquidity removed successfully!');
        },
        () => {
          console.log('Remove liquidity transaction cancelled');
          setIsLoading(false);
          toast('Transaction cancelled');
        }
      );
    } catch (error: any) {
      console.error('Error removing liquidity:', error);
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
      // First liquidity provider - use geometric mean
      return Math.sqrt(amount0 * amount1);
    }

    // Subsequent liquidity providers - maintain ratio
    const liquidity0 = (amount0 * totalSupply) / reserve0;
    const liquidity1 = (amount1 * totalSupply) / reserve1;
    
    // Return the minimum to ensure balanced addition
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

  /**
   * Create a new pool (if it doesn't exist)
   */
  const createPool = useCallback(async (
    token0: string,
    token1: string
  ) => {
    if (!isConnected || !stxAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    console.log('Creating pool for:', { token0, token1 });

    setIsLoading(true);
    setError(null);
    setTxId(null);

    try {
      await stacksDexContract.createPool(
        token0,
        token1,
        stxAddress,
        (data) => {
          console.log('Pool created successfully:', data);
          setTxId(data.txId);
          setIsLoading(false);
          toast.success('Pool created successfully!');
        },
        () => {
          console.log('Create pool transaction cancelled');
          setIsLoading(false);
          toast('Transaction cancelled');
        }
      );
    } catch (error: any) {
      console.error('Error creating pool:', error);
      setError(error.message || 'Failed to create pool');
      setIsLoading(false);
      toast.error(error.message || 'Failed to create pool');
    }
  }, [isConnected, stxAddress]);

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
    createPool, 
  };
}