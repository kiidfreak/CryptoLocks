import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Shield, 
  Bell, 
  Moon, 
  Sun,
  Key,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export const Settings: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    lockExpiry: true,
    priceAlerts: false,
  });
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    apiKey: 'fv_sk_1234567890abcdef1234567890abcdef',
  });
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated", 
      description: "Your security preferences have been saved.",
    });
  };

  const handleToggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    toast({
      title: "Theme Changed",
      description: `Switched to ${!isDark ? 'dark' : 'light'} mode.`,
    });
  };

  const generateNewApiKey = () => {
    const newKey = 'fv_sk_' + Math.random().toString(36).substring(2, 34);
    setProfile(prev => ({ ...prev, apiKey: newKey }));
    toast({
      title: "New API Key Generated",
      description: "Your API key has been regenerated. Update your applications.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and security settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={handleToggleTheme}
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & API
            </CardTitle>
            <CardDescription>
              Manage your security preferences and API access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={profile.apiKey}
                    readOnly
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Used for programmatic access to FlashVault API
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={generateNewApiKey}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              Generate New API Key
            </Button>

            <Separator />

            <div className="space-y-4">
              <Label>Two-Factor Authentication</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <Switch />
              </div>
            </div>

            <Button onClick={handleSaveSecurity} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </Button>
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
              Configure how you want to receive updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Browser Notifications</p>
                <p className="text-sm text-muted-foreground">Push notifications in browser</p>
              </div>
              <Switch
                checked={notifications.browser}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, browser: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Lock Expiry Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified before locks expire</p>
              </div>
              <Switch
                checked={notifications.lockExpiry}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, lockExpiry: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Price Alerts</p>
                <p className="text-sm text-muted-foreground">USDT price movement notifications</p>
              </div>
              <Switch
                checked={notifications.priceAlerts}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, priceAlerts: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Manage your connected wallets and blockchain settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm text-destructive">Disconnected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect your wallet to interact with smart contracts
              </p>
            </div>

            <div className="space-y-2">
              <Label>Preferred Network</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="w-3 h-3 bg-warning rounded-full" />
                <span className="text-sm font-medium">BSC Testnet</span>
                <span className="text-xs text-muted-foreground ml-auto">Chain ID: 97</span>
              </div>
            </div>

            <Button variant="crypto" className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Supports MetaMask, WalletConnect, and other Web3 wallets
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};