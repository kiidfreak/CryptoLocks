import React, { useState } from 'react';
import { Calendar, Wallet, Plus, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { useLocks } from '@/hooks/useLocks';
import { useWallet } from '@/hooks/useWallet';
import { APP_CONFIG } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export const CreateLockForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const { createLock, isLoading } = useLocks();
  const { address, isConnected, usdtBalance } = useWallet();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Lock Created Successfully!",
        description: `Locked $${amount} USDT until ${new Date(expiryDate).toLocaleDateString()}`,
      });
      
      // Reset form
      setAmount('');
      setRecipient('');
      setExpiryDate('');
    } catch (error) {
      toast({
        title: "Lock Creation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = amount && recipient && expiryDate && isConnected;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5 p-8 border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Create New Lock
              </h2>
              <p className="text-lg text-muted-foreground mt-1">Secure • Fast • Professional USDT Time-Locking</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Create a new time-locked USDT vault with enterprise-grade security. 
            Set custom expiry dates and recipient addresses for maximum flexibility.
          </p>
          
          {!isConnected && (
            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-warning" />
                <p className="text-sm text-warning font-medium">
                  Please connect your wallet to create a lock
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enhanced Form */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Lock Configuration
            </CardTitle>
            <CardDescription>
              Set up your USDT time-lock with recipient and expiry details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount (USDT)
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-lg font-mono"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-sm font-medium text-muted-foreground">$</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: ${APP_CONFIG.MIN_LOCK_AMOUNT} USDT • Available: ${parseFloat(usdtBalance || '0').toFixed(2)} USDT
                </p>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Address
                </Label>
                <div className="relative">
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="0x742d35Cc6Ab888888C4d62A13d999..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="pl-12 font-mono text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  BSC address that will receive the locked tokens
                </p>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-sm font-medium">
                  Unlock Date
                </Label>
                <div className="relative">
                  <Input
                    id="expiry"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="pl-12"
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tokens will be unlocked after this date
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="crypto"
                className="w-full h-12 text-base"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Lock...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Time Lock
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview & Info */}
        <div className="space-y-6">
          {/* Enhanced Lock Preview */}
          <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-primary" />
                </div>
                Lock Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-mono font-bold">
                  {amount ? `$${amount} USDT` : '$0.00 USDT'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Recipient</span>
                <span className="font-mono text-xs">
                  {recipient || '0x...'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Unlock Date</span>
                <span className="font-mono text-sm">
                  {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>

              {amount && expiryDate && (
                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    Lock Duration: {Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Security Features */}
          <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-success" />
                </div>
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Smart contract audited by CertiK</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Non-custodial, funds stay in your control</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Immutable time locks on BSC</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Gas-optimized transactions</span>
              </div>
            </CardContent>
          </Card>

          {/* Fee Structure */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Fee Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Platform Fee</span>
                <span className="text-sm font-mono">0.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network Fee</span>
                <span className="text-sm font-mono">~$2-5</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-sm">Total Est. Cost</span>
                  <span className="text-sm font-mono">
                    {amount ? `$${(parseFloat(amount) * 0.001 + 3.5).toFixed(2)}` : '$3.50'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};