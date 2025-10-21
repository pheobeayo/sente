import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

// Contract details
export const CONTRACT_ADDRESS = 'ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ';
export const CONTRACT_NAME = 'token-dex';

// Network configuration
export const NETWORK = STACKS_TESTNET;
// For mainnet, use: export const NETWORK = STACKS_MAINNET;

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
  SWAP_TOKENS: 'swap-tokens',
  GET_SWAP_QUOTE: 'get-swap-quote',
  
  // Liquidity functions
  ADD_LIQUIDITY: 'add-liquidity',
  REMOVE_LIQUIDITY: 'remove-liquidity',
  GET_LIQUIDITY: 'get-liquidity',
  
  // Pool functions
  CREATE_POOL: 'create-pool',
  GET_POOL_INFO: 'get-pool-info',
  GET_POOL_RESERVES: 'get-pool-reserves',
  
  // Token functions
  GET_BALANCE: 'get-balance',
  TRANSFER: 'transfer',
};

// Token addresses on Stacks
export const STACKS_TOKENS = {
  STX: 'STX', // Native STX token
  USDA: `${CONTRACT_ADDRESS}.usda-token`,
  XUSD: `${CONTRACT_ADDRESS}.xusd-token`,
  // Add more tokens as needed
};

// Transaction settings
export const TX_OPTIONS = {
  postConditionMode: 0x01, // Allow post conditions
  fee: 200000, // Default fee in microSTX (0.2 STX)
};

export default {
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