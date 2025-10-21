# Stacks DEX Frontend

A decentralized exchange (DEX) frontend built with Next.js, TypeScript, and Tailwind CSS for the Stacks blockchain.

## Features

- Token swapping with AMM pricing
- Liquidity pool management
- Real-time pool statistics
- Transaction history
- Wallet integration with Stacks Connect
- Responsive design for all devices

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── page.tsx              # Main application
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # Header, Navigation, Footer
│   ├── swap/                 # Swap interface components
│   ├── liquidity/            # Liquidity management
│   ├── pools/                # Pool listings
│   ├── history/              # Transaction history
│   └── common/               # Reusable components
├── hooks/
│   ├── useWallet.ts          # Wallet connection logic
│   └── useDEXData.ts         # DEX data fetching
└── lib/
    └── contract.ts           # Stacks contract interactions
```

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Stacks Connect** - Wallet integration
- **Stacks.js** - Blockchain interactions

## Contract Integration

The frontend connects to the token-dex smart contract on Stacks blockchain. Update contract addresses in `lib/contract.ts`.
