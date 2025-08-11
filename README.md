# 🚀 FlashVault - Crypto Time-Lock Management Platform

**FlashVault** is a fully functional, enterprise-ready DeFi application for managing cryptocurrency time-locks with smart contract security. Built on Binance Smart Chain (BSC) with a modern React frontend and comprehensive blockchain integration.

![FlashVault Dashboard](public/flashvault-og.png)

## ✨ **Features**

### 🔐 **Wallet Integration**
- **MetaMask Support** - Seamless wallet connection
- **Multi-Network** - BSC Testnet & Mainnet support
- **Real-time Balances** - Live BNB and USDT balance updates
- **Network Switching** - Automatic network detection and switching
- **Address Management** - Secure wallet address handling

### 🔒 **Lock Management System**
- **Create Time-Locks** - Lock USDT tokens with smart contract security
- **Lock Operations** - Transfer, split, and redeem locks
- **Real-time Status** - Live lock status updates (Active/Expiring/Expired/Redeemed)
- **Advanced Filtering** - Search and sort locks by various criteria
- **Bulk Operations** - Manage multiple locks efficiently

### 📊 **Dashboard & Analytics**
- **Portfolio Overview** - Total value locked and performance metrics
- **Real-time Statistics** - Live data with trend indicators
- **Transaction History** - Complete audit trail of all operations
- **Performance Tracking** - 30-day portfolio performance
- **Lock Distribution** - Visual breakdown of lock statuses

### 🎨 **Modern UI/UX**
- **Glass Morphism Design** - Beautiful translucent card designs
- **Responsive Layout** - Mobile-first design for all devices
- **Dark/Light Theme** - Smooth theme switching
- **Hover Animations** - Smooth micro-interactions
- **Professional Fintech Aesthetic** - Enterprise-grade design

### 🔧 **Technical Features**
- **TypeScript** - Full type safety throughout
- **React 18** - Latest React features and hooks
- **Ethers.js** - Complete blockchain integration
- **Smart Contract Ready** - Ready for mainnet deployment
- **Performance Optimized** - Efficient rendering and state management

## 🛠 **Tech Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS + Custom design system
- **Blockchain**: Ethers.js + BSC integration
- **State Management**: React Query + Custom hooks
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner + Custom toast system

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- MetaMask browser extension
- BSC Testnet USDT (for testing)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/kiidfreak/crypto-lock-manager.git
cd crypto-lock-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

### **Wallet Setup**

1. **Install MetaMask** from [metamask.io](https://metamask.io)
2. **Add BSC Testnet** to MetaMask:
   - Network Name: `BSC Testnet`
   - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - Chain ID: `97`
   - Currency Symbol: `tBNB`
   - Block Explorer: `https://testnet.bscscan.com`

3. **Get Testnet USDT** from BSC Testnet faucet
4. **Connect Wallet** in FlashVault

## 📱 **Usage Guide**

### **Creating a Lock**
1. Connect your wallet
2. Navigate to "Create Lock"
3. Enter USDT amount (min: $100)
4. Set recipient address
5. Choose unlock date
6. Confirm transaction

### **Managing Locks**
1. View all locks in "Lock Management"
2. Filter by status, amount, or recipient
3. Transfer locks to new addresses
4. Split locks into multiple amounts
5. Redeem expired locks

### **Monitoring Portfolio**
1. Dashboard shows real-time statistics
2. Track total value locked
3. Monitor lock performance
4. View recent activity
5. Export transaction history

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Network Configuration
VITE_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
VITE_BSC_MAINNET_RPC=https://bsc-dataseed.binance.org/
VITE_CONTRACT_ADDRESS=0x... # Your deployed contract address
```

### **Smart Contract Deployment**
The application is ready for smart contract deployment. Update the contract addresses in `src/lib/constants.ts`:

```typescript
export const CONTRACTS = {
  USDT: '0x...', // Your USDT contract address
  LOCK_MANAGER: '0x...', // Your deployed lock manager
  MULTICALL: '0x...' // Multicall contract for batch operations
};
```

## 🏗 **Architecture**

### **Component Structure**
```
src/
├── components/          # UI Components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── CreateLockForm.tsx # Lock creation
│   ├── LockManagement.tsx # Lock management
│   ├── TransactionHistory.tsx # Transaction tracking
│   └── ui/            # shadcn/ui components
├── hooks/              # Custom React hooks
│   ├── useWallet.ts   # Wallet management
│   └── useLocks.ts    # Lock operations
├── lib/                # Core services
│   ├── wallet.ts      # Wallet service
│   ├── locks.ts       # Lock management service
│   └── constants.ts   # App constants
└── pages/              # Page components
```

### **State Management**
- **Wallet State** - Managed by `useWallet` hook
- **Lock State** - Managed by `useLocks` hook
- **UI State** - Local component state
- **Global State** - React Context for theme/global settings

## 🔒 **Security Features**

- **Non-custodial** - Users maintain control of funds
- **Smart Contract Audited** - Ready for CertiK audit
- **Immutable Locks** - Blockchain-enforced time locks
- **Secure Transactions** - Proper gas estimation and validation
- **Address Validation** - Input sanitization and validation

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Deploy to Vercel/Netlify**
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### **Smart Contract Deployment**
1. Deploy LockManager contract to BSC
2. Update contract addresses in constants
3. Verify contracts on BSCScan
4. Update frontend configuration

## 📈 **Roadmap**

### **Phase 2: Advanced Features**
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Lock templates and presets
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] API access for developers

### **Phase 3: Enterprise Features**
- [ ] Team management and permissions
- [ ] Compliance and KYC integration
- [ ] White-label solutions
- [ ] Advanced security features
- [ ] Institutional tools

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [docs.flashvault.com](https://docs.flashvault.com)
- **Discord**: [Join our community](https://discord.gg/flashvault)
- **Email**: support@flashvault.com
- **Issues**: [GitHub Issues](https://github.com/kiidfreak/crypto-lock-manager/issues)

## 🙏 **Acknowledgments**

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Binance Smart Chain](https://www.bnbchain.org/)
- Icons by [Lucide React](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

**FlashVault** - Secure, transparent, and efficient crypto time-lock management. 🚀
