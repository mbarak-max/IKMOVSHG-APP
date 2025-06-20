import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Auth/Login';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardStats from './components/Dashboard/DashboardStats';
import MemberRegistration from './components/Members/MemberRegistration';
import MembersList from './components/Members/MembersList';
import MemberStatement from './components/Members/MemberStatement';
import TransactionForm from './components/Transactions/TransactionForm';
import TransactionsList from './components/Transactions/TransactionsList';
import LoanApplication from './components/Loans/LoanApplication';
import LoansList from './components/Loans/LoansList';
import GroupExpenses from './components/Expenses/GroupExpenses';
import DisbursementForm from './components/Disbursements/DisbursementForm';
import ReportsGeneration from './components/Reports/ReportsGeneration';
import ExecutivesManagement from './components/Executives/ExecutivesManagement';
import SystemSettings from './components/Settings/SystemSettings';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currentUser, updateMemberStatus, setCurrentUser } = useApp();

  useEffect(() => {
    // Update member status on app load and periodically
    updateMemberStatus();
    const interval = setInterval(updateMemberStatus, 24 * 60 * 60 * 1000); // Daily
    return () => clearInterval(interval);
  }, [updateMemberStatus]);

  const handleLogin = (username: string, role: string) => {
    setCurrentUser({
      id: Math.random().toString(36).substr(2, 9),
      username,
      role: role as any,
      memberId: role === 'member' ? 'member-id' : undefined,
    });
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TransactionsList />
              <LoansList />
            </div>
          </div>
        );
      case 'members':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Members Management</h1>
            <div className="space-y-8">
              <MemberRegistration />
              <MembersList />
            </div>
          </div>
        );
      case 'my-statement':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Statement</h1>
            <MemberStatement />
          </div>
        );
      case 'transactions':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Transactions</h1>
            <div className="space-y-8">
              <TransactionForm />
              <TransactionsList />
            </div>
          </div>
        );
      case 'loans':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Loans Management</h1>
            <div className="space-y-8">
              <LoanApplication />
              <LoansList />
            </div>
          </div>
        );
      case 'loan-request':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Request Loan</h1>
            <LoanApplication />
          </div>
        );
      case 'expenses':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Group Expenses</h1>
            <GroupExpenses />
          </div>
        );
      case 'disbursements':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Disbursements</h1>
            <DisbursementForm />
          </div>
        );
      case 'reports':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports</h1>
            <ReportsGeneration />
          </div>
        );
      case 'executives':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Executives Management</h1>
            <ExecutivesManagement />
          </div>
        );
      case 'settings':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
            <SystemSettings />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;