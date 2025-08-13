import React, { useState } from 'react';
import { ArrowLeft, Wallet, PieChart, Shield, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SplitLockFormProps {
  onViewChange?: (view: string) => void;
}

interface SplitAllocation {
  id: string;
  amount: string;
  recipient: string;
}

export const SplitLockForm: React.FC<SplitLockFormProps> = ({ onViewChange }) => {
  const [selectedLock, setSelectedLock] = useState('');
  const [splitCount, setSplitCount] = useState(2);
  const [allocations, setAllocations] = useState<SplitAllocation[]>([
    { id: '1', amount: '', recipient: '' },
    { id: '2', amount: '', recipient: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for existing locks
  const existingLocks = [
    { id: '1', amount: '100,000', expiryDate: '2024-12-15', recipient: '0x742...4d2' },
    { id: '2', amount: '125,000', expiryDate: '2024-08-20', recipient: '0x123...789' },
    { id: '3', amount: '75,500', expiryDate: '2024-06-10', recipient: '0x456...abc' },
  ];

  const selectedLockData = existingLocks.find(l => l.id === selectedLock);
  const totalAmount = selectedLockData ? parseFloat(selectedLockData.amount.replace(/,/g, '')) : 0;

  const handleSplitCountChange = (count: number) => {
    if (count < 2 || count > 10) return;
    
    setSplitCount(count);
    const newAllocations: SplitAllocation[] = [];
    
    for (let i = 1; i <= count; i++) {
      newAllocations.push({
        id: i.toString(),
        amount: '',
        recipient: ''
      });
    }
    
    setAllocations(newAllocations);
  };

  const updateAllocation = (index: number, field: 'amount' | 'recipient', value: string) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setAllocations(newAllocations);
  };

  const calculateTotalAllocated = () => {
    return allocations.reduce((sum, allocation) => {
      return sum + (parseFloat(allocation.amount) || 0);
    }, 0);
  };

  const getRemainingAmount = () => {
    return totalAmount - calculateTotalAllocated();
  };

  const isFormValid = () => {
    if (!selectedLock) return false;
    
    const totalAllocated = calculateTotalAllocated();
    if (totalAllocated !== totalAmount) return false;
    
    return allocations.every(allocation => 
      allocation.amount && allocation.recipient && parseFloat(allocation.amount) > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Invalid Split Configuration",
        description: "Please ensure all amounts add up to the total and all recipients are specified.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Lock Split Successfully!",
        description: `Lock has been split into ${splitCount} smaller locks`,
      });
      
      // Reset form
      setSelectedLock('');
      setSplitCount(2);
      setAllocations([
        { id: '1', amount: '', recipient: '' },
        { id: '2', amount: '', recipient: '' }
      ]);
    } catch (error) {
      toast({
        title: "Split Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Split Lock
              </h2>
              <p className="text-lg text-muted-foreground mt-1">Secure • Flexible • Professional Lock Division</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Split an existing USDT time-lock into multiple smaller locks with different recipients. 
            This operation maintains the original expiry date while creating new ownership structures.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Split Configuration */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              Split Configuration
            </CardTitle>
            <CardDescription>
              Select a lock and configure how to split it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lock Selection */}
              <div className="space-y-2">
                <Label htmlFor="lock" className="text-sm font-medium">
                  Select Lock to Split
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

              {/* Split Count */}
              <div className="space-y-2">
                <Label htmlFor="splitCount" className="text-sm font-medium">
                  Number of Splits
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSplitCountChange(splitCount - 1)}
                    disabled={splitCount <= 2}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 bg-muted rounded-lg font-mono">
                    {splitCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSplitCountChange(splitCount + 1)}
                    disabled={splitCount >= 10}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose between 2 and 10 splits
                </p>
              </div>

              {/* Allocations */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Split Allocations</Label>
                {allocations.map((allocation, index) => (
                  <div key={allocation.id} className="space-y-2 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Split #{index + 1}</span>
                      <span className="text-xs text-muted-foreground">
                        {getRemainingAmount() + parseFloat(allocation.amount || '0')} USDT remaining
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`amount-${index}`} className="text-xs">Amount (USDT)</Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          placeholder="0.00"
                          value={allocation.amount}
                          onChange={(e) => updateAllocation(index, 'amount', e.target.value)}
                          className="text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`recipient-${index}`} className="text-xs">Recipient</Label>
                        <Input
                          id={`recipient-${index}`}
                          type="text"
                          placeholder="0x..."
                          value={allocation.recipient}
                          onChange={(e) => updateAllocation(index, 'recipient', e.target.value)}
                          className="text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="crypto"
                className="w-full h-12 text-base"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Splitting Lock...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Split Lock
                    <PieChart className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Split Preview & Info */}
        <div className="space-y-6">
          {/* Split Preview */}
          <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <Calculator className="h-3 w-3 text-primary" />
                </div>
                Split Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLock ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Original Lock</span>
                    <span className="font-mono font-bold">#{selectedLock}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="font-mono font-bold">${totalAmount.toLocaleString()} USDT</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Allocated</span>
                    <span className={`font-mono font-bold ${
                      calculateTotalAllocated() === totalAmount ? 'text-success' : 'text-warning'
                    }`}>
                      ${calculateTotalAllocated().toLocaleString()} USDT
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-mono font-bold ${
                      getRemainingAmount() === 0 ? 'text-success' : 'text-warning'
                    }`}>
                      ${getRemainingAmount().toLocaleString()} USDT
                    </span>
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      Split Fee: ~$3-8 (Network Gas)
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a lock to see split details
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
                Split Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Original expiry date preserved</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Each split maintains lock terms</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">Individual recipient control</span>
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
