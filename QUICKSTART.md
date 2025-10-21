# 🚀 Quick Start Guide

Get your Sente running with Stacks in 5 minutes!

## Step 1: Clone & Install (2 min)

```bash
# Navigate to your project directory
cd sente

# Install dependencies
npm install

# or if you prefer yarn
yarn install

# or pnpm
pnpm install
```

## Step 2: Configure Environment (1 min)

```bash
# Copy environment template
cp .env.example .env.local
```

Your `.env.local` should look like this (already configured for testnet):

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ
NEXT_PUBLIC_CONTRACT_NAME=token-dex
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_EXPLORER_URL=https://explorer.hiro.so
```

## Step 3: Setup Wallet (1 min)

### Option A: Hiro Wallet (Recommended)

1. Go to https://wallet.hiro.so/
2. Click "Download" and install browser extension
3. Create new wallet or import existing
4. **Important**: Switch to **Testnet** in settings

### Option B: Leather Wallet

1. Go to https://leather.io/
2. Install browser extension
3. Setup wallet
4. Switch to testnet

## Step 4: Get Test Tokens (1 min)

1. Go to faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter your testnet address (from wallet)
3. Click "Request STX"
4. Wait ~30 seconds for confirmation

## Step 5: Run the App (30 sec)

```bash
# Start development server
npm run dev

# App will be available at:
# http://localhost:3000
```

## 🎯 First Actions

### 1. Connect Your Wallet

- Click **"Connect Wallet"** button in navbar
- Approve connection in wallet popup
- See your address displayed ✅

### 2. Check Your Balance

- Your STX balance shows in wallet menu
- Click your address to see options
- View on explorer to see full details

### 3. Make Your First Swap

Navigate to http://localhost:3000/swap

1. Select tokens (e.g., STACKS → XUSD)
2. Enter amount
3. Review swap details
4. Click "Swap"
5. Approve in wallet
6. Wait for confirmation 🎉

### 4. Add Liquidity

Navigate to http://localhost:3000/pool

1. Select a pool
2. Enter token amounts
3. Review pool share
4. Click "Add Liquidity"
5. Approve in wallet
6. Earn fees! 💰

## 🔍 Verify Everything Works

### Checklist
- [ ] Wallet connects successfully
- [ ] Address displays in navbar
- [ ] Balance shows correctly
- [ ] Can view address on explorer
- [ ] Can disconnect wallet
- [ ] Swap page loads
- [ ] Pool page loads
- [ ] No console errors

## 🐛 Something Not Working?

### Wallet Won't Connect
```bash
# Check:
1. Wallet extension is installed
2. Wallet is unlocked
3. You're on testnet network
4. Refresh the page
```

### Can't See Balance
```bash
# Solution:
1. Get testnet STX from faucet
2. Wait 30 seconds for confirmation
3. Refresh the page
4. Check on explorer
```

### Page Won't Load
```bash
# Fix:
1. Stop the server (Ctrl+C)
2. Clear cache: rm -rf .next
3. Restart: npm run dev
```

## 📖 Next Steps

Once everything is working:

1. **Read Full Documentation**: Check `INTEGRATION.md`
2. **Explore Features**: Try all pages (Swap, Pools, Vote, Charts)
3. **View Contract**: Visit the contract on [Stacks Explorer](https://explorer.hiro.so/txid/ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ.token-dex?chain=testnet)
4. **Customize**: Update branding, colors, tokens
5. **Deploy**: When ready, deploy to Vercel

## 🎓 Learning Resources

- **Stacks Basics**: https://docs.stacks.co/
- **Clarity Language**: https://book.clarity-lang.org/
- **React Hooks**: Review `src/hooks/useStacksWallet.ts`
- **Contract Integration**: Check `src/lib/stacks/contract.ts`

## 💬 Get Help

- **Documentation**: See `INTEGRATION.md` for detailed guide
- **Stacks Discord**: https://discord.gg/stacks
- **GitHub Issues**: Report bugs in your repo

## 🎉 You're All Set!

Your DEX is running on Stacks testnet. Time to:
- Make some swaps
- Provide liquidity
- Explore governance
- Build amazing features!

Welcome to the Stacks ecosystem! 🚀