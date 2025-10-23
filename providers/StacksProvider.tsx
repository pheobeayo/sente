'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppConfig,
  type UserData,
  UserSession,
} from '@stacks/connect';
import { APP_CONFIG, API_URL } from '@/lib/config';

interface StacksContextType {
  userData: UserData | null;
  isConnected: boolean;
  stxAddress: string | null;
  balance: string;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  refreshBalance: () => void;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export function StacksProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectFn, setShowConnectFn] = useState<any>(null);

  // Load showConnect function dynamically
  useEffect(() => {
    const loadShowConnect = async () => {
      try {
        const module = await import('@stacks/connect');
        setShowConnectFn(() => module.showConnect);
      } catch (error) {
        console.error('Failed to load @stacks/connect:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadShowConnect();
    }
  }, []);

  // Check if user is already connected
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  // Fetch balance when user connects
  useEffect(() => {
    if (userData) {
      const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
      if (address) {
        fetchBalance(address);
      }
    }
  }, [userData]);

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(
        `${API_URL}/extended/v1/address/${address}/balances`
      );
      
      if (response.ok) {
        const data = await response.json();
        const balanceInStx = (parseInt(data.stx.balance) / 1000000).toFixed(2);
        setBalance(balanceInStx);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connectWallet = () => {
    if (!showConnectFn) {
      console.error('showConnect function not loaded yet');
      return;
    }

    setIsLoading(true);

    try {
      showConnectFn({
        appDetails: {
          name: APP_CONFIG.name,
          icon: typeof window !== 'undefined' 
            ? window.location.origin + APP_CONFIG.icon 
            : APP_CONFIG.icon,
        },
        onFinish: () => {
          window.location.reload();
        },
        onCancel: () => {
          setIsLoading(false);
        },
        userSession,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setBalance('0');
  };

  const refreshBalance = () => {
    if (userData) {
      const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
      if (address) {
        fetchBalance(address);
      }
    }
  };

  const isConnected = !!userData;
  const stxAddress = userData?.profile.stxAddress.testnet || userData?.profile.stxAddress.mainnet || null;

  const value: StacksContextType = {
    userData,
    isConnected,
    stxAddress,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
}