import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  contractPrincipalCV,
  bufferCVFromString,
  ClarityValue,
  cvToJSON,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, TX_OPTIONS } from './config';

export class StacksDexContract {
  private network: StacksNetwork;

  constructor() {
    this.network = NETWORK;
  }

  /**
   * Call a read-only contract function
   */
  async callReadOnly(
    functionName: string,
    functionArgs: ClarityValue[],
    senderAddress: string
  ) {
    try {
      const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        network: this.network,
        senderAddress,
      };

      const result = await fetchCallReadOnlyFunction(options);
      return cvToJSON(result);
    } catch (error) {
      console.error('Error calling read-only function:', error);
      throw error;
    }
  }

  /**
   * Get pool information
   */
  async getPoolInfo(token0: string, token1: string, senderAddress: string) {
    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, token0),
      contractPrincipalCV(CONTRACT_ADDRESS, token1),
    ];

    return this.callReadOnly('get-pool-info', functionArgs, senderAddress);
  }

  /**
   * Get swap quote
   */
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    senderAddress: string
  ) {
    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenIn),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenOut),
      uintCV(amountIn),
    ];

    return this.callReadOnly('get-swap-quote', functionArgs, senderAddress);
  }

  /**
   * Get user's liquidity in a pool
   */
  async getUserLiquidity(
    token0: string,
    token1: string,
    userAddress: string
  ) {
    const functionArgs = [
      standardPrincipalCV(userAddress),
      contractPrincipalCV(CONTRACT_ADDRESS, token0),
      contractPrincipalCV(CONTRACT_ADDRESS, token1),
    ];

    return this.callReadOnly('get-liquidity', functionArgs, userAddress);
  }

  /**
   * Swap tokens
   */
  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    minAmountOut: number,
    senderAddress: string
  ) {
    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenIn),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenOut),
      uintCV(amountIn),
      uintCV(minAmountOut),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'swap-tokens',
      functionArgs,
      senderKey: '', // Will be signed by wallet
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: TX_OPTIONS.fee,
    };

    return txOptions;
  }

  /**
   * Add liquidity to a pool
   */
  async addLiquidity(
    token0: string,
    token1: string,
    amount0: number,
    amount1: number,
    minLiquidity: number,
    senderAddress: string
  ) {
    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, token0),
      contractPrincipalCV(CONTRACT_ADDRESS, token1),
      uintCV(amount0),
      uintCV(amount1),
      uintCV(minLiquidity),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'add-liquidity',
      functionArgs,
      senderKey: '', // Will be signed by wallet
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: TX_OPTIONS.fee,
    };

    return txOptions;
  }

  /**
   * Remove liquidity from a pool
   */
  async removeLiquidity(
    token0: string,
    token1: string,
    liquidity: number,
    minAmount0: number,
    minAmount1: number,
    senderAddress: string
  ) {
    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, token0),
      contractPrincipalCV(CONTRACT_ADDRESS, token1),
      uintCV(liquidity),
      uintCV(minAmount0),
      uintCV(minAmount1),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'remove-liquidity',
      functionArgs,
      senderKey: '', // Will be signed by wallet
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: TX_OPTIONS.fee,
    };

    return txOptions;
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenAddress: string, userAddress: string) {
    const [contractAddr, tokenName] = tokenAddress.split('.');
    
    const functionArgs = [standardPrincipalCV(userAddress)];

    return this.callReadOnly('get-balance', functionArgs, userAddress);
  }

  /**
   * Format transaction for display
   */
  formatTransaction(txId: string): string {
    return `${CONTRACT_ADDRESS}.${CONTRACT_NAME}::${txId}`;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string) {
    try {
      const response = await fetch(
        `${this.network.client.baseUrl}/extended/v1/tx/${txId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stacksDexContract = new StacksDexContract();