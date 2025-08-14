import React, { useState } from 'react';
import { ContractDeployment } from '@/components/ContractDeployment';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export const DeploymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('deploy');

  const handleViewChange = (view: 'dashboard' | 'locks' | 'create' | 'transactions' | 'deploy' | 'settings' | 'send') => {
    setCurrentView(view);
    
    // Navigate to the appropriate route based on the selected view
    switch (view) {
      case 'dashboard':
        navigate('/');
        break;
      case 'locks':
        navigate('/');
        break;
      case 'create':
        navigate('/');
        break;
      case 'transactions':
        navigate('/');
        break;
      case 'deploy':
        navigate('/deploy');
        break;
      case 'settings':
        navigate('/');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={handleViewChange}>
      <div className="container mx-auto px-4 py-8">
        <ContractDeployment />
      </div>
    </DashboardLayout>
  );
};
