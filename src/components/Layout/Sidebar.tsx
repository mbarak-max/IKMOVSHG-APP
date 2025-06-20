import React from 'react';
import { 
  Home, Users, CreditCard, DollarSign, FileText, 
  TrendingUp, Settings, UserCheck, Receipt, Banknote 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useApp();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'loans', label: 'Loans', icon: DollarSign },
    { id: 'expenses', label: 'Group Expenses', icon: Receipt },
    { id: 'disbursements', label: 'Disbursements', icon: Banknote },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'executives', label: 'Executives', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const memberMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'my-statement', label: 'My Statement', icon: FileText },
    { id: 'loan-request', label: 'Request Loan', icon: DollarSign },
  ];

  const menuItems = currentUser?.role === 'member' ? memberMenuItems : adminMenuItems;

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;