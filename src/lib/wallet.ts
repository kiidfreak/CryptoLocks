import { ethers } from 'ethers';
import { NETWORKS, CONTRACTS } from './constants';

export interface WalletState {
  address: string | null;
  balance: string;
  usdtBalance: string;
  network: typeof NETWORKS.BSC_MAINNET | typeof NETWORKS.BSC_TESTNET | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletProvider {
  name: string;
  connect: () => Promise<string>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

class MetaMaskProvider implements WalletProvider {
  name = 'MetaMask';
  private provider: ethers.BrowserProvider | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    // Check if MetaMask is properly accessible
    if (!window.ethereum.isMetaMask) {
      throw new Error('MetaMask extension not detected. Please install MetaMask and refresh the page.');
    }

    // Check if MetaMask is accessible
    try {
      await window.ethereum.request({ method: 'eth_chainId' });
    } catch (error) {
      throw new Error('MetaMask is not accessible. Please unlock MetaMask and try again.');
    }

    try {
      console.log('Creating BrowserProvider...');
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if MetaMask is unlocked first
      console.log('Checking if MetaMask is unlocked...');
      try {
        const accounts = await this.provider.send('eth_accounts', []);
        console.log('Current accounts:', accounts);
        
        if (accounts.length === 0) {
          console.log('MetaMask is locked, requesting unlock...');
          // MetaMask is locked, request accounts will prompt for unlock
        } else {
          console.log('MetaMask is already unlocked with account:', accounts[0]);
        }
      } catch (error) {
        console.log('Error checking accounts:', error);
      }
      
      console.log('Requesting accounts...');
      
      // Add timeout to prevent hanging
      const accountsPromise = this.provider.send('eth_requestAccounts', []);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection request timed out. Please check MetaMask and try again.')), 30000);
      });
      
      const accounts = await Promise.race([accountsPromise, timeoutPromise]);
      console.log('Accounts received:', accounts);
      
      const address = accounts[0];
      
      if (!address) {
        throw new Error('No accounts found');
      }
      
      console.log('Account connected:', address);
      
      // Don't force network switch - let user stay on current network
      // We'll detect and use whatever network they're on
      const network = await this.provider.getNetwork();
      console.log('Current network chainId:', network.chainId.toString());
      
      return address;
    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === -32002) {
        throw new Error('MetaMask is already processing a request. Please check MetaMask and try again.');
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection was rejected. Please approve the connection in MetaMask.');
      } else {
        throw new Error(`Failed to connect: ${error.message || error}`);
      }
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw switchError;
      }
    }
  }

  private async addNetwork(chainId: number): Promise<void> {
    const network = chainId === NETWORKS.BSC_TESTNET.chainId ? NETWORKS.BSC_TESTNET : NETWORKS.BSC_MAINNET;
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        chainName: network.name,
        nativeCurrency: {
          name: network.currency,
          symbol: network.currency,
          decimals: network.decimals,
        },
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.explorer],
      }],
    });
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const signer = await this.provider.getSigner();
    return await signer.signMessage(message);
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

// USDT ABI (ERC-20)
export const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
] as const;

export class WalletService {
  private provider: MetaMaskProvider;
  private state: WalletState = {
    address: null,
    balance: '0',
    usdtBalance: '0',
    network: null,
    isConnected: false,
    isConnecting: false,
    error: null
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.provider = new MetaMaskProvider();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
    }
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.disconnect();
    } else {
      this.state.address = accounts[0];
      this.updateState();
    }
  }

  private handleChainChanged(chainId: string): void {
    const chainIdNum = parseInt(chainId, 16);
    this.state.network = Object.values(NETWORKS).find(n => n.chainId === chainIdNum) || null;
    this.updateState();
  }

  private handleDisconnect(): void {
    this.disconnect();
  }

  async connect(): Promise<void> {
    try {
      this.state.isConnecting = true;
      this.state.error = null;
      this.updateState();
      console.log('WalletService: Starting connection, state updated');

      console.log('Connecting to wallet...');
      const address = await this.provider.connect();
      console.log('Wallet connected, address:', address);
      
      this.state.address = address;
      this.state.isConnected = true;
      console.log('WalletService: Address and connection state set');
      
      // Try to detect current network instead of forcing BSC Testnet
      try {
        const provider = this.provider.getProvider();
        if (provider) {
          const network = await provider.getNetwork();
          console.log('Current network:', network);
          
          // Check if we're on a supported network
          const supportedNetwork = Object.values(NETWORKS).find(n => n.chainId === Number(network.chainId));
          if (supportedNetwork) {
            this.state.network = supportedNetwork;
            console.log('Using network:', supportedNetwork.name);
          } else {
            // Default to BSC Testnet if not on supported network
            this.state.network = NETWORKS.BSC_TESTNET;
            console.log('Defaulting to BSC Testnet');
          }
        }
      } catch (networkError) {
        console.warn('Network detection failed, using default:', networkError);
        this.state.network = NETWORKS.BSC_TESTNET;
      }
      
      console.log('WalletService: About to update balances...');
      await this.updateBalances();
      console.log('WalletService: Balances updated, calling updateState...');
      this.updateState();
      console.log('Connection completed successfully');
    } catch (error: any) {
      console.error('Connection failed:', error);
      this.state.error = error.message;
      this.updateState();
      throw error;
    } finally {
      console.log('WalletService: Finally block, setting isConnecting to false');
      this.state.isConnecting = false;
      this.updateState();
      console.log('WalletService: Final state update complete');
    }
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
    this.state = {
      address: null,
      balance: '0',
      usdtBalance: '0',
      network: null,
      isConnected: false,
      isConnecting: false,
      error: null
    };
    this.updateState();
  }

  async updateBalances(): Promise<void> {
    if (!this.state.address || !this.provider.getProvider()) {
      console.log('updateBalances: Skipping - no address or provider');
      return;
    }

    try {
      console.log('updateBalances: Starting balance update...');
      const provider = this.provider.getProvider()!;
      
      // Get BNB balance
      console.log('updateBalances: Getting BNB balance...');
      const balance = await provider.getBalance(this.state.address);
      this.state.balance = ethers.formatEther(balance);
      console.log('updateBalances: BNB balance updated:', this.state.balance);
      
      // Get USDT balance
      console.log('updateBalances: Getting USDT balance...');
      const usdtContract = new ethers.Contract(CONTRACTS.USDT, USDT_ABI, provider);
      const usdtBalance = await usdtContract.balanceOf(this.state.address);
      this.state.usdtBalance = ethers.formatUnits(usdtBalance, 6); // USDT has 6 decimals
      console.log('updateBalances: USDT balance updated:', this.state.usdtBalance);
      
      console.log('updateBalances: Calling updateState...');
      this.updateState();
      console.log('updateBalances: Balance update complete');
    } catch (error) {
      console.error('Failed to update balances:', error);
      // Don't throw error - just log it so connection can still succeed
    }
  }

  getState(): WalletState {
    return { ...this.state };
  }

  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider.getProvider();
  }

  async signMessage(message: string): Promise<string> {
    return await this.provider.signMessage(message);
  }
}

// Export singleton instance
export const walletService = new WalletService();
