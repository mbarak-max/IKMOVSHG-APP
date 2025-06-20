import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, FileText, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ReportsGeneration: React.FC = () => {
  const { members, transactions, loans, groupExpenses, disbursements } = useApp();
  const [reportType, setReportType] = useState('members');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportPeriod, setReportPeriod] = useState('monthly');

  const reportTypes = [
    { value: 'members', label: 'Members Report', icon: Users },
    { value: 'financial', label: 'Financial Report', icon: DollarSign },
    { value: 'loans', label: 'Loans Report', icon: TrendingUp },
    { value: 'transactions', label: 'Transactions Report', icon: FileText },
  ];

  const filterDataByDate = (data: any[], dateField: string) => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  const generateMembersReport = () => {
    const activeMembers = members.filter(m => m.status === 'active');
    const dormantMembers = members.filter(m => m.status === 'dormant');
    const inactiveMembers = members.filter(m => m.status === 'inactive');

    return {
      summary: {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        dormantMembers: dormantMembers.length,
        inactiveMembers: inactiveMembers.length,
        totalRegistrationFees: members.reduce((sum, m) => sum + m.registrationFee, 0),
        totalContributions: members.reduce((sum, m) => sum + m.totalContributions, 0),
      },
      details: members.map(member => ({
        name: member.name,
        phone: member.phone,
        registrationDate: new Date(member.registrationDate).toLocaleDateString(),
        status: member.status,
        totalContributions: member.totalContributions,
        lastPaymentDate: member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString() : 'Never',
      })),
    };
  };

  const generateFinancialReport = () => {
    const filteredTransactions = filterDataByDate(transactions, 'date');
    const filteredExpenses = filterDataByDate(groupExpenses, 'date');
    const filteredDisbursements = filterDataByDate(disbursements.filter(d => d.status === 'disbursed'), 'disbursementDate');

    const income = filteredTransactions
      .filter(t => !['withdrawal'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const disbursed = filteredDisbursements.reduce((sum, d) => sum + d.approvedAmount, 0);
    const withdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        totalDisbursements: disbursed,
        totalWithdrawals: withdrawals,
        netBalance: income - expenses - disbursed - withdrawals,
      },
      incomeBreakdown: {
        deposits: filteredTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
        pettyCash: filteredTransactions.filter(t => t.type === 'petty_cash').reduce((sum, t) => sum + t.amount, 0),
        medical: filteredTransactions.filter(t => t.type === 'medical').reduce((sum, t) => sum + t.amount, 0),
        lastExpense: filteredTransactions.filter(t => t.type === 'last_expense').reduce((sum, t) => sum + t.amount, 0),
        registrationFees: filteredTransactions.filter(t => t.type === 'registration_fee').reduce((sum, t) => sum + t.amount, 0),
      },
    };
  };

  const generateLoansReport = () => {
    const filteredLoans = filterDataByDate(loans, 'applicationDate');
    const activeLoans = filteredLoans.filter(l => ['approved', 'disbursed'].includes(l.status));
    const completedLoans = filteredLoans.filter(l => l.status === 'completed');
    const overdueLoans = filteredLoans.filter(l => {
      if (l.status !== 'disbursed' || !l.dueDate) return false;
      return new Date() > l.dueDate;
    });

    return {
      summary: {
        totalApplications: filteredLoans.length,
        activeLoans: activeLoans.length,
        completedLoans: completedLoans.length,
        overdueLoans: overdueLoans.length,
        totalDisbursed: filteredLoans.filter(l => l.status === 'disbursed').reduce((sum, l) => sum + l.amount, 0),
        totalRepaid: filteredLoans.reduce((sum, l) => sum + l.totalRepaid, 0),
      },
      details: filteredLoans.map(loan => ({
        member: members.find(m => m.id === loan.memberId)?.name || 'Unknown',
        type: loan.type,
        amount: loan.amount,
        interestRate: loan.interestRate,
        status: loan.status,
        applicationDate: new Date(loan.applicationDate).toLocaleDateString(),
        dueDate: loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A',
        totalRepaid: loan.totalRepaid,
      })),
    };
  };

  const generateTransactionsReport = () => {
    const filteredTransactions = filterDataByDate(transactions, 'date');

    return {
      summary: {
        totalTransactions: filteredTransactions.length,
        totalAmount: filteredTransactions.reduce((sum, t) => sum + (t.type === 'withdrawal' ? -t.amount : t.amount), 0),
        deposits: filteredTransactions.filter(t => t.type === 'deposit').length,
        withdrawals: filteredTransactions.filter(t => t.type === 'withdrawal').length,
      },
      details: filteredTransactions.map(transaction => ({
        date: new Date(transaction.date).toLocaleDateString(),
        member: members.find(m => m.id === transaction.memberId)?.name || 'Unknown',
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        processedBy: transaction.processedBy,
      })),
    };
  };

  const getReportData = () => {
    switch (reportType) {
      case 'members':
        return generateMembersReport();
      case 'financial':
        return generateFinancialReport();
      case 'loans':
        return generateLoansReport();
      case 'transactions':
        return generateTransactionsReport();
      default:
        return null;
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const reportData = getReportData();
    if (!reportData) return;

    // Header
    doc.setFontSize(20);
    doc.text('IKMOV-SHG', 20, 20);
    doc.setFontSize(16);
    doc.text(`${reportTypes.find(rt => rt.value === reportType)?.label}`, 20, 30);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 20, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);

    let yPosition = 70;

    // Summary
    if ('summary' in reportData) {
      doc.setFontSize(14);
      doc.text('Summary', 20, yPosition);
      yPosition += 10;

      Object.entries(reportData.summary).forEach(([key, value]) => {
        doc.setFontSize(10);
        doc.text(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${typeof value === 'number' ? value.toLocaleString() : value}`, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Details table
    if ('details' in reportData && reportData.details.length > 0) {
      const tableData = reportData.details.map(item => Object.values(item));
      const tableHeaders = Object.keys(reportData.details[0]).map(key => 
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      );

      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const reportData = getReportData();
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if ('summary' in reportData) {
      const summaryData = Object.entries(reportData.summary).map(([key, value]) => ({
        Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        Value: value,
      }));

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Details sheet
    if ('details' in reportData && reportData.details.length > 0) {
      const detailsSheet = XLSX.utils.json_to_sheet(reportData.details);
      XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Details');
    }

    XLSX.writeFile(workbook, `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const reportData = getReportData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports Generation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            {(() => {
              const ReportIcon = reportTypes.find(rt => rt.value === reportType)?.icon || FileText;
              return <ReportIcon className="h-6 w-6 text-blue-600 mr-3" />;
            })()}
            <h3 className="text-xl font-bold text-gray-900">
              {reportTypes.find(rt => rt.value === reportType)?.label}
            </h3>
          </div>

          {/* Summary Section */}
          {'summary' in reportData && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {typeof value === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('fee') || key.toLowerCase().includes('contribution') || key.toLowerCase().includes('income') || key.toLowerCase().includes('expense') || key.toLowerCase().includes('balance') || key.toLowerCase().includes('disburs') || key.toLowerCase().includes('repaid') || key.toLowerCase().includes('withdrawal')
                        ? `KES ${value.toLocaleString()}`
                        : value.toLocaleString()
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details Section */}
          {'details' in reportData && reportData.details.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Details</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData.details[0]).map(key => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.details.slice(0, 50).map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.entries(item).map(([key, value]) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof value === 'number' && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('fee') || key.toLowerCase().includes('contribution') || key.toLowerCase().includes('repaid'))
                              ? `KES ${value.toLocaleString()}`
                              : String(value)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.details.length > 50 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing first 50 records. Export to view all {reportData.details.length} records.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsGeneration;