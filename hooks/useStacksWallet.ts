'use client';

import {
  AppConfig,
  type UserData,
  UserSession,
} from '@stacks/connect';
import { useEffect, useState, useCallback } from 'react';
import { APP_CONFIG, API_URL } from '@/lib/config';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  stxAddress: string | null;
  btcAddress: string | null;
  isLoading: boolean;
  error: string | null;
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
  });

  // Create application config
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  // Update wallet state when userData changes
  useEffect(() => {
    if (userData) {
      setWalletState({
        isConnected: true,
        address: userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet,
        stxAddress: userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet,
        btcAddress: userData.profile.btcAddress?.p2wpkh?.testnet || userData.profile.btcAddress?.p2wpkh?.mainnet || null,
        isLoading: false,
        error: null,
      });
    } else {
      setWalletState({
        isConnected: false,
        address: null,
        stxAddress: null,
        btcAddress: null,
        isLoading: false,
        error: null,
      });
    }
  }, [userData]);

  // Check connection on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamic import to ensure it works in client-side only
      const { showConnect: showConnectFn } = await import('@stacks/connect');
      
      showConnectFn({
        appDetails: {
          name: APP_CONFIG.name,
          icon: typeof window !== 'undefined' ? window.location.origin + APP_CONFIG.icon : APP_CONFIG.icon,
        },
        onFinish: () => {
          // Reload to ensure user session is populated from local storage
          window.location.reload();
        },
        onCancel: () => {
          setWalletState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Connection cancelled',
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
    });
  }, [userSession]);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    try {
      const response = await fetch(
        `${API_URL}/extended/v1/address/${address}/balances`
      );
      const data = await response.json();
      return data.stx.balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }, []);

  const checkConnection = useCallback(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, [userSession]);

  return {
    ...walletState,
    userData,
    connectWallet,
    disconnectWallet,
    getBalance,
    checkConnection,
    userSession,
  };
}