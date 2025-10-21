import { Token } from '@/types';

// Mainnet token addresses (Ethereum)
export const TOKEN_ADDRESSES = {
  ETH: '0x0000000000000000000000000000000000000000',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  SENTE: '0x0000000000000000000000000000000000000001', // Placeholder
};

// Token list
export const TOKENS: { [key: string]: Token } = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    address: TOKEN_ADDRESSES.ETH,
    decimals: 18,
    logo: '/images/tokens/eth.png',
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: TOKEN_ADDRESSES.WETH,
    decimals: 18,
    logo: '/images/tokens/eth.png',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: TOKEN_ADDRESSES.USDC,
    decimals: 6,
    logo: '/images/tokens/usdc.png',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: TOKEN_ADDRESSES.USDT,
    decimals: 6,
    logo: '/images/tokens/usdc.png',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: TOKEN_ADDRESSES.DAI,
    decimals: 18,
    logo: '/images/tokens/dai.png',
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: TOKEN_ADDRESSES.WBTC,
    decimals: 8,
    logo: '/images/tokens/wbtc.png',
  },
  SENTE: {
    symbol: 'SENTE',
    name: 'SenteDex Token',
    address: TOKEN_ADDRESSES.SENTE,
    decimals: 18,
    logo: '/images/tokens/sente.png',
  },
};

// Popular token pairs
export const POPULAR_PAIRS = [
  [TOKENS.ETH, TOKENS.USDC],
  [TOKENS.WBTC, TOKENS.ETH],
  [TOKENS.DAI, TOKENS.USDC],
  [TOKENS.ETH, TOKENS.DAI],
  [TOKENS.USDC, TOKENS.USDT],
];

// Default tokens for swap interface
export const DEFAULT_FROM_TOKEN = TOKENS.ETH;
export const DEFAULT_TO_TOKEN = TOKENS.USDC;

// Stablecoin list
export const STABLECOINS = [TOKENS.USDC, TOKENS.USDT, TOKENS.DAI];

// Token list as array
export const TOKEN_LIST = Object.values(TOKENS);