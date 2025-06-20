import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Member, Transaction, Loan, GroupExpense, Disbursement, Executive, User } from '../types';

interface AppContextType {
  // State
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  groupExpenses: GroupExpense[];
  disbursements: Disbursement[];
  executives: Executive[];
  currentUser: User | null;
  
  // Actions
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  addGroupExpense: (expense: Omit<GroupExpense, 'id'>) => void;
  addDisbursement: (disbursement: Omit<Disbursement, 'id'>) => void;
  updateDisbursement: (id: string, updates: Partial<Disbursement>) => void;
  addExecutive: (executive: Omit<Executive, 'id'>) => void;
  updateExecutive: (id: string, updates: Partial<Executive>) => void;
  setCurrentUser: (user: User | null) => void;
  updateMemberStatus: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    username: 'admin',
    role: 'admin'
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update member's total contributions and last payment date
    if (transactionData.type === 'deposit') {
      updateMember(transactionData.memberId, {
        totalContributions: members.find(m => m.id === transactionData.memberId)?.totalContributions || 0 + transactionData.amount,
        lastPaymentDate: transactionData.date
      });
    }
  };

  const addLoan = (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: generateId(),
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(loan => 
      loan.id === id ? { ...loan, ...updates } : loan
    ));
  };

  const addGroupExpense = (expenseData: Omit<GroupExpense, 'id'>) => {
    const newExpense: GroupExpense = {
      ...expenseData,
      id: generateId(),
    };
    setGroupExpenses(prev => [...prev, newExpense]);
  };

  const addDisbursement = (disbursementData: Omit<Disbursement, 'id'>) => {
    const newDisbursement: Disbursement = {
      ...disbursementData,
      id: generateId(),
    };
    setDisbursements(prev => [...prev, newDisbursement]);
  };

  const updateDisbursement = (id: string, updates: Partial<Disbursement>) => {
    setDisbursements(prev => prev.map(disbursement => 
      disbursement.id === id ? { ...disbursement, ...updates } : disbursement
    ));
  };

  const addExecutive = (executiveData: Omit<Executive, 'id'>) => {
    const newExecutive: Executive = {
      ...executiveData,
      id: generateId(),
    };
    setExecutives(prev => [...prev, newExecutive]);
  };

  const updateExecutive = (id: string, updates: Partial<Executive>) => {
    setExecutives(prev => prev.map(executive => 
      executive.id === id ? { ...executive, ...updates } : executive
    ));
  };

  const updateMemberStatus = () => {
    const now = new Date();
    setMembers(prev => prev.map(member => {
      if (!member.lastPaymentDate) {
        return { ...member, status: 'inactive' };
      }
      
      const monthsSincePayment = Math.floor(
        (now.getTime() - member.lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      
      let status: Member['status'] = 'active';
      if (monthsSincePayment >= 6) {
        status = 'inactive';
      } else if (monthsSincePayment >= 3) {
        status = 'dormant';
      }
      
      return { ...member, status };
    }));
  };

  const value: AppContextType = {
    members,
    transactions,
    loans,
    groupExpenses,
    disbursements,
    executives,
    currentUser,
    addMember,
    updateMember,
    addTransaction,
    addLoan,
    updateLoan,
    addGroupExpense,
    addDisbursement,
    updateDisbursement,
    addExecutive,
    updateExecutive,
    setCurrentUser,
    updateMemberStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};