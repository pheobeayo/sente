// src/constants/tokens.ts

import { StaticImageData } from 'next/image';
import stx from "@/public/stx.png";
import usdc from "@/public/usdc.png";
import eth from "@/public/eth.png";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: StaticImageData;
}

// Fixed token list - removed duplicate ETH to prevent React key conflicts
export const TOKENS: Token[] = [
  { 
    symbol: 'STX', 
    name: 'Stacks', 
    address: 'STX', // Native STX token
    icon: stx 
  },
  { 
    symbol: 'USDT', 
    name: 'Tether USD', 
    address: 'ST2QXSK64YQX3CQPC530K79XWQ98XFAM9W3XKEH3N.token-usdt', 
    icon: usdc 
  },
  { 
    symbol: 'ETH', 
    name: 'Wrapped Ethereum', 
    address: 'ST1KNS2PT486RDG4FDPPCD87M1NK3XWTXA6WGQN98.wrapped-eth', 
    icon: eth 
  },
];

// Helper function to get token by address
export function getTokenByAddress(address: string): Token | undefined {
  return TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
}

// Helper function to get token by symbol
export function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
}