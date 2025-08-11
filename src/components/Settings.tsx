import React, { useState } from 'react';
import { Settings as SettingsIcon, Network, Shield, Bell, Palette, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@/hooks/useWallet';
import { NETWORKS } from '@/lib/constants';

export const Settings: React.FC = () => {
  const { network, switchNetwork } = useWallet();
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(network?.chainId.toString() || '97');

  const handleNetworkChange = async (chainId: string) => {
    try {
      await switchNetwork(parseInt(chainId));
      setSelectedNetwork(chainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const exportData = () => {
    // Export user data functionality
    const data = {
      timestamp: new Date().toISOString(),
      network: network?.name,
      settings: {
        notifications,
        autoRefresh,
        darkMode
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashvault-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Configure your FlashVault experience</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Network Settings */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Network Configuration
            </CardTitle>
            <CardDescription>
              Choose your preferred blockchain network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="network">Default Network</Label>
              <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="97">BSC Testnet</SelectItem>
                  <SelectItem value="56">BSC Mainnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current: {network?.name || 'Not connected'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about lock events
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update data every 30s
                </p>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Transaction Confirmation</Label>
              <p className="text-sm text-muted-foreground">
                Always require confirmation for transactions
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Require 2FA for large amounts</span>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your data and manage preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline">
              Export Transaction History
            </Button>
            <Button variant="outline">
              Export Lock Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>About FlashVault</CardTitle>
          <CardDescription>
            Version 1.0.0 - Built with React, TypeScript, and Tailwind CSS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>FlashVault is a secure, non-custodial time-lock platform for managing cryptocurrency assets.</p>
            <p>Built on Binance Smart Chain for fast, low-cost transactions.</p>
            <p>Smart contracts audited by CertiK for maximum security.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};