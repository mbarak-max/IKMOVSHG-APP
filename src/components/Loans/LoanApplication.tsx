import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const LoanApplication: React.FC = () => {
  const { members, addLoan, currentUser } = useApp();
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'short_term' as const,
    amount: '',
    purpose: '',
  });

  const loanTypes = [
    { 
      value: 'short_term', 
      label: 'Short Term (1 month)', 
      rate: 10, 
      description: '10% interest, 1 month repayment' 
    },
    { 
      value: 'bridge', 
      label: 'Bridge Loan (4 months)', 
      rate: 8, 
      description: '8% interest, 4 months repayment' 
    },
    { 
      value: 'long_term', 
      label: 'Long Term (3 months)', 
      rate: 10, 
      description: '10% interest, 3 months repayment' 
    },
  ];

  const calculateLoanDetails = () => {
    const amount = parseFloat(formData.amount) || 0;
    const loanType = loanTypes.find(lt => lt.value === formData.type);
    if (!loanType) return null;

    const interestRate = loanType.rate / 100;
    const termMonths = formData.type === 'short_term' ? 1 : formData.type === 'bridge' ? 4 : 3;
    const totalInterest = amount * interestRate;
    const totalRepayment = amount + totalInterest;
    const monthlyPayment = totalRepayment / termMonths;

    return {
      principal: amount,
      interestRate: loanType.rate,
      termMonths,
      totalInterest,
      totalRepayment,
      monthlyPayment,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const loanDetails = calculateLoanDetails();
    if (!loanDetails) return;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + loanDetails.termMonths);

    addLoan({
      memberId: formData.memberId,
      type: formData.type,
      amount: loanDetails.principal,
      interestRate: loanDetails.interestRate,
      termMonths: loanDetails.termMonths,
      applicationDate: new Date(),
      dueDate,
      status: 'pending',
      monthlyPayment: loanDetails.monthlyPayment,
      totalRepaid: 0,
    });

    // Reset form
    setFormData({
      memberId: '',
      type: 'short_term',
      amount: '',
      purpose: '',
    });

    alert('Loan application submitted successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const loanDetails = calculateLoanDetails();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Loan Application</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member *
            </label>
            <select
              name="memberId"
              required
              value={formData.memberId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Member</option>
              {members.filter(m => m.status === 'active').map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Type *
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loanTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (KES) *
            </label>
            <input
              type="number"
              name="amount"
              required
              min="1000"
              step="100"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Loan
          </label>
          <textarea
            name="purpose"
            rows={3}
            value={formData.purpose}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the purpose of this loan"
          />
        </div>

        {loanDetails && loanDetails.principal > 0 && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Loan Calculation</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Principal Amount:</span>
                <span className="font-medium ml-2">KES {loanDetails.principal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-700">Interest Rate:</span>
                <span className="font-medium ml-2">{loanDetails.interestRate}%</span>
              </div>
              <div>
                <span className="text-blue-700">Term:</span>
                <span className="font-medium ml-2">{loanDetails.termMonths} months</span>
              </div>
              <div>
                <span className="text-blue-700">Total Interest:</span>
                <span className="font-medium ml-2">KES {loanDetails.totalInterest.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-700">Total Repayment:</span>
                <span className="font-medium ml-2">KES {loanDetails.totalRepayment.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-700">Monthly Payment:</span>
                <span className="font-medium ml-2">KES {loanDetails.monthlyPayment.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Loans past due date attract 10% additional interest on outstanding balance for up to 4 months.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Submit Loan Application
        </button>
      </form>
    </div>
  );
};

export default LoanApplication;