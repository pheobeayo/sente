import {
  fetchCallReadOnlyFunction,
  cvToValue,
  standardPrincipalCV,
  uintCV,
  contractPrincipalCV,
  ClarityValue,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import type { ContractCallOptions } from '@stacks/connect';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, API_URL } from './config';

export class StacksDexContract {
  /**
   * Call a read-only contract function
   */
  async callReadOnly(
    functionName: string,
    functionArgs: ClarityValue[],
    senderAddress: string
  ) {
    try {
      console.log(`Calling read-only function: ${functionName}`, {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        senderAddress,
        functionArgs,
      });

      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        network: NETWORK,
        senderAddress,
      });

      const value = cvToValue(result);
      console.log(`Result from ${functionName}:`, value);
      return value;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
      });
      throw error;
    }
  }

  /**
   * Get pool information using get-pool function (CORRECT for your contract)
   */
  async getPoolInfo(tokenX: string, tokenY: string, senderAddress: string) {
    console.log('getPoolInfo called with:', { tokenX, tokenY, senderAddress });

    // Parse token strings to extract contract name only (if format is address.token-name)
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    console.log('Parsed token names:', { tokenXName, tokenYName });

    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
    ];

    
    return this.callReadOnly('get-pool', functionArgs, senderAddress);
  }

  /**
   * Get swap output using constant product formula
   * Parameters: amount-in (uint), reserve-in (uint), reserve-out (uint)
   */
  async getSwapOutput(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    senderAddress: string
  ) {
    console.log('getSwapOutput called with:', { amountIn, reserveIn, reserveOut });

    const functionArgs = [
      uintCV(amountIn),
      uintCV(reserveIn),
      uintCV(reserveOut),
    ];

    return this.callReadOnly('get-swap-output', functionArgs, senderAddress);
  }

  /**
   * Get user's shares/liquidity in a pool
   */
  async getUserShares(
    tokenX: string,
    tokenY: string,
    userAddress: string
  ) {
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    const functionArgs = [
      standardPrincipalCV(userAddress),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
    ];

    return this.callReadOnly('get-user-shares', functionArgs, userAddress);
  }

  /**
   * Get swap quote by fetching pool info and calculating output
   */
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    senderAddress: string
  ) {
    try {
      console.log('getSwapQuote called with:', { tokenIn, tokenOut, amountIn });

      // Get pool information
      const poolData = await this.getPoolInfo(tokenIn, tokenOut, senderAddress);
      
      console.log('Pool data structure:', JSON.stringify(poolData, null, 2));

      if (!poolData) {
        throw new Error('Pool not found - getPoolInfo returned null or undefined');
      }

      // Extract reserves from pool data - handle multiple possible structures
      let reserveX = 0;
      let reserveY = 0;

      if (poolData.value) {
        reserveX = Number(
          poolData.value['reserve-x'] || 
          poolData.value.reserveX || 
          poolData.value['reserveA'] ||
          0
        );
        
        reserveY = Number(
          poolData.value['reserve-y'] || 
          poolData.value.reserveY || 
          poolData.value['reserveB'] ||
          0
        );
      } else {
        reserveX = Number(
          poolData['reserve-x'] || 
          poolData.reserveX || 
          poolData['reserveA'] ||
          0
        );
        
        reserveY = Number(
          poolData['reserve-y'] || 
          poolData.reserveY || 
          poolData['reserveB'] ||
          0
        );
      }

      console.log('Extracted reserves:', { reserveX, reserveY });

      if (reserveX === 0 || reserveY === 0) {
        throw new Error(`Pool has no liquidity or pool doesn't exist. Reserves: X=${reserveX}, Y=${reserveY}`);
      }

      // Calculate output using the contract's formula
      const output = await this.getSwapOutput(
        amountIn,
        reserveX, // reserve-in
        reserveY, // reserve-out
        senderAddress
      );

      return output;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  /**
   * Swap token X for token Y
   */
  async swapXForY(
    tokenX: string,
    tokenY: string,
    amountIn: number,
    minAmountOut: number,
    senderAddress: string,
    onFinish: (data: { txId: string }) => void,
    onCancel: () => void
  ) {
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
      uintCV(amountIn),
      uintCV(minAmountOut),
    ];

    const txOptions: ContractCallOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'swap-x-for-y',
      functionArgs,
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction submitted:', data);
        onFinish({ txId: data.txId });
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        onCancel();
      },
    };

    return openContractCall(txOptions);
  }

  /**
   * Swap token Y for token X
   */
  async swapYForX(
    tokenX: string,
    tokenY: string,
    amountIn: number,
    minAmountOut: number,
    senderAddress: string,
    onFinish: (data: { txId: string }) => void,
    onCancel: () => void
  ) {
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
      uintCV(amountIn),
      uintCV(minAmountOut),
    ];

    const txOptions: ContractCallOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'swap-y-for-x',
      functionArgs,
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction submitted:', data);
        onFinish({ txId: data.txId });
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        onCancel();
      },
    };

    return openContractCall(txOptions);
  }

  /**
   * Smart swap function that determines direction and calls appropriate function
   */
  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    minAmountOut: number,
    senderAddress: string,
    onFinish: (data: { txId: string }) => void,
    onCancel: () => void
  ) {
    console.log('swapTokens called:', { tokenIn, tokenOut, amountIn, minAmountOut });
    
    // Determine swap direction
    // Assuming tokenIn is X and tokenOut is Y for swap-x-for-y
    
    return this.swapXForY(
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
      senderAddress,
      onFinish,
      onCancel
    );
  }

  /**
   * Create a new liquidity pool
   */
  async createPool(
    tokenX: string,
    tokenY: string,
    senderAddress: string,
    onFinish: (data: { txId: string }) => void,
    onCancel: () => void
  ) {
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
    ];

    const txOptions: ContractCallOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-pool',
      functionArgs,
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Pool created:', data);
        onFinish({ txId: data.txId });
      },
      onCancel: () => {
        console.log('Pool creation cancelled');
        onCancel();
      },
    };

    return openContractCall(txOptions);
  }

  /**
   * Add liquidity to a pool
   */
  async addLiquidity(
    tokenX: string,
    tokenY: string,
    amountX: number,
    amountY: number,
    minShares: number,
    senderAddress: string,
    onFinish: (data: { txId: string }) => void,
    onCancel: () => void
  ) {
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
      uintCV(amountX),
      uintCV(amountY),
      uintCV(minShares),
    ];

    const txOptions: ContractCallOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'add-liquidity',
      functionArgs,
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction submitted:', data);
        onFinish({ txId: data.txId });
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        onCancel();
      },
    };

    return openContractCall(txOptions);
  }

  /**
   * Remove liquidity from a pool
   */
  async removeLiquidity(
    tokenX: string,
    tokenY: string,
    shares: number,
    minAmountX: number,
    minAmountY: number,
    senderAddress: string,
    onFinish: (data: { txId: string }) => void,
    onCancel: () => void
  ) {
    const parseToken = (token: string) => {
      const parts = token.split('.');
      return parts.length > 1 ? parts[1] : token;
    };

    const tokenXName = parseToken(tokenX);
    const tokenYName = parseToken(tokenY);

    const functionArgs = [
      contractPrincipalCV(CONTRACT_ADDRESS, tokenXName),
      contractPrincipalCV(CONTRACT_ADDRESS, tokenYName),
      uintCV(shares),
      uintCV(minAmountX),
      uintCV(minAmountY),
    ];

    const txOptions: ContractCallOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'remove-liquidity',
      functionArgs,
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction submitted:', data);
        onFinish({ txId: data.txId });
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        onCancel();
      },
    };

    return openContractCall(txOptions);
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenAddress: string, userAddress: string) {
    const [contractAddr, tokenName] = tokenAddress.split('.');
    
    const functionArgs = [standardPrincipalCV(userAddress)];

    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: tokenName,
        functionName: 'get-balance',
        functionArgs,
        network: NETWORK,
        senderAddress: userAddress,
      });

      return cvToValue(result);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string) {
    try {
      const response = await fetch(
        `${API_URL}/extended/v1/tx/${txId}`
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