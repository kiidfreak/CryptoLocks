import React, { useState } from 'react';
import { Calendar, Wallet, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';

export const CreateLockForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    // Reset form
    setAmount('');
    setRecipient('');
    setExpiryDate('');
  };

  const isFormValid = amount && recipient && expiryDate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create New Lock</h2>
        <p className="text-muted-foreground">Lock your USDT tokens with smart contract security</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
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
                  Minimum: $100 USDT • Available: $50,000 USDT
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
          {/* Lock Preview */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Lock Preview</CardTitle>
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

          {/* Security Features */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
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