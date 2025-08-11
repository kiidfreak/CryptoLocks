import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Shield,
  Activity,
  BarChart3,
  PieChart
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

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your crypto asset management</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button variant="crypto" className="gap-2">
            <Shield className="h-4 w-4" />
            Create Lock
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="glass-card hover-float border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                  <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Distribution */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Portfolio Distribution
            </CardTitle>
            <CardDescription>Breakdown of your locked assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-mono">{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest transactions and lock operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">{activity.amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common operations for your locked assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Create Lock</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Transfer Lock</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <PieChart className="h-6 w-6" />
              <span className="text-sm">Split Lock</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};