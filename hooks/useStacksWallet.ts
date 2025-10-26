'use client';

import { useEffect, useState, useCallback } from 'react';
import { isConnected, getLocalStorage } from '@stacks/connect';


export function useStacksWallet() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status and get address
  const checkConnection = useCallback(() => {
    try {
      const connected = isConnected();
      setIsWalletConnected(connected);

      if (connected) {
        const data = getLocalStorage();
        const address = data?.addresses?.stx?.[0]?.address;
        if (address && typeof address === 'string') {
          setStxAddress(address);
          fetchBalance(address);
        } else {
          setStxAddress(null);
          setBalance('0');
        }
      } else {
        setStxAddress(null);
        setBalance('0');
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      setStxAddress(null);
      setBalance('0');
    }
  }, []);

  // Fetch STX balance
  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      const stxBalance = (parseInt(data.stx.balance) / 1000000).toFixed(2);
      setBalance(stxBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance('0');
    }
  };

  // Check connection on mount and set up interval
  useEffect(() => {
    checkConnection();

    // Poll for connection changes every 2 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 2000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  
  const refreshBalance = useCallback(() => {
    if (stxAddress) {
      fetchBalance(stxAddress);
    }
  }, [stxAddress]);

  const connectWallet = useCallback(async () => {
    console.log('Use the ConnectWallet button in navbar to connect');
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('Use the ConnectWallet button in navbar to disconnect');
  }, []);

  return {
    // Main states
    isConnected: isWalletConnected,
    stxAddress,
    balance,
    isLoading,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshBalance,
    checkConnection,
    
    // Aliases for compatibility
    address: stxAddress,
    userData: stxAddress ? { profile: { stxAddress: { testnet: stxAddress } } } : null,
  };
}