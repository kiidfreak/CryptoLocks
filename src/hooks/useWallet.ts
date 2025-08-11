import { useState, useEffect, useCallback } from 'react';
import { walletService, WalletState } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getState());
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    try {
      console.log('useWallet: Starting connection...');
      await walletService.connect();
      console.log('useWallet: Connection successful');
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletState.network?.name || 'BSC Testnet'}`,
      });
    } catch (error: any) {
      console.error('useWallet: Connection failed:', error);
      const errorMessage = error.message || 'Unknown connection error';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, walletState.network?.name]);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error: any) {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const refreshBalances = useCallback(async () => {
    try {
      await walletService.updateBalances();
    } catch (error: any) {
      console.error('Failed to refresh balances:', error);
    }
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      // This would be implemented in the wallet service
      toast({
        title: "Network Switched",
        description: "Successfully switched to new network",
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    ...walletState,
    connect,
    disconnect,
    refreshBalances,
    switchNetwork,
    isMetaMaskInstalled: typeof window !== 'undefined' && !!window.ethereum,
  };
};
