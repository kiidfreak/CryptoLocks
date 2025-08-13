const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');
const deployRouter = require('./deploy');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ BLOCKCHAIN CONFIGURATION ============
const NETWORKS = {
  bscTestnet: {
    name: 'BSC Testnet',
    chainId: 97,
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorer: 'https://testnet.bscscan.com',
    usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
  },
  bscMainnet: {
    name: 'BSC Mainnet',
    chainId: 56,
    rpc: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com',
    usdt: '0x55d398326f99059fF775485246999027B3197955'
  }
};

// Contract ABI (simplified for demo)
const LOCK_MANAGER_ABI = [
  "function getLock(uint256 lockId) external view returns (tuple(uint256 id, address owner, address recipient, uint256 amount, uint256 unlockTime, bool isActive, bool isRedeemed, uint256 createdAt, uint256 lastModified))",
  "function getUserLocks(address user) external view returns (uint256[])",
  "function getUserTotalLocked(address user) external view returns (uint256)",
  "function getContractStats() external view returns (uint256, uint256, uint256)",
  "event LockCreated(uint256 indexed lockId, address indexed owner, address indexed recipient, uint256 amount, uint256 unlockTime)",
  "event LockRedeemed(uint256 indexed lockId, address indexed recipient, uint256 amount)",
  "event LockTransferred(uint256 indexed lockId, address indexed oldRecipient, address indexed newRecipient)",
  "event LockSplit(uint256 indexed originalLockId, uint256[] newLockIds, address indexed owner)"
];

// ============ ROUTES ============

// Deployment routes
app.use('/api/deploy', deployRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'FlashVault Backend API'
  });
});

// Get network information
app.get('/api/networks', (req, res) => {
  res.json({
    networks: NETWORKS,
    currentNetwork: process.env.CURRENT_NETWORK || 'bscTestnet'
  });
});

// Get lock information
app.get('/api/locks/:lockId', async (req, res) => {
  try {
    const { lockId } = req.params;
    const { network = 'bscTestnet', contractAddress } = req.query;

    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' });
    }

    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return res.status(400).json({ error: 'Invalid network' });
    }

    const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc);
    const contract = new ethers.Contract(contractAddress, LOCK_MANAGER_ABI, provider);

    const lock = await contract.getLock(lockId);
    
    res.json({
      lockId: parseInt(lockId),
      owner: lock.owner,
      recipient: lock.recipient,
      amount: ethers.utils.formatUnits(lock.amount, 6), // USDT has 6 decimals
      unlockTime: new Date(parseInt(lock.unlockTime) * 1000).toISOString(),
      isActive: lock.isActive,
      isRedeemed: lock.isRedeemed,
      createdAt: new Date(parseInt(lock.createdAt) * 1000).toISOString(),
      lastModified: new Date(parseInt(lock.lastModified) * 1000).toISOString(),
      network: networkConfig.name,
      explorerUrl: `${networkConfig.explorer}/tx/${lockId}`
    });

  } catch (error) {
    console.error('Error fetching lock:', error);
    res.status(500).json({ error: 'Failed to fetch lock information' });
  }
});

// Get user locks
app.get('/api/users/:address/locks', async (req, res) => {
  try {
    const { address } = req.params;
    const { network = 'bscTestnet', contractAddress } = req.query;

    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' });
    }

    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return res.status(400).json({ error: 'Invalid network' });
    }

    const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc);
    const contract = new ethers.Contract(contractAddress, LOCK_MANAGER_ABI, provider);

    const lockIds = await contract.getUserLocks(address);
    const totalLocked = await contract.getUserTotalLocked(address);

    // Fetch details for each lock
    const locks = [];
    for (const lockId of lockIds) {
      try {
        const lock = await contract.getLock(lockId);
        locks.push({
          lockId: lockId.toNumber(),
          owner: lock.owner,
          recipient: lock.recipient,
          amount: ethers.utils.formatUnits(lock.amount, 6),
          unlockTime: new Date(parseInt(lock.unlockTime) * 1000).toISOString(),
          isActive: lock.isActive,
          isRedeemed: lock.isRedeemed,
          createdAt: new Date(parseInt(lock.createdAt) * 1000).toISOString(),
          lastModified: new Date(parseInt(lock.lastModified) * 1000).toISOString()
        });
      } catch (error) {
        console.error(`Error fetching lock ${lockId}:`, error);
      }
    }

    res.json({
      userAddress: address,
      totalLocks: locks.length,
      totalLocked: ethers.utils.formatUnits(totalLocked, 6),
      locks: locks,
      network: networkConfig.name
    });

  } catch (error) {
    console.error('Error fetching user locks:', error);
    res.status(500).json({ error: 'Failed to fetch user locks' });
  }
});

// Get contract statistics
app.get('/api/contract/:address/stats', async (req, res) => {
  try {
    const { address: contractAddress } = req.params;
    const { network = 'bscTestnet' } = req.query;

    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return res.status(400).json({ error: 'Invalid network' });
    }

    const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc);
    const contract = new ethers.Contract(contractAddress, LOCK_MANAGER_ABI, provider);

    const [totalLocks, totalLocked, totalFees] = await contract.getContractStats();

    res.json({
      contractAddress,
      network: networkConfig.name,
      stats: {
        totalLocks: totalLocks.toNumber(),
        totalLocked: ethers.utils.formatUnits(totalLocked, 6),
        totalFees: ethers.utils.formatUnits(totalFees, 6)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching contract stats:', error);
    res.status(500).json({ error: 'Failed to fetch contract statistics' });
  }
});

// Mock portfolio analytics (for demo purposes)
app.get('/api/users/:address/analytics', (req, res) => {
  const { address } = req.params;
  
  // Mock analytics data
  const analytics = {
    userAddress: address,
    portfolioValue: '$125,000',
    totalLocks: 8,
    activeLocks: 6,
    expiringLocks: 2,
    averageLockDuration: '45 days',
    performance: {
      '7d': '+2.3%',
      '30d': '+8.7%',
      '90d': '+15.2%'
    },
    lockDistribution: {
      '0-30 days': 2,
      '31-90 days': 3,
      '91-180 days': 2,
      '180+ days': 1
    },
    timestamp: new Date().toISOString()
  };

  res.json(analytics);
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ============ SERVER STARTUP ============
app.listen(PORT, () => {
  console.log(`🚀 FlashVault Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Networks configured: ${Object.keys(NETWORKS).join(', ')}`);
});

module.exports = app;
