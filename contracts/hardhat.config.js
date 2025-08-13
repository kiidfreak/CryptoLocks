require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Ensure private key is available
const PRIVATE_KEY = process.env.PRIVATE_KEY || "6ac9ee802d80a14718583af1d880236a8fa2b09749d9007752232f6ca931fd50";
if (!PRIVATE_KEY.startsWith('0x')) {
  process.env.PRIVATE_KEY = "0x" + PRIVATE_KEY;
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // Point to contracts subfolder
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",  // Point to subfolder
    tests: "./test"
  },
  networks: {
    // BSC Testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
    // BSC Mainnet
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },
    // New BNB Testnet
    bnbTestnet: {
      url: "https://bsc-testnet.publicnode.com",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 Gwei (reduced from 10 Gwei)
    },
    // Local development
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
  },
};
