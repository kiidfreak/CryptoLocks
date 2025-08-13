# FlashVault 🚀

**Professional USDT Time-Lock Management System on Binance Smart Chain**

FlashVault is a comprehensive, enterprise-grade platform for managing time-locked USDT tokens with advanced features including lock creation, transfer, splitting, and portfolio analytics.

## 🌟 Features

### 🔒 Core Lock Management
- **Time-Locked USDT**: Secure token locking with configurable durations
- **Lock Transfer**: Change lock ownership to new recipients
- **Lock Splitting**: Divide large locks into multiple smaller ones
- **Lock Redemption**: Claim locked tokens after unlock time
- **Portfolio Tracking**: Comprehensive lock management dashboard

### 🏗️ Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Smart Contracts**: Solidity on BSC with OpenZeppelin security
- **Backend API**: Node.js + Express with blockchain integration
- **Database**: PostgreSQL for user data and analytics
- **Blockchain**: Binance Smart Chain (BSC) Testnet/Mainnet

### 🔐 Security Features
- **Non-custodial**: Users maintain full control of funds
- **Smart Contract Security**: OpenZeppelin audited contracts
- **Reentrancy Protection**: Advanced security measures
- **Input Validation**: Comprehensive parameter checks
- **Event Logging**: Full audit trail on blockchain

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask wallet with BSC network
- BSC testnet tokens (tBNB and tUSDT)

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Smart Contract Development
```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to BSC Testnet
npm run deploy:testnet
```

### Backend API
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
flashvault/
├── src/                    # Frontend React application
│   ├── components/        # UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and constants
│   └── pages/            # Application pages
├── contracts/             # Smart contract development
│   ├── LockManager.sol   # Main contract
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.js # Hardhat configuration
├── backend/               # Backend API server
│   ├── server.js         # Express server
│   └── package.json      # Backend dependencies
└── README.md              # Project documentation
```

## 🔧 Configuration

### Environment Variables
Create `.env` files in each directory:

**Frontend (.env)**
```bash
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_NETWORK=bscTestnet
```

**Contracts (.env)**
```bash
PRIVATE_KEY=your_deployer_private_key
BSCSCAN_API_KEY=your_bscscan_api_key
```

**Backend (.env)**
```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
CURRENT_NETWORK=bscTestnet
```

## 🌐 Networks

### BSC Testnet (Chain ID: 97)
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **USDT**: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
- **Explorer**: https://testnet.bscscan.com/

### BSC Mainnet (Chain ID: 56)
- **RPC**: https://bsc-dataseed.binance.org/
- **USDT**: 0x55d398326f99059fF775485246999027B3197955
- **Explorer**: https://bscscan.com/

## 📊 Smart Contract Features

### Lock Configuration
- **Min Amount**: 100 USDT
- **Max Amount**: 1,000,000 USDT
- **Min Duration**: 1 day
- **Max Duration**: 365 days
- **Platform Fee**: 0.25%

### Core Functions
- `createLock(recipient, amount, unlockTime)` - Create new lock
- `redeemLock(lockId)` - Redeem unlocked tokens
- `transferLock(lockId, newRecipient)` - Transfer ownership
- `splitLock(lockId, recipients, amounts)` - Split lock
- `getUserLocks(user)` - Get user's locks
- `getContractStats()` - Get contract statistics

## 🔗 API Endpoints

### Health & Network
- `GET /api/health` - Server status
- `GET /api/networks` - Available networks

### Lock Management
- `GET /api/locks/:lockId` - Lock information
- `GET /api/users/:address/locks` - User's locks
- `GET /api/contract/:address/stats` - Contract stats

### Analytics
- `GET /api/users/:address/analytics` - Portfolio analytics

## 🧪 Testing

### Frontend Testing
```bash
npm run test
npm run test:coverage
```

### Smart Contract Testing
```bash
cd contracts
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### Manual Testing
1. Start frontend: `npm run dev`
2. Start backend: `cd backend && npm run dev`
3. Deploy contracts: `cd contracts && npm run deploy:testnet`
4. Test wallet connection and lock operations

## 🚀 Deployment

### Smart Contracts
```bash
cd contracts

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Verify on BSCScan
npm run verify:testnet
```

### Frontend
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
# Upload dist/ folder contents
```

### Backend
```bash
cd backend

# Production build
npm start

# Environment variables
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
```

## 🔐 Security Considerations

### Smart Contract Security
- **Audit**: Consider professional audit before mainnet
- **Timelock**: Implement timelock for admin functions
- **Upgradeable**: Consider upgradeable pattern for mainnet
- **Emergency Pause**: Add pause mechanism for critical issues

### Backend Security
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive parameter checking
- **CORS**: Configured cross-origin policies
- **Helmet**: Security headers and protection

## 📈 Performance Optimization

### Frontend
- **Lazy Loading**: Component and route lazy loading
- **Code Splitting**: Dynamic imports for better performance
- **Image Optimization**: Optimized assets and SVGs
- **Caching**: Efficient data caching strategies

### Smart Contracts
- **Gas Optimization**: Efficient storage and operations
- **Batch Operations**: Multi-lock operations
- **Event Optimization**: Minimal event data
- **Storage Layout**: Optimized data structures

### Backend
- **Caching**: Smart contract data caching
- **Compression**: Response compression
- **Connection Pooling**: Database optimization
- **Rate Limiting**: API performance protection

## 🔄 Development Workflow

### 1. Smart Contract Development
1. Write and test contracts locally
2. Deploy to BSC Testnet
3. Test all functions thoroughly
4. Deploy to BSC Mainnet
5. Verify on BSCScan

### 2. Backend API Development
1. Implement API endpoints
2. Add blockchain integration
3. Test with deployed contracts
4. Add error handling and validation
5. Performance optimization

### 3. Frontend Integration
1. Replace mock data with real API calls
2. Integrate smart contract functions
3. Add real-time updates
4. Error handling and user feedback
5. Performance optimization

## 🚨 Emergency Procedures

### Smart Contract Issues
1. **Pause Function**: Implement emergency pause
2. **Timelock**: Admin function delays
3. **Emergency Withdraw**: Owner-only emergency functions
4. **Upgrade Path**: Upgradeable contract pattern

### Backend Issues
1. **Health Checks**: Monitor API health
2. **Rate Limiting**: Prevent abuse
3. **Error Logging**: Comprehensive error tracking
4. **Backup Systems**: Data backup and recovery

## 📞 Support & Community

### Documentation
- **Smart Contracts**: Check contracts/README.md
- **Backend API**: Check backend/README.md
- **Frontend**: Check src/ components and hooks

### Issues & Questions
- **GitHub Issues**: Report bugs and feature requests
- **Code Comments**: Inline documentation in code
- **API Testing**: Use provided test endpoints

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Security-focused smart contract library
- **Hardhat**: Ethereum development environment
- **BSC Community**: Binance Smart Chain ecosystem
- **React Community**: Frontend framework and tools

---

## 🎯 Next Steps

1. **Deploy Smart Contracts** to BSC Testnet
2. **Test All Functions** thoroughly
3. **Integrate Backend API** with frontend
4. **Replace Mock Data** with real blockchain calls
5. **Deploy to Production** on BSC Mainnet

**🚀 Ready to revolutionize USDT time-lock management!**

---

*FlashVault - Secure • Fast • Professional Crypto Asset Management*
