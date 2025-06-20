import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, FileText, Calendar, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MemberStatement: React.FC = () => {
  const { members, transactions, loans, currentUser } = useApp();
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const selectedMember = members.find(m => m.id === selectedMemberId);
  
  const memberTransactions = transactions
    .filter(t => t.memberId === selectedMemberId)
    .filter(t => {
      const transactionDate = new Date(t.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      return transactionDate >= start && transactionDate <= end;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const memberLoans = loans
    .filter(l => l.memberId === selectedMemberId)
    .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());

  const calculateSummary = () => {
    const deposits = memberTransactions
      .filter(t => ['deposit', 'petty_cash', 'medical', 'last_expense', 'registration_fee'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = memberTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLoans = memberLoans
      .filter(l => l.status === 'disbursed')
      .reduce((sum, l) => sum + l.amount, 0);

    const totalRepaid = memberLoans
      .reduce((sum, l) => sum + l.totalRepaid, 0);

    return {
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      netContributions: deposits - withdrawals,
      totalLoans,
      totalRepaid,
      outstandingLoans: totalLoans - totalRepaid,
    };
  };

  const exportToPDF = () => {
    if (!selectedMember) return;

    const doc = new jsPDF();
    const summary = calculateSummary();

    // Header
    doc.setFontSize(20);
    doc.text('IKMOV-SHG', 20, 20);
    doc.setFontSize(16);
    doc.text('Member Statement', 20, 30);
    doc.setFontSize(12);
    doc.text(`Member: ${selectedMember.name}`, 20, 40);
    doc.text(`Phone: ${selectedMember.phone}`, 20, 50);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 20, 60);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 70);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 90);
    doc.setFontSize(10);
    doc.text(`Total Deposits: KES ${summary.totalDeposits.toLocaleString()}`, 20, 100);
    doc.text(`Total Withdrawals: KES ${summary.totalWithdrawals.toLocaleString()}`, 20, 110);
    doc.text(`Net Contributions: KES ${summary.netContributions.toLocaleString()}`, 20, 120);
    doc.text(`Total Loans: KES ${summary.totalLoans.toLocaleString()}`, 20, 130);
    doc.text(`Outstanding Loans: KES ${summary.outstandingLoans.toLocaleString()}`, 20, 140);

    // Transactions
    if (memberTransactions.length > 0) {
      const transactionData = memberTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type.replace('_', ' ').toUpperCase(),
        t.type === 'withdrawal' ? `-KES ${t.amount.toLocaleString()}` : `KES ${t.amount.toLocaleString()}`,
        t.description,
      ]);

      doc.autoTable({
        head: [['Date', 'Type', 'Amount', 'Description']],
        body: transactionData,
        startY: 160,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    doc.save(`${selectedMember.name}-statement-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const summary = selectedMember ? calculateSummary() : null;

  // For member role, only show their own statement
  const availableMembers = currentUser?.role === 'member' 
    ? members.filter(m => m.id === currentUser.memberId)
    : members;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Member Statement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Member
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose Member</option>
              {availableMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedMember && (
          <button
            onClick={exportToPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Statement</span>
          </button>
        )}
      </div>

      {selectedMember && summary && (
        <>
          {/* Member Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{selectedMember.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{selectedMember.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedMember.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedMember.status === 'dormant' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedMember.status}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-600">Total Deposits</p>
                    <p className="text-lg font-semibold text-green-900">
                      KES {summary.totalDeposits.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm text-red-600">Total Withdrawals</p>
                    <p className="text-lg font-semibold text-red-900">
                      KES {summary.totalWithdrawals.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-blue-600">Net Contributions</p>
                    <p className="text-lg font-semibold text-blue-900">
                      KES {summary.netContributions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-purple-600">Total Loans</p>
                    <p className="text-lg font-semibold text-purple-900">
                      KES {summary.totalLoans.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-orange-600">Outstanding Loans</p>
                    <p className="text-lg font-semibold text-orange-900">
                      KES {summary.outstandingLoans.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.type.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}KES {transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loans */}
          {memberLoans.length > 0 && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Loan History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.type.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          KES {loan.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            loan.status === 'disbursed' ? 'bg-green-100 text-green-800' :
                            loan.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(loan.applicationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberStatement;