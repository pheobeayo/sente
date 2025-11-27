// src/hooks/usePoolDetection.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStacksWallet } from './useStacksWallet';
import { stacksDexContract } from '@/lib/contract';

export interface PoolData {
  exists: boolean;
  hasLiquidity: boolean;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  token0: string;
  token1: string;
}

export interface UserPoolPosition {
  poolId: string;
  token0: string;
  token1: string;
  shares: number;
  token0Amount: number;
  token1Amount: number;
  value: number;
}

/**
 * Hook to detect and track pool creation and liquidity
 */
export function usePoolDetection() {
  const { stxAddress, isConnected } = useStacksWallet();
  const [pools, setPools] = useState<Record<string, PoolData>>({});
  const [userPositions, setUserPositions] = useState<UserPoolPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if a specific pool exists
   */
  const checkPool = useCallback(async (
    token0: string,
    token1: string
  ): Promise<PoolData> => {
    if (!stxAddress) {
      return {
        exists: false,
        hasLiquidity: false,
        reserve0: 0,
        reserve1: 0,
        totalSupply: 0,
        token0,
        token1,
      };
    }

    try {
      console.log(`Checking pool: ${token0}/${token1}`);
      
      // Try to get pool info
      const poolInfo = await stacksDexContract.getPoolInfo(token0, token1, stxAddress);
      
      console.log('Pool info result:', poolInfo);

      if (!poolInfo) {
        console.log('Pool does not exist');
        return {
          exists: false,
          hasLiquidity: false,
          reserve0: 0,
          reserve1: 0,
          totalSupply: 0,
          token0,
          token1,
        };
      }

      // Parse pool data
      const poolData = poolInfo.value || poolInfo;
      
      const reserve0 = Number(poolData['reserve-x'] || poolData.reserveX || poolData.reserve0 || 0);
      const reserve1 = Number(poolData['reserve-y'] || poolData.reserveY || poolData.reserve1 || 0);
      const totalSupply = Number(poolData['shares-total'] || poolData.totalShares || poolData.totalSupply || 0);

      console.log('Parsed pool data:', { reserve0, reserve1, totalSupply });

      return {
        exists: true,
        hasLiquidity: reserve0 > 0 && reserve1 > 0,
        reserve0,
        reserve1,
        totalSupply,
        token0,
        token1,
      };
    } catch (error) {
      console.error(`Error checking pool ${token0}/${token1}:`, error);
      return {
        exists: false,
        hasLiquidity: false,
        reserve0: 0,
        reserve1: 0,
        totalSupply: 0,
        token0,
        token1,
      };
    }
  }, [stxAddress]);

  /**
   * Check user's position in a pool
   */
  const checkUserPosition = useCallback(async (
    token0: string,
    token1: string,
    poolData: PoolData
  ): Promise<UserPoolPosition | null> => {
    if (!stxAddress || !poolData.exists) {
      return null;
    }

    try {
      console.log(`Checking user position in ${token0}/${token1}`);
      
      const sharesResult = await stacksDexContract.getUserShares(
        token0,
        token1,
        stxAddress
      );

      console.log('User shares result:', sharesResult);

      const shares = Number(
        typeof sharesResult === 'object' && sharesResult !== null
          ? (sharesResult.value || sharesResult)
          : sharesResult || 0
      );

      console.log('Parsed shares:', shares);

      if (shares === 0) {
        return null;
      }

      // Calculate user's token amounts
      const sharePercentage = poolData.totalSupply > 0 
        ? shares / poolData.totalSupply 
        : 0;

      const token0Amount = sharePercentage * poolData.reserve0;
      const token1Amount = sharePercentage * poolData.reserve1;

      // Calculate approximate value (assuming $0.85 per STX and $1 per stablecoin)
      const value = (token0Amount / 1000000 * 0.85) + (token1Amount / 1000000);

      const position: UserPoolPosition = {
        poolId: `${token0}-${token1}`,
        token0,
        token1,
        shares,
        token0Amount,
        token1Amount,
        value,
      };

      console.log('User position:', position);

      return position;
    } catch (error) {
      console.error(`Error checking user position in ${token0}/${token1}:`, error);
      return null;
    }
  }, [stxAddress]);

  /**
   * Refresh all pool data
   */
  const refreshPools = useCallback(async (tokenPairs: Array<{ token0: string; token1: string }>) => {
    if (!stxAddress || !isConnected) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const poolsData: Record<string, PoolData> = {};
      const positions: UserPoolPosition[] = [];

      for (const pair of tokenPairs) {
        const poolData = await checkPool(pair.token0, pair.token1);
        const poolId = `${pair.token0}-${pair.token1}`;
        poolsData[poolId] = poolData;

        // Check user position if pool exists
        if (poolData.exists) {
          const position = await checkUserPosition(pair.token0, pair.token1, poolData);
          if (position) {
            positions.push(position);
          }
        }
      }

      setPools(poolsData);
      setUserPositions(positions);
    } catch (err) {
      console.error('Error refreshing pools:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh pools');
    } finally {
      setIsLoading(false);
    }
  }, [stxAddress, isConnected, checkPool, checkUserPosition]);

  return {
    pools,
    userPositions,
    isLoading,
    error,
    checkPool,
    checkUserPosition,
    refreshPools,
  };
}