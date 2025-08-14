import React, { useState } from 'react';
import { Settings, Network, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  currency: string;
  estimatedCost: string;
  rpcUrl: string;
  explorer: string;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    chainId: 97,
    currency: 'tBNB',
    estimatedCost: '0.005 BNB',
    rpcUrl: 'https://bsc-testnet.publicnode.com',
    explorer: 'https://testnet.bscscan.com'
  },
  {
    id: 'bsc-mainnet',
    name: 'BSC Mainnet',
    chainId: 56,
    currency: 'BNB',
    estimatedCost: '0.01 BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com'
  },
  {
    id: 'polygon-testnet',
    name: 'Polygon Mumbai',
    chainId: 80001,
    currency: 'MATIC',
    estimatedCost: '0.01 MATIC',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com'
  },
  {
    id: 'ethereum-sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    currency: 'ETH',
    estimatedCost: '0.001 ETH',
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io'
  }
];

interface DeploymentConfigProps {
  onConfigChange: (config: any) => void;
}

export const DeploymentConfig: React.FC<DeploymentConfigProps> = ({ onConfigChange }) => {
  console.log('DeploymentConfig rendered with onConfigChange:', onConfigChange);
  const [selectedNetwork, setSelectedNetwork] = useState('bsc-testnet');
  const [gasPrice, setGasPrice] = useState('5000000000'); // 5 Gwei
  const [gasLimit, setGasLimit] = useState('3000000');

  const handleConfigChange = () => {
    try {
      const config = {
        network: selectedNetwork,
        gasPrice,
        gasLimit: parseInt(gasLimit),
        networkInfo: NETWORKS.find(n => n.id === selectedNetwork)
      };
      console.log('Applying configuration:', config);
      onConfigChange(config);
    } catch (error) {
      console.error('Error applying configuration:', error);
    }
  };

  const selectedNetworkInfo = NETWORKS.find(n => n.id === selectedNetwork);

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Settings className="h-4 w-4 text-blue-500" />
          </div>
          Deployment Configuration
        </CardTitle>
        <CardDescription>
          Configure network settings and gas parameters for contract deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Selection */}
        <div className="space-y-3">
          <Label htmlFor="network">Target Network</Label>
          <p className="text-xs text-muted-foreground">
            Choose the blockchain network where you want to deploy your contracts
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-amber-600 mt-0.5">💡</div>
              <div className="text-xs text-amber-800">
                <strong>Recommendation:</strong> Start with <strong>BSC Testnet</strong> for development and testing. 
                It's free, fast, and perfect for learning. Switch to mainnet only when ready for production.
              </div>
            </div>
          </div>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger>
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent>
              {NETWORKS.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{network.name}</span>
                      <span className="text-xs text-muted-foreground">Chain ID: {network.chainId}</span>
                    </div>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {network.currency}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedNetworkInfo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800">Estimated Cost:</span>
                <span className="font-semibold text-blue-900">{selectedNetworkInfo.estimatedCost}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-blue-800">Chain ID:</span>
                <span className="font-mono text-blue-900">{selectedNetworkInfo.chainId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Gas Configuration */}
        <div className="space-y-3">
          <Label htmlFor="gasPrice">Gas Price (Wei)</Label>
          <div className="flex gap-2">
            <Input
              id="gasPrice"
              type="number"
              value={gasPrice}
              onChange={(e) => setGasPrice(e.target.value)}
              placeholder="5000000000"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGasPrice('5000000000')}
            >
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current: {parseInt(gasPrice) / 1000000000} Gwei
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="gasLimit">Gas Limit</Label>
          <div className="flex gap-2">
            <Input
              id="gasLimit"
              type="number"
              value={gasLimit}
              onChange={(e) => setGasLimit(e.target.value)}
              placeholder="3000000"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGasLimit('3000000')}
            >
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated cost: {((parseInt(gasPrice) * parseInt(gasLimit)) / 1e18).toFixed(6)} {selectedNetworkInfo?.currency}
          </p>
        </div>

        {/* Network Info */}
        {selectedNetworkInfo && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Network className="h-4 w-4" />
              {selectedNetworkInfo.name} Details
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">RPC URL:</span>
                <code className="text-blue-900 font-mono text-xs">{selectedNetworkInfo.rpcUrl}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Explorer:</span>
                <a 
                  href={selectedNetworkInfo.explorer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-900 hover:underline text-xs"
                >
                  {selectedNetworkInfo.explorer}
                </a>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
              <strong>💡 Tip:</strong> {selectedNetworkInfo.id.includes('testnet') ? 
                'Use testnets for development and testing. Get free test tokens from faucets.' : 
                'Mainnet deployment requires real tokens and incurs actual gas costs.'
              }
            </div>
          </div>
        )}

        {/* Apply Configuration */}
        <Button 
          onClick={(e) => {
            console.log('Button clicked!', e);
            handleConfigChange();
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Zap className="h-4 w-4 mr-2" />
          Apply Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
