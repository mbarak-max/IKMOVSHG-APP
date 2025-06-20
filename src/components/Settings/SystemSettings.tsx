import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RefreshCw, Database, Users, Shield } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const { currentUser } = useApp();
  const [settings, setSettings] = useState({
    groupName: 'IKMOV-SHG',
    registrationFee: 1000,
    pettyCashAmount: 50,
    loanInterestRates: {
      shortTerm: 10,
      longTerm: 10,
      bridge: 8,
    },
    loanTerms: {
      shortTerm: 1,
      longTerm: 3,
      bridge: 4,
    },
    overdueInterestRate: 10,
    maxOverdueMonths: 4,
    memberStatusThresholds: {
      dormantMonths: 3,
      inactiveMonths: 6,
    },
    systemMaintenance: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetentionMonths: 24,
    },
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    // In a real application, this would save to a backend
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        groupName: 'IKMOV-SHG',
        registrationFee: 1000,
        pettyCashAmount: 50,
        loanInterestRates: {
          shortTerm: 10,
          longTerm: 10,
          bridge: 8,
        },
        loanTerms: {
          shortTerm: 1,
          longTerm: 3,
          bridge: 4,
        },
        overdueInterestRate: 10,
        maxOverdueMonths: 4,
        memberStatusThresholds: {
          dormantMonths: 3,
          inactiveMonths: 6,
        },
        systemMaintenance: {
          autoBackup: true,
          backupFrequency: 'daily',
          dataRetentionMonths: 24,
        },
      });
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleDirectChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'loans', label: 'Loans', icon: Database },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'system', label: 'System', icon: Shield },
  ];

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only administrators can access system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={settings.groupName}
                    onChange={(e) => handleDirectChange('groupName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Fee (KES)
                  </label>
                  <input
                    type="number"
                    value={settings.registrationFee}
                    onChange={(e) => handleDirectChange('registrationFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Petty Cash Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={settings.pettyCashAmount}
                    onChange={(e) => handleDirectChange('pettyCashAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Loan Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Interest Rates (%)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Short Term</label>
                      <input
                        type="number"
                        value={settings.loanInterestRates.shortTerm}
                        onChange={(e) => handleChange('loanInterestRates', 'shortTerm', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Long Term</label>
                      <input
                        type="number"
                        value={settings.loanInterestRates.longTerm}
                        onChange={(e) => handleChange('loanInterestRates', 'longTerm', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Bridge Loan</label>
                      <input
                        type="number"
                        value={settings.loanInterestRates.bridge}
                        onChange={(e) => handleChange('loanInterestRates', 'bridge', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Loan Terms (Months)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Short Term</label>
                      <input
                        type="number"
                        value={settings.loanTerms.shortTerm}
                        onChange={(e) => handleChange('loanTerms', 'shortTerm', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Long Term</label>
                      <input
                        type="number"
                        value={settings.loanTerms.longTerm}
                        onChange={(e) => handleChange('loanTerms', 'longTerm', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Bridge Loan</label>
                      <input
                        type="number"
                        value={settings.loanTerms.bridge}
                        onChange={(e) => handleChange('loanTerms', 'bridge', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overdue Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.overdueInterestRate}
                    onChange={(e) => handleDirectChange('overdueInterestRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Overdue Months
                  </label>
                  <input
                    type="number"
                    value={settings.maxOverdueMonths}
                    onChange={(e) => handleDirectChange('maxOverdueMonths', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Member Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dormant Status Threshold (Months)
                  </label>
                  <input
                    type="number"
                    value={settings.memberStatusThresholds.dormantMonths}
                    onChange={(e) => handleChange('memberStatusThresholds', 'dormantMonths', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Members become dormant after this many months without payment
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inactive Status Threshold (Months)
                  </label>
                  <input
                    type="number"
                    value={settings.memberStatusThresholds.inactiveMonths}
                    onChange={(e) => handleChange('memberStatusThresholds', 'inactiveMonths', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Members become inactive after this many months without payment
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.systemMaintenance.autoBackup}
                      onChange={(e) => handleChange('systemMaintenance', 'autoBackup', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Auto Backup</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.systemMaintenance.backupFrequency}
                    onChange={(e) => handleChange('systemMaintenance', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Retention (Months)
                  </label>
                  <input
                    type="number"
                    value={settings.systemMaintenance.dataRetentionMonths}
                    onChange={(e) => handleChange('systemMaintenance', 'dataRetentionMonths', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long to keep historical data
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;