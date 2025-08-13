const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const router = express.Router();

// POST /api/deploy
router.post('/deploy', async (req, res) => {
  try {
    const { network, privateKey, gasPrice, gasLimit } = req.body;

    // Validate input
    if (!network || !privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Network and private key are required'
      });
    }

    // Set environment variables
    process.env.PRIVATE_KEY = privateKey;
    if (gasPrice) process.env.GAS_PRICE = gasPrice;
    if (gasLimit) process.env.GAS_LIMIT = gasLimit;

    // Determine deployment script based on network
    let deploymentScript = 'deploy-bridge.js';
    let networkFlag = '';

    switch (network) {
      case 'bsc-testnet':
        networkFlag = '--network bscTestnet';
        break;
      case 'bsc-mainnet':
        networkFlag = '--network bscMainnet';
        break;
      case 'bnb-testnet':
        networkFlag = '--network bnbTestnet';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid network specified'
        });
    }

    // Execute deployment
    const contractsDir = path.join(__dirname, '..', 'contracts');
    const command = `cd "${contractsDir}" && npx hardhat run scripts/${deploymentScript} ${networkFlag}`;

    console.log(`Executing deployment command: ${command}`);

    exec(command, { 
      cwd: contractsDir,
      env: { ...process.env, PATH: process.env.PATH }
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('Deployment error:', error);
        return res.status(500).json({
          success: false,
          error: `Deployment failed: ${error.message}`,
          stderr: stderr
        });
      }

      // Parse deployment output to extract contract addresses
      const output = stdout.toString();
      const contracts = {};

      // Extract contract addresses from output
      const tokenMatch = output.match(/Token deployed to: (0x[a-fA-F0-9]{40})/);
      const bridgeMatch = output.match(/Bridge deployed to: (0x[a-fA-F0-9]{40})/);
      const lockManagerMatch = output.match(/LockManager deployed to: (0x[a-fA-F0-9]{40})/);

      if (tokenMatch) contracts.token = tokenMatch[1];
      if (bridgeMatch) contracts.bridge = bridgeMatch[1];
      if (lockManagerMatch) contracts.lockManager = lockManagerMatch[1];

      console.log('Deployment successful:', contracts);

      res.json({
        success: true,
        contracts,
        output: stdout,
        network,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Deployment API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/deploy/status
router.get('/deploy/status', (req, res) => {
  res.json({
    status: 'ready',
    supportedNetworks: ['bsc-testnet', 'bsc-mainnet', 'bnb-testnet'],
    timestamp: new Date().toISOString()
  });
});

// GET /api/deploy/networks
router.get('/deploy/networks', (req, res) => {
  const networks = [
    {
      id: 'bsc-testnet',
      name: 'BSC Testnet',
      chainId: 97,
      currency: 'tBNB',
      estimatedCost: '0.005 BNB'
    },
    {
      id: 'bsc-mainnet',
      name: 'BSC Mainnet',
      chainId: 56,
      currency: 'BNB',
      estimatedCost: '0.01 BNB'
    },
    {
      id: 'bnb-testnet',
      name: 'BNB Testnet',
      chainId: 97,
      currency: 'tBNB',
      estimatedCost: '0.005 BNB'
    }
  ];

  res.json(networks);
});

module.exports = router;
