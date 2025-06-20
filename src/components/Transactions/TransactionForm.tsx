import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const TransactionForm: React.FC = () => {
  const { members, addTransaction, currentUser } = useApp();
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'deposit' as const,
    amount: '',
    description: '',
  });

  const transactionTypes = [
    { value: 'deposit', label: 'Monthly Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'petty_cash', label: 'Petty Cash (KES 50)' },
    { value: 'medical', label: 'Medical Contribution' },
    { value: 'last_expense', label: 'Last Expense Contribution' },
    { value: 'membership_renewal', label: 'Membership Renewal' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let amount = parseFloat(formData.amount);
    if (formData.type === 'petty_cash') {
      amount = 50; // Fixed amount for petty cash
    }

    addTransaction({
      memberId: formData.memberId,
      type: formData.type,
      amount,
      date: new Date(),
      description: formData.description || `${formData.type.replace('_', ' ')} transaction`,
      processedBy: currentUser?.username || 'admin',
    });

    // Reset form
    setFormData({
      memberId: '',
      type: 'deposit',
      amount: '',
      description: '',
    });

    alert('Transaction recorded successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Transaction</h2>
      
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
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type *
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES) *
            </label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              disabled={formData.type === 'petty_cash'}
              placeholder={formData.type === 'petty_cash' ? '50 (Fixed)' : 'Enter amount'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description"
          />
        </div>

        {formData.type === 'petty_cash' && (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Petty cash contributions are non-refundable and fixed at KES 50 per month.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Record Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;