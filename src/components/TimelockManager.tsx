import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';

interface Lock {
  id: number;
  beneficiary: string;
  amount: string;
  releaseTime: number;
  isRevocable: boolean;
  description: string;
  createdAt: number;
  isReleased: boolean;
  releasedAt?: number;
}

interface VestingSchedule {
  id: number;
  beneficiary: string;
  totalAmount: string;
  startTime: number;
  duration: number;
  description: string;
  claimedAmount: string;
  lastClaimTime: number;
}

interface TimelockManagerProps {
  tokenTimelockAddress: string;
  userAddress: string;
  onCreateLock: (beneficiary: string, amount: string, releaseTime: number, isRevocable: boolean, description: string) => Promise<void>;
  onCreateVesting: (beneficiary: string, totalAmount: string, startTime: number, duration: number, description: string) => Promise<void>;
  onReleaseLock: (lockId: number) => Promise<void>;
  onClaimVesting: (vestingId: number) => Promise<void>;
  onRevokeLock: (lockId: number) => Promise<void>;
  onRevokeVesting: (vestingId: number) => Promise<void>;
  locks: Lock[];
  vestingSchedules: VestingSchedule[];
  isLoading: boolean;
}

export default function TimelockManager({
  tokenTimelockAddress,
  userAddress,
  onCreateLock,
  onCreateVesting,
  onReleaseLock,
  onClaimVesting,
  onRevokeLock,
  onRevokeVesting,
  locks,
  vestingSchedules,
  isLoading
}: TimelockManagerProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create lock state
  const [lockBeneficiary, setLockBeneficiary] = useState('');
  const [lockAmount, setLockAmount] = useState('');
  const [lockReleaseTime, setLockReleaseTime] = useState('');
  const [lockIsRevocable, setLockIsRevocable] = useState(true);
  const [lockDescription, setLockDescription] = useState('');
  
  // Create vesting state
  const [vestingBeneficiary, setVestingBeneficiary] = useState('');
  const [vestingTotalAmount, setVestingTotalAmount] = useState('');
  const [vestingStartTime, setVestingStartTime] = useState('');
  const [vestingDuration, setVestingDuration] = useState('');
  const [vestingDescription, setVestingDescription] = useState('');
  
  const { toast } = useToast();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRemaining = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = timestamp - now;
    
    if (remaining <= 0) return 'Unlocked';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getVestingProgress = (vesting: VestingSchedule) => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - vesting.startTime;
    const progress = Math.min(elapsed / vesting.duration, 1);
    const claimable = Math.floor(progress * parseFloat(vesting.totalAmount));
    return {
      progress: Math.min(progress * 100, 100),
      claimable: claimable.toString(),
      isClaimable: claimable > parseFloat(vesting.claimedAmount)
    };
  };

  const handleCreateLock = async () => {
    if (!lockBeneficiary || !lockAmount || !lockReleaseTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const releaseTime = Math.floor(new Date(lockReleaseTime).getTime() / 1000);
    if (releaseTime <= Math.floor(Date.now() / 1000)) {
      toast({
        title: "Validation Error",
        description: "Release time must be in the future",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onCreateLock(lockBeneficiary, lockAmount, releaseTime, lockIsRevocable, lockDescription);
      toast({
        title: "Success",
        description: "Lock created successfully",
      });
      // Reset form
      setLockBeneficiary('');
      setLockAmount('');
      setLockReleaseTime('');
      setLockDescription('');
    } catch (error) {
      toast({
        title: "Create Lock Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateVesting = async () => {
    if (!vestingBeneficiary || !vestingTotalAmount || !vestingStartTime || !vestingDuration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const startTime = Math.floor(new Date(vestingStartTime).getTime() / 1000);
    const duration = parseInt(vestingDuration) * 86400; // Convert days to seconds

    setIsProcessing(true);
    try {
      await onCreateVesting(vestingBeneficiary, vestingTotalAmount, startTime, duration, vestingDescription);
      toast({
        title: "Success",
        description: "Vesting schedule created successfully",
      });
      // Reset form
      setVestingBeneficiary('');
      setVestingTotalAmount('');
      setVestingStartTime('');
      setVestingDuration('');
      setVestingDescription('');
    } catch (error) {
      toast({
        title: "Create Vesting Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReleaseLock = async (lockId: number) => {
    setIsProcessing(true);
    try {
      await onReleaseLock(lockId);
      toast({
        title: "Success",
        description: "Lock released successfully",
      });
    } catch (error) {
      toast({
        title: "Release Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimVesting = async (vestingId: number) => {
    setIsProcessing(true);
    try {
      await onClaimVesting(vestingId);
      toast({
        title: "Success",
        description: "Vesting claimed successfully",
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔒 Timelock Manager
          <Badge variant="secondary">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Create and manage token time-locks and vesting schedules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Timelock Contract:</strong> {tokenTimelockAddress}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Your Address:</strong> {userAddress}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="locks">Locks</TabsTrigger>
            <TabsTrigger value="vesting">Vesting</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Lock */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Time Lock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="lockBeneficiary">Beneficiary Address</Label>
                    <Input
                      id="lockBeneficiary"
                      placeholder="0x..."
                      value={lockBeneficiary}
                      onChange={(e) => setLockBeneficiary(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lockAmount">Amount (USDT)</Label>
                    <Input
                      id="lockAmount"
                      type="number"
                      placeholder="1000.00"
                      value={lockAmount}
                      onChange={(e) => setLockAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lockReleaseTime">Release Date & Time</Label>
                    <Input
                      id="lockReleaseTime"
                      type="datetime-local"
                      value={lockReleaseTime}
                      onChange={(e) => setLockReleaseTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lockDescription">Description</Label>
                    <Input
                      id="lockDescription"
                      placeholder="Team allocation, Investor lock, etc."
                      value={lockDescription}
                      onChange={(e) => setLockDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lockIsRevocable"
                      checked={lockIsRevocable}
                      onChange={(e) => setLockIsRevocable(e.target.checked)}
                    />
                    <Label htmlFor="lockIsRevocable">Revocable by admin</Label>
                  </div>

                  <Button 
                    onClick={handleCreateLock} 
                    disabled={isProcessing || !lockBeneficiary || !lockAmount || !lockReleaseTime}
                    className="w-full"
                  >
                    {isProcessing ? "Creating..." : "Create Lock"}
                  </Button>
                </CardContent>
              </Card>

              {/* Create Vesting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Vesting Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vestingBeneficiary">Beneficiary Address</Label>
                    <Input
                      id="vestingBeneficiary"
                      placeholder="0x..."
                      value={vestingBeneficiary}
                      onChange={(e) => setVestingBeneficiary(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vestingTotalAmount">Total Amount (USDT)</Label>
                    <Input
                      id="vestingTotalAmount"
                      type="number"
                      placeholder="10000.00"
                      value={vestingTotalAmount}
                      onChange={(e) => setVestingTotalAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="vestingStartTime">Start Date & Time</Label>
                    <Input
                      id="vestingStartTime"
                      type="datetime-local"
                      value={vestingStartTime}
                      onChange={(e) => setVestingStartTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="vestingDuration">Duration (Days)</Label>
                    <Input
                      id="vestingDuration"
                      type="number"
                      placeholder="365"
                      value={vestingDuration}
                      onChange={(e) => setVestingDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="vestingDescription">Description</Label>
                    <Input
                      id="vestingDescription"
                      placeholder="Team vesting, Founder allocation, etc."
                      value={vestingDescription}
                      onChange={(e) => setVestingDescription(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateVesting} 
                    disabled={isProcessing || !vestingBeneficiary || !vestingTotalAmount || !vestingStartTime || !vestingDuration}
                    className="w-full"
                  >
                    {isProcessing ? "Creating..." : "Create Vesting"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locks" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Locks</h3>
              {isLoading ? (
                <div className="text-center py-8">Loading locks...</div>
              ) : locks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No locks found</div>
              ) : (
                <div className="space-y-3">
                  {locks.map((lock) => (
                    <Card key={lock.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold">Lock #{lock.id}</div>
                            <div className="text-sm text-muted-foreground">
                              Beneficiary: {lock.beneficiary}
                            </div>
                          </div>
                          <Badge variant={lock.isReleased ? "secondary" : "default"}>
                            {lock.isReleased ? "Released" : "Active"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Amount:</strong> {lock.amount} USDT
                          </div>
                          <div>
                            <strong>Release Time:</strong> {formatTime(lock.releaseTime)}
                          </div>
                          <div>
                            <strong>Created:</strong> {formatTime(lock.createdAt)}
                          </div>
                          <div>
                            <strong>Time Remaining:</strong> {getTimeRemaining(lock.releaseTime)}
                          </div>
                        </div>
                        
                        {lock.description && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <strong>Description:</strong> {lock.description}
                          </div>
                        )}
                        
                        {!lock.isReleased && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReleaseLock(lock.id)}
                              disabled={isProcessing || getTimeRemaining(lock.releaseTime) !== 'Unlocked'}
                            >
                              Release
                            </Button>
                            {lock.isRevocable && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRevokeLock(lock.id)}
                                disabled={isProcessing}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vesting" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vesting Schedules</h3>
              {isLoading ? (
                <div className="text-center py-8">Loading vesting schedules...</div>
              ) : vestingSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No vesting schedules found</div>
              ) : (
                <div className="space-y-3">
                  {vestingSchedules.map((vesting) => {
                    const progress = getVestingProgress(vesting);
                    return (
                      <Card key={vesting.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold">Vesting #{vesting.id}</div>
                              <div className="text-sm text-muted-foreground">
                                Beneficiary: {vesting.beneficiary}
                              </div>
                            </div>
                            <Badge variant="default">
                              {progress.progress.toFixed(1)}% Complete
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <strong>Total Amount:</strong> {vesting.totalAmount} USDT
                            </div>
                            <div>
                              <strong>Claimed:</strong> {vesting.claimedAmount} USDT
                            </div>
                            <div>
                              <strong>Start Time:</strong> {formatTime(vesting.startTime)}
                            </div>
                            <div>
                              <strong>Duration:</strong> {Math.floor(vesting.duration / 86400)} days
                            </div>
                          </div>
                          
                          {vesting.description && (
                            <div className="mb-3 text-sm text-muted-foreground">
                              <strong>Description:</strong> {vesting.description}
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{progress.progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleClaimVesting(vesting.id)}
                              disabled={isProcessing || !progress.isClaimable}
                            >
                              {progress.isClaimable ? `Claim ${progress.claimable} USDT` : 'No tokens to claim'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRevokeVesting(vesting.id)}
                              disabled={isProcessing}
                            >
                              Revoke
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Management Tools</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{locks.length}</div>
                      <div className="text-sm text-muted-foreground">Total Locks</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{vestingSchedules.length}</div>
                      <div className="text-sm text-muted-foreground">Vesting Schedules</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {locks.filter(lock => !lock.isReleased).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Locks</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {locks.filter(lock => lock.isReleased).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Released Locks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
