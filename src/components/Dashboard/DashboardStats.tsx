import React from 'react';
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DashboardStats: React.FC = () => {
  const { members, transactions, loans } = useApp();

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const dormantMembers = members.filter(m => m.status === 'dormant').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;

  const totalContributions = transactions
    .filter(t => ['deposit', 'petty_cash', 'medical', 'last_expense', 'registration_fee'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const activeLoans = loans.filter(l => ['approved', 'disbursed'].includes(l.status)).length;
  const totalLoanAmount = loans
    .filter(l => l.status === 'disbursed')
    .reduce((sum, l) => sum + l.amount, 0);

  const overdueLoans = loans.filter(l => {
    if (l.status !== 'disbursed' || !l.dueDate) return false;
    return new Date() > l.dueDate;
  }).length;

  const stats = [
    {
      title: 'Total Members',
      value: totalMembers,
      subtitle: `${activeMembers} Active, ${dormantMembers} Dormant, ${inactiveMembers} Inactive`,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Contributions',
      value: `KES ${totalContributions.toLocaleString()}`,
      subtitle: 'All member contributions',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Loans',
      value: activeLoans,
      subtitle: `KES ${totalLoanAmount.toLocaleString()} disbursed`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Overdue Loans',
      value: overdueLoans,
      subtitle: 'Require attention',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;