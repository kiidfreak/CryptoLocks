import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';

interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
  isContract: boolean;
  lastTransaction?: number;
}

interface TokenStats {
  totalSupply: string;
  maxSupply: string;
  totalHolders: number;
  circulatingSupply: string;
  lockedSupply: string;
  averageBalance: string;
  medianBalance: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  type: 'transfer' | 'mint' | 'burn' | 'lock' | 'unlock';
}

interface TokenHolderStatsProps {
  tokenAddress: string;
  onRefreshStats: () => Promise<void>;
  onSearchHolder: (address: string) => Promise<TokenHolder | null>;
  holders: TokenHolder[];
  stats: TokenStats;
  recentTransactions: Transaction[];
  isLoading: boolean;
}

export default function TokenHolderStats({
  tokenAddress,
  onRefreshStats,
  onSearchHolder,
  holders,
  stats,
  recentTransactions,
  isLoading
}: TokenHolderStatsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResult, setSearchResult] = useState<TokenHolder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { toast } = useToast();

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateSupplyPercentage = () => {
    const total = parseFloat(stats.totalSupply);
    const max = parseFloat(stats.maxSupply);
    if (isNaN(total) || isNaN(max) || max === 0) return 0;
    return (total / max) * 100;
  };

  const getTopHolders = (count: number = 10) => {
    return holders.slice(0, count);
  };

  const getHolderDistribution = () => {
    const distribution = {
      whales: 0,      // >1% of supply
      large: 0,       // 0.1% - 1% of supply
      medium: 0,      // 0.01% - 0.1% of supply
      small: 0,       // <0.01% of supply
    };

    const totalSupply = parseFloat(stats.totalSupply);
    
    holders.forEach(holder => {
      const percentage = holder.percentage;
      if (percentage > 1) distribution.whales++;
      else if (percentage > 0.1) distribution.large++;
      else if (percentage > 0.01) distribution.medium++;
      else distribution.small++;
    });

    return distribution;
  };

  const handleSearchHolder = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an address to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await onSearchHolder(searchAddress.trim());
      setSearchResult(result);
      
      if (result) {
        toast({
          title: "Holder Found",
          description: `Found holder with ${formatNumber(result.balance)} USDT`,
        });
      } else {
        toast({
          title: "No Holder Found",
          description: "No tokens found for this address",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      await onRefreshStats();
      toast({
        title: "Success",
        description: "Statistics refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const holderDistribution = getHolderDistribution();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Token Holder Stats
          <Badge variant="secondary">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive analytics and statistics for token holders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Token Address:</strong> {tokenAddress}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Total Holders:</strong> {stats.totalHolders.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Last Updated:</strong> {new Date().toLocaleString()}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{formatNumber(stats.totalSupply)}</div>
                    <div className="text-sm text-muted-foreground">Total Supply</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{formatNumber(stats.circulatingSupply)}</div>
                    <div className="text-sm text-muted-foreground">Circulating</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{formatNumber(stats.lockedSupply)}</div>
                    <div className="text-sm text-muted-foreground">Locked</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.totalHolders.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Holders</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supply Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Supply Usage</span>
                      <span>{calculateSupplyPercentage().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${calculateSupplyPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {formatNumber(stats.totalSupply)} / {formatNumber(stats.maxSupply)} USDT
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">Holder Distribution</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Whales (&gt;1%)</span>
                        <span className="font-mono">{holderDistribution.whales}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Large (0.1-1%)</span>
                        <span className="font-mono">{holderDistribution.large}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium (0.01-0.1%)</span>
                        <span className="font-mono">{holderDistribution.medium}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Small (&lt;0.01%)</span>
                        <span className="font-mono">{holderDistribution.small}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl font-bold">{formatNumber(stats.averageBalance)}</div>
                    <div className="text-sm text-muted-foreground">Average Balance</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl font-bold">{formatNumber(stats.medianBalance)}</div>
                    <div className="text-sm text-muted-foreground">Median Balance</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl font-bold">{recentTransactions.length}</div>
                    <div className="text-sm text-muted-foreground">Recent Transactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Top Holders</h3>
              <Button onClick={handleRefreshStats} disabled={isLoading} size="sm">
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading holders...</div>
            ) : holders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No holders found</div>
            ) : (
              <div className="space-y-3">
                {getTopHolders(20).map((holder) => (
                  <Card key={holder.address}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-mono">
                            {holder.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{formatAddress(holder.address)}</div>
                            <div className="text-sm text-muted-foreground">
                              {holder.isContract ? "Contract" : "Wallet"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(holder.balance)} USDT</div>
                          <div className="text-sm text-muted-foreground">
                            {holder.percentage.toFixed(4)}%
                          </div>
                        </div>
                      </div>
                      
                      {holder.lastTransaction && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last transaction: {formatTime(holder.lastTransaction)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button onClick={handleRefreshStats} disabled={isLoading} size="sm">
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions found</div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 20).map((tx) => (
                  <Card key={tx.hash}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{tx.type}</Badge>
                            <span className="text-sm font-mono">{formatAddress(tx.hash)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>From:</strong> {formatAddress(tx.from)}
                            </div>
                            <div>
                              <strong>To:</strong> {formatAddress(tx.to)}
                            </div>
                            <div>
                              <strong>Amount:</strong> {formatNumber(tx.amount)} USDT
                            </div>
                            <div>
                              <strong>Time:</strong> {formatTime(tx.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Token Holder</CardTitle>
                <CardDescription>
                  Search for a specific address to see their token balance and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter wallet address (0x...)"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearchHolder} 
                    disabled={isSearching || !searchAddress.trim()}
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Search Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">Address:</span>
                          <span className="font-mono">{searchResult.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Balance:</span>
                          <span>{formatNumber(searchResult.balance)} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Percentage:</span>
                          <span>{searchResult.percentage.toFixed(4)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Rank:</span>
                          <span>#{searchResult.rank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Type:</span>
                          <Badge variant={searchResult.isContract ? "secondary" : "default"}>
                            {searchResult.isContract ? "Contract" : "Wallet"}
                          </Badge>
                        </div>
                        {searchResult.lastTransaction && (
                          <div className="flex justify-between">
                            <span className="font-semibold">Last Transaction:</span>
                            <span>{formatTime(searchResult.lastTransaction)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
