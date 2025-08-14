import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Dashboard } from '@/components/Dashboard';
import { LockManagement } from '@/components/LockManagement';
import { CreateLockForm } from '@/components/CreateLockForm';
import { TransferLockForm } from '@/components/TransferLockForm';
import { SplitLockForm } from '@/components/SplitLockForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Settings } from '@/components/Settings';

type ViewType = 'dashboard' | 'locks' | 'create' | 'transactions' | 'deploy' | 'settings' | 'transfer' | 'split' | 'send';

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const handleViewChange = (view: ViewType) => {
    if (view === 'deploy') {
      navigate('/deploy');
      return;
    }
    if (view === 'send') {
      // Stay on dashboard but scroll to send section
      setCurrentView(view);
      return;
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'locks':
        return <LockManagement onViewChange={setCurrentView} />;
      case 'create':
        return <CreateLockForm />;
      case 'transactions':
        return <TransactionHistory />;
      case 'settings':
        return <Settings />;
      case 'transfer':
        return <TransferLockForm />;
      case 'split':
        return <SplitLockForm />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout onViewChange={handleViewChange} currentView={currentView}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;
