import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, DollarSign } from 'lucide-react';

const DisbursementForm: React.FC = () => {
  const { members, transactions, disbursements, addDisbursement, updateDisbursement, currentUser } = useApp();
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'medical' as const,
    requestAmount: '',
  });

  const disbursementTypes = [
    { value: 'medical', label: 'Medical Aid' },
    { value: 'last_expense', label: 'Last Expense Aid' },
  ];

  const calculateFundsSummary = (type: 'medical' | 'last_expense') => {
    // Calculate total contributions for this type
    const totalContributed = transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total disbursed for this type
    const totalDisbursed = disbursements
      .filter(d => d.type === type && d.status === 'disbursed')
      .reduce((sum, d) => sum + d.approvedAmount, 0);

    const balance = totalContributed - totalDisbursed;

    return {
      totalContributed,
      totalDisbursed,
      balance,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fundsSummary = calculateFundsSummary(formData.type);
    const requestAmount = parseFloat(formData.requestAmount);

    if (requestAmount > fundsSummary.balance) {
      alert(`Insufficient funds. Available balance: KES ${fundsSummary.balance.toLocaleString()}`);
      return;
    }

    addDisbursement({
      memberId: formData.memberId,
      type: formData.type,
      requestAmount,
      approvedAmount: 0, // Will be set during approval
      fundsSummary,
      requestDate: new Date(),
      status: 'pending',
    });

    // Reset form
    setFormData({
      memberId: '',
      type: 'medical',
      requestAmount: '',
    });

    alert('Disbursement request submitted successfully!');
  };

  const handleApprove = (disbursementId: string, approvedAmount: number) => {
    updateDisbursement(disbursementId, {
      status: 'approved',
      approvedAmount,
      approvalDate: new Date(),
      approvedBy: currentUser?.username,
    });
  };

  const handleDisburse = (disbursementId: string) => {
    updateDisbursement(disbursementId, {
      status: 'disbursed',
      disbursementDate: new Date(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown Member';
  };

  const currentFundsSummary = formData.type ? calculateFundsSummary(formData.type) : null;
  const canApprove = currentUser?.role === 'treasurer' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Disbursement Request</h2>
        
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
                Disbursement Type *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {disbursementTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Amount (KES) *
              </label>
              <input
                type="number"
                name="requestAmount"
                required
                min="1"
                step="0.01"
                value={formData.requestAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {currentFundsSummary && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                {formData.type.replace('_', ' ').toUpperCase()} Fund Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Contributed:</span>
                  <div className="font-medium text-green-600">
                    KES {currentFundsSummary.totalContributed.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Total Disbursed:</span>
                  <div className="font-medium text-red-600">
                    KES {currentFundsSummary.totalDisbursed.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Available Balance:</span>
                  <div className="font-medium text-blue-600">
                    KES {currentFundsSummary.balance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Submit Disbursement Request</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Disbursement Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                {canApprove && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disbursements
                .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                .map((disbursement) => (
                  <tr key={disbursement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMemberName(disbursement.memberId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {disbursement.type.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      KES {disbursement.requestAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {disbursement.approvedAmount > 0 
                        ? `KES ${disbursement.approvedAmount.toLocaleString()}`
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        disbursement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        disbursement.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {disbursement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(disbursement.requestDate).toLocaleDateString()}
                    </td>
                    {canApprove && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {disbursement.status === 'pending' && (
                            <button
                              onClick={() => {
                                const amount = prompt('Enter approved amount:');
                                if (amount && !isNaN(parseFloat(amount))) {
                                  handleApprove(disbursement.id, parseFloat(amount));
                                }
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                          )}
                          {disbursement.status === 'approved' && (
                            <button
                              onClick={() => handleDisburse(disbursement.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Disburse
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisbursementForm;