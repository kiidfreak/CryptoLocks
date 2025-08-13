import React, { useState } from 'react';
import { 
  Calendar,
  Copy,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LockData {
  id: string;
  amount: string;
  lockDate: string;
  expiryDate: string;
  transferCount: number;
  status: 'active' | 'expired' | 'expiring';
  recipient: string;
  txHash: string;
}

const mockLocks: LockData[] = [
  {
    id: '1',
    amount: '50,000',
    lockDate: '2024-01-15',
    expiryDate: '2024-12-15',
    transferCount: 2,
    status: 'active',
    recipient: '0x742...4d2',
    txHash: '0xabc...def'
  },
  {
    id: '2',
    amount: '125,000',
    lockDate: '2024-02-01',
    expiryDate: '2024-08-20',
    transferCount: 0,
    status: 'expiring',
    recipient: '0x123...789',
    txHash: '0x123...456'
  },
  {
    id: '3',
    amount: '75,500',
    lockDate: '2023-12-10',
    expiryDate: '2024-06-10',
    transferCount: 5,
    status: 'expired',
    recipient: '0x456...abc',
    txHash: '0x789...012'
  },
  {
    id: '4',
    amount: '200,000',
    lockDate: '2024-03-05',
    expiryDate: '2025-03-05',
    transferCount: 1,
    status: 'active',
    recipient: '0x789...def',
    txHash: '0x345...678'
  }
];

const StatusBadge: React.FC<{ status: LockData['status'] }> = ({ status }) => {
  const configs = {
    active: {
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-success text-success-foreground'
    },
    expiring: {
      variant: 'secondary' as const,
      icon: AlertTriangle,
      className: 'bg-warning text-warning-foreground'
    },
    expired: {
      variant: 'destructive' as const,
      icon: XCircle,
      className: 'bg-destructive text-destructive-foreground'
    }
  };

  const config = configs[status];
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} gap-1`}>
      <IconComponent className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

interface LockManagementProps {
  onViewChange?: (view: 'create') => void;
}

export const LockManagement: React.FC<LockManagementProps> = ({ onViewChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof LockData>('lockDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof LockData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredLocks = mockLocks.filter(lock =>
    lock.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lock.amount.includes(searchTerm) ||
    lock.status.includes(searchTerm.toLowerCase())
  );

  const sortedLocks = [...filteredLocks].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5 p-8 border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Lock Management
              </h2>
              <p className="text-lg text-muted-foreground mt-1">Secure • Organized • Professional Asset Control</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Monitor and manage all your USDT time-locks in one centralized dashboard. 
            Track expiry dates, transfer history, and lock status with real-time updates.
          </p>
          
          <div className="flex gap-3 mt-6">
            <Button 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={() => onViewChange?.('create')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create New Lock
            </Button>
            <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="glass-card p-6 rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipient, amount, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-border focus:border-primary transition-colors"
            />
          </div>
          
          <Button variant="outline" className="gap-2 h-12 px-6 hover:bg-primary hover:text-white transition-colors">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-white transition-colors">
            All Locks ({mockLocks.length})
          </Badge>
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-success hover:text-white transition-colors">
            Active ({mockLocks.filter(l => l.status === 'active').length})
          </Badge>
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-warning hover:text-white transition-colors">
            Expiring ({mockLocks.filter(l => l.status === 'expiring').length})
          </Badge>
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-white transition-colors">
            Expired ({mockLocks.filter(l => l.status === 'expired').length})
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount (USDT)
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('lockDate')}
              >
                <div className="flex items-center gap-1">
                  Lock Date
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('expiryDate')}
              >
                <div className="flex items-center gap-1">
                  Expiry Date
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('transferCount')}
              >
                <div className="flex items-center gap-1">
                  Transfers
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLocks.map((lock) => (
              <TableRow 
                key={lock.id} 
                className="border-border hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono font-medium">
                  ${lock.amount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(lock.lockDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {new Date(lock.expiryDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {lock.recipient}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(lock.recipient)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {lock.transferCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={lock.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on BSCScan
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={lock.status === 'expired'}>
                        Split Lock
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={lock.status === 'expired'}>
                        Transfer Lock
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={lock.status !== 'expired'}
                        className="text-success"
                      >
                        Redeem
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-lg hover-float">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value Locked</p>
              <p className="text-2xl font-bold text-primary">$450,500</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-bold">🔒</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg hover-float">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Locks</p>
              <p className="text-2xl font-bold text-success">2</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg hover-float">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold text-warning">1</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};