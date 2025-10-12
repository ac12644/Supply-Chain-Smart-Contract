# 🌾 AgriChain Frontend

A modern, responsive frontend for the AgriChain agricultural supply chain platform built with Next.js, TypeScript, and shadcn/ui.

## 🚀 Features

- **Modern UI/UX**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Component Library**: Uses shadcn/ui for consistent, accessible components
- **Web3 Integration**: Seamless MetaMask integration with ethers.js
- **Real-time Updates**: Live contract interaction and state management
- **Responsive Design**: Mobile-first design that works on all devices
- **Type Safety**: Full TypeScript support with contract type definitions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI primitives
- **Web3**: ethers.js v6
- **Icons**: Lucide React
- **State Management**: React hooks + custom hooks

## 📦 Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.local.example .env.local
   ```

   Update the contract addresses in `.env.local` after deploying your contracts.

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Contract addresses (update after deployment)
NEXT_PUBLIC_SUPPLY_CHAIN_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_ADDRESS=0x...

# Network configuration
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_NETWORK_NAME=localhost

# IPFS configuration
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

# App configuration
NEXT_PUBLIC_APP_NAME=AgriChain
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### Contract Addresses

After deploying your smart contracts, update the contract addresses in `.env.local`:

1. Deploy contracts using Hardhat
2. Copy the deployed addresses
3. Update `.env.local` with the new addresses
4. Restart the development server

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── ProductCard.tsx  # Product display card
│   │   ├── ProductForm.tsx  # Product creation form
│   │   └── WalletConnect.tsx # Wallet connection
│   ├── hooks/               # Custom React hooks
│   │   └── useWeb3.ts       # Web3 integration hook
│   └── lib/                 # Utilities and configurations
│       ├── contracts.ts     # Contract ABIs and types
│       └── utils.ts         # Utility functions
├── public/                  # Static assets
├── components.json          # shadcn/ui configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🎨 Components

### Core Components

- **`WalletConnect`**: MetaMask wallet connection and user info
- **`Dashboard`**: Main dashboard with stats and product management
- **`ProductCard`**: Individual product display with actions
- **`ProductForm`**: Form for creating new products

### UI Components

All UI components are from shadcn/ui and include:

- Button, Card, Input, Label, Textarea
- Select, Badge, Alert, Dialog, Sheet
- Fully accessible and customizable

## 🔌 Web3 Integration

### useWeb3 Hook

The `useWeb3` hook provides:

```typescript
const {
  // Connection state
  account,
  isConnected,
  isLoading,
  error,

  // Contract instances
  supplyChain,
  escrow,
  reputation,

  // User data
  role,
  reputation,
  products,
  isVerified,

  // Actions
  connectWallet,
  disconnectWallet,
  loadUserData,
} = useWeb3();
```

### Contract Interaction

All contract interactions are handled through the hook:

```typescript
// Create product
await supplyChain.produceItemByFarmer(
  0,
  ipfsHash,
  ethers.parseEther(price),
  deadline
);

// Purchase product
await supplyChain.purchaseItemByDistributor(productCode, {
  value: ethers.parseEther(price),
});
```

## 🎯 User Roles

The frontend supports all four user roles:

- **Farmer**: Create products, list for sale, ship products
- **Distributor**: Purchase, process, package, and resell products
- **Retailer**: Purchase from distributors and sell to consumers
- **Consumer**: Purchase final products

Each role sees different actions and interfaces based on their permissions.

## 📱 Responsive Design

The frontend is fully responsive with:

- **Mobile-first**: Optimized for mobile devices
- **Tablet support**: Adaptive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Touch-friendly**: Large touch targets and gestures

## 🔒 Security Features

- **Input validation**: Client-side validation for all forms
- **Error handling**: Comprehensive error handling and user feedback
- **Type safety**: Full TypeScript coverage
- **Safe contracts**: All contract interactions are properly typed

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify**: Static export
- **AWS Amplify**: Full-stack deployment
- **Railway**: Simple deployment
- **Docker**: Containerized deployment

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the main README
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@agrichain.com

---

Built with ❤️ for the agricultural community
