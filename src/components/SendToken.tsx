import React, { useState } from 'react';
import { 
  Send, 
  Clock, 
  Scissors, 
  Lock, 
  Users, 
  DollarSign, 
  Network, 
  Shield,
  Zap,
  TrendingUp,
  Eye,
  Edit3,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface DeployedToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  network: string;
  totalSupply: string;
  circulatingSupply: string;
  holders: number;
  price: string;
  marketCap: string;
  explorer: string;
}

interface SendTokenProps {
  tokens: DeployedToken[];
}

export const SendToken: React.FC<SendTokenProps> = ({ tokens }) => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [expirationDays, setExpirationDays] = useState('30');
  const [splitCount, setSplitCount] = useState('1');
  const [enableLock, setEnableLock] = useState(false);
  const [lockDuration, setLockDuration] = useState('180');
  const [vestingSchedule, setVestingSchedule] = useState('linear');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const selectedTokenData = tokens.find(token => token.id === selectedToken);

  const handleSendToken = () => {
    if (!selectedToken || !recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Simulate token send
    toast({
      title: "Token Sent Successfully!",
      description: `${amount} ${selectedTokenData?.symbol} sent to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
    });

    // Clear form
    setRecipientAddress('');
    setAmount('');
    setExpirationDays('30');
    setSplitCount('1');
    setEnableLock(false);
    setLockDuration('180');
    setVestingSchedule('linear');
  };

  const handlePreview = () => {
    if (!selectedToken || !recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Preview",
      description: `Sending ${amount} ${selectedTokenData?.symbol} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)} with ${expirationDays} days expiration`,
    });
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (tokens.length === 0) {
    return (
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Send className="h-4 w-4 text-blue-500" />
            </div>
            Send Token
          </CardTitle>
          <CardDescription>No tokens have been deployed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Tokens Available</p>
            <p className="text-sm">Deploy your first token to start sending</p>
            <Button 
              className="mt-4"
              onClick={() => window.open('/deploy', '_blank')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Deploy Token
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Send Token</h2>
          <p className="text-muted-foreground">Send tokens with advanced features and lock management</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {tokens.length} Token{tokens.length !== 1 ? 's' : ''} Available
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Token Selection & Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Token Selector */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Select Token
              </CardTitle>
              <CardDescription>Choose which token to send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        <div className="flex items-center gap-2">
                          <span>{token.symbol}</span>
                          <span className="text-muted-foreground">({token.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Token Info Display */}
              {selectedTokenData && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Network:</span>
                      <div className="flex items-center gap-2">
                        <Network className="h-3 w-3" />
                        <span className="text-sm text-blue-700">{selectedTokenData.network}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Total Supply:</span>
                      <span className="text-sm text-blue-700">{formatNumber(selectedTokenData.totalSupply)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Circulating:</span>
                      <span className="text-sm text-blue-700">{formatNumber(selectedTokenData.circulatingSupply)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Holders:</span>
                      <span className="text-sm text-blue-700">{selectedTokenData.holders.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Price:</span>
                      <span className="text-sm text-blue-700">${selectedTokenData.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Market Cap:</span>
                      <span className="text-sm text-blue-700">${selectedTokenData.marketCap}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(selectedTokenData.address)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Address
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedTokenData.explorer, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Send Configuration */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send Configuration
              </CardTitle>
              <CardDescription>Configure your token transfer with advanced options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Send Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Recipient Address</Label>
                  <Input
                    placeholder="0x... (Enter recipient address)"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    placeholder="Enter amount to send"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {selectedTokenData && (
                    <p className="text-xs text-muted-foreground">
                      Available: {formatNumber(selectedTokenData.circulatingSupply)} {selectedTokenData.symbol}
                    </p>
                  )}
                </div>
              </div>

              {/* Expiration & Splitting */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Expiration (Days)</Label>
                  <Select value={expirationDays} onValueChange={setExpirationDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Token expires if not claimed within this time
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Split Count</Label>
                  <Select value={splitCount} onValueChange={setSplitCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">No split (1 recipient)</SelectItem>
                      <SelectItem value="2">Split into 2</SelectItem>
                      <SelectItem value="3">Split into 3</SelectItem>
                      <SelectItem value="5">Split into 5</SelectItem>
                      <SelectItem value="10">Split into 10</SelectItem>
                      <SelectItem value="custom">Custom split</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Number of times this transfer can be split
                  </p>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Advanced Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable timelock and vesting options
                  </p>
                </div>
                <Switch
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
              </div>

              {/* Advanced Features */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <h4 className="font-semibold text-purple-800">Advanced Token Features</h4>
                  </div>

                  {/* Lock Management */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Time Lock</Label>
                      <p className="text-sm text-muted-foreground">
                        Lock tokens for a specified duration
                      </p>
                    </div>
                    <Switch
                      checked={enableLock}
                      onCheckedChange={setEnableLock}
                    />
                  </div>

                  {enableLock && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Lock Duration (Days)</Label>
                        <Select value={lockDuration} onValueChange={setLockDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                            <SelectItem value="365">365 days</SelectItem>
                            <SelectItem value="730">2 years</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Vesting Schedule</Label>
                        <Select value={vestingSchedule} onValueChange={setVestingSchedule}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear (equal monthly)</SelectItem>
                            <SelectItem value="cliff">Cliff (all at once)</SelectItem>
                            <SelectItem value="quarterly">Quarterly releases</SelectItem>
                            <SelectItem value="custom">Custom schedule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Additional Features */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Transfer Fee</Label>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage fee on transfer (optional)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Recipients</Label>
                      <Input
                        placeholder="1"
                        type="number"
                        min="1"
                        max="100"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of recipients
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handlePreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Transaction
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleSendToken}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Token
                </Button>
              </div>

              {/* Transaction Summary */}
              {selectedToken && recipientAddress && amount && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Transaction Summary</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Token:</span>
                      <span className="font-medium">{selectedTokenData?.symbol} ({selectedTokenData?.name})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">{amount} {selectedTokenData?.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipient:</span>
                      <span className="font-medium">{formatAddress(recipientAddress)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiration:</span>
                      <span className="font-medium">{expirationDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Split Count:</span>
                      <span className="font-medium">{splitCount}</span>
                    </div>
                    {enableLock && (
                      <>
                        <div className="flex justify-between">
                          <span>Lock Duration:</span>
                          <span className="font-medium">{lockDuration} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vesting:</span>
                          <span className="font-medium">{vestingSchedule}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
