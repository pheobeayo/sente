// Token Types
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
  balance?: number;
  price?: number;
}

// Pool Types
export interface Pool {
  id: string;
  address: string;
  token0: Token;
  token1: Token;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  tvl: number;
  volume24h: number;
  volumeWeek: number;
  fees24h: number;
  feesWeek: number;
  apr: number;
  lpTokenBalance?: string;
  poolShare?: number;
}

// Transaction Types
export enum TransactionType {
  SWAP = 'SWAP',
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
  CLAIM_FEES = 'CLAIM_FEES',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface Transaction {
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  from: string;
  to?: string;
  token0?: Token;
  token1?: Token;
  amount0?: string;
  amount1?: string;
  value?: string;
  gasUsed?: string;
  gasPrice?: string;
}

// Wallet Types
export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  balance: string | null;
  provider: any;
  signer: any;
}

// Swap Types
export interface SwapParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOutMin: string;
  slippage: number;
  deadline: number;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  route: Token[];
  fee: string;
  minimumReceived: string;
}

// Liquidity Types
export interface AddLiquidityParams {
  token0: Token;
  token1: Token;
  amount0: string;
  amount1: string;
  amount0Min: string;
  amount1Min: string;
  deadline: number;
}

export interface RemoveLiquidityParams {
  pool: Pool;
  liquidity: string;
  amount0Min: string;
  amount1Min: string;
  deadline: number;
}

// Governance Types
export enum ProposalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  votesFor: string;
  votesAgainst: string;
  totalVotes: string;
  startBlock: number;
  endBlock: number;
  startTime: number;
  endTime: number;
  category: string;
  actions?: ProposalAction[];
}

export interface ProposalAction {
  target: string;
  value: string;
  signature: string;
  calldata: string;
}

export interface Vote {
  proposalId: string;
  voter: string;
  support: boolean;
  votes: string;
  timestamp: number;
}

// Analytics Types
export interface AnalyticsData {
  tvl: number;
  volume24h: number;
  volumeWeek: number;
  fees24h: number;
  feesWeek: number;
  transactions24h: number;
  transactionsWeek: number;
  uniqueUsers24h: number;
  uniqueUsersWeek: number;
}

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  value: number;
  label?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Error Types
export class DexError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'DexError';
    this.code = code;
  }
}

export enum ErrorCode {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
}