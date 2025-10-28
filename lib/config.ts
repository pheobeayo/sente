import { STACKS_TESTNET } from '@stacks/network';
import { PostConditionMode } from '@stacks/transactions';

// Contract details
export const CONTRACT_ADDRESS = 'ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ';
export const CONTRACT_NAME = 'token-dex';

// Network configuration
export const NETWORK = STACKS_TESTNET;
// For mainnet, use: export const NETWORK = new StacksMainnet();

// API endpoints
export const API_URL = 'https://api.testnet.hiro.so';
// For mainnet: 'https://api.hiro.so'

// Explorer URL
export const EXPLORER_URL = 'https://explorer.hiro.so';

// App configuration for Stacks Connect
export const APP_CONFIG = {
  name: 'SenteDex',
  icon: '/favicon.ico',
};

// Common contract functions
export const CONTRACT_FUNCTIONS = {
  // Swap functions
  SWAP_X_FOR_Y: 'swap-x-for-y',
  SWAP_Y_FOR_X: 'swap-y-for-x',
  GET_SWAP_OUTPUT: 'get-swap-output',
 
  // Liquidity functions
  ADD_LIQUIDITY: 'add-liquidity',
  REMOVE_LIQUIDITY: 'remove-liquidity',
 
  // Pool functions
  CREATE_POOL: 'create-pool',
  GET_POOL: 'get-pool', 
  
  // User functions
  GET_USER_SHARES: 'get-user-shares',
  IS_TOKEN_SUPPORTED: 'is-token-supported',
 
  // Token functions
  GET_BALANCE: 'get-balance',
  TRANSFER: 'transfer',
} as const;

// Token addresses on Stacks
export const STACKS_TOKENS = {
  STX: `${CONTRACT_ADDRESS}.STX`, 
  USDT: `${CONTRACT_ADDRESS}.token-usdt`,
  ETH: `${CONTRACT_ADDRESS}.ETH`,
  // Add more tokens as needed
} as const;

// Transaction settings
export const TX_OPTIONS = {
  postConditionMode: PostConditionMode.Allow,
  fee: 200000, // Default fee in microSTX (0.2 STX)
} as const;

// Default export for convenience
const config = {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  NETWORK,
  API_URL,
  EXPLORER_URL,
  APP_CONFIG,
  CONTRACT_FUNCTIONS,
  STACKS_TOKENS,
  TX_OPTIONS,
};

export default config;