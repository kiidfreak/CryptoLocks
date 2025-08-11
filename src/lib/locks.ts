import { ethers } from 'ethers';
import { walletService, USDT_ABI } from './wallet';
import { CONTRACTS, APP_CONFIG, ERROR_MESSAGES } from './constants';

export interface Lock {
  id: string;
  amount: string;
  lockDate: string;
  expiryDate: string;
  recipient: string;
  sender: string;
  status: 'active' | 'expired' | 'expiring' | 'redeemed';
  txHash: string;
  blockNumber: number;
  transferCount: number;
  isTransferable: boolean;
}

export interface CreateLockParams {
  amount: string;
  recipient: string;
  expiryDate: string;
}

export interface LockService {
  createLock: (params: CreateLockParams) => Promise<string>;
  getLocks: (address: string) => Promise<Lock[]>;
  redeemLock: (lockId: string) => Promise<string>;
  transferLock: (lockId: string, newRecipient: string) => Promise<string>;
  splitLock: (lockId: string, amounts: string[]) => Promise<string[]>;
  getLockDetails: (lockId: string) => Promise<Lock>;
}

// Mock Lock Manager ABI (will be replaced with actual contract)
const LOCK_MANAGER_ABI = [
  'function createLock(address recipient, uint256 amount, uint256 unlockTime) external returns (uint256 lockId)',
  'function getLock(uint256 lockId) external view returns (address sender, address recipient, uint256 amount, uint256 lockTime, uint256 unlockTime, bool isRedeemed, uint256 transferCount)',
  'function redeemLock(uint256 lockId) external',
  'function transferLock(uint256 lockId, address newRecipient) external',
  'function splitLock(uint256 lockId, uint256[] memory amounts) external returns (uint256[] memory newLockIds)',
  'function getLocksByAddress(address user) external view returns (uint256[] memory lockIds)',
  'function getLockCount() external view returns (uint256)',
  'event LockCreated(uint256 indexed lockId, address indexed sender, address indexed recipient, uint256 amount, uint256 lockTime, uint256 unlockTime)',
  'event LockRedeemed(uint256 indexed lockId, address indexed recipient, uint256 amount)',
  'event LockTransferred(uint256 indexed lockId, address indexed oldRecipient, address indexed newRecipient)',
  'event LockSplit(uint256 indexed oldLockId, uint256[] indexed newLockIds)'
] as const;

