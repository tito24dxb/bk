export type UserRole = 'admin' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investor extends User {
  role: 'investor';
  country: string;
  joinDate: string;
  initialDeposit: number;
  currentBalance: number;
  isActive: boolean;
  accountStatus?: string;
  accountFlags?: {
    policyViolation?: boolean;
    policyViolationMessage?: string;
    pendingKyc?: boolean;
    kycMessage?: string;
    withdrawalDisabled?: boolean;
    withdrawalMessage?: string;
  };
  tradingData?: {
    positionsPerDay: number;
    pairs: string[];
    platform: string;
    leverage: number;
    currency: string;
  };
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
  phone?: string;
}

export interface Transaction {
  id: string;
  investorId: string;
  type: 'Deposit' | 'Earnings' | 'Withdrawal';
  amount: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  description?: string;
  createdAt: Date;
}

export interface WithdrawalRequest {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
  reason?: string;
}