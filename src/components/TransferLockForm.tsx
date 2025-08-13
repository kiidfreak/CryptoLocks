import React, { useState } from 'react';
import { ArrowLeft, Wallet, ArrowRight, Shield, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TransferLockFormProps {
  onViewChange?: (view: string) => void;
}

export const TransferLockForm: React.FC<TransferLockFormProps> = ({ onViewChange }) => {
  const [selectedLock, setSelectedLock] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for existing locks
  const existingLocks = [
    { id: '1', amount: '50,000', expiryDate: '2024-12-15', recipient: '0x742...4d2' },
    { id: '2', amount: '125,000', expiryDate: '2024-08-20', recipient: '0x123...789' },
    { id: '3', amount: '75,500', expiryDate: '2024-06-10', recipient: '0x456...abc' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLock || !newRecipient) {
      toast({
        title: "Missing Information",
        description: "Please select a lock and enter a new recipient address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Lock Transferred Successfully!",
        description: `Lock has been transferred to ${newRecipient}`,
      });
      
      // Reset form
      setSelectedLock('');
      setNewRecipient('');
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedLock && newRecipient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5 p-8 border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange?.('dashboard')}
              className="p-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Transfer Lock
              </h2>
              <p className="text-lg text-muted-foreground mt-1">Secure • Fast • Professional Lock Transfer</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Transfer an existing USDT time-lock to a new recipient address. 
            This operation maintains the original lock terms while changing ownership.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transfer Form */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              Transfer Configuration
            </CardTitle>
            <CardDescription>
              Select an existing lock and specify the new recipient address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lock Selection */}
              <div className="space-y-2">
                <Label htmlFor="lock" className="text-sm font-medium">
                  Select Lock to Transfer
                </Label>
                <select
                  id="lock"
                  value={selectedLock}
                  onChange={(e) => setSelectedLock(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background focus:border-primary transition-colors"
                >
                  <option value="">Choose a lock...</option>
                  {existingLocks.map((lock) => (
                    <option key={lock.id} value={lock.id}>
                      Lock #{lock.id} - ${lock.amount} USDT (Expires: {lock.expiryDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* New Recipient */}
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm font-medium">
                  New Recipient Address
                </Label>
                <div className="relative">
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="0x742d35Cc6Ab888888C4d62A13d999..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="pl-12 font-mono text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  BSC address that will receive the transferred lock
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
                    Transferring Lock...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Transfer Lock
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transfer Preview & Info */}
        <div className="space-y-6">
          {/* Transfer Preview */}
          <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-primary" />
                </div>
                Transfer Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLock ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Lock ID</span>
                    <span className="font-mono font-bold">#{selectedLock}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Current Recipient</span>
                    <span className="font-mono text-xs">
                      {existingLocks.find(l => l.id === selectedLock)?.recipient || '0x...'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">New Recipient</span>
                    <span className="font-mono text-xs">
                      {newRecipient || '0x...'}
                    </span>
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      Transfer Fee: ~$2-5 (Network Gas)
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a lock to see transfer details
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-success" />
                </div>
                Transfer Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Lock terms remain unchanged</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Original expiry date preserved</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Immediate ownership transfer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Non-reversible operation</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
