import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';

interface Activity {
  id: string;
  type: 'transfer' | 'mint' | 'burn' | 'lock' | 'unlock' | 'vesting' | 'distribution' | 'bridge' | 'admin';
  title: string;
  description: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  from?: string;
  to?: string;
  amount?: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'confirmed' | 'failed';
}

interface ActivityFeedProps {
  onRefreshActivities: () => Promise<void>;
  onLoadMore: () => Promise<void>;
  activities: Activity[];
  isLoading: boolean;
  hasMore: boolean;
  filters: {
    types: string[];
    status: string[];
    timeRange: string;
  };
  onUpdateFilters: (filters: any) => void;
}

export default function ActivityFeed({
  onRefreshActivities,
  onLoadMore,
  activities,
  isLoading,
  hasMore,
  filters,
  onUpdateFilters
}: ActivityFeedProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { toast } = useToast();

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return 'Just now';
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    if (!amount) return 'N/A';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return num.toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transfer': return '💸';
      case 'mint': return '🪙';
      case 'burn': return '🔥';
      case 'lock': return '🔒';
      case 'unlock': return '🔓';
      case 'vesting': return '📅';
      case 'distribution': return '✂️';
      case 'bridge': return '🌉';
      case 'admin': return '⚙️';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'mint': return 'bg-green-100 text-green-800';
      case 'burn': return 'bg-red-100 text-red-800';
      case 'lock': return 'bg-yellow-100 text-yellow-800';
      case 'unlock': return 'bg-purple-100 text-purple-800';
      case 'vesting': return 'bg-indigo-100 text-indigo-800';
      case 'distribution': return 'bg-pink-100 text-pink-800';
      case 'bridge': return 'bg-cyan-100 text-cyan-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredActivities = () => {
    let filtered = activities;
    
    // Filter by type
    if (filters.types.length > 0) {
      filtered = filtered.filter(activity => filters.types.includes(activity.type));
    }
    
    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(activity => filters.status.includes(activity.status));
    }
    
    // Filter by time range
    if (filters.timeRange !== 'all') {
      const now = Math.floor(Date.now() / 1000);
      const timeRanges = {
        '1h': 3600,
        '24h': 86400,
        '7d': 604800,
        '30d': 2592000
      };
      
      if (timeRanges[filters.timeRange as keyof typeof timeRanges]) {
        const cutoff = now - timeRanges[filters.timeRange as keyof typeof timeRanges];
        filtered = filtered.filter(activity => activity.timestamp >= cutoff);
      }
    }
    
    return filtered;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshActivities();
      toast({
        title: "Success",
        description: "Activity feed refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } catch (error) {
      toast({
        title: "Load More Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterType === 'types') {
      newFilters.types = value;
    } else if (filterType === 'status') {
      newFilters.status = value;
    } else if (filterType === 'timeRange') {
      newFilters.timeRange = value;
    }
    
    onUpdateFilters(newFilters);
  };

  const filteredActivities = getFilteredActivities();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📰 Activity Feed
          <Badge variant="secondary">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Real-time feed of all token-related activities and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Activity Types</label>
                <div className="space-y-2">
                  {['transfer', 'mint', 'burn', 'lock', 'unlock', 'vesting', 'distribution', 'bridge', 'admin'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.types, type]
                            : filters.types.filter(t => t !== type);
                          handleFilterChange('types', newTypes);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  {['confirmed', 'pending', 'failed'].map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status]
                            : filters.status.filter(s => s !== status);
                          handleFilterChange('status', newStatus);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Time</option>
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="admin">Admin Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {filteredActivities.length} activities
              </div>
              <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading activities...</div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No activities found</div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <Badge className={getActivityColor(activity.type)}>
                              {activity.type}
                            </Badge>
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {activity.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {activity.from && (
                              <div>
                                <strong>From:</strong> {formatAddress(activity.from)}
                              </div>
                            )}
                            {activity.to && (
                              <div>
                                <strong>To:</strong> {formatAddress(activity.to)}
                              </div>
                            )}
                            {activity.amount && (
                              <div>
                                <strong>Amount:</strong> {formatAmount(activity.amount)} USDT
                              </div>
                            )}
                            <div>
                              <strong>Time:</strong> {formatTime(activity.timestamp)}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-muted-foreground">
                            Block #{activity.blockNumber} • {formatAddress(activity.transactionHash)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="text-center py-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Showing only transfer, mint, burn, and bridge activities
            </div>
            
            {filteredActivities
              .filter(activity => ['transfer', 'mint', 'burn', 'bridge'].includes(activity.type))
              .map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{activity.title}</h4>
                          <Badge className={getActivityColor(activity.type)}>
                            {activity.type}
                          </Badge>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {activity.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {activity.from && (
                            <div>
                              <strong>From:</strong> {formatAddress(activity.from)}
                            </div>
                          )}
                          {activity.to && (
                            <div>
                              <strong>To:</strong> {formatAddress(activity.to)}
                            </div>
                          )}
                          {activity.amount && (
                            <div>
                              <strong>Amount:</strong> {formatAmount(activity.amount)} USDT
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          {formatTime(activity.timestamp)} • Block #{activity.blockNumber}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Showing only administrative and management activities
            </div>
            
            {filteredActivities
              .filter(activity => ['lock', 'unlock', 'vesting', 'distribution', 'admin'].includes(activity.type))
              .map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{activity.title}</h4>
                          <Badge className={getActivityColor(activity.type)}>
                            {activity.type}
                          </Badge>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {activity.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {activity.amount && (
                            <div>
                              <strong>Amount:</strong> {formatAmount(activity.amount)} USDT
                            </div>
                          )}
                          <div>
                            <strong>Time:</strong> {formatTime(activity.timestamp)}
                          </div>
                          <div>
                            <strong>Block:</strong> #{activity.blockNumber}
                          </div>
                        </div>
                        
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-3 p-2 bg-muted rounded text-xs">
                            <strong>Details:</strong>
                            <pre className="mt-1 text-muted-foreground">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
