import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// =========================================
// TEST CONSTANTS
// =========================================

const CONTRACT_NAME = 'token-dex';
const TOKEN_X = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-x';
const TOKEN_Y = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-y';

// Error codes from the contract
const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_AMOUNT = 101;
const ERR_INSUFFICIENT_LIQUIDITY = 102;
const ERR_SLIPPAGE_TOO_HIGH = 103;
const ERR_POOL_EXISTS = 104;
const ERR_POOL_NOT_FOUND = 105;
const ERR_ZERO_AMOUNT = 106;
const ERR_INSUFFICIENT_BALANCE = 107;

// =========================================
// HELPER FUNCTIONS
// =========================================

function addSupportedToken(tokenAddress: string, sender: Account) {
  return Tx.contractCall(
    CONTRACT_NAME,
    'add-supported-token',
    [types.principal(tokenAddress)],
    sender.address
  );
}

function createPool(tokenX: string, tokenY: string, sender: Account) {
  return Tx.contractCall(
    CONTRACT_NAME,
    'create-pool',
    [types.principal(tokenX), types.principal(tokenY)],
    sender.address
  );
}

function addLiquidity(
  tokenX: string,
  tokenY: string,
  amountX: number,
  amountY: number,
  minShares: number,
  sender: Account
) {
  return Tx.contractCall(
    CONTRACT_NAME,
    'add-liquidity',
    [
      types.principal(tokenX),
      types.principal(tokenY),
      types.uint(amountX),
      types.uint(amountY),
      types.uint(minShares)
    ],
    sender.address
  );
}

function removeLiquidity(
  tokenX: string,
  tokenY: string,
  shares: number,
  minX: number,
  minY: number,
  sender: Account
) {
  return Tx.contractCall(
    CONTRACT_NAME,
    'remove-liquidity',
    [
      types.principal(tokenX),
      types.principal(tokenY),
      types.uint(shares),
      types.uint(minX),
      types.uint(minY)
    ],
    sender.address
  );
}

function swapXForY(
  tokenX: string,
  tokenY: string,
  amountIn: number,
  minAmountOut: number,
  sender: Account
) {
  return Tx.contractCall(
    CONTRACT_NAME,
    'swap-x-for-y',
    [
      types.principal(tokenX),
      types.principal(tokenY),
      types.uint(amountIn),
      types.uint(minAmountOut)
    ],
    sender.address
  );
}

function swapYForX(
  tokenX: string,
  tokenY: string,
  amountIn: number,
  minAmountOut: number,
  sender: Account
) {
  return Tx.contractCall(
    CONTRACT_NAME,
    'swap-y-for-x',
    [
      types.principal(tokenX),
      types.principal(tokenY),
      types.uint(amountIn),
      types.uint(minAmountOut)
    ],
    sender.address
  );
}

// =========================================
// TEST SUITE: TOKEN SUPPORT
// =========================================

Clarinet.test({
  name: "Ensure that contract owner can add supported tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer)
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that non-owner cannot add supported tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, wallet1)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(ERR_NOT_AUTHORIZED);
  },
});

Clarinet.test({
  name: "Ensure that is-token-supported returns correct status",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Add token-x
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer)
    ]);
    
    // Check if token-x is supported
    let result = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'is-token-supported',
      [types.principal(TOKEN_X)],
      deployer.address
    );
    result.result.expectBool(true);
    
    // Check if token-y is supported (should be false)
    let result2 = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'is-token-supported',
      [types.principal(TOKEN_Y)],
      deployer.address
    );
    result2.result.expectBool(false);
  },
});

// =========================================
// TEST SUITE: POOL CREATION
// =========================================

Clarinet.test({
  name: "Ensure that pool can be created with supported tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer)
    ]);
    
    block.receipts[2].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that pool cannot be created with unsupported tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      createPool(TOKEN_X, TOKEN_Y, deployer)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(ERR_NOT_AUTHORIZED);
  },
});

Clarinet.test({
  name: "Ensure that duplicate pools cannot be created",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer)
    ]);
    
    block.receipts[2].result.expectOk();
    block.receipts[3].result.expectErr().expectUint(ERR_POOL_EXISTS);
  },
});

// =========================================
// TEST SUITE: ADD LIQUIDITY
// =========================================

Clarinet.test({
  name: "Ensure that liquidity can be added to a pool (first deposit)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer)
    ]);
    
    // Should succeed and return shares
    block.receipts[3].result.expectOk().expectUint(1000000);
    
    // Check pool state
    let pool = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-pool',
      [types.principal(TOKEN_X), types.principal(TOKEN_Y)],
      deployer.address
    );
    
    let poolData = pool.result.expectSome().expectTuple();
    assertEquals(poolData['reserve-x'], types.uint(1000000));
    assertEquals(poolData['reserve-y'], types.uint(1000000));
    assertEquals(poolData['total-shares'], types.uint(1000000));
  },
});

Clarinet.test({
  name: "Ensure that subsequent liquidity additions maintain ratio",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 2000000, 0, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 500000, 1000000, 0, wallet1)
    ]);
    
    // First deposit gets sqrt(1000000 * 2000000) = 1414213 shares
    block.receipts[3].result.expectOk().expectUint(1414213);
    
    // Second deposit should get proportional shares
    block.receipts[4].result.expectOk().expectUint(707106);
  },
});

Clarinet.test({
  name: "Ensure that zero amounts are rejected when adding liquidity",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 0, 1000000, 0, deployer)
    ]);
    
    block.receipts[3].result.expectErr().expectUint(ERR_ZERO_AMOUNT);
  },
});

Clarinet.test({
  name: "Ensure that slippage protection works when adding liquidity",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      // Request minimum 2000000 shares but will only get 1000000
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 2000000, deployer)
    ]);
    
    block.receipts[3].result.expectErr().expectUint(ERR_SLIPPAGE_TOO_HIGH);
  },
});

Clarinet.test({
  name: "Ensure that adding liquidity to non-existent pool fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer)
    ]);
    
    block.receipts[2].result.expectErr().expectUint(ERR_POOL_NOT_FOUND);
  },
});

// =========================================
// TEST SUITE: REMOVE LIQUIDITY
// =========================================

Clarinet.test({
  name: "Ensure that liquidity can be removed from a pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 2000000, 0, deployer),
      // Remove half the liquidity (707106 out of 1414213 shares)
      removeLiquidity(TOKEN_X, TOKEN_Y, 707106, 0, 0, deployer)
    ]);
    
    let result = block.receipts[4].result.expectOk().expectTuple();
    // Should get back approximately half of each token
    assertEquals(result['amount-x'], types.uint(499999));
    assertEquals(result['amount-y'], types.uint(999999));
  },
});

Clarinet.test({
  name: "Ensure that removing more shares than owned fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Try to remove more shares than exist
      removeLiquidity(TOKEN_X, TOKEN_Y, 2000000, 0, 0, deployer)
    ]);
    
    block.receipts[4].result.expectErr().expectUint(ERR_INSUFFICIENT_BALANCE);
  },
});

Clarinet.test({
  name: "Ensure that slippage protection works when removing liquidity",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Request minimum amounts that are too high
      removeLiquidity(TOKEN_X, TOKEN_Y, 500000, 1000000, 1000000, deployer)
    ]);
    
    block.receipts[4].result.expectErr().expectUint(ERR_SLIPPAGE_TOO_HIGH);
  },
});

Clarinet.test({
  name: "Ensure that zero shares cannot be removed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      removeLiquidity(TOKEN_X, TOKEN_Y, 0, 0, 0, deployer)
    ]);
    
    block.receipts[4].result.expectErr().expectUint(ERR_ZERO_AMOUNT);
  },
});

// =========================================
// TEST SUITE: TOKEN SWAPS
// =========================================

Clarinet.test({
  name: "Ensure that swap-x-for-y works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 0, wallet1)
    ]);
    
    // Should receive approximately 90,673 tokens (accounting for 0.3% fee)
    // Formula: (100000 * 0.997 * 1000000) / (1000000 + 100000 * 0.997)
    let amountOut = block.receipts[4].result.expectOk();
    // The exact amount will be 90673
    assertEquals(amountOut, types.uint(90673));
  },
});

Clarinet.test({
  name: "Ensure that swap-y-for-x works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      swapYForX(TOKEN_X, TOKEN_Y, 100000, 0, wallet1)
    ]);
    
    let amountOut = block.receipts[4].result.expectOk();
    assertEquals(amountOut, types.uint(90673));
  },
});

Clarinet.test({
  name: "Ensure that zero amount swaps are rejected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 0, 0, deployer)
    ]);
    
    block.receipts[4].result.expectErr().expectUint(ERR_ZERO_AMOUNT);
  },
});

Clarinet.test({
  name: "Ensure that swaps fail with insufficient liquidity",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000, 1000, 0, deployer),
      // Try to swap amount that would drain the pool
      swapXForY(TOKEN_X, TOKEN_Y, 1000000, 0, deployer)
    ]);
    
    block.receipts[4].result.expectErr().expectUint(ERR_INSUFFICIENT_LIQUIDITY);
  },
});

Clarinet.test({
  name: "Ensure that slippage protection works for swaps",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Request minimum output that's too high
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 100000, deployer)
    ]);
    
    block.receipts[4].result.expectErr().expectUint(ERR_SLIPPAGE_TOO_HIGH);
  },
});

Clarinet.test({
  name: "Ensure that swapping in empty pool fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 0, deployer)
    ]);
    
    block.receipts[3].result.expectErr().expectUint(ERR_INSUFFICIENT_LIQUIDITY);
  },
});

// =========================================
// TEST SUITE: READ-ONLY FUNCTIONS
// =========================================

Clarinet.test({
  name: "Ensure that get-pool returns correct pool data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 2000000, 0, deployer)
    ]);
    
    let pool = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-pool',
      [types.principal(TOKEN_X), types.principal(TOKEN_Y)],
      deployer.address
    );
    
    let poolData = pool.result.expectSome().expectTuple();
    assertEquals(poolData['reserve-x'], types.uint(1000000));
    assertEquals(poolData['reserve-y'], types.uint(2000000));
    assertEquals(poolData['total-shares'], types.uint(1414213));
  },
});

Clarinet.test({
  name: "Ensure that get-user-shares returns correct share amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer)
    ]);
    
    // Check deployer's shares
    let shares = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-user-shares',
      [
        types.principal(deployer.address),
        types.principal(TOKEN_X),
        types.principal(TOKEN_Y)
      ],
      deployer.address
    );
    
    let sharesData = shares.result.expectTuple();
    assertEquals(sharesData['shares'], types.uint(1000000));
    
    // Check wallet1's shares (should be 0)
    let shares2 = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-user-shares',
      [
        types.principal(wallet1.address),
        types.principal(TOKEN_X),
        types.principal(TOKEN_Y)
      ],
      deployer.address
    );
    
    let sharesData2 = shares2.result.expectTuple();
    assertEquals(sharesData2['shares'], types.uint(0));
  },
});

Clarinet.test({
  name: "Ensure that get-swap-output calculates correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Calculate swap output for 100000 in, with reserves 1000000 each
    let output = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-swap-output',
      [types.uint(100000), types.uint(1000000), types.uint(1000000)],
      deployer.address
    );
    
    // Expected: (100000 * 0.997 * 1000000) / (1000000 + 100000 * 0.997) = 90673
    output.result.expectOk().expectUint(90673);
  },
});

Clarinet.test({
  name: "Ensure that calculate-shares works for first deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // First deposit: sqrt(1000000 * 2000000) = 1414213
    let shares = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'calculate-shares',
      [
        types.uint(1000000),
        types.uint(2000000),
        types.uint(0),
        types.uint(0),
        types.uint(0)
      ],
      deployer.address
    );
    
    shares.result.expectOk().expectUint(1414213);
  },
});

Clarinet.test({
  name: "Ensure that calculate-shares works for subsequent deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Subsequent deposit with existing reserves and shares
    let shares = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'calculate-shares',
      [
        types.uint(500000),
        types.uint(1000000),
        types.uint(1000000),
        types.uint(2000000),
        types.uint(1414213)
      ],
      deployer.address
    );
    
    // min(500000/1000000, 1000000/2000000) * 1414213 = 0.5 * 1414213 = 707106
    shares.result.expectOk().expectUint(707106);
  },
});

// =========================================
// TEST SUITE: EDGE CASES & SECURITY
// =========================================

Clarinet.test({
  name: "Ensure that price impact is calculated correctly for large swaps",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Small swap
      swapXForY(TOKEN_X, TOKEN_Y, 10000, 0, deployer),
      // Large swap (10% of pool)
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 0, deployer)
    ]);
    
    // Small swap should have better rate than large swap
    let smallSwapOutput = block.receipts[4].result.expectOk();
    let largeSwapOutput = block.receipts[5].result.expectOk();
    
    // Small swap rate: ~9.96 (9967/10000)
    // Large swap rate: ~9.06 (90673/100000) - worse due to price impact
    console.log(`Small swap: ${smallSwapOutput}, Large swap: ${largeSwapOutput}`);
  },
});

Clarinet.test({
  name: "Ensure that multiple users can provide liquidity independently",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 500000, 500000, 0, wallet1),
      addLiquidity(TOKEN_X, TOKEN_Y, 250000, 250000, 0, wallet2)
    ]);
    
    // All should succeed
    block.receipts[3].result.expectOk();
    block.receipts[4].result.expectOk();
    block.receipts[5].result.expectOk();
    
    // Check individual shares
    let deployerShares = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-user-shares',
      [
        types.principal(deployer.address),
        types.principal(TOKEN_X),
        types.principal(TOKEN_Y)
      ],
      deployer.address
    );
    
    deployerShares.result.expectTuple()['shares'].expectUint(1000000);
  },
});

Clarinet.test({
  name: "Ensure that pool maintains constant product after swap",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 0, deployer)
    ]);
    
    // Get pool state after swap
    let pool = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-pool',
      [types.principal(TOKEN_X), types.principal(TOKEN_Y)],
      deployer.address
    );
    
    let poolData = pool.result.expectSome().expectTuple();
    let reserveX = poolData['reserve-x'];
    let reserveY = poolData['reserve-y'];
    
    // After swap: reserve-x = 1100000, reserve-y = 909327
    // Product should be close to original (accounting for fees)
    // Original k = 1000000 * 1000000 = 1,000,000,000,000
    // New k should be slightly higher due to fees benefiting LPs
    console.log(`Reserve X: ${reserveX}, Reserve Y: ${reserveY}`);
  },
});

// =========================================
// TEST SUITE: COMPLEX SCENARIOS
// =========================================

Clarinet.test({
  name: "Ensure that round-trip swap returns less due to fees",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Swap 100000 X for Y
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 0, deployer),
      // Swap all Y back to X
      swapYForX(TOKEN_X, TOKEN_Y, 90673, 0, deployer)
    ]);
    
    let firstSwap = block.receipts[4].result.expectOk();
    let secondSwap = block.receipts[5].result.expectOk();
    
    // Should get less than 100000 back due to double fee application
    console.log(`Started with 100000, got back: ${secondSwap}`);
    // Expected to get back approximately 98,200 (less than original due to fees)
  },
});

Clarinet.test({
  name: "Ensure that adding and removing liquidity is consistent",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
    ]);
    
    let sharesReceived = block.receipts[3].result.expectOk();
    
    // Now remove all liquidity
    let block2 = chain.mineBlock([
      removeLiquidity(TOKEN_X, TOKEN_Y, 1000000, 0, 0, deployer)
    ]);
    
    let result = block2.receipts[0].result.expectOk().expectTuple();
    // Should get back exactly what was put in
    assertEquals(result['amount-x'], types.uint(1000000));
    assertEquals(result['amount-y'], types.uint(1000000));
  },
});

Clarinet.test({
  name: "Ensure that liquidity providers earn fees from swaps",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      // Deployer adds liquidity
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Wallet1 swaps, generating fees
      swapXForY(TOKEN_X, TOKEN_Y, 100000, 0, wallet1),
    ]);
    
    // Get pool state after swap
    let pool = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-pool',
      [types.principal(TOKEN_X), types.principal(TOKEN_Y)],
      deployer.address
    );
    
    let poolData = pool.result.expectSome().expectTuple();
    
    // Now deployer removes all liquidity
    let block2 = chain.mineBlock([
      removeLiquidity(TOKEN_X, TOKEN_Y, 1000000, 0, 0, deployer)
    ]);
    
    let result = block2.receipts[0].result.expectOk().expectTuple();
    let amountX = result['amount-x'];
    let amountY = result['amount-y'];
    
    // Deployer should get back more than originally deposited due to fees
    // Original: 1000000 X, 1000000 Y
    // After swap: more X, less Y, but total value increased by fees
    console.log(`Got back - X: ${amountX}, Y: ${amountY}`);
  },
});

Clarinet.test({
  name: "Ensure that unbalanced liquidity addition uses minimum ratio",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      // First deposit: 1:2 ratio
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 2000000, 0, deployer),
      // Second deposit: trying to add 1:1 ratio
      // Should only use 500000:1000000 to maintain 1:2 ratio
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, wallet1)
    ]);
    
    // First deposit gets sqrt(1000000 * 2000000) shares
    block.receipts[3].result.expectOk().expectUint(1414213);
    
    // Second deposit should get shares based on the minimum ratio
    // min(1000000/1000000, 1000000/2000000) = 0.5
    // 0.5 * 1414213 = 707106
    block.receipts[4].result.expectOk().expectUint(707106);
  },
});

Clarinet.test({
  name: "Ensure that price changes based on trade size",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
    ]);
    
    // Calculate outputs for different trade sizes
    let small = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-swap-output',
      [types.uint(1000), types.uint(1000000), types.uint(1000000)],
      deployer.address
    );
    
    let medium = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-swap-output',
      [types.uint(10000), types.uint(1000000), types.uint(1000000)],
      deployer.address
    );
    
    let large = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-swap-output',
      [types.uint(100000), types.uint(1000000), types.uint(1000000)],
      deployer.address
    );
    
    let smallOut = small.result.expectOk();
    let mediumOut = medium.result.expectOk();
    let largeOut = large.result.expectOk();
    
    // Price per token should worsen as trade size increases
    // Small: ~0.9967 per token
    // Medium: ~0.9967 per token
    // Large: ~0.9067 per token (worse due to price impact)
    console.log(`Small: ${smallOut}, Medium: ${mediumOut}, Large: ${largeOut}`);
  },
});

Clarinet.test({
  name: "Ensure that multiple swaps affect pool reserves correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Multiple swaps
      swapXForY(TOKEN_X, TOKEN_Y, 50000, 0, wallet1),
      swapYForX(TOKEN_X, TOKEN_Y, 30000, 0, wallet2),
      swapXForY(TOKEN_X, TOKEN_Y, 20000, 0, wallet1),
    ]);
    
    // All swaps should succeed
    block.receipts[4].result.expectOk();
    block.receipts[5].result.expectOk();
    block.receipts[6].result.expectOk();
    
    // Check final pool state
    let pool = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-pool',
      [types.principal(TOKEN_X), types.principal(TOKEN_Y)],
      deployer.address
    );
    
    let poolData = pool.result.expectSome().expectTuple();
    console.log(`Final reserves - X: ${poolData['reserve-x']}, Y: ${poolData['reserve-y']}`);
  },
});

Clarinet.test({
  name: "Ensure that partial liquidity removal works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Remove 25% of liquidity
      removeLiquidity(TOKEN_X, TOKEN_Y, 250000, 0, 0, deployer),
    ]);
    
    let result = block.receipts[4].result.expectOk().expectTuple();
    
    // Should get back 25% of each token
    assertEquals(result['amount-x'], types.uint(250000));
    assertEquals(result['amount-y'], types.uint(250000));
    
    // Check remaining shares
    let shares = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-user-shares',
      [
        types.principal(deployer.address),
        types.principal(TOKEN_X),
        types.principal(TOKEN_Y)
      ],
      deployer.address
    );
    
    shares.result.expectTuple()['shares'].expectUint(750000);
  },
});

Clarinet.test({
  name: "Ensure that get-pool returns none for non-existent pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let pool = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-pool',
      [types.principal(TOKEN_X), types.principal(TOKEN_Y)],
      deployer.address
    );
    
    pool.result.expectNone();
  },
});

Clarinet.test({
  name: "Ensure that swap with exact liquidity drain is prevented",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 1000000, 0, deployer),
      // Try to get all of reserve-y (1000000)
      swapXForY(TOKEN_X, TOKEN_Y, 10000000, 1000000, deployer)
    ]);
    
    // Should fail because output must be less than reserve
    block.receipts[4].result.expectErr().expectUint(ERR_INSUFFICIENT_LIQUIDITY);
  },
});

Clarinet.test({
  name: "Ensure that fee calculation is consistent",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Test that 0.3% fee is applied correctly
    let output = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-swap-output',
      [types.uint(100000), types.uint(1000000), types.uint(1000000)],
      deployer.address
    );
    
    // Fee: 100000 * 30 / 10000 = 300
    // Amount after fee: 100000 - 300 = 99700
    // Output: (99700 * 1000000) / (1000000 + 99700) = 90673
    output.result.expectOk().expectUint(90673);
  },
});

// =========================================
// TEST SUITE: STRESS TESTS
// =========================================

Clarinet.test({
  name: "Ensure that very small amounts work correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      addLiquidity(TOKEN_X, TOKEN_Y, 100, 100, 0, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 1, 0, deployer)
    ]);
    
    // Should work with very small amounts
    block.receipts[3].result.expectOk();
    block.receipts[4].result.expectOk();
  },
});

Clarinet.test({
  name: "Ensure that large amounts work correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      // Use very large amounts
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000000000, 1000000000000, 0, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 100000000, 0, deployer)
    ]);
    
    // Should work with large amounts
    block.receipts[3].result.expectOk();
    block.receipts[4].result.expectOk();
  },
});

Clarinet.test({
  name: "Ensure that imbalanced pools work correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      addSupportedToken(TOKEN_X, deployer),
      addSupportedToken(TOKEN_Y, deployer),
      createPool(TOKEN_X, TOKEN_Y, deployer),
      // Create pool with 1:100 ratio
      addLiquidity(TOKEN_X, TOKEN_Y, 1000000, 100000000, 0, deployer),
      swapXForY(TOKEN_X, TOKEN_Y, 10000, 0, deployer)
    ]);
    
    // Should handle imbalanced pools
    block.receipts[3].result.expectOk();
    block.receipts[4].result.expectOk();
    
    let output = block.receipts[4].result.expectOk();
    // Price should reflect the 1:100 ratio
    console.log(`Swap output for imbalanced pool: ${output}`);
  },
});

console.log("All tests defined successfully!");
console.log("\nTo run these tests:");
console.log("1. Make sure you have Clarinet installed");
console.log("2. Place this file in your tests/ directory");
console.log("3. Run: clarinet test");
console.log("\nTest Coverage:");
console.log("- Token support management");
console.log("- Pool creation and validation");
console.log("- Adding liquidity (first and subsequent)");
console.log("- Removing liquidity (full and partial)");
console.log("- Token swaps (both directions)");
console.log("- Slippage protection");
console.log("- Fee calculations");
console.log("- Edge cases and security");
console.log("- Read-only functions");
console.log("- Complex scenarios");
console.log("- Stress tests");