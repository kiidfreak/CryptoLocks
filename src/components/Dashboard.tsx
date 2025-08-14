import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Rocket,
  Users,
  Zap,
  Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeployedTokensNew } from './DeployedTokensNew';
import { SendToken } from './SendToken';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  description: string;
}

const stats: StatCard[] = [
  {
    title: 'Total Tokens',
    value: '2',
    change: '+1',
    trend: 'up',
    icon: DollarSign,
    description: 'Deployed contracts'
  },
  {
    title: 'Total Holders',
    value: '2,106',
    change: '+156',
    trend: 'up',
    icon: Users,
    description: 'Across all tokens'
  },
  {
    title: 'Market Cap',
    value: '$1,005,000',
    change: '+5.67%',
    trend: 'up',
    icon: TrendingUp,
    description: 'Combined value'
  },
  {
    title: '24h Volume',
    value: '$45,200',
    change: '+12.3%',
    trend: 'up',
    icon: Activity,
    description: 'Trading activity'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'token_transfer',
    amount: '50,000 USDT',
    time: '2 hours ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'token_mint',
    amount: '100,000 FVB',
    time: '1 day ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'holder_added',
    amount: 'New Holder',
    time: '2 days ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'token_burn',
    amount: '25,000 USDT',
    time: '3 days ago',
    status: 'completed'
  }
];

const portfolioDistribution = [
  { name: 'USDT Token', value: 75, color: 'bg-primary' },
  { name: 'FVB Token', value: 25, color: 'bg-blue-500' }
];

// Mock deployed tokens data
const deployedTokens = [
  {
    id: '1',
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x1234567890123456789012345678901234567890',
    network: 'BSC Testnet',
    networkIcon: '🟡',
    totalSupply: '1000000000000000000000000', // 1M tokens
    circulatingSupply: '750000000000000000000000', // 750k tokens
    holders: 1250,
    price: '1.00',
    marketCap: '750000',
    change24h: '+0.02%',
    explorer: 'https://testnet.bscscan.com',
    rpcUrl: 'https://bsc-testnet.publicnode.com'
  },
  {
    id: '2',
    name: 'FlashVault Bridge Token',
    symbol: 'FVB',
    address: '0x9876543210987654321098765432109876543210',
    network: 'BSC Testnet',
    networkIcon: '🟡',
    totalSupply: '500000000000000000000000', // 500k tokens
    circulatingSupply: '300000000000000000000000', // 300k tokens
    holders: 856,
    price: '0.85',
    marketCap: '255000',
    change24h: '+5.67%',
    explorer: 'https://testnet.bscscan.com',
    rpcUrl: 'https://bsc-testnet.publicnode.com'
  }
];

interface DashboardProps {
  onViewChange?: (view: 'create' | 'transactions' | 'transfer' | 'split' | 'settings' | 'send') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5 p-8 border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Token Management Hub
              </h1>
              <p className="text-lg text-muted-foreground mt-1">Advanced Token Features • Analytics • Management</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Manage your deployed tokens with enterprise-grade tools. Send, analyze, and control your token ecosystem 
            with powerful features designed for professional token management.
          </p>
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-primary hover:text-white transition-colors"
              onClick={() => onViewChange?.('transactions')}
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg shadow-primary/25"
              onClick={() => window.open('/deploy', '_blank')}
            >
              <Rocket className="h-4 w-4" />
              Deploy New Token
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="group glass-card hover:shadow-xl hover:shadow-primary/10 border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    <TrendIcon className={`h-3 w-3`} />
                    <span className="font-medium">{stat.change}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deployed Tokens Summary */}
      <Card className="glass-card border-border hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            Deployed Tokens Overview
          </CardTitle>
          <CardDescription>Summary of your deployed smart contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{deployedTokens.length}</div>
              <div className="text-xs text-blue-700">Total Tokens</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {deployedTokens.reduce((sum, token) => sum + token.holders, 0).toLocaleString()}
              </div>
              <div className="text-xs text-green-700">Total Holders</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ${deployedTokens.reduce((sum, token) => sum + parseFloat(token.marketCap), 0).toLocaleString()}
              </div>
              <div className="text-xs text-purple-700">Total Market Cap</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {deployedTokens.length}
              </div>
              <div className="text-xs text-orange-700">Active Tokens</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced Portfolio Distribution */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              Token Distribution
            </CardTitle>
            <CardDescription>Breakdown of your token portfolio by value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {portfolioDistribution.map((item, index) => (
              <div key={index} className="space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                  <span className="font-mono font-bold text-lg">{item.value}%</span>
                </div>
                <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md`}
                    style={{ width: `${item.value}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Token Value</span>
                <span className="font-bold text-lg text-primary">$1,005,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="glass-card border-border lg:col-span-2 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription>Latest token transactions and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="group flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'token_transfer' ? 'bg-primary' :
                      activity.type === 'token_mint' ? 'bg-blue-500' :
                      activity.type === 'holder_added' ? 'bg-success' :
                      'bg-purple-500'
                    } animate-pulse`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-primary">{activity.amount}</p>
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border/50">
                           <Button 
               variant="outline" 
               className="w-full mt-2 hover:bg-primary hover:text-white transition-colors"
               onClick={() => onViewChange?.('transactions')}
             >
               View All Activity
             </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            Token Actions
          </CardTitle>
          <CardDescription>Quick access to essential token management features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-blue-600"
               onClick={() => window.open('/deploy', '_blank')}
             >
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <Rocket className="h-5 w-5 text-blue-600 group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">Deploy Token</span>
             </Button>
            
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-green-600"
               onClick={() => onViewChange?.('transactions')}
             >
               <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <Send className="h-5 w-5 text-green-600 group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">Send Tokens</span>
             </Button>
            
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-purple-600"
               onClick={() => onViewChange?.('transactions')}
             >
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <BarChart3 className="h-5 w-5 text-purple-600 group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">Token Analytics</span>
             </Button>
            
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-success hover:text-white hover:shadow-lg hover:shadow-success/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-success"
               onClick={() => onViewChange?.('transactions')}
             >
               <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <TrendingUp className="h-5 w-5 text-success group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">View Analytics</span>
             </Button>
          </div>
        </CardContent>
      </Card>



      {/* Core Token Features */}
      <Card className="glass-card border-border hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-500" />
            </div>
            Core Token Features
            <Badge variant="secondary" className="ml-2">Priority</Badge>
          </CardTitle>
          <CardDescription>Essential tools for professional token management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Access essential token management features including transfers, analytics, holder management, and supply control.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <h4 className="font-semibold text-green-800 mb-2">💸 Send Tokens</h4>
                <p className="text-xs text-green-700">Standard & batch transfers</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Transfer</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Token Analytics</h4>
                <p className="text-xs text-blue-700">Holder insights & metrics</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Analytics</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <h4 className="font-semibold text-purple-800 mb-2">👥 Holder Management</h4>
                <p className="text-xs text-purple-700">View & manage holders</p>
                <Badge className="mt-2 bg-purple-100 text-purple-800">Management</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                <h4 className="font-semibold text-orange-800 mb-2">🪙 Supply Control</h4>
                <p className="text-xs text-orange-700">Mint & burn tokens</p>
                <Badge className="mt-2 bg-orange-100 text-orange-800">Supply</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <h4 className="font-semibold text-indigo-800 mb-2">📈 Performance</h4>
                <p className="text-xs text-indigo-700">Price & market data</p>
                <Badge className="mt-2 bg-indigo-100 text-indigo-800">Performance</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-rose-50">
                <h4 className="font-semibold text-pink-800 mb-2">⚙️ Settings</h4>
                <p className="text-xs text-pink-700">Timelock & lock management</p>
                <Badge className="mt-2 bg-pink-100 text-pink-800">Advanced</Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-green-500 hover:text-white transition-colors"
                onClick={() => onViewChange?.('transactions')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Access Token Features
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onViewChange?.('settings')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Timelock Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployed Tokens Section */}
              <DeployedTokensNew tokens={deployedTokens} />

      {/* Send Token Section */}
      <SendToken tokens={deployedTokens} />
    </div>
  );
};