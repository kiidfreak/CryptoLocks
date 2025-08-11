import { useState, useEffect, useCallback } from 'react';
import { lockService, Lock, CreateLockParams } from '@/lib/locks';
import { useWallet } from './useWallet';
import { useToast } from './use-toast';
import { mockLocks } from '@/lib/locks'; // Remove when contract is deployed

export const useLocks = () => {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useWallet();
  const { toast } = useToast();

  // Load locks when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadLocks();
    } else {
      setLocks([]);
    }
  }, [isConnected, address]);

  const loadLocks = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // For now, use mock data. Replace with actual contract call when deployed
      // const userLocks = await lockService.getLocks(address);
      const userLocks = mockLocks.filter(lock => 
        lock.sender.toLowerCase() === address.toLowerCase() || 
        lock.recipient.toLowerCase() === address.toLowerCase()
      );
      
      setLocks(userLocks);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to load locks",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, toast]);

  const createLock = useCallback(async (params: CreateLockParams): Promise<string | null> => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, simulate the lock creation. Replace with actual contract call when deployed
      // const lockId = await lockService.createLock(params);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock lock
      const newLock: Lock = {
        id: Date.now().toString(),
        amount: params.amount,
        lockDate: new Date().toISOString(),
        expiryDate: params.expiryDate,
        recipient: params.recipient,
        sender: address,
        status: 'active',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 10000000),
        transferCount: 0,
        isTransferable: true
      };

      setLocks(prev => [newLock, ...prev]);
      
      toast({
        title: "Lock Created Successfully",
        description: `Created lock for ${params.amount} USDT`,
      });

      return newLock.id;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to create lock",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, toast]);

  const redeemLock = useCallback(async (lockId: string): Promise<boolean> => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, simulate the redemption. Replace with actual contract call when deployed
      // const txHash = await lockService.redeemLock(lockId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update lock status
      setLocks(prev => prev.map(lock => 
        lock.id === lockId 
          ? { ...lock, status: 'redeemed' as const }
          : lock
      ));
      
      toast({
        title: "Lock Redeemed Successfully",
        description: "Tokens have been unlocked and transferred",
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to redeem lock",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, toast]);

  const transferLock = useCallback(async (lockId: string, newRecipient: string): Promise<boolean> => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, simulate the transfer. Replace with actual contract call when deployed
      // const txHash = await lockService.transferLock(lockId, newRecipient);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update lock recipient
      setLocks(prev => prev.map(lock => 
        lock.id === lockId 
          ? { ...lock, recipient: newRecipient, transferCount: lock.transferCount + 1 }
          : lock
      ));
      
      toast({
        title: "Lock Transferred Successfully",
        description: `Lock transferred to ${newRecipient.slice(0, 6)}...${newRecipient.slice(-4)}`,
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to transfer lock",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, toast]);

  const splitLock = useCallback(async (lockId: string, amounts: string[]): Promise<boolean> => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, simulate the split. Replace with actual contract call when deployed
      // const newLockIds = await lockService.splitLock(lockId, amounts);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the original lock
      const originalLock = locks.find(lock => lock.id === lockId);
      if (!originalLock) throw new Error('Lock not found');

      // Create new locks from the split
      const newLocks: Lock[] = amounts.map((amount, index) => ({
        id: `${lockId}-split-${index}`,
        amount,
        lockDate: originalLock.lockDate,
        expiryDate: originalLock.expiryDate,
        recipient: originalLock.recipient,
        sender: originalLock.sender,
        status: originalLock.status,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 10000000),
        transferCount: 0,
        isTransferable: originalLock.isTransferable
      }));

      // Remove original lock and add new ones
      setLocks(prev => [
        ...newLocks,
        ...prev.filter(lock => lock.id !== lockId)
      ]);
      
      toast({
        title: "Lock Split Successfully",
        description: `Split into ${amounts.length} new locks`,
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to split lock",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, locks, toast]);

  const refreshLocks = useCallback(() => {
    if (address) {
      loadLocks();
    }
  }, [address, loadLocks]);

  return {
    locks,
    isLoading,
    error,
    createLock,
    redeemLock,
    transferLock,
    splitLock,
    refreshLocks,
    hasLocks: locks.length > 0,
  };
};
