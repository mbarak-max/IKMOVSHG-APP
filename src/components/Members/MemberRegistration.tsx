import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';

const MemberRegistration: React.FC = () => {
  const { addMember, addTransaction, currentUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: Omit<Member, 'id'> = {
      ...formData,
      registrationDate: new Date(),
      registrationFee: 1000,
      status: 'active',
      totalContributions: 1000,
      lastPaymentDate: new Date(),
    };

    addMember(newMember);

    // Add registration fee transaction
    addTransaction({
      memberId: '', // Will be set when member is created
      type: 'registration_fee',
      amount: 1000,
      date: new Date(),
      description: 'Member registration fee',
      processedBy: currentUser?.username || 'admin',
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      nationalId: '',
      address: '',
    });

    alert('Member registered successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Member Registration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              National ID *
            </label>
            <input
              type="text"
              name="nationalId"
              required
              value={formData.nationalId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            name="address"
            required
            rows={3}
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Registration Fee:</strong> KES 1,000 (non-refundable)
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Register Member
        </button>
      </form>
    </div>
  );
};

export default MemberRegistration;