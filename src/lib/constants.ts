// Network and Contract Configuration
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

// Contract Addresses (BSC Testnet)
export const CONTRACTS = {
  USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT
  LOCK_MANAGER: '0x...', // Will be deployed
  MULTICALL: '0x6e5bb1a5Ad6F68A8D7D6A5e47750eC15773d6042'
} as const;

// App Configuration
export const APP_CONFIG = {
  MIN_LOCK_AMOUNT: 100, // Minimum USDT amount
  MAX_LOCK_AMOUNT: 1000000, // Maximum USDT amount
  PLATFORM_FEE: 0.001, // 0.1%
  MIN_LOCK_DURATION: 1, // 1 day minimum
  MAX_LOCK_DURATION: 3650, // 10 years maximum
  DEFAULT_GAS_LIMIT: 300000,
  DEFAULT_GAS_PRICE: '5000000000' // 5 Gwei
} as const;

// UI Constants
export const UI_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  TOAST_DURATION: 5000, // 5 seconds
  MAX_DECIMALS: 6, // USDT decimals
  DATE_FORMAT: 'MMM dd, yyyy',
  TIME_FORMAT: 'HH:mm:ss'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient USDT balance',
  INVALID_ADDRESS: 'Invalid recipient address',
  INVALID_AMOUNT: 'Amount must be between $100 and $1,000,000',
  INVALID_DATE: 'Unlock date must be in the future',
  NETWORK_ERROR: 'Network connection error',
  USER_REJECTED: 'Transaction rejected by user',
  INSUFFICIENT_GAS: 'Insufficient gas for transaction'
} as const;
