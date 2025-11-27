// src/services/transactionService.ts

const STACKS_API_URL = process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'token-dex';

export interface StacksTransaction {
  tx_id: string;
  tx_status: 'success' | 'pending' | 'abort_by_response' | 'abort_by_post_condition';
  tx_type: string;
  sender_address: string;
  burn_block_time: number;
  burn_block_time_iso: string;
  block_height?: number;
  fee_rate: string;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args: Array<{
      repr: string;
      name: string;
      type: string;
      hex?: string;
    }>;
  };
  tx_result?: {
    repr: string;
  };
}

export interface ParsedSwapTransaction {
  id: string;
  type: 'swap';
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: Date;
  timestampFormatted: string;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
  sender: string;
  blockHeight?: number;
  fee: string;
}

export interface TransactionResponse {
  limit: number;
  offset: number;
  total: number;
  results: StacksTransaction[];
}

/**
 * Fetch with better error handling and timeout
 */
async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      // No mode: 'cors' needed - browser handles this automatically
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - API took too long to respond');
    }
    throw error;
  }
}

/**
 * Fetch transactions for a specific address
 */
export async function fetchAddressTransactions(
  address: string,
  limit: number = 50,
  offset: number = 0
): Promise<TransactionResponse> {
  const url = `${STACKS_API_URL}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`;
  
  console.log('Fetching address transactions:', url);
  
  try {
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch address transactions: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching address transactions:', error);
    
    // Return empty result instead of throwing
    return {
      limit,
      offset,
      total: 0,
      results: []
    };
  }
}

/**
 * Fetch all transactions for the DEX contract
 */
export async function fetchContractTransactions(
  limit: number = 50,
  offset: number = 0
): Promise<TransactionResponse> {
  const contractId = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
  const url = `${STACKS_API_URL}/extended/v1/tx?contract_id=${contractId}&limit=${limit}&offset=${offset}`;
  
  console.log('Fetching contract transactions:', url);
  
  try {
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch contract transactions: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contract transactions:', error);
    
    // Return empty result instead of throwing
    return {
      limit,
      offset,
      total: 0,
      results: []
    };
  }
}

/**
 * Get token symbol from contract address
 */
export function getTokenSymbol(contractAddress: string): string {
  if (!contractAddress) return 'Unknown';
  
  // Handle native STX
  if (contractAddress === 'STX' || contractAddress.toUpperCase() === 'STX') {
    return 'STX';
  }
  
  // Handle principal format
  if (contractAddress.includes('.')) {
    const parts = contractAddress.split('.');
    const tokenName = parts[parts.length - 1];
    
    // Common token mappings
    const lowerName = tokenName.toLowerCase();
    if (lowerName.includes('stx') || lowerName === 'stacks') return 'STX';
    if (lowerName.includes('usdt')) return 'USDT';
    if (lowerName.includes('usdc')) return 'USDC';
    if (lowerName.includes('eth') || lowerName === 'ethereum' || lowerName.includes('wrapped')) return 'ETH';
    if (lowerName.includes('btc') || lowerName === 'bitcoin') return 'BTC';
    
    // Return capitalized token name
    return tokenName
      .replace(/token-|wrapped-|-token/gi, '')
      .toUpperCase()
      .substring(0, 10); // Limit length
  }
  
  return contractAddress.substring(0, 6).toUpperCase();
}

/**
 * Format amount from microunits to regular units
 */
export function formatAmount(amount: string | number): string {
  try {
    let cleanAmount: string;
    
    if (typeof amount === 'number') {
      cleanAmount = amount.toString();
    } else {
      // Remove 'u' prefix if present
      cleanAmount = amount.replace(/^u/, '');
    }
    
    const numAmount = parseInt(cleanAmount);
    if (isNaN(numAmount)) return '0.0000';
    
    return (numAmount / 1000000).toFixed(4);
  } catch {
    return '0.0000';
  }
}

/**
 * Parse a single transaction into a structured swap transaction
 */
export function parseSwapTransaction(tx: StacksTransaction): ParsedSwapTransaction | null {
  try {
    // Only process contract calls
    if (tx.tx_type !== 'contract_call' || !tx.contract_call) {
      return null;
    }

    // Check if transaction is for our DEX contract
    const contractId = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
    if (tx.contract_call.contract_id !== contractId) {
      return null;
    }

    // Check if it's a swap function
    const functionName = tx.contract_call.function_name.toLowerCase();
    if (!functionName.includes('swap')) {
      return null;
    }

    const args = tx.contract_call.function_args || [];
    
    // Extract token addresses and amounts
    // Adjust these indices based on your actual contract function signature
    const tokenIn = args[0]?.repr || args[0]?.hex || 'Unknown';
    const tokenOut = args[1]?.repr || args[1]?.hex || 'Unknown';
    const amountIn = args[2]?.repr || '0';
    const amountOut = args[3]?.repr || args[4]?.repr || '0'; // Some contracts have minAmountOut at index 3

    // Determine status
    let status: 'success' | 'pending' | 'failed';
    if (tx.tx_status === 'success') {
      status = 'success';
    } else if (tx.tx_status === 'pending') {
      status = 'pending';
    } else {
      status = 'failed';
    }

    const timestamp = new Date(tx.burn_block_time_iso);

    return {
      id: tx.tx_id,
      type: 'swap',
      fromToken: getTokenSymbol(tokenIn),
      toToken: getTokenSymbol(tokenOut),
      fromAmount: formatAmount(amountIn),
      toAmount: formatAmount(amountOut),
      timestamp,
      timestampFormatted: timestamp.toLocaleString(),
      status,
      txHash: tx.tx_id,
      sender: tx.sender_address,
      blockHeight: tx.block_height,
      fee: (parseInt(tx.fee_rate) / 1000000).toFixed(6),
    };
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return null;
  }
}

/**
 * Filter and parse swap transactions from a list
 */
export function parseSwapTransactions(transactions: StacksTransaction[]): ParsedSwapTransaction[] {
  return transactions
    .map(parseSwapTransaction)
    .filter((tx): tx is ParsedSwapTransaction => tx !== null);
}

/**
 * Get transaction status from transaction ID
 */
export async function getTransactionStatus(txId: string): Promise<StacksTransaction | null> {
  try {
    const url = `${STACKS_API_URL}/extended/v1/tx/${txId}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return null;
  }
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txId: string, network: 'mainnet' | 'testnet' = 'testnet'): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=${network}`;
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}