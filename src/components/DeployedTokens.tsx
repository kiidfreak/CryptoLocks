import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  Send, 
  Users,
  DollarSign,
  TrendingUp,
  Network,
  Shield,
  Zap,
  Clock,
  Split,
  Gift,
  Target,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface DeployedToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  network: string;
  networkIcon: string;
  totalSupply: string;
  circulatingSupply: string;
  holders: number;
  price: string;
  marketCap: string;
  change24h: string;
  explorer: string;
  rpcUrl: string;
}

interface DeployedTokensProps {
  tokens: DeployedToken[];
}

export const DeployedTokens: React.FC<DeployedTokensProps> = ({ tokens }) => {
  console.log('🚨 DeployedTokens component rendering at:', new Date().toLocaleTimeString());
  console.log('🚨 Component version: 2.0 - UPDATED');
  console.log('🚨 Number of tokens:', tokens.length);
  console.log('🚨 Tokens data:', tokens);
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());
  const [sendFormData, setSendFormData] = useState<Record<string, {
    recipient: string;
    amount: string;
    feature: string;
    customParams: Record<string, string>;
  }>>({});
  const { toast } = useToast();

  const toggleToken = (tokenId: string) => {
    const newExpanded = new Set(expandedTokens);
    if (newExpanded.has(tokenId)) {
      newExpanded.delete(tokenId);
    } else {
      newExpanded.add(tokenId);
    }
    setExpandedTokens(newExpanded);
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSendToken = async (tokenId: string) => {
    const formData = sendFormData[tokenId];
    if (!formData || !formData.recipient || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending token with advanced features
    toast({
      title: "Token Sent Successfully!",
      description: `${formData.amount} ${tokens.find(t => t.id === tokenId)?.symbol} sent to ${formData.recipient.slice(0, 6)}...${formData.recipient.slice(-4)} with ${formData.feature} feature`,
    });

    // Clear form
    setSendFormData(prev => ({
      ...prev,
      [tokenId]: {
        recipient: '',
        amount: '',
        feature: 'standard',
        customParams: {}
      }
    }));
  };

  const updateSendForm = (tokenId: string, field: string, value: string) => {
    setSendFormData(prev => ({
      ...prev,
      [tokenId]: {
        ...prev[tokenId],
        [field]: value
      }
    }));
  };

  const updateCustomParam = (tokenId: string, param: string, value: string) => {
    setSendFormData(prev => ({
      ...prev,
      [tokenId]: {
        ...prev[tokenId],
        customParams: {
          ...prev[tokenId]?.customParams,
          [param]: value
        }
      }
    }));
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
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            Token Management Hub
          </CardTitle>
          <CardDescription>No tokens have been deployed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Tokens Deployed</p>
            <p className="text-sm">Deploy your first token to start managing and sending with advanced features</p>
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
    <div className="space-y-6" style={{ border: '10px solid red', background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ffff00)', padding: '20px' }}>
      {/* Debug Info */}
      <div style={{ 
        background: 'yellow', 
        padding: '30px', 
        margin: '30px 0', 
        border: '10px solid black', 
        fontSize: '20px', 
        textAlign: 'center',
        animation: 'flash 1s infinite',
        boxShadow: '0 0 50px red'
      }}>
        <style>
          {`
            @keyframes flash {
              0%, 50% { background: yellow; }
              51%, 100% { background: red; }
            }
          `}
        </style>
        <h3 style={{ color: 'red', fontSize: '32px', marginBottom: '20px' }}>🚨 DEBUG: Token Sending Hub Component is Rendering! 🚨</h3>
        <h4 style={{ color: 'blue', fontSize: '24px', marginBottom: '20px' }}>🔥 THIS IS THE NEW VERSION - UPDATED AT {new Date().toLocaleString()} 🔥</h4>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}><strong>Number of tokens:</strong> {tokens.length}</p>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}><strong>Current time:</strong> {new Date().toLocaleTimeString()}</p>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}><strong>Component version:</strong> 2.0 - UPDATED</p>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}><strong>Tokens data:</strong></p>
        <pre style={{ background: 'white', padding: '15px', border: '5px solid black', fontSize: '14px', textAlign: 'left' }}>
          {JSON.stringify(tokens, null, 2)}
        </pre>
      </div>
      
      {/* Token Management Hub Header */}
      <Card className="glass-card border-border" style={{ background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)', border: '5px solid purple' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Send className="h-6 w-6 text-white" />
            </div>
🚨 TOKEN SENDING HUB - UPDATED VERSION 2.0 🚨
          </CardTitle>
          <CardDescription className="text-lg">
            Advanced Token Sending • Multi-Feature Transfers • Professional Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Send your deployed tokens with enterprise-grade features. Choose from standard transfers, time-limited sends, token splitting, and vesting schedules. Professional token management starts with powerful sending capabilities.
          </p>
          <div className="flex gap-3">
            <Button 
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg"
              onClick={() => window.location.href = '/#send'}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Tokens Now
            </Button>
            <Button 
              variant="outline" 
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => window.open('/deploy', '_blank')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Deploy New Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{tokens.length}</div>
                <div className="text-sm text-muted-foreground">Total Tokens</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  +1 from last month <TrendingUp className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tokens.reduce((sum, token) => sum + token.holders, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Holders</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  +156 from last month <TrendingUp className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ${tokens.reduce((sum, token) => sum + parseFloat(token.marketCap.replace(/,/g, '')), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  +5.67% from last month <TrendingUp className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">$45,200</div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  +12.3% from last month <TrendingUp className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployed Tokens List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Deployed Tokens</h2>
          <Badge variant="outline" className="text-sm">
            {tokens.length} Token{tokens.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {tokens.map((token) => (
          <Card key={token.id} className="glass-card border-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{token.name} ({token.symbol})</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Network className="h-3 w-3" />
                      {token.network}
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyAddress(token.address)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {formatAddress(token.address)}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(token.explorer, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleToken(token.id)}
                  >
                    {expandedTokens.has(token.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Token Stats */}
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-primary">{formatNumber(token.totalSupply)}</div>
                  <div className="text-xs text-muted-foreground">Total Supply</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{formatNumber(token.circulatingSupply)}</div>
                  <div className="text-xs text-muted-foreground">Circulating</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{token.holders.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Holders</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">${token.price}</div>
                  <div className="text-xs text-muted-foreground">Price</div>
                </div>
              </div>

              {/* Market Info */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Market Cap:</span>
                    <span className="ml-2 font-semibold">${token.marketCap}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">24h Change:</span>
                    <span className={`ml-2 font-semibold ${
                      token.change24h.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {token.change24h}
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>

              {/* Collapsible Token Management */}
              <Collapsible open={expandedTokens.has(token.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between mb-2"
                  >
                    <span className="text-sm font-medium">Token Management & Advanced Features</span>
                    {expandedTokens.has(token.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 pt-4 border-t border-border">
                  
                  {/* Core Send Token Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                        <Send className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800">Send Token with Advanced Features</h3>
                        <p className="text-green-700">Choose from powerful token sending options designed for professional use</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Recipient and Amount */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Recipient Address</Label>
                        <Input
                          placeholder="0x..."
                          value={sendFormData[token.id]?.recipient || ''}
                          onChange={(e) => updateSendForm(token.id, 'recipient', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Amount ({token.symbol})</Label>
                        <Input
                          placeholder="0.00"
                          type="number"
                          value={sendFormData[token.id]?.amount || ''}
                          onChange={(e) => updateSendForm(token.id, 'amount', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Advanced Features Selection */}
                    <div className="mt-4">
                      <Label className="text-sm font-medium mb-3 block">Select Advanced Feature</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'standard', label: 'Standard Send', icon: Send, color: 'bg-blue-100 text-blue-700 border-blue-300' },
                          { id: 'expiration', label: 'With Expiration', icon: Clock, color: 'bg-orange-100 text-orange-700 border-orange-300' },
                          { id: 'splitting', label: 'Token Splitting', icon: Split, color: 'bg-purple-100 text-purple-700 border-purple-300' },
                          { id: 'vesting', label: 'Vesting Schedule', icon: Gift, color: 'bg-green-100 text-green-700 border-green-300' }
                        ].map((feature) => (
                          <Button
                            key={feature.id}
                            variant="outline"
                            size="sm"
                            className={`${feature.color} hover:opacity-80 ${sendFormData[token.id]?.feature === feature.id ? 'ring-2 ring-offset-2' : ''}`}
                            onClick={() => updateSendForm(token.id, 'feature', feature.id)}
                          >
                            <feature.icon className="h-4 w-4 mr-2" />
                            {feature.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Feature-Specific Parameters */}
                    {sendFormData[token.id]?.feature && sendFormData[token.id].feature !== 'standard' && (
                      <div className="mt-4 p-4 bg-white/50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-3">Configure {sendFormData[token.id].feature} Parameters</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {sendFormData[token.id].feature === 'expiration' && (
                            <>
                              <div>
                                <Label className="text-sm font-medium">Expiration Date</Label>
                                <Input
                                  type="datetime-local"
                                  value={sendFormData[token.id]?.customParams?.expirationDate || ''}
                                  onChange={(e) => updateCustomParam(token.id, 'expirationDate', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Auto-Return if Unclaimed</Label>
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={sendFormData[token.id]?.customParams?.autoReturn || 'true'}
                                  onChange={(e) => updateCustomParam(token.id, 'autoReturn', e.target.value)}
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              </div>
                            </>
                          )}
                          {sendFormData[token.id].feature === 'splitting' && (
                            <>
                              <div>
                                <Label className="text-sm font-medium">Split Count</Label>
                                <Input
                                  type="number"
                                  placeholder="2"
                                  value={sendFormData[token.id]?.customParams?.splitCount || ''}
                                  onChange={(e) => updateCustomParam(token.id, 'splitCount', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Split Type</Label>
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  value={sendFormData[token.id]?.customParams?.splitType || 'equal'}
                                  onChange={(e) => updateCustomParam(token.id, 'splitType', e.target.value)}
                                >
                                  <option value="equal">Equal Parts</option>
                                  <option value="percentage">Percentage Based</option>
                                  <option value="custom">Custom Amounts</option>
                                </select>
                              </div>
                            </>
                          )}
                          {sendFormData[token.id].feature === 'vesting' && (
                            <>
                              <div>
                                <Label className="text-sm font-medium">Vesting Duration (days)</Label>
                                <Input
                                  type="number"
                                  placeholder="365"
                                  value={sendFormData[token.id]?.customParams?.vestingDuration || ''}
                                  onChange={(e) => updateCustomParam(token.id, 'vestingDuration', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Cliff Period (days)</Label>
                                <Input
                                  type="number"
                                  placeholder="90"
                                  value={sendFormData[token.id]?.customParams?.cliffPeriod || ''}
                                  onChange={(e) => updateCustomParam(token.id, 'cliffPeriod', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Send Button */}
                    <div className="mt-4 flex gap-3">
                      <Button 
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                        onClick={() => handleSendToken(token.id)}
                        disabled={!sendFormData[token.id]?.recipient || !sendFormData[token.id]?.amount}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send {token.symbol} with {sendFormData[token.id]?.feature === 'standard' ? 'Standard' : sendFormData[token.id]?.feature} Feature
                      </Button>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Advanced Settings
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="font-semibold">View Holders</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Analyze token distribution and holder analytics</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                          </div>
                          <h4 className="font-semibold">Performance</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Track token performance and market metrics</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Charts
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Target className="h-4 w-4 text-green-600" />
                          </div>
                          <h4 className="font-semibold">Bulk Operations</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Send to multiple recipients at once</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Bulk Send
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Transactions */}
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Recent Transactions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="font-medium">Sent 1,000 {token.symbol}</div>
                            <div className="text-sm text-muted-foreground">To 0x742d...b6 • 2 hours ago</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <div>
                            <div className="font-medium">Vesting Lock Created</div>
                            <div className="text-sm text-muted-foreground">500 {token.symbol} • 365 days • 1 day ago</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
