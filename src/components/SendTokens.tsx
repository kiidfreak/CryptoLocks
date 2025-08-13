import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';

interface SendTokensProps {
  tokenAddress: string;
  userBalance: string;
  onTransfer: (recipient: string, amount: string) => Promise<void>;
  onBatchTransfer: (recipients: string[], amounts: string[]) => Promise<void>;
}

export default function SendTokens({ 
  tokenAddress, 
  userBalance, 
  onTransfer, 
  onBatchTransfer 
}: SendTokensProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Batch transfer state
  const [batchRecipients, setBatchRecipients] = useState<string[]>(['']);
  const [batchAmounts, setBatchAmounts] = useState<string[]>(['']);
  const [batchDescription, setBatchDescription] = useState('');
  
  const { toast } = useToast();

  const handleStandardTransfer = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onTransfer(recipient, amount);
      toast({
        title: "Success",
        description: `Successfully sent ${amount} tokens to ${recipient}`,
      });
      setRecipient('');
      setAmount('');
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchTransfer = async () => {
    const validRecipients = batchRecipients.filter(r => r.trim() !== '');
    const validAmounts = batchAmounts.filter(a => a.trim() !== '');

    if (validRecipients.length === 0 || validAmounts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one recipient and amount",
        variant: "destructive"
      });
      return;
    }

    if (validRecipients.length !== validAmounts.length) {
      toast({
        title: "Validation Error",
        description: "Number of recipients must match number of amounts",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onBatchTransfer(validRecipients, validAmounts);
      toast({
        title: "Success",
        description: `Successfully sent batch transfer to ${validRecipients.length} recipients`,
      });
      // Reset batch form
      setBatchRecipients(['']);
      setBatchAmounts(['']);
      setBatchDescription('');
    } catch (error) {
      toast({
        title: "Batch Transfer Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addBatchRecipient = () => {
    setBatchRecipients([...batchRecipients, '']);
    setBatchAmounts([...batchAmounts, '']);
  };

  const removeBatchRecipient = (index: number) => {
    if (batchRecipients.length > 1) {
      setBatchRecipients(batchRecipients.filter((_, i) => i !== index));
      setBatchAmounts(batchAmounts.filter((_, i) => i !== index));
    }
  };

  const updateBatchRecipient = (index: number, value: string) => {
    const newRecipients = [...batchRecipients];
    newRecipients[index] = value;
    setBatchRecipients(newRecipients);
  };

  const updateBatchAmount = (index: number, value: string) => {
    const newAmounts = [...batchAmounts];
    newAmounts[index] = value;
    setBatchAmounts(newAmounts);
  };

  const calculateTotalBatchAmount = () => {
    return batchAmounts.reduce((total, amount) => {
      const num = parseFloat(amount) || 0;
      return total + num;
    }, 0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💸 Send Tokens
          <Badge variant="secondary">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Transfer tokens to individual addresses or perform batch transfers to multiple recipients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Token Address:</strong> {tokenAddress}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Your Balance:</strong> {userBalance} USDT
          </div>
        </div>

        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Transfer</TabsTrigger>
            <TabsTrigger value="batch">Batch Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleStandardTransfer} 
                disabled={isLoading || !recipient || !amount}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Tokens"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchDescription">Description (Optional)</Label>
                <Input
                  id="batchDescription"
                  placeholder="Q4 2024 distribution, Team allocation, etc."
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Recipients & Amounts</Label>
                {batchRecipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={recipient}
                      onChange={(e) => updateBatchRecipient(index, e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="100.00"
                      value={batchAmounts[index]}
                      onChange={(e) => updateBatchAmount(index, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBatchRecipient(index)}
                      disabled={batchRecipients.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addBatchRecipient}
                  className="w-full"
                >
                  + Add Recipient
                </Button>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <strong>Total Amount:</strong> {calculateTotalBatchAmount().toFixed(2)} USDT
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Recipients:</strong> {batchRecipients.filter(r => r.trim() !== '').length}
                </div>
              </div>

              <Button 
                onClick={handleBatchTransfer} 
                disabled={isLoading || batchRecipients.filter(r => r.trim() !== '').length === 0}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Execute Batch Transfer"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
