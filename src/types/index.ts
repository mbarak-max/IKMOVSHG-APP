export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId: string;
  address: string;
  registrationDate: Date;
  registrationFee: number;
  status: 'active' | 'dormant' | 'inactive';
  lastPaymentDate?: Date;
  totalContributions: number;
}

export interface Transaction {
  id: string;
  memberId: string;
  type: 'deposit' | 'withdrawal' | 'petty_cash' | 'medical' | 'last_expense' | 'registration_fee' | 'membership_renewal';
  amount: number;
  date: Date;
  description: string;
  processedBy: string;
}

export interface Loan {
  id: string;
  memberId: string;
  type: 'bridge' | 'long_term' | 'short_term';
  amount: number;
  interestRate: number;
  termMonths: number;
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  dueDate?: Date;
  status: 'pending' | 'approved' | 'disbursed' | 'completed' | 'overdue';
  monthlyPayment: number;
  totalRepaid: number;
  approvedBy?: string;
}

export interface GroupExpense {
  id: string;
  category: 'transport' | 'communication' | 'stamps' | 'certificate_renewal' | 'beverage' | 'other';
  amount: number;
  description: string;
  date: Date;
  processedBy: string;
}

export interface Disbursement {
  id: string;
  memberId: string;
  type: 'medical' | 'last_expense';
  requestAmount: number;
  approvedAmount: number;
  fundsSummary: {
    totalContributed: number;
    totalDisbursed: number;
    balance: number;
  };
  requestDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  status: 'pending' | 'approved' | 'disbursed';
  approvedBy?: string;
}

export interface Executive {
  id: string;
  name: string;
  position: 'chairman' | 'secretary' | 'treasurer' | 'member';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'treasurer' | 'member';
  memberId?: string;
}

export type UserRole = 'admin' | 'treasurer' | 'member';