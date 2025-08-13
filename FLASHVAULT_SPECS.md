# FlashVault System Specifications & Features

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Smart Contract Features](#smart-contract-features)
4. [Token Integration](#token-integration)
5. [Frontend Features](#frontend-features)
6. [Deployment Guide](#deployment-guide)
7. [API Reference](#api-reference)
8. [Security Features](#security-features)
9. [Configuration](#configuration)
10. [Development Guide](#development-guide)

## System Overview

**FlashVault** is a decentralized time-locking platform for USDT tokens built on the Binance Smart Chain (BSC). The system provides enterprise-grade security for time-locked assets with advanced features like lock splitting, transfer management, and platform fee collection.

### Key Benefits
- **Secure Time-Locking**: Lock USDT for specified durations with cryptographic security
- **Flexible Management**: Transfer, split, and manage locks with ease
- **Professional Interface**: Modern React-based frontend with responsive design
- **Multi-Network Support**: Deploy on testnet and mainnet seamlessly
- **Fee Generation**: Platform collects fees for sustainable operations

## Architecture

### Technology Stack
- **Smart Contracts**: Solidity 0.8.19 with OpenZeppelin libraries
- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Binance Smart Chain (BSC)
- **Development**: Hardhat framework
- **Styling**: Tailwind CSS + shadcn/ui components

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Blockchain    │
│   (React/TS)    │◄──►│   Contracts     │◄──►│   (BSC)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │   Hardhat       │    │   USDT Token    │
│   Integration   │    │   Development   │    │   Contract      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Smart Contract Features

### Core Contract: LockManager.sol

#### Lock Structure
```solidity
struct Lock {
    uint256 id;           // Unique lock identifier
    address owner;        // Lock creator address
    address recipient;    // Address that can redeem
    uint256 amount;       // Locked USDT amount
    uint256 unlockTime;   // Timestamp when lock becomes redeemable
    bool isActive;        // Lock status flag
    bool isRedeemed;      // Redemption status
    uint256 createdAt;    // Creation timestamp
    uint256 lastModified; // Last modification timestamp
}
```

#### Split Lock Structure
```solidity
struct SplitLock {
    uint256 originalLockId;    // Original lock ID
    uint256[] newLockIds;      // Array of new lock IDs
    uint256 splitTime;         // Split timestamp
    bool isActive;             // Split status
}
```

### Key Functions

#### 1. Lock Creation
```solidity
function createLock(
    address recipient,
    uint256 amount,
    uint256 unlockTime
) external returns (uint256)
```
- **Purpose**: Create new time-locked USDT vault
- **Parameters**: 
  - `recipient`: Address that can redeem the lock
  - `amount`: USDT amount to lock (100 - 1,000,000 USDT)
  - `unlockTime`: Timestamp when lock becomes redeemable
- **Returns**: Unique lock ID
- **Fees**: 0.25% platform fee deducted from amount

#### 2. Lock Redemption
```solidity
function redeemLock(uint256 lockId) external
```
- **Purpose**: Redeem locked USDT after unlock time
- **Access**: Only lock recipient
- **Requirements**: Lock must be active and unlocked

#### 3. Lock Transfer
```solidity
function transferLock(uint256 lockId, address newRecipient) external
```
- **Purpose**: Transfer lock ownership to new recipient
- **Access**: Only lock owner
- **Requirements**: Lock must be active and not redeemed

#### 4. Lock Splitting
```solidity
function splitLock(
    uint256 lockId,
    address[] calldata recipients,
    uint256[] calldata amounts
) external
```
- **Purpose**: Split large lock into multiple smaller ones
- **Parameters**:
  - `lockId`: Original lock to split
  - `recipients`: Array of new recipient addresses
  - `amounts`: Array of amounts for each split
- **Requirements**: Total amounts must equal original lock amount

### View Functions
- `getLock(uint256 lockId)`: Get lock details
- `getUserLocks(address user)`: Get all locks for a user
- `getUserTotalLocked(address user)`: Get total locked amount
- `isLockRedeemable(uint256 lockId)`: Check if lock can be redeemed
- `getContractStats()`: Get contract statistics

### Admin Functions
- `updatePlatformFee(uint256 newFee)`: Update platform fee (max 1%)
- `updateLockLimits()`: Update lock amount and duration limits
- `withdrawFees(uint256 amount)`: Withdraw collected platform fees
- `emergencyWithdrawUSDT(uint256 amount)`: Emergency USDT withdrawal

## Token Integration

### Current Implementation
The system is currently hardcoded for USDT tokens with the following specifications:
- **Token Standard**: ERC-20
- **Decimals**: 6 (USDT standard)
- **Addresses**:
  - Testnet: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`
  - Mainnet: `0x55d398326f99059fF775485246999027B3197955`

### Extending for Other Tokens

#### Option 1: Multi-Token Manager
Create a new contract that supports multiple tokens:
```solidity
contract MultiTokenLockManager {
    mapping(address => mapping(uint256 => Lock)) public tokenLocks;
    mapping(address => bool) public supportedTokens;
    mapping(address => TokenConfig) public tokenConfigs;
    
    struct TokenConfig {
        uint256 minAmount;
        uint256 maxAmount;
        uint256 minDuration;
        uint256 maxDuration;
        uint256 platformFee;
        bool isActive;
    }
}
```

#### Option 2: Token-Specific Instances
Deploy separate LockManager instances for each token:
```solidity
// Deploy for each token
LockManager usdtManager = new LockManager(USDT_ADDRESS);
LockManager btcManager = new LockManager(BTC_ADDRESS);
LockManager ethManager = new LockManager(ETH_ADDRESS);
```

### Token Requirements
To integrate a new token, ensure it:
- Implements ERC-20 standard
- Has stable value or clear pricing mechanism
- Supports `transferFrom` and `approve` functions
- Has reasonable gas costs for operations

## Frontend Features

### User Interface Components

#### 1. CreateLockForm
- **Purpose**: Create new time-locked USDT vaults
- **Features**:
  - Amount input with validation
  - Recipient address input
  - Date picker for unlock time
  - Real-time form validation
  - Wallet connection status

#### 2. Dashboard
- **Purpose**: Overview of user's locks and system statistics
- **Features**:
  - Total locked amount display
  - Active locks count
  - Recent activity feed
  - Quick action buttons

#### 3. LockManagement
- **Purpose**: Manage existing locks
- **Features**:
  - Lock status overview
  - Transfer lock ownership
  - Split lock functionality
  - Lock extension options

#### 4. TransactionHistory
- **Purpose**: Track all lock-related transactions
- **Features**:
  - Transaction status
  - Gas costs
  - Block confirmations
  - Explorer links

### State Management
- **React Hooks**: Custom hooks for wallet and lock management
- **Ethers.js**: Blockchain interaction library
- **React Query**: Server state management
- **Local Storage**: User preferences and settings

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Desktop**: Full-featured desktop experience
- **Tablet**: Adaptive layout for medium screens

## Deployment Guide

### Prerequisites
- Node.js 16+ and npm
- MetaMask or compatible wallet
- BSC testnet/mainnet BNB for gas fees
- BSCScan API key for contract verification

### Environment Setup

#### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts
npm install
```

#### 2. Environment Configuration
Create `.env` file in `contracts/` directory:
```bash
# Testnet Configuration
PRIVATE_KEY=your_testnet_private_key
BSCSCAN_API_KEY=your_bscscan_api_key

# Mainnet Configuration (when ready)
MAINNET_PRIVATE_KEY=your_mainnet_private_key
MAINNET_BSCSCAN_API_KEY=your_mainnet_bscscan_api_key
```

### Deployment Process

#### Step 1: Testnet Deployment
```bash
cd contracts
npm run deploy:testnet
```

#### Step 2: Contract Verification
```bash
npm run verify:testnet
```

#### Step 3: Frontend Testing
- Update constants with testnet contract address
- Test all functionality with testnet USDT
- Verify wallet integration
- Test error handling

#### Step 4: Mainnet Deployment
```bash
npm run deploy:mainnet
npm run verify:mainnet
```

#### Step 5: Production Configuration
- Update frontend constants with mainnet addresses
- Test with real mainnet USDT
- Monitor contract performance
- Set up monitoring and alerting

### Network Configuration

#### BSC Testnet
- **Chain ID**: 97
- **RPC URL**: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- **Explorer**: `https://testnet.bscscan.com`
- **Currency**: tBNB
- **Gas Price**: 10 Gwei

#### BSC Mainnet
- **Chain ID**: 56
- **RPC URL**: `https://bsc-dataseed.binance.org/`
- **Explorer**: `https://bscscan.com`
- **Currency**: BNB
- **Gas Price**: 5 Gwei

## API Reference

### Smart Contract Events

#### LockCreated
```solidity
event LockCreated(
    uint256 indexed lockId,
    address indexed owner,
    address indexed recipient,
    uint256 amount,
    uint256 unlockTime
)
```

#### LockRedeemed
```solidity
event LockRedeemed(
    uint256 indexed lockId,
    address indexed recipient,
    uint256 amount
)
```

#### LockTransferred
```solidity
event LockTransferred(
    uint256 indexed lockId,
    address indexed oldRecipient,
    address indexed newRecipient
)
```

#### LockSplit
```solidity
event LockSplit(
    uint256 indexed originalLockId,
    uint256[] newLockIds,
    address indexed owner
)
```

### Frontend Service Methods

#### LockService Interface
```typescript
interface LockService {
  createLock: (params: CreateLockParams) => Promise<string>;
  getLocks: (address: string) => Promise<Lock[]>;
  redeemLock: (lockId: string) => Promise<string>;
  transferLock: (lockId: string, newRecipient: string) => Promise<string>;
  splitLock: (lockId: string, amounts: string[]) => Promise<string[]>;
  getLockDetails: (lockId: string) => Promise<Lock>;
}
```

#### WalletService Interface
```typescript
interface WalletService {
  connect: () => Promise<void>;
  disconnect: () => void;
  getAddress: () => string | null;
  getBalance: () => Promise<string>;
  getUSDTBalance: () => Promise<string>;
  isConnected: boolean;
}
```

## Security Features

### Smart Contract Security
- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Comprehensive parameter validation
- **Safe Math**: Built-in overflow protection with Solidity 0.8+
- **Emergency Functions**: Owner can withdraw funds in emergencies

### Frontend Security
- **Input Sanitization**: All user inputs are validated
- **Wallet Integration**: Secure MetaMask integration
- **Transaction Confirmation**: User must confirm all transactions
- **Error Handling**: Comprehensive error handling and user feedback

### Operational Security
- **Fee Limits**: Platform fee capped at 1%
- **Amount Limits**: Configurable min/max lock amounts
- **Duration Limits**: Configurable min/max lock durations
- **Owner Controls**: Limited admin functions with proper access control

## Configuration

### Contract Configuration
```solidity
// Lock limits
uint256 public minLockAmount = 100 * 10**6;        // 100 USDT
uint256 public maxLockAmount = 1000000 * 10**6;    // 1M USDT
uint256 public minLockDuration = 1 days;           // 1 day
uint256 public maxLockDuration = 365 days;         // 1 year

// Platform fees
uint256 public platformFee = 25;                   // 0.25% (basis points)
uint256 public feeDenominator = 10000;             // Fee calculation base
```

### Frontend Configuration
```typescript
export const APP_CONFIG = {
  MIN_LOCK_AMOUNT: 100,           // Minimum USDT amount
  MAX_LOCK_AMOUNT: 1000000,       // Maximum USDT amount
  PLATFORM_FEE: 0.001,            // 0.1% (frontend display)
  MIN_LOCK_DURATION: 1,           // 1 day minimum
  MAX_LOCK_DURATION: 3650,        // 10 years maximum
  DEFAULT_GAS_LIMIT: 300000,      // Default gas limit
  DEFAULT_GAS_PRICE: '5000000000' // 5 Gwei
} as const;
```

### Network Configuration
```typescript
export const NETWORKS = {
  BSC_MAINNET: {
    chainId: 56,
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com',
    currency: 'BNB',
    decimals: 18
  },
  BSC_TESTNET: {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorer: 'https://testnet.bscscan.com',
    currency: 'tBNB',
    decimals: 18
  }
} as const;
```

## Development Guide

### Local Development
```bash
# Start local Hardhat node
cd contracts
npm run node

# Deploy to local network
npm run deploy:local

# Start frontend development server
cd ..
npm run dev
```

### Testing
```bash
# Run contract tests
cd contracts
npm test

# Run frontend tests
cd ..
npm run test
```

### Building for Production
```bash
# Build frontend
npm run build

# Compile contracts
cd contracts
npm run compile
```

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Hardhat**: Solidity compilation and testing

### Deployment Scripts
```bash
# Testnet deployment
npm run deploy:testnet

# Mainnet deployment
npm run deploy:mainnet

# Contract verification
npm run verify:testnet
npm run verify:mainnet
```

## Future Enhancements

### Planned Features
1. **Multi-Token Support**: Extend beyond USDT to other tokens
2. **Yield Generation**: Integrate with DeFi protocols for yield
3. **NFT Representation**: Convert locks to tradeable NFTs
4. **Advanced Analytics**: Comprehensive lock analytics and reporting
5. **Mobile App**: Native mobile applications
6. **API Integration**: REST API for third-party integrations

### Technical Improvements
1. **Gas Optimization**: Reduce transaction costs
2. **Batch Operations**: Support for multiple operations in single transaction
3. **Layer 2 Integration**: Support for BSC Layer 2 solutions
4. **Cross-Chain**: Multi-chain deployment support
5. **Upgradeable Contracts**: Implement upgradeable contract patterns

---

## Support & Documentation

For additional support, development questions, or feature requests, please refer to:
- **GitHub Repository**: [Project Repository]
- **Documentation**: [Project Documentation]
- **Community**: [Discord/Telegram Links]
- **Support**: [Support Email/Channel]

---

*Last Updated: [Current Date]*
*Version: 1.0.0*
*Author: FlashVault Team*
