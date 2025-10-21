# Sente - Decentralized Exchange

A modern, feature-rich decentralized exchange (DEX) built with Next.js 14, TypeScript, and Tailwind CSS, integrated with Stacks blockchain.

> **Stacks Integration**: This DEX is connected to the Stacks testnet contract at `ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ.token-dex`

## Features

- 🔄 **Token Swapping** - Fast and efficient token swaps with real-time pricing
- 💧 **Liquidity Pools** - Provide liquidity and earn trading fees
- 🗳️ **Governance** - Community-driven protocol decisions through SENTE token
- 📊 **Analytics** - Comprehensive charts and trading insights
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🔐 **Web3 Integration** - Connect with MetaMask, WalletConnect, and more

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand (planned)
- **Web3**: stacks (planned)

## Project Structure

```
sente-dex/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── swap/              # Swap interface
│   │   ├── pool/              # Liquidity pools
│   │   ├── vote/              # Governance
│   │   ├── charts/            # Analytics
│   │   └── docs/              # Documentation
│   ├── components/            # React components
│   │   ├── layout/            # Layout components
│   │   ├── swap/              # Swap components
│   │   ├── pool/              # Pool components
│   │   └── common/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # App constants
│   └── store/                 # State management
└── public/                    # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sente.git
cd sente
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=your_rpc_url
NEXT_PUBLIC_ROUTER_ADDRESS=your_router_address
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Pages

### Landing Page (`/`)
- Hero section with stats
- Feature showcase
- How it works guide
- Testimonials
- Call-to-action sections

### Swap (`/swap`)
- Token swap interface
- Real-time price quotes
- Slippage settings
- Transaction history

### Pools (`/pool`)
- Pool list with sorting/filtering
- Pool details and analytics
- Add/remove liquidity
- Fee claiming

### Vote (`/vote`)
- Active proposals
- Voting interface
- Governance stats
- Proposal creation

### Charts (`/charts`)
- TVL tracking
- Volume analytics
- Fee metrics
- Top trading pairs

### Docs (`/docs`)
- Getting started guides
- Trading tutorials
- Liquidity provision
- Developer resources

## Smart Contract Integration

This frontend is designed to work with standard AMM DEX contracts (Uniswap V2 style). You'll need to:

1. Deploy or connect to existing DEX contracts
2. Update contract addresses in `.env.local`
3. Implement Web3 integration in `hooks`
4. Add contract ABIs to your project

## Customization

### Branding
- Update logo and colors in `tailwind.config.ts`
- Modify global styles in `/app/globals.css`
- Replace token images in `public/images/tokens/`

### Theme
The app uses a purple/pink gradient theme. You can customize:
- Primary colors in Tailwind config
- Gradient backgrounds
- Component styles

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

```bash
npm run build
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Vercel
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_NETWORK=testnet

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_CONTRACT_NAME=

# API Endpoints
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
# For mainnet: https://api.hiro.so

NEXT_PUBLIC_EXPLORER_URL=https://explorer.hiro.so

# App Configuration
NEXT_PUBLIC_APP_NAME=Sente
NEXT_PUBLIC_APP_URL=

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## Features by Page

### Swap Page
- ✅ Token selection modal
- ✅ Amount input with balance display
- ✅ Slippage tolerance settings
- ✅ Price impact calculation
- ✅ Fee display
- ✅ Recent transactions
- ⏳ Web3 integration (pending)
- ⏳ Token approval flow (pending)

### Pool Page
- ✅ Pool list with stats
- ✅ Search and filtering
- ✅ Sort by TVL, volume, APR
- ✅ Pool composition display
- ✅ Add/remove liquidity UI
- ⏳ LP token management (pending)
- ⏳ Fee claiming (pending)

### Vote Page
- ✅ Proposal listing
- ✅ Status filters
- ✅ Voting progress bars
- ✅ Voting interface
- ⏳ On-chain proposal data (pending)
- ⏳ Vote submission (pending)

### Charts Page
- ✅ TVL chart
- ✅ Volume chart
- ✅ Fees chart
- ✅ Pool distribution
- ✅ Top pairs table
- ⏳ Real-time data updates (pending)

### Docs Page
- ✅ Documentation structure
- ✅ Category navigation
- ✅ Search functionality
- ✅ Quick links
- ⏳ Actual content (pending)

## Roadmap

### Phase 1: Core Features ✅
- [x] Landing page
- [x] Swap interface
- [x] Pool management
- [x] Governance
- [x] Analytics dashboard
- [x] Documentation

### Phase 2: Web3 Integration 🚧
- [ ] Wallet connection
- [ ] Token approvals
- [ ] Swap execution
- [ ] Liquidity management
- [ ] Governance voting
- [ ] Transaction notifications

### Phase 3: Advanced Features 📋
- [ ] Limit orders
- [ ] Price alerts
- [ ] Portfolio tracking
- [ ] Advanced charts
- [ ] Mobile app
- [ ] Multi-chain support

### Phase 4: Optimization 📋
- [ ] Performance improvements
- [ ] SEO optimization
- [ ] PWA support
- [ ] Enhanced accessibility
- [ ] Internationalization

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add comments for complex logic
- Test on multiple screen sizes
- Ensure accessibility standards

## Testing

```bash
# Run linter
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

## Performance

- Lighthouse Score: 90+ (target)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Security

- No private keys stored
- All transactions require user confirmation
- Smart contract interactions are audited
- HTTPS enforced in production
- CSP headers configured

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Uniswap for DEX design inspiration
- Next.js team for the amazing framework
- Tailwind CSS for utility-first styling
- Recharts for beautiful charts
- The DeFi community

## Support

- Documentation: [docs](/docs)


## Contributors

Created with ❤️ by Ifeoluwa Sanni

---

**Note**: This is a frontend template. You need to integrate with actual smart contracts for full functionality.