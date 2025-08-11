import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NETWORKS } from '@/lib/constants';

interface Transaction {
  id: string;
  type: 'lock_created' | 'lock_redeemed' | 'lock_transferred' | 'lock_split';
  amount: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  blockNumber: number;
  network: typeof NETWORKS.BSC_MAINNET | typeof NETWORKS.BSC_TESTNET;
  details: {
    recipient?: string;
    sender?: string;
    lockId?: string;
    newLocks?: string[];
  };
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'lock_created',
    amount: '50000',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'confirmed',
    txHash: '0xabc123def456789',
    blockNumber: 12345678,
    network: NETWORKS.BSC_TESTNET,
    details: {
      recipient: '0x742d35Cc6Ab888888C4d62A13d999',
      sender: '0x1234567890123456789012345678901234567890',
      lockId: '1'
    }
  },
  {
    id: '2',
    type: 'lock_transferred',
    amount: '25000',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'confirmed',
    txHash: '0xdef456abc789123',
    blockNumber: 12345679,
    network: NETWORKS.BSC_TESTNET,
    details: {
      recipient: '0x4567890123456789012345678901234567890123',
      lockId: '2'
    }
  },
  {
    id: '3',
    type: 'lock_redeemed',
    amount: '100000',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'confirmed',
    txHash: '0x789123def456abc',
    blockNumber: 12345680,
    network: NETWORKS.BSC_TESTNET,
    details: {
      recipient: '0x7890123456789012345678901234567890123456',
      lockId: '3'
    }
  }
];

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'lock_created':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'lock_redeemed':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'lock_transferred':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'lock_split':
      return <AlertTriangle className="h-4 w-4 text-info" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTransactionTitle = (type: Transaction['type']) => {
  switch (type) {
    case 'lock_created':
      return 'Lock Created';
    case 'lock_redeemed':
      return 'Lock Redeemed';
    case 'lock_transferred':
      return 'Lock Transferred';
    case 'lock_split':
      return 'Lock Split';
    default:
      return 'Transaction';
  }
};

const getStatusBadge = (status: Transaction['status']) => {
  const configs = {
    pending: { variant: 'secondary' as const, className: 'bg-warning/10 text-warning border-warning/20' },
    confirmed: { variant: 'default' as const, className: 'bg-success/10 text-success border-success/20' },
    failed: { variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-destructive/20' }
  };

  const config = configs[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const TransactionHistory: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openExplorer = (txHash: string, network: Transaction['network']) => {
    window.open(`${network.explorer}/tx/${txHash}`, '_blank');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffMs = now.getTime() - txTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
          <p className="text-muted-foreground">Track all your lock-related transactions</p>
        </div>
        <Button variant="outline" size="sm">
          Export History
        </Button>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest lock operations and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="text-sm font-medium">
                        {getTransactionTitle(tx.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-mono font-medium">${tx.amount} USDT</p>
                    {tx.details.recipient && (
                      <p className="text-xs text-muted-foreground">
                        To: {formatAddress(tx.details.recipient)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Block #{tx.blockNumber}
                    </p>
                    <p className="text-xs font-mono">
                      {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                    </p>
                  </div>
                  
                  {getStatusBadge(tx.status)}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tx.txHash)}
                      className="h-8 w-8 p-0"
                    >
                      <Clock className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openExplorer(tx.txHash, tx.network)}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mockTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Create your first lock to see transaction history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
