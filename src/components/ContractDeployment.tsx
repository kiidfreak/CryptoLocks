import React, { useState, useEffect } from 'react';
import { Rocket, CheckCircle, AlertCircle, Loader2, Download, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { DeploymentConfig } from './DeploymentConfig';

interface DeploymentStatus {
  token: 'pending' | 'success' | 'failed' | 'not-started';
  bridge: 'pending' | 'success' | 'failed' | 'not-started';
  lockManager: 'pending' | 'success' | 'failed' | 'not-started';
}

export const ContractDeployment: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    token: 'not-started',
    bridge: 'not-started',
    lockManager: 'not-started'
  });
  const [deploymentResult, setDeploymentResult] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<string>('');
  const [deploymentConfig, setDeploymentConfig] = useState<any>(null);
  const { address, isConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Deployment config changed:', deploymentConfig);
  }, [deploymentConfig]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const deployContracts = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy contracts",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus({ token: 'pending', bridge: 'not-started', lockManager: 'not-started' });

    try {
      // Simulate deployment process
      await simulateDeployment();
      toast({ title: "Deployment Successful!", description: "All contracts deployed successfully" });
    } catch (error) {
      toast({ title: "Deployment Failed", description: "Error during deployment", variant: "destructive" });
    } finally {
      setIsDeploying(false);
    }
  };

  const simulateDeployment = async () => {
    // Simulate token deployment
    setCurrentStep('Deploying TetherUSDBridgedZED20...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    setDeploymentStatus(prev => ({ ...prev, token: 'success' }));
    setDeploymentResult(prev => ({ ...prev, token: '0x1234...5678' }));

    // Simulate bridge deployment
    setCurrentStep('Deploying TokenBridge...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    setDeploymentStatus(prev => ({ ...prev, bridge: 'success' }));
    setDeploymentResult(prev => ({ ...prev, bridge: '0x8765...4321' }));

    // Simulate lock manager deployment
    setCurrentStep('Deploying LockManager...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    setDeploymentStatus(prev => ({ ...prev, lockManager: 'success' }));
    setDeploymentResult(prev => ({ ...prev, lockManager: '0x9876...5432' }));

    setCurrentStep('Deployment Complete!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/10 to-blue-500/5 p-8 border border-blue-500/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Contract Deployment
              </h2>
              <p className="text-lg text-muted-foreground mt-1">Deploy FlashVault Bridge System</p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Deploy all three contracts (Token, Bridge, LockManager) with a single click. 
            Monitor deployment progress and download deployment information.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deployment Configuration */}
        <DeploymentConfig onConfigChange={(config) => {
          console.log('Configuration received:', config);
          setDeploymentConfig(config);
        }} />
        
        {/* Deployment Control */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Play className="h-4 w-4 text-blue-500" />
              </div>
              Deployment Control
            </CardTitle>
            <CardDescription>
              Control the deployment process and monitor progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <p className="text-sm text-warning font-medium">
                    Please connect your wallet to deploy contracts
                  </p>
                </div>
              </div>
            ) : !deploymentConfig ? (
              <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-info" />
                  <p className="text-sm text-info font-medium">
                    Please configure deployment settings first (Current config: {JSON.stringify(deploymentConfig)})
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Button 
                  onClick={deployContracts} 
                  disabled={isDeploying || !deploymentConfig}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy All Contracts
                    </>
                  )}
                </Button>

                {currentStep && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">{currentStep}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Deployment Status */}
        <Card className="glass-card border-border hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              Deployment Status
            </CardTitle>
            <CardDescription>
              Monitor the progress of each contract deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Token Contract */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(deploymentStatus.token)}
                <div>
                  <p className="font-medium">TetherUSDBridgedZED20</p>
                  <p className="text-sm text-muted-foreground">Bridged USDT Token</p>
                </div>
              </div>
              <Badge className={`px-2 py-1 rounded ${
                deploymentStatus.token === 'success' ? 'bg-green-100 text-green-800' :
                deploymentStatus.token === 'failed' ? 'bg-red-100 text-red-800' :
                deploymentStatus.token === 'pending' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {deploymentStatus.token.replace('-', ' ')}
              </Badge>
            </div>

            {/* Bridge Contract */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(deploymentStatus.bridge)}
                <div>
                  <p className="font-medium">TokenBridge</p>
                  <p className="text-sm text-muted-foreground">Cross-Chain Bridge</p>
                </div>
              </div>
              <Badge className={`px-2 py-1 rounded ${
                deploymentStatus.bridge === 'success' ? 'bg-green-100 text-green-800' :
                deploymentStatus.bridge === 'failed' ? 'bg-red-100 text-red-800' :
                deploymentStatus.bridge === 'pending' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {deploymentStatus.bridge.replace('-', ' ')}
              </Badge>
            </div>

            {/* Lock Manager Contract */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(deploymentStatus.lockManager)}
                <div>
                  <p className="font-medium">LockManager</p>
                  <p className="text-sm text-muted-foreground">Time-Lock System</p>
                </div>
              </div>
              <Badge className={`px-2 py-1 rounded ${
                deploymentStatus.lockManager === 'success' ? 'bg-green-100 text-green-800' :
                deploymentStatus.lockManager === 'failed' ? 'bg-red-100 text-red-800' :
                deploymentStatus.lockManager === 'pending' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {deploymentStatus.lockManager.replace('-', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Results */}
      {Object.keys(deploymentResult).length > 0 && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Deployment Results</CardTitle>
            <CardDescription>
              Contract addresses and deployment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deploymentResult.token && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="font-medium">Token Contract:</span>
                  <a 
                    href={`${deploymentConfig?.networkInfo?.explorer}/address/${deploymentResult.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-green-100 px-2 py-1 rounded hover:bg-green-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {deploymentResult.token}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {deploymentResult.bridge && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-medium">Bridge Contract:</span>
                  <a 
                    href={`${deploymentConfig?.networkInfo?.explorer}/address/${deploymentResult.bridge}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {deploymentResult.bridge}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {deploymentResult.lockManager && (
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="font-medium">LockManager Contract:</span>
                  <a 
                    href={`${deploymentConfig?.networkInfo?.explorer}/address/${deploymentResult.lockManager}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-purple-100 px-2 py-1 rounded hover:bg-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {deploymentResult.lockManager}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
