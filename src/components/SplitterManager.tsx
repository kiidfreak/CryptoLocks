import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';

interface Recipient {
  id: number;
  wallet: string;
  percentage: number;
  description: string;
  isActive: boolean;
}

interface Distribution {
  id: number;
  totalAmount: string;
  recipientCount: number;
  description: string;
  timestamp: number;
  isCompleted: boolean;
}

interface SplitterManagerProps {
  tokenSplitterAddress: string;
  userAddress: string;
  userBalance: string;
  onAddRecipient: (wallet: string, percentage: number, description: string) => Promise<void>;
  onUpdateRecipient: (recipientId: number, wallet: string, percentage: number, description: string) => Promise<void>;
  onRemoveRecipient: (recipientId: number) => Promise<void>;
  onExecuteDistribution: (amount: string, description: string) => Promise<void>;
  onSetMinDistributionAmount: (amount: string) => Promise<void>;
  onPauseDistribution: () => Promise<void>;
  onUnpauseDistribution: () => Promise<void>;
  recipients: Recipient[];
  distributions: Distribution[];
  minDistributionAmount: string;
  isDistributionPaused: boolean;
  isLoading: boolean;
}

export default function SplitterManager({
  tokenSplitterAddress,
  userAddress,
  userBalance,
  onAddRecipient,
  onUpdateRecipient,
  onRemoveRecipient,
  onExecuteDistribution,
  onSetMinDistributionAmount,
  onPauseDistribution,
  onUnpauseDistribution,
  recipients,
  distributions,
  minDistributionAmount,
  isDistributionPaused,
  isLoading
}: SplitterManagerProps) {
  const [activeTab, setActiveTab] = useState('recipients');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add recipient state
  const [newWallet, setNewWallet] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Edit recipient state
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [editWallet, setEditWallet] = useState('');
  const [editPercentage, setEditPercentage] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Distribution state
  const [distributionAmount, setDistributionAmount] = useState('');
  const [distributionDescription, setDistributionDescription] = useState('');
  
  // Min amount state
  const [newMinAmount, setNewMinAmount] = useState('');
  
  const { toast } = useToast();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateTotalPercentage = () => {
    return recipients.reduce((total, recipient) => total + recipient.percentage, 0);
  };

  const validatePercentage = (percentage: number) => {
    const total = calculateTotalPercentage();
    const currentRecipientPercentage = editingRecipient ? editingRecipient.percentage : 0;
    const newTotal = total - currentRecipientPercentage + percentage;
    return newTotal <= 100;
  };

  const handleAddRecipient = async () => {
    if (!newWallet || !newPercentage || !newDescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const percentage = parseFloat(newPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        title: "Validation Error",
        description: "Percentage must be between 0 and 100",
        variant: "destructive"
      });
      return;
    }

    if (!validatePercentage(percentage)) {
      toast({
        title: "Validation Error",
        description: "Total percentage would exceed 100%",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onAddRecipient(newWallet, percentage, newDescription);
      toast({
        title: "Success",
        description: "Recipient added successfully",
      });
      // Reset form
      setNewWallet('');
      setNewPercentage('');
      setNewDescription('');
    } catch (error) {
      toast({
        title: "Add Recipient Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRecipient = async () => {
    if (!editingRecipient || !editWallet || !editPercentage || !editDescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const percentage = parseFloat(editPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        title: "Validation Error",
        description: "Percentage must be between 0 and 100",
        variant: "destructive"
      });
      return;
    }

    if (!validatePercentage(percentage)) {
      toast({
        title: "Validation Error",
        description: "Total percentage would exceed 100%",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onUpdateRecipient(editingRecipient.id, editWallet, percentage, editDescription);
      toast({
        title: "Success",
        description: "Recipient updated successfully",
      });
      // Reset edit state
      setEditingRecipient(null);
      setEditWallet('');
      setEditPercentage('');
      setEditDescription('');
    } catch (error) {
      toast({
        title: "Update Recipient Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRecipient = async (recipientId: number) => {
    setIsProcessing(true);
    try {
      await onRemoveRecipient(recipientId);
      toast({
        title: "Success",
        description: "Recipient removed successfully",
      });
    } catch (error) {
      toast({
        title: "Remove Recipient Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteDistribution = async () => {
    if (!distributionAmount || !distributionDescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(distributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (amount < parseFloat(minDistributionAmount)) {
      toast({
        title: "Validation Error",
        description: `Amount must be at least ${minDistributionAmount} USDT`,
        variant: "destructive"
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        title: "Validation Error",
        description: "No recipients configured",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onExecuteDistribution(distributionAmount, distributionDescription);
      toast({
        title: "Success",
        description: "Distribution executed successfully",
      });
      // Reset form
      setDistributionAmount('');
      setDistributionDescription('');
    } catch (error) {
      toast({
        title: "Distribution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetMinAmount = async () => {
    if (!newMinAmount) {
      toast({
        title: "Validation Error",
        description: "Please enter a minimum amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(newMinAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be a positive number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onSetMinDistributionAmount(newMinAmount);
      toast({
        title: "Success",
        description: "Minimum distribution amount updated",
      });
      setNewMinAmount('');
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startEditingRecipient = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setEditWallet(recipient.wallet);
    setEditPercentage(recipient.percentage.toString());
    setEditDescription(recipient.description);
  };

  const cancelEditing = () => {
    setEditingRecipient(null);
    setEditWallet('');
    setEditPercentage('');
    setEditDescription('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✂️ Splitter Manager
          <Badge variant="secondary">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Configure recipients and execute automated token distributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Splitter Contract:</strong> {tokenSplitterAddress}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Your Balance:</strong> {userBalance} USDT
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Min Distribution:</strong> {minDistributionAmount} USDT
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Status:</strong> 
            <Badge variant={isDistributionPaused ? "destructive" : "default"} className="ml-2">
              {isDistributionPaused ? "Paused" : "Active"}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
            <TabsTrigger value="distribute">Distribute</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="recipients" className="space-y-6">
            {/* Add New Recipient */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Recipient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="newWallet">Wallet Address</Label>
                    <Input
                      id="newWallet"
                      placeholder="0x..."
                      value={newWallet}
                      onChange={(e) => setNewWallet(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPercentage">Percentage (%)</Label>
                    <Input
                      id="newPercentage"
                      type="number"
                      placeholder="25.0"
                      step="0.1"
                      value={newPercentage}
                      onChange={(e) => setNewPercentage(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="newDescription">Description</Label>
                    <Input
                      id="newDescription"
                      placeholder="Team wallet, Treasury, etc."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <strong>Total Percentage:</strong> {calculateTotalPercentage().toFixed(1)}%
                  </div>
                  <Button 
                    onClick={handleAddRecipient} 
                    disabled={isProcessing || !newWallet || !newPercentage || !newDescription}
                  >
                    {isProcessing ? "Adding..." : "Add Recipient"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recipients List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading recipients...</div>
                ) : recipients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No recipients configured</div>
                ) : (
                  <div className="space-y-3">
                    {recipients.map((recipient) => (
                      <Card key={recipient.id}>
                        <CardContent className="p-4">
                          {editingRecipient?.id === recipient.id ? (
                            // Edit mode
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label>Wallet Address</Label>
                                  <Input
                                    value={editWallet}
                                    onChange={(e) => setEditWallet(e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <Label>Percentage (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={editPercentage}
                                    onChange={(e) => setEditPercentage(e.target.value)}
                                  />
                                </div>

                                <div>
                                  <Label>Description</Label>
                                  <Input
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleUpdateRecipient}
                                  disabled={isProcessing}
                                >
                                  {isProcessing ? "Updating..." : "Update"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="font-semibold">{recipient.wallet}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {recipient.description}
                                  </div>
                                </div>
                                <Badge variant="default">
                                  {recipient.percentage}%
                                </Badge>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingRecipient(recipient)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemoveRecipient(recipient.id)}
                                  disabled={isProcessing}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribute" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Execute Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distributionAmount">Amount (USDT)</Label>
                    <Input
                      id="distributionAmount"
                      type="number"
                      placeholder="10000.00"
                      value={distributionAmount}
                      onChange={(e) => setDistributionAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="distributionDescription">Description</Label>
                    <Input
                      id="distributionDescription"
                      placeholder="Q4 2024 revenue, Team bonus, etc."
                      value={distributionDescription}
                      onChange={(e) => setDistributionDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <strong>Recipients:</strong> {recipients.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Total Percentage:</strong> {calculateTotalPercentage().toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Min Amount Required:</strong> {minDistributionAmount} USDT
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleExecuteDistribution} 
                    disabled={isProcessing || !distributionAmount || !distributionDescription || recipients.length === 0}
                    className="flex-1"
                  >
                    {isProcessing ? "Processing..." : "Execute Distribution"}
                  </Button>
                  
                  <Button
                    variant={isDistributionPaused ? "default" : "destructive"}
                    onClick={isDistributionPaused ? onUnpauseDistribution : onPauseDistribution}
                    disabled={isProcessing}
                  >
                    {isDistributionPaused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Distribution History</h3>
              {isLoading ? (
                <div className="text-center py-8">Loading distributions...</div>
              ) : distributions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No distributions found</div>
              ) : (
                <div className="space-y-3">
                  {distributions.map((distribution) => (
                    <Card key={distribution.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold">Distribution #{distribution.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {distribution.description}
                            </div>
                          </div>
                          <Badge variant={distribution.isCompleted ? "default" : "secondary"}>
                            {distribution.isCompleted ? "Completed" : "Processing"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Amount:</strong> {distribution.totalAmount} USDT
                          </div>
                          <div>
                            <strong>Recipients:</strong> {distribution.recipientCount}
                          </div>
                          <div>
                            <strong>Timestamp:</strong> {formatTime(distribution.timestamp)}
                          </div>
                          <div>
                            <strong>Status:</strong> {distribution.isCompleted ? "Completed" : "Processing"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Splitter Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newMinAmount">Minimum Distribution Amount (USDT)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newMinAmount"
                      type="number"
                      placeholder={minDistributionAmount}
                      value={newMinAmount}
                      onChange={(e) => setNewMinAmount(e.target.value)}
                    />
                    <Button
                      onClick={handleSetMinAmount}
                      disabled={isProcessing || !newMinAmount}
                    >
                      {isProcessing ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <strong>Current Min Amount:</strong> {minDistributionAmount} USDT
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Distribution Status:</strong> 
                    <Badge variant={isDistributionPaused ? "destructive" : "default"} className="ml-2">
                      {isDistributionPaused ? "Paused" : "Active"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
