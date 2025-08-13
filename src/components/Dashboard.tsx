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
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    title: 'Total Value Locked',
    value: '$2,450,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    description: 'Across all active locks'
  },
  {
    title: 'Active Locks',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Shield,
    description: 'Currently secured'
  },
  {
    title: 'Avg Lock Duration',
    value: '186 days',
    change: '-5.2%',
    trend: 'down',
    icon: Clock,
    description: 'Average time to unlock'
  },
  {
    title: 'Portfolio Performance',
    value: '+8.2%',
    change: '+2.1%',
    trend: 'up',
    icon: TrendingUp,
    description: '30-day performance'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'lock_created',
    amount: '$50,000',
    time: '2 hours ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'lock_transferred',
    amount: '$25,000',
    time: '1 day ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'lock_redeemed',
    amount: '$100,000',
    time: '2 days ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'lock_split',
    amount: '$75,000',
    time: '3 days ago',
    status: 'completed'
  }
];

const portfolioDistribution = [
  { name: 'Active Locks', value: 68, color: 'bg-primary' },
  { name: 'Expiring Soon', value: 22, color: 'bg-warning' },
  { name: 'Expired', value: 10, color: 'bg-destructive' }
];

interface DashboardProps {
  onViewChange?: (view: 'create' | 'transactions' | 'transfer' | 'split') => void;
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
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                FlashVault Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-1">Secure • Fast • Professional Crypto Asset Management</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Experience the future of time-locked crypto assets with our advanced vault system. 
            Create, manage, and monitor your USDT locks with enterprise-grade security.
          </p>
          
                     <div className="flex gap-3 mt-6">
             <Button 
               variant="outline" 
               className="gap-2 hover:bg-primary hover:text-white transition-colors"
               onClick={() => onViewChange?.('transactions')}
             >
               <BarChart3 className="h-4 w-4" />
               Analytics
             </Button>
             <Button 
               className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg shadow-primary/25"
               onClick={() => onViewChange?.('create')}
             >
               <Shield className="h-4 w-4" />
               Create Lock
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced Portfolio Distribution */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              Portfolio Distribution
            </CardTitle>
            <CardDescription>Breakdown of your locked assets by status</CardDescription>
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
                <span className="text-muted-foreground">Total Portfolio Value</span>
                <span className="font-bold text-lg text-primary">$2,450,000</span>
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
            <CardDescription>Latest transactions and lock operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="group flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'lock_created' ? 'bg-primary' :
                      activity.type === 'lock_transferred' ? 'bg-blue-500' :
                      activity.type === 'lock_redeemed' ? 'bg-success' :
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
              <Shield className="h-4 w-4 text-primary" />
            </div>
            Quick Actions
          </CardTitle>
          <CardDescription>Common operations for your locked assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-primary"
               onClick={() => onViewChange?.('create')}
             >
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <Shield className="h-5 w-5 text-primary group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">Create Lock</span>
             </Button>
            
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-blue-600"
               onClick={() => onViewChange?.('transfer')}
             >
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <Activity className="h-5 w-5 text-blue-600 group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">Transfer Lock</span>
             </Button>
            
                         <Button 
               variant="outline" 
               className="group h-24 flex-col gap-3 hover:bg-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 border-2 border-border hover:border-purple-600"
               onClick={() => onViewChange?.('split')}
             >
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <PieChart className="h-5 w-5 text-purple-600 group-hover:text-white" />
               </div>
               <span className="text-sm font-medium">Split Lock</span>
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

      {/* Contract Deployment Section */}
      <Card className="glass-card border-border hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-blue-500" />
            </div>
            Contract Deployment
          </CardTitle>
          <CardDescription>Deploy FlashVault Bridge System contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deploy the complete FlashVault system including the bridged USDT token, cross-chain bridge, and time-lock manager.
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                <h4 className="font-semibold text-green-800 mb-2">TetherUSDBridgedZED20</h4>
                <p className="text-xs text-green-700">Bridged USDT token with 6 decimals</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Token Contract</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <h4 className="font-semibold text-blue-800 mb-2">TokenBridge</h4>
                <p className="text-xs text-blue-700">Cross-chain bridge for asset transfers</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Bridge Contract</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <h4 className="font-semibold text-purple-800 mb-2">LockManager</h4>
                <p className="text-xs text-purple-700">Time-lock system for secure asset management</p>
                <Badge className="mt-2 bg-purple-100 text-purple-800">Lock Manager</Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-blue-500 hover:text-white transition-colors"
                onClick={() => window.open('/deploy', '_blank')}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Deploy Contracts
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('https://testnet.bscscan.com', '_blank')}
              >
                View on Explorer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Features Section */}
      <Card className="glass-card border-border hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-green-500" />
            </div>
            Enhanced Token Features
            <Badge variant="secondary" className="ml-2">New</Badge>
          </CardTitle>
          <CardDescription>Advanced token management tools and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Access powerful new features including batch transfers, time-lock management, automated distributions, and comprehensive analytics.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <h4 className="font-semibold text-green-800 mb-2">💸 Send Tokens</h4>
                <p className="text-xs text-green-700">Standard & batch transfers</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Transfer</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <h4 className="font-semibold text-blue-800 mb-2">🔒 Timelock Manager</h4>
                <p className="text-xs text-blue-700">Time-locked tokens & vesting</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Timelock</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <h4 className="font-semibold text-purple-800 mb-2">✂️ Splitter Manager</h4>
                <p className="text-xs text-purple-700">Automated distributions</p>
                <Badge className="mt-2 bg-purple-100 text-purple-800">Distribution</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                <h4 className="font-semibold text-orange-800 mb-2">🪙 Mint/Burn Tools</h4>
                <p className="text-xs text-orange-700">Supply management</p>
                <Badge className="mt-2 bg-orange-100 text-orange-800">Supply</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <h4 className="font-semibold text-indigo-800 mb-2">📊 Token Stats</h4>
                <p className="text-xs text-indigo-700">Holder analytics</p>
                <Badge className="mt-2 bg-indigo-100 text-indigo-800">Analytics</Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-rose-50">
                <h4 className="font-semibold text-pink-800 mb-2">📰 Activity Feed</h4>
                <p className="text-xs text-pink-700">Real-time tracking</p>
                <Badge className="mt-2 bg-pink-100 text-pink-800">Tracking</Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-green-500 hover:text-white transition-colors"
                onClick={() => window.open('/enhanced', '_blank')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Access Enhanced Features
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('/enhanced', '_blank')}
              >
                View Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};