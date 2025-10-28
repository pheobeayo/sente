# ✅ Integration documentation



---

## 📦 Files Created for Integration

### Configuration
- ✅ `src/lib/stacks/config.ts` - Stacks network and contract configuration
- ✅ `.env.example` - Environment variables template for Stacks

### Smart Contract Integration
- ✅ `src/lib/stacks/contract.ts` - Contract interaction layer
  - Read-only function calls
  - Transaction building
  - Pool queries
  - Swap quotes
  - Liquidity management

### React Hooks
- ✅ `src/hooks/useStacksWallet.ts` - Wallet connection and management
- ✅ `src/hooks/useStacksSwap.ts` - Token swapping functions
- ✅ `src/hooks/useStacksPool.ts` - Liquidity pool operations

### Updated Components for Integration
- ✅ `src/components/layout/Navbar.tsx` - Stacks wallet connection
  - Connect/disconnect functionality
  - Address display
  - Explorer links
  

### Documentation
- ✅ `STACKS_SETUP.md` - Complete integration guide
- ✅ `INTEGRATION.md` - This summary
- ✅ Updated `README.md` - Added Stacks-specific information
- ✅ Updated `package.json` - Added Stacks dependencies

---

## 🔧 Dependencies Added

```json
{
  "@stacks/connect": "^8.2.0",
  "@stacks/network": "^7.2.0",
  "@stacks/transactions": "^7.2.0",
}
```

---

## 🚀 How to Use

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

The contract details are pre-configured for the testnet contract.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Connect Wallet

1. Install [Hiro Wallet](https://wallet.hiro.so/)
2. Switch to **Testnet** network
3. Get testnet STX from [faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
4. Click "Connect Wallet" in the app

---

## 🎯 Available Features

### Wallet Integration ✅
- Connect Hiro/Leather wallet
- Display connected address
- Show STX balance
- Disconnect functionality
- Mobile-responsive wallet menu

### Contract Functions (Ready to Use)

#### Read-Only Functions
```typescript
// Get pool information
stacksDexContract.getPoolInfo(token0, token1, userAddress)

// Get swap quote
stacksDexContract.getSwapQuote(tokenIn, tokenOut, amountIn, userAddress)

// Get user's liquidity
stacksDexContract.getUserLiquidity(token0, token1, userAddress)
```

#### Write Functions
```typescript
// Execute swap
const { executeSwap } = useStacksSwap();
await executeSwap(tokenIn, tokenOut, amountIn, minAmountOut);

// Add liquidity
const { addLiquidity } = useStacksPool();
await addLiquidity(token0, token1, amount0, amount1, minLiquidity);

// Remove liquidity
const { removeLiquidity } = useStacksPool();
await removeLiquidity(token0, token1, liquidity, minAmount0, minAmount1);
```

---

## 📝 Implementation Examples

### Swap Page Integration

```typescript
'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksSwap } from '@/hooks/useStacksSwap';

export default function SwapPage() {
  const { isConnected, stxAddress } = useStacksWallet();
  const { executeSwap, getQuote, isSwapping } = useStacksSwap();

  const handleSwap = async () => {
    if (!isConnected) {
      alert('Please connect wallet');
      return;
    }

    try {
      // Get quote first
      const quote = await getQuote('usda-token', 'xusd-token', 1000000);
      console.log('Quote:', quote);

      // Execute swap with 5% slippage
      const minOut = quote.amountOut * 0.95;
      await executeSwap('usda-token', 'xusd-token', 1000000, minOut);
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  return (
    <button onClick={handleSwap} disabled={isSwapping}>
      {isSwapping ? 'Swapping...' : 'Swap Tokens'}
    </button>
  );
}
```

### Pool Page Integration

```typescript
'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksPool } from '@/hooks/useStacksPool';

export default function PoolPage() {
  const { isConnected } = useStacksWallet();
  const { addLiquidity, getPoolInfo, isLoading } = useStacksPool();

  const handleAddLiquidity = async () => {
    if (!isConnected) return;

    try {
      // Get pool info first
      const poolInfo = await getPoolInfo('usda-token', 'xusd-token');
      console.log('Pool Info:', poolInfo);

      // Add liquidity (example: 1000 of each token)
      await addLiquidity(
        'usda-token',
        'xusd-token',
        1000000, // amount0
        1000000, // amount1
        900000   // minLiquidity (10% slippage)
      );
    } catch (error) {
      console.error('Add liquidity failed:', error);
    }
  };

  return (
    <button onClick={handleAddLiquidity} disabled={isLoading}>
      {isLoading ? 'Adding...' : 'Add Liquidity'}
    </button>
  );
}
```

---

## 🔐 Security Considerations

### Transaction Flow
1. ✅ User initiates action (swap, add/remove liquidity)
2. ✅ Frontend builds transaction with contract function
3. ✅ Hiro Wallet popup opens for user approval
4. ✅ User reviews and signs transaction
5. ✅ Transaction broadcast to Stacks network
6. ✅ Wait for confirmation
7. ✅ UI updates with transaction result

### Key Security Features
- ✅ No private keys stored in frontend
- ✅ All transactions require wallet approval
- ✅ Post-conditions can be added for safety
- ✅ Read-only functions don't require signing
- ✅ Transaction validation before broadcast

---

## 🧪 Testing Checklist

### Wallet Connection
- [ ] Connect Hiro Wallet successfully
- [ ] Display correct address in navbar
- [ ] Show STX balance
- [ ] Copy address to clipboard
- [ ] View address on explorer
- [ ] Disconnect wallet
- [ ] Reconnect after page refresh

### Contract Interactions
- [ ] Get swap quote
- [ ] Execute token swap
- [ ] Get pool information
- [ ] Add liquidity to pool
- [ ] Remove liquidity from pool
- [ ] View transaction on explorer
- [ ] Handle transaction errors gracefully

### UI/UX
- [ ] Mobile responsive wallet menu
- [ ] Loading states during transactions
- [ ] Error messages display correctly
- [ ] Success notifications show
- [ ] Transaction links work

---

## 📊 Contract Functions Available

## Smart Contract Functions

The DEX contract supports these main functions:

### Read-Only Functions

```clarity
;; Get pool information
(get-pool-info (token-a principal) (token-b principal))

;; Get swap quote
(get-swap-quote (token-in principal) (token-out principal) (amount-in uint))

;; Get user liquidity
(get-liquidity (user principal) (token-a principal) (token-b principal))

;; Get token balance
(get-balance (user principal))
```

### Public Functions

```clarity
;; Swap tokens
(swap-tokens (token-in principal) (token-out principal) 
             (amount-in uint) (min-amount-out uint))

;; Add liquidity
(add-liquidity (token-a principal) (token-b principal)
               (amount-a uint) (amount-b uint) (min-liquidity uint))

;; Remove liquidity
(remove-liquidity (token-a principal) (token-b principal)
                  (liquidity uint) (min-amount-a uint) (min-amount-b uint))
```

## Code Examples

### Calling Contract Functions

```typescript
import { stacksDexContract } from '@/lib/stacks/contract';
import { useStacksWallet } from '@/hooks/useStacksWallet';

// In your component
const { stxAddress } = useStacksWallet();

// Get swap quote
const quote = await stacksDexContract.getSwapQuote(
  'usda-token',
  'xusd-token',
  1000000, // 1 token (6 decimals)
  stxAddress
);

// Execute swap
const txOptions = await stacksDexContract.swapTokens(
  'usda-token',
  'xusd-token',
  1000000,
  950000, // min output with 5% slippage
  stxAddress
);

// Broadcast transaction
const response = await openContractCall(txOptions);
```

### Reading Pool Data

```typescript
// Get pool information
const poolInfo = await stacksDexContract.getPoolInfo(
  'usda-token',
  'xusd-token',
  stxAddress
);

console.log('Pool Reserves:', poolInfo);
console.log('Total Liquidity:', poolInfo.totalLiquidity);
```

## Transaction Flow

1. **User Action** → Button click in UI
2. **Build Transaction** → Create transaction options
3. **Wallet Popup** → Hiro Wallet opens for approval
4. **User Confirms** → Signs transaction
5. **Broadcast** → Transaction sent to mempool
6. **Confirmation** → Wait for block confirmation
7. **Update UI** → Refresh balances and data

## Debugging

### Check Wallet Connection

```typescript
import { isConnected } from '@stacks/connect';

console.log('Wallet connected:', isConnected());
```

### View Transaction Status

```typescript
const status = await stacksDexContract.getTransactionStatus(txId);
console.log('TX Status:', status);
```

### Swap Functions
| Function | Type | Description |
|----------|------|-------------|
| `get-swap-quote` | Read-only | Get expected output amount |
| `swap-tokens` | Public | Execute token swap |

### Liquidity Functions
| Function | Type | Description |
|----------|------|-------------|
| `get-pool-info` | Read-only | Get pool reserves and data |
| `get-liquidity` | Read-only | Get user's LP tokens |
| `add-liquidity` | Public | Add tokens to pool |
| `remove-liquidity` | Public | Withdraw tokens from pool |

### Token Functions
| Function | Type | Description |
|----------|------|-------------|
| `get-balance` | Read-only | Get token balance |
| `transfer` | Public | Transfer tokens |

---
### Common Issues

**Issue**: Wallet not connecting
- **Solution**: Make sure Hiro Wallet extension is installed and unlocked

**Issue**: Transaction failing
- **Solution**: Check you have enough STX for gas fees

**Issue**: "Insufficient balance" error
- **Solution**: Ensure you have testnet STX from the faucet

**Issue**: Contract function not found
- **Solution**: Verify contract address and function names match deployment

## Testing

### Manual Testing Checklist

- [ ] Connect wallet successfully
- [ ] Disconnect wallet
- [ ] View STX balance
- [ ] Get swap quote
- [ ] Execute token swap
- [ ] Add liquidity to pool
- [ ] Remove liquidity from pool
- [ ] View transaction on explorer
- [ ] Vote on proposal (if governance enabled)

### Test Accounts

Use testnet accounts for development:
```
Address: ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ
Network: Testnet
```

## Contract Verification

View the deployed contract on Stacks Explorer:
https://explorer.hiro.so/txid/ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ.token-dex?chain=testnet

## API Endpoints

### Hiro API

```bash
# Get address balance
GET https://api.testnet.hiro.so/extended/v1/address/{address}/balances

# Get transaction
GET https://api.testnet.hiro.so/extended/v1/tx/{txId}

# Get contract info
GET https://api.testnet.hiro.so/v2/contracts/interface/{address}/{contractName}
```

## Mainnet Deployment

When ready for mainnet:

1. Update `.env.local`:
```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_STACKS_API_URL=https://api.hiro.so
```

2. Deploy contract to mainnet

3. Update contract address in config

4. Test thoroughly on mainnet

## Resources

- **Stacks Docs**: https://docs.stacks.co/
- **Hiro Wallet**: https://wallet.hiro.so/
- **Stacks Explorer**: https://explorer.hiro.so/
- **Clarity Language**: https://docs.stacks.co/clarity/
- **@stacks/connect Docs**: https://connect.stacks.js.org/

## Support

- Discord: [Join SenteDex Community](#)
- GitHub Issues: [Report bugs](#)
- Documentation: `/docs` page

## Next Steps

1. ✅ Connect your wallet
2. ✅ Get testnet STX
3. ✅ Try swapping tokens
4. ✅ Add liquidity to a pool
5. ✅ Explore governance features

Happy trading on Stacks! 🚀