class LockManagerService implements LockService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  private async getContract(): Promise<ethers.Contract> {
    if (!this.contract) {
      this.provider = walletService.getProvider();
      if (!this.provider) {
        throw new Error('Wallet not connected');
      }
      
      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACTS.LOCK_MANAGER, LOCK_MANAGER_ABI, signer);
    }
    return this.contract;
  }

  async createLock(params: CreateLockParams): Promise<string> {
    try {
      const contract = await this.getContract();
      
      // Validate parameters
      const amount = ethers.parseUnits(params.amount, 6); // USDT has 6 decimals
      const unlockTime = Math.floor(new Date(params.expiryDate).getTime() / 1000);
      
      if (amount < ethers.parseUnits(APP_CONFIG.MIN_LOCK_AMOUNT.toString(), 6)) {
        throw new Error(ERROR_MESSAGES.INVALID_AMOUNT);
      }
      
      if (unlockTime <= Math.floor(Date.now() / 1000)) {
        throw new Error(ERROR_MESSAGES.INVALID_DATE);
      }

      // Check USDT allowance and approve if needed
      await this.ensureUSDTAllowance(amount);

      // Create the lock
      const tx = await contract.createLock(params.recipient, amount, unlockTime, {
        gasLimit: APP_CONFIG.DEFAULT_GAS_LIMIT
      });

      const receipt = await tx.wait();
      
      // Find the LockCreated event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'LockCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        return parsed.args.lockId.toString();
      }

      throw new Error('Failed to get lock ID from transaction');
    } catch (error: any) {
      throw new Error(`Failed to create lock: ${error.message}`);
    }
  }

  async getLocks(address: string): Promise<Lock[]> {
    try {
      const contract = await this.getContract();
      const lockIds = await contract.getLocksByAddress(address);
      
      const locks: Lock[] = [];
      for (const lockId of lockIds) {
        try {
          const lock = await this.getLockDetails(lockId.toString());
          locks.push(lock);
        } catch (error) {
          console.error(`Failed to get lock ${lockId}:`, error);
        }
      }
      
      return locks.sort((a, b) => new Date(b.lockDate).getTime() - new Date(a.lockDate).getTime());
    } catch (error: any) {
      throw new Error(`Failed to get locks: ${error.message}`);
    }
  }

  async getLockDetails(lockId: string): Promise<Lock> {
    try {
      const contract = await this.getContract();
      const lockData = await contract.getLock(lockId);
      
      const now = Math.floor(Date.now() / 1000);
      const unlockTime = Number(lockData.unlockTime);
      
      let status: Lock['status'] = 'active';
      if (lockData.isRedeemed) {
        status = 'redeemed';
      } else if (unlockTime <= now) {
        status = 'expired';
      } else if (unlockTime - now <= 7 * 24 * 60 * 60) { // 7 days
        status = 'expiring';
      }

      return {
        id: lockId,
        amount: ethers.formatUnits(lockData.amount, 6),
        lockDate: new Date(Number(lockData.lockTime) * 1000).toISOString(),
        expiryDate: new Date(unlockTime * 1000).toISOString(),
        recipient: lockData.recipient,
        sender: lockData.sender,
        status,
        txHash: '', // Would need to track this separately
        blockNumber: 0, // Would need to track this separately
        transferCount: Number(lockData.transferCount),
        isTransferable: !lockData.isRedeemed && unlockTime > now
      };
    } catch (error: any) {
      throw new Error(`Failed to get lock details: ${error.message}`);
    }
  }

  async redeemLock(lockId: string): Promise<string> {
    try {
      const contract = await this.getContract();
      const tx = await contract.redeemLock(lockId, {
        gasLimit: APP_CONFIG.DEFAULT_GAS_LIMIT
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to redeem lock: ${error.message}`);
    }
  }

  async transferLock(lockId: string, newRecipient: string): Promise<string> {
    try {
      const contract = await this.getContract();
      const tx = await contract.transferLock(lockId, newRecipient, {
        gasLimit: APP_CONFIG.DEFAULT_GAS_LIMIT
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to transfer lock: ${error.message}`);
    }
  }

  async splitLock(lockId: string, amounts: string[]): Promise<string[]> {
    try {
      const contract = await this.getContract();
      const parsedAmounts = amounts.map(amount => ethers.parseUnits(amount, 6));
      
      const tx = await contract.splitLock(lockId, parsedAmounts, {
        gasLimit: APP_CONFIG.DEFAULT_GAS_LIMIT * 2 // Higher gas for complex operation
      });
      
      const receipt = await tx.wait();
      
      // Find the LockSplit event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'LockSplit';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        return parsed.args.newLockIds.map((id: any) => id.toString());
      }

      throw new Error('Failed to get new lock IDs from transaction');
    } catch (error: any) {
      throw new Error(`Failed to split lock: ${error.message}`);
    }
  }

  private async ensureUSDTAllowance(amount: bigint): Promise<void> {
    const provider = walletService.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    const signer = await provider.getSigner();
    const usdtContract = new ethers.Contract(CONTRACTS.USDT, USDT_ABI, signer);
    
    const currentAllowance = await usdtContract.allowance(await signer.getAddress(), CONTRACTS.LOCK_MANAGER);
    
    if (currentAllowance < amount) {
      const approveTx = await usdtContract.approve(CONTRACTS.LOCK_MANAGER, amount, {
        gasLimit: APP_CONFIG.DEFAULT_GAS_LIMIT
      });
      await approveTx.wait();
    }
  }
}

// Export singleton instance
export const lockService = new LockManagerService();

// Mock data for development (remove when contract is deployed)
export const mockLocks: Lock[] = [
  {
    id: '1',
    amount: '50000',
    lockDate: '2024-01-15T00:00:00.000Z',
    expiryDate: '2024-12-15T00:00:00.000Z',
    recipient: '0x742d35Cc6Ab888888C4d62A13d999',
    sender: '0x1234567890123456789012345678901234567890',
    status: 'active',
    txHash: '0xabc123def456789',
    blockNumber: 12345678,
    transferCount: 2,
    isTransferable: true
  },
  {
    id: '2',
    amount: '125000',
    lockDate: '2024-02-01T00:00:00.000Z',
    expiryDate: '2024-08-20T00:00:00.000Z',
    recipient: '0x1234567890123456789012345678901234567890',
    sender: '0x742d35Cc6Ab888888C4d62A13d999',
    status: 'expiring',
    txHash: '0xdef456abc789123',
    blockNumber: 12345679,
    transferCount: 0,
    isTransferable: true
  }
];
