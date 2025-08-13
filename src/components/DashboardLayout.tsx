import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Lock, 
  Plus, 
  Settings, 
  Moon, 
  Sun,
  Menu,
  X,
  Wallet,
  Copy,
  ExternalLink,
  Clock,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { NETWORKS } from '@/lib/constants';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onViewChange?: (view: 'dashboard' | 'locks' | 'create' | 'transactions' | 'settings') => void;
  currentView?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onViewChange, currentView = 'dashboard' }) => {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { 
    address, 
    balance, 
    usdtBalance, 
    network, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect,
    isMetaMaskInstalled 
  } = useWallet();
  const { toast } = useToast();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    toast({
      title: "Theme Changed",
      description: `Switched to ${!isDark ? 'dark' : 'light'} mode.`,
    });
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast({
          title: "Address Copied!",
          description: "Wallet address copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy address to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' as const },
    { icon: Lock, label: 'Lock Management', view: 'locks' as const },
    { icon: Plus, label: 'Create Lock', view: 'create' as const },
    { icon: Clock, label: 'Transactions', view: 'transactions' as const },
    { icon: Settings, label: 'Settings', view: 'settings' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                FlashVault
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex"
                onClick={handleConnectWallet}
                disabled={!isMetaMaskInstalled || isConnecting}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {!isMetaMaskInstalled ? 'Install MetaMask' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {network?.name || 'Unknown Network'}
                  </Badge>
                  <span className="text-muted-foreground">
                    {parseFloat(balance).toFixed(4)} {network?.currency}
                  </span>
                  <span className="text-muted-foreground">
                    ${parseFloat(usdtBalance).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyAddress}
                        className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy full address</p>
                      <p className="font-mono text-xs mt-1">{address}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={disconnect}
                    className="p-2 hover:bg-destructive hover:text-white transition-colors"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            ${isSidebarOpen ? 'w-64' : 'w-0'} 
            transition-all duration-300 overflow-hidden
            lg:w-64 lg:block
            bg-card border-r border-border
            fixed lg:static h-[calc(100vh-4rem)] z-40
          `}
        >
          <div className="p-6 space-y-2">
            {sidebarItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={index}
                  variant={currentView === item.view ? "default" : "ghost"}
                  className={`
                    w-full justify-start gap-3 h-11
                    ${currentView === item.view ? 'bg-primary text-primary-foreground shadow-md' : ''}
                  `}
                  onClick={() => onViewChange?.(item.view)}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Sidebar stats */}
          {isConnected && (
            <div className="p-6 mt-8">
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Wallet Overview
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network</span>
                    <Badge variant="outline" className="text-xs">
                      {network?.name || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{network?.currency || 'BNB'}</span>
                    <span className="font-mono">{parseFloat(balance).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>USDT</span>
                    <span className="font-mono text-success">${parseFloat(usdtBalance).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={`
          flex-1 p-6 
          ${isSidebarOpen ? 'lg:ml-0' : ''} 
          transition-all duration-300
        `}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};