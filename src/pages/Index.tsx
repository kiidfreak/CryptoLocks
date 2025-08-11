import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Dashboard } from '@/components/Dashboard';
import { LockManagement } from '@/components/LockManagement';
import { CreateLockForm } from '@/components/CreateLockForm';

type ViewType = 'dashboard' | 'locks' | 'create' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'locks':
        return <LockManagement />;
      case 'create':
        return <CreateLockForm />;
      case 'settings':
        return <div className="text-center text-muted-foreground">Settings page coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout onViewChange={setCurrentView} currentView={currentView}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;
