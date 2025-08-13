# FlashVault Smart Contracts 🚀

This directory contains the smart contracts for FlashVault, a decentralized USDT time-lock management system on Binance Smart Chain (BSC).

## 📋 Overview

FlashVault enables users to:
- **Create Time-Locks**: Lock USDT for specified durations
- **Transfer Locks**: Change lock ownership to new recipients
- **Split Locks**: Divide large locks into multiple smaller ones
- **Redeem Locks**: Claim locked USDT after unlock time
- **Manage Portfolio**: Track all locks and performance

## 🏗️ Architecture

### Core Contracts
- **`LockManager.sol`**: Main contract managing all lock operations
- **OpenZeppelin Contracts**: Security and standard implementations

### Key Features
- **Non-custodial**: Users maintain control of their funds
- **Fee System**: 0.25% platform fee on lock creation
- **Flexible Durations**: 1 day to 365 days
- **Amount Limits**: 100 USDT to 1M USDT
- **Event System**: Comprehensive blockchain event logging

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask wallet with BSC network configured
- BSC testnet tokens (tBNB and tUSDT)

### Installation
```bash
cd contracts
npm install
```

### Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your values
PRIVATE_KEY=your_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### Compile Contracts
```bash
npm run compile
```

### Deploy to BSC Testnet
```bash
npm run deploy:testnet
```

## 📊 Contract Functions

### User Functions
- `createLock(recipient, amount, unlockTime)` - Create new time-lock
- `redeemLock(lockId)` - Redeem unlocked USDT
- `transferLock(lockId, newRecipient)` - Transfer lock ownership
- `splitLock(lockId, recipients, amounts)` - Split lock into multiple

### View Functions
- `getLock(lockId)` - Get lock details
- `getUserLocks(user)` - Get user's lock IDs
- `getUserTotalLocked(user)` - Get user's total locked amount
- `isLockRedeemable(lockId)` - Check if lock can be redeemed
- `getContractStats()` - Get contract statistics

### Admin Functions
- `updatePlatformFee(newFee)` - Update platform fee
- `updateLockLimits(...)` - Update lock amount/duration limits
- `withdrawFees(amount)` - Withdraw collected fees

## 🔧 Configuration

### Lock Limits
- **Min Amount**: 100 USDT
- **Max Amount**: 1,000,000 USDT
- **Min Duration**: 1 day
- **Max Duration**: 365 days

### Fee Structure
- **Platform Fee**: 0.25% (25 basis points)
- **Fee Collection**: Collected in USDT on lock creation
- **Fee Withdrawal**: Only contract owner can withdraw

## 🧪 Testing

### Local Testing
```bash
# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local

# Run tests
npm run test
```

### Testnet Testing
```bash
# Deploy to BSC Testnet
npm run deploy:testnet

# Verify on BSCScan
npm run verify:testnet
```

## 📁 File Structure

```
contracts/
├── LockManager.sol          # Main contract
├── hardhat.config.js        # Hardhat configuration
├── scripts/
│   └── deploy.js           # Deployment script
├── package.json             # Dependencies
├── env.example             # Environment template
└── README.md               # This file
```

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Admin functions restricted to owner
- **SafeERC20**: Safe token transfer operations
- **Input Validation**: Comprehensive parameter checks
- **Event Logging**: Full audit trail of operations

## 🌐 Network Support

### BSC Testnet (Chain ID: 97)
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **USDT**: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
- **Explorer**: https://testnet.bscscan.com/

### BSC Mainnet (Chain ID: 56)
- **RPC**: https://bsc-dataseed.binance.org/
- **USDT**: 0x55d398326f99059fF775485246999027B3197955
- **Explorer**: https://bscscan.com/

## 📈 Gas Optimization

- **Contract Size**: Optimized for deployment costs
- **Function Efficiency**: Minimal gas usage per operation
- **Storage Layout**: Optimized storage patterns
- **Batch Operations**: Efficient multi-lock operations

## 🚨 Emergency Procedures

### Emergency Withdraw
- **Owner Only**: Contract owner can withdraw USDT in emergencies
- **Audit Trail**: All emergency operations are logged
- **Timelock**: Consider implementing timelock for mainnet

### Pause Functionality
- **Future Enhancement**: Add pause mechanism for critical issues
- **Upgradeable**: Consider upgradeable pattern for mainnet

## 🔗 Integration

### Frontend Integration
- **Web3.js/Ethers.js**: Standard Web3 library support
- **Event Listening**: Real-time blockchain event monitoring
- **Transaction Handling**: Comprehensive transaction management

### Backend Integration
- **REST API**: Standard HTTP API endpoints
- **WebSocket**: Real-time updates via WebSocket
- **Database**: PostgreSQL for user data and analytics

## 📞 Support

For technical support or questions:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check this README and inline code comments
- **Community**: Join our developer community

## 📄 License

MIT License - see LICENSE file for details.

---

**🚀 Ready to deploy FlashVault to the blockchain!**
