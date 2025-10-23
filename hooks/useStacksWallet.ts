'use client';

import {
  AppConfig,
  type UserData,
  UserSession,
  showConnect,
} from '@stacks/connect';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { APP_CONFIG, API_URL } from '@/lib/config';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  stxAddress: string | null;
  btcAddress: string | null;
  isLoading: boolean;
  error: string | null;
  balance: string;
}

export function useStacksWallet() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    stxAddress: null,
    btcAddress: null,
    isLoading: false,
    error: null,
    balance: '0',
  });

  // Create stable instances using useMemo
  const appConfig = useMemo(() => new AppConfig(['store_write', 'publish_data']), []);
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig]);

  // Determine if we're on testnet or mainnet
  const isTestnet = useMemo(
    () => typeof API_URL === 'string' && API_URL.includes('testnet'),
    []
  );

  // Fetch balance for connected wallet
  const fetchBalance = useCallback(async (address: string) => {
    try {
      const response = await fetch(
        `${API_URL}/extended/v1/address/${address}/balances`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      const balanceInStx = (parseInt(data.stx.balance) / 1000000).toFixed(2);
      setWalletState(prev => ({ ...prev, balance: balanceInStx }));
      return balanceInStx;
    } catch (error) {
      console.error('Error fetching balance:', error);
      setWalletState(prev => ({ ...prev, balance: '0' }));
      return '0';
    }
  }, []);

  // Update wallet state when userData changes
  useEffect(() => {
    if (userData) {
      // Use testnet or mainnet address based on network configuration
      const stxAddr = isTestnet 
        ? userData.profile.stxAddress.testnet 
        : userData.profile.stxAddress.mainnet;
      
      const btcAddr = isTestnet
        ? userData.profile.btcAddress?.p2wpkh?.testnet
        : userData.profile.btcAddress?.p2wpkh?.mainnet;
      
      setWalletState({
        isConnected: true,
        address: stxAddr,
        stxAddress: stxAddr,
        btcAddress: btcAddr || null,
        isLoading: false,
        error: null,
        balance: '0',
      });

      // Fetch balance after setting wallet state
      if (stxAddr) {
        fetchBalance(stxAddr);
      }
    } else {
      setWalletState({
        isConnected: false,
        address: null,
        stxAddress: null,
        btcAddress: null,
        isLoading: false,
        error: null,
        balance: '0',
      });
    }
  }, [userData, fetchBalance, isTestnet]);

  // Check connection on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      }).catch((error) => {
        console.error('Error handling pending sign in:', error);
      });
    }
  }, [userSession]);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      showConnect({
        appDetails: {
          name: APP_CONFIG.name,
          icon: typeof window !== 'undefined' 
            ? window.location.origin + APP_CONFIG.icon 
            : APP_CONFIG.icon,
        },
        onFinish: () => {
          const loadedUserData = userSession.loadUserData();
          setUserData(loadedUserData);
          setWalletState(prev => ({ ...prev, isLoading: false }));
        },
        onCancel: () => {
          setWalletState(prev => ({
            ...prev,
            isLoading: false,
            error: null, // Don't set error on cancel - user intentionally cancelled
          }));
        },
        userSession,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, [userSession]);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setUserData(null);
    setWalletState({
      isConnected: false,
      address: null,
      stxAddress: null,
      btcAddress: null,
      isLoading: false,
      error: null,
      balance: '0',
    });
  }, [userSession]);

  const getBalance = useCallback(async (address?: string): Promise<string> => {
    const targetAddress = address || walletState.stxAddress;
    if (!targetAddress) {
      console.warn('No address provided to getBalance');
      return '0';
    }
    return fetchBalance(targetAddress);
  }, [walletState.stxAddress, fetchBalance]);

  const refreshBalance = useCallback(() => {
    if (walletState.stxAddress) {
      fetchBalance(walletState.stxAddress);
    }
  }, [walletState.stxAddress, fetchBalance]);

  const checkConnection = useCallback(() => {
    if (userSession.isUserSignedIn()) {
      const loadedUserData = userSession.loadUserData();
      setUserData(loadedUserData);
      return true;
    }
    return false;
  }, [userSession]);

  return {
    // Wallet state
    ...walletState,
    userData,
    
    // Actions
    connectWallet,
    disconnectWallet,
    getBalance,
    refreshBalance,
    checkConnection,
    
    // Utilities
    userSession,
    isTestnet,
  };
}