import React from 'react';
import { Users, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">IKMOVSHG</h1>
              <p className="text-blue-200 text-sm">IKMOV Self Help Group Management</p>
            </div>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{currentUser.username}</p>
                <p className="text-blue-200 text-sm capitalize">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;