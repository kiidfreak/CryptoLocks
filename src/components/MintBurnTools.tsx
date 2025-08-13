import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';

interface MintBurnToolsProps {
  tokenAddress: string;
  userAddress: string;
  userBalance: string;
  onMint: (recipient: string, amount: string, reason: string) => Promise<void>;
  onBurn: (fromAddress: string, amount: string, reason: string) => Promise<void>;
  onSetMaxSupply: (newMaxSupply: string) => Promise<void>;
  onLockMaxSupply: () => Promise<void>;
  onPause: () => Promise<void>;
  onUnpause: () => Promise<void>;
  maxSupply: string;
  totalSupply: string;
  isMaxSupplyLocked: boolean;
  isPaused: boolean;
  hasMinterRole: boolean;
  hasBurnerRole: boolean;
  hasAdminRole: boolean;
  hasPauserRole: boolean;
  isLoading: boolean;
}

export default function MintBurnTools({
  tokenAddress,
  userAddress,
  userBalance,
  onMint,
  onBurn,
  onSetMaxSupply,
  onLockMaxSupply,
  onPause,
  onUnpause,
  maxSupply,
  totalSupply,
  isMaxSupplyLocked,
  isPaused,
  hasMinterRole,
  hasBurnerRole,
  hasAdminRole,
  hasPauserRole,
  isLoading
}: MintBurnToolsProps) {
  const [activeTab, setActiveTab] = useState('mint');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mint state
  const [mintRecipient, setMintRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintReason, setMintReason] = useState('');
  
  // Burn state
  const [burnFromAddress, setBurnFromAddress] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [burnReason, setBurnReason] = useState('');
  
  // Max supply state
  const [newMaxSupply, setNewMaxSupply] = useState('');
  
  const { toast } = useToast();

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  const calculateRemainingSupply = () => {
    const max = parseFloat(maxSupply);
    const total = parseFloat(totalSupply);
    if (isNaN(max) || isNaN(total)) return '0';
    return (max - total).toLocaleString();
  };

  const calculateSupplyPercentage = () => {
    const max = parseFloat(maxSupply);
    const total = parseFloat(totalSupply);
    if (isNaN(max) || isNaN(total) || max === 0) return 0;
    return (total / max) * 100;
  };

  const handleMint = async () => {
    if (!mintRecipient || !mintAmount || !mintReason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(mintAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const max = parseFloat(maxSupply);
    const total = parseFloat(totalSupply);
    if (amount + total > max) {
      toast({
        title: "Validation Error",
        description: `Minting ${amount} tokens would exceed max supply of ${max}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onMint(mintRecipient, mintAmount, mintReason);
      toast({
        title: "Success",
        description: `Successfully minted ${mintAmount} tokens to ${mintRecipient}`,
      });
      // Reset form
      setMintRecipient('');
      setMintAmount('');
      setMintReason('');
    } catch (error) {
      toast({
        title: "Mint Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBurn = async () => {
    if (!burnFromAddress || !burnAmount || !burnReason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(burnAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onBurn(burnFromAddress, burnAmount, burnReason);
      toast({
        title: "Success",
        description: `Successfully burned ${burnAmount} tokens from ${burnFromAddress}`,
      });
      // Reset form
      setBurnFromAddress('');
      setBurnAmount('');
      setBurnReason('');
    } catch (error) {
      toast({
        title: "Burn Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetMaxSupply = async () => {
    if (!newMaxSupply) {
      toast({
        title: "Validation Error",
        description: "Please enter a new max supply",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(newMaxSupply);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Max supply must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const currentTotal = parseFloat(totalSupply);
    if (amount < currentTotal) {
      toast({
        title: "Validation Error",
        description: `New max supply (${amount}) cannot be less than current total supply (${currentTotal})`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onSetMaxSupply(newMaxSupply);
      toast({
        title: "Success",
        description: "Max supply updated successfully",
      });
      setNewMaxSupply('');
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

  const handleLockMaxSupply = async () => {
    if (isMaxSupplyLocked) {
      toast({
        title: "Already Locked",
        description: "Max supply is already locked",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onLockMaxSupply();
      toast({
        title: "Success",
        description: "Max supply locked successfully",
      });
    } catch (error) {
      toast({
        title: "Lock Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseToggle = async () => {
    setIsProcessing(true);
    try {
      if (isPaused) {
        await onUnpause();
        toast({
          title: "Success",
          description: "Token transfers resumed",
        });
      } else {
        await onPause();
        toast({
          title: "Success",
          description: "Token transfers paused",
        });
      }
    } catch (error) {
      toast({
        title: "Toggle Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🪙 Mint/Burn Tools
          <Badge variant="secondary">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Manage token supply through minting, burning, and supply controls
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
          <div className="text-sm text-muted-foreground">
            <strong>Total Supply:</strong> {formatNumber(totalSupply)} USDT
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Max Supply:</strong> {formatNumber(maxSupply)} USDT
          </div>
        </div>

        {/* Supply Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Supply Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{formatNumber(totalSupply)}</div>
                <div className="text-sm text-muted-foreground">Total Supply</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{formatNumber(maxSupply)}</div>
                <div className="text-sm text-muted-foreground">Max Supply</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{calculateRemainingSupply()}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{calculateSupplyPercentage().toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Used</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Supply Usage</span>
                <span>{calculateSupplyPercentage().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calculateSupplyPercentage()}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="burn">Burn</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mint New Tokens</CardTitle>
                <CardDescription>
                  Create new tokens and assign them to a recipient address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasMinterRole ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800">
                      <strong>Access Required:</strong> You need the MINTER_ROLE to mint tokens.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mintRecipient">Recipient Address</Label>
                        <Input
                          id="mintRecipient"
                          placeholder="0x..."
                          value={mintRecipient}
                          onChange={(e) => setMintRecipient(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="mintAmount">Amount (USDT)</Label>
                        <Input
                          id="mintAmount"
                          type="number"
                          placeholder="1000.00"
                          value={mintAmount}
                          onChange={(e) => setMintAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mintReason">Reason</Label>
                      <Input
                        id="mintReason"
                        placeholder="Initial distribution, Team allocation, etc."
                        value={mintReason}
                        onChange={(e) => setMintReason(e.target.value)}
                      />
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        <strong>Current Total Supply:</strong> {formatNumber(totalSupply)} USDT
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Max Supply:</strong> {formatNumber(maxSupply)} USDT
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Remaining Capacity:</strong> {calculateRemainingSupply()} USDT
                      </div>
                    </div>

                    <Button 
                      onClick={handleMint} 
                      disabled={isProcessing || !mintRecipient || !mintAmount || !mintReason}
                      className="w-full"
                    >
                      {isProcessing ? "Minting..." : "Mint Tokens"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Burn Tokens</CardTitle>
                <CardDescription>
                  Remove tokens from circulation by burning them from a specific address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasBurnerRole ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800">
                      <strong>Access Required:</strong> You need the BURNER_ROLE to burn tokens.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="burnFromAddress">Address to Burn From</Label>
                        <Input
                          id="burnFromAddress"
                          placeholder="0x..."
                          value={burnFromAddress}
                          onChange={(e) => setBurnFromAddress(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="burnAmount">Amount (USDT)</Label>
                        <Input
                          id="burnAmount"
                          type="number"
                          placeholder="1000.00"
                          value={burnAmount}
                          onChange={(e) => setBurnAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="burnReason">Reason</Label>
                      <Input
                        id="burnReason"
                        placeholder="Excess supply reduction, Compliance, etc."
                        value={burnReason}
                        onChange={(e) => setBurnReason(e.target.value)}
                      />
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        <strong>Current Total Supply:</strong> {formatNumber(totalSupply)} USDT
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>After Burn:</strong> {(parseFloat(totalSupply) - parseFloat(burnAmount || '0')).toLocaleString()} USDT
                      </div>
                    </div>

                    <Button 
                      onClick={handleBurn} 
                      disabled={isProcessing || !burnFromAddress || !burnAmount || !burnReason}
                      className="w-full"
                    >
                      {isProcessing ? "Burning..." : "Burn Tokens"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Supply Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Max Supply Controls</CardTitle>
                  <CardDescription>
                    Manage the maximum token supply limit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasAdminRole ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-yellow-800">
                        <strong>Access Required:</strong> You need the ADMIN_ROLE to modify max supply.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="newMaxSupply">New Max Supply (USDT)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="newMaxSupply"
                            type="number"
                            placeholder={maxSupply}
                            value={newMaxSupply}
                            onChange={(e) => setNewMaxSupply(e.target.value)}
                          />
                          <Button
                            onClick={handleSetMaxSupply}
                            disabled={isProcessing || !newMaxSupply}
                          >
                            {isProcessing ? "Updating..." : "Update"}
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm">
                          <strong>Current Max Supply:</strong> {formatNumber(maxSupply)} USDT
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Status:</strong> 
                          <Badge variant={isMaxSupplyLocked ? "destructive" : "default"} className="ml-2">
                            {isMaxSupplyLocked ? "Locked" : "Unlocked"}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        onClick={handleLockMaxSupply}
                        disabled={isProcessing || isMaxSupplyLocked}
                        variant="outline"
                        className="w-full"
                      >
                        {isProcessing ? "Processing..." : "Lock Max Supply"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pause Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pause Controls</CardTitle>
                  <CardDescription>
                    Emergency controls to pause token transfers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasPauserRole ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-yellow-800">
                        <strong>Access Required:</strong> You need the PAUSER_ROLE to pause/unpause.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm">
                          <strong>Current Status:</strong> 
                          <Badge variant={isPaused ? "destructive" : "default"} className="ml-2">
                            {isPaused ? "Paused" : "Active"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {isPaused 
                            ? "Token transfers are currently paused" 
                            : "Token transfers are active and working normally"
                          }
                        </div>
                      </div>

                      <Button
                        onClick={handlePauseToggle}
                        disabled={isProcessing}
                        variant={isPaused ? "default" : "destructive"}
                        className="w-full"
                      >
                        {isProcessing ? "Processing..." : (isPaused ? "Resume Transfers" : "Pause Transfers")}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{hasMinterRole ? "✅" : "❌"}</div>
                    <div className="text-sm">Minter</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{hasBurnerRole ? "✅" : "❌"}</div>
                    <div className="text-sm">Burner</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{hasAdminRole ? "✅" : "❌"}</div>
                    <div className="text-sm">Admin</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{hasPauserRole ? "✅" : "❌"}</div>
                    <div className="text-sm">Pauser</div>
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
