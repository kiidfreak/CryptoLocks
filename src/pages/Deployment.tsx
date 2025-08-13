import React from 'react';
import { ContractDeployment } from '@/components/ContractDeployment';
import { DashboardLayout } from '@/components/DashboardLayout';

export const DeploymentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ContractDeployment />
      </div>
    </DashboardLayout>
  );
};
