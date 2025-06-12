import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  setDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Investor, Transaction, WithdrawalRequest } from '../types/user';
import { Commission } from '../hooks/useCommissions';

export class FirestoreService {
  // Investors
  static async getInvestors(): Promise<Investor[]> {
    try {
      console.log('Interactive Brokers API: Fetching investors...');
      const investorsRef = collection(db, 'users');
      const q = query(investorsRef, where('role', '==', 'investor'));
      const querySnapshot = await getDocs(q);
      
      const investors = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Investor[];
      
      console.log('Interactive Brokers API: Retrieved', investors.length, 'investors');
      return investors;
    } catch (error) {
      console.error('Interactive Brokers API: Get investors error:', error);
      return [];
    }
  }

  static async getInvestorById(id: string): Promise<Investor | null> {
    try {
      console.log('Interactive Brokers API: Fetching investor by ID:', id);
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const investor = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Investor;
        
        console.log('Interactive Brokers API: Found investor:', investor.name);
        return investor;
      }
      
      console.log('Interactive Brokers API: Investor not found');
      return null;
    } catch (error) {
      console.error('Interactive Brokers API: Get investor by ID error:', error);
      return null;
    }
  }

  static async createInvestor(investorId: string, investorData: any): Promise<void> {
    try {
      console.log('Interactive Brokers API: Creating investor:', investorId, investorData);
      const docRef = doc(db, 'users', investorId);
      await setDoc(docRef, investorData);
      console.log('Interactive Brokers API: Investor created successfully');
    } catch (error) {
      console.error('Interactive Brokers API: Create investor error:', error);
      throw error;
    }
  }

  static async updateInvestor(investorId: string, updateData: Partial<Investor>): Promise<void> {
    try {
      console.log('Interactive Brokers API: Updating investor:', investorId, updateData);
      const docRef = doc(db, 'users', investorId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
      console.log('Interactive Brokers API: Investor updated successfully');
    } catch (error) {
      console.error('Interactive Brokers API: Update investor error:', error);
      throw error;
    }
  }

  static async updateInvestorBalance(investorId: string, newBalance: number): Promise<void> {
    try {
      console.log('Interactive Brokers API: Updating balance for investor:', investorId, 'to:', newBalance);
      const docRef = doc(db, 'users', investorId);
      await updateDoc(docRef, {
        currentBalance: newBalance,
        updatedAt: new Date()
      });
      console.log('Interactive Brokers API: Balance updated successfully');
    } catch (error) {
      console.error('Interactive Brokers API: Update investor balance error:', error);
      throw error;
    }
  }

  // Transactions
  static async getTransactions(investorId?: string): Promise<Transaction[]> {
    try {
      console.log('Interactive Brokers API: Fetching transactions...', investorId ? `for investor ${investorId}` : 'all');
      const transactionsRef = collection(db, 'transactions');
      
      let querySnapshot;
      if (investorId) {
        // Fetch transactions for specific investor without ordering to avoid index requirement
        const q = query(transactionsRef, where('investorId', '==', investorId));
        querySnapshot = await getDocs(q);
      } else {
        // For all transactions, use orderBy only
        const q = query(transactionsRef, orderBy('createdAt', 'desc'));
        querySnapshot = await getDocs(q);
      }
      
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Transaction[];
      
      // Sort transactions client-side when filtering by investorId
      if (investorId) {
        transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      console.log('Interactive Brokers API: Retrieved', transactions.length, 'transactions');
      return transactions;
    } catch (error) {
      console.error('Interactive Brokers API: Get transactions error:', error);
      throw error;
    }
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Interactive Brokers API: Adding transaction:', transaction);
      const transactionsRef = collection(db, 'transactions');
      const docRef = await addDoc(transactionsRef, {
        ...transaction,
        createdAt: new Date()
      });
      
      console.log('Interactive Brokers API: Transaction added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Interactive Brokers API: Add transaction error:', error);
      throw error;
    }
  }

  // Withdrawal Requests
  static async getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    try {
      console.log('Interactive Brokers API: Fetching withdrawal requests...');
      const withdrawalsRef = collection(db, 'withdrawalRequests');
      const q = query(withdrawalsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const withdrawalRequests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          processedAt: data.processedAt?.toDate(),
        };
      }) as WithdrawalRequest[];
      
      console.log('Interactive Brokers API: Retrieved', withdrawalRequests.length, 'withdrawal requests');
      return withdrawalRequests;
    } catch (error) {
      console.error('Interactive Brokers API: Get withdrawal requests error:', error);
      return [];
    }
  }

  static async addWithdrawalRequest(
    investorId: string, 
    investorName: string, 
    amount: number
  ): Promise<string> {
    try {
      console.log('Interactive Brokers API: Adding withdrawal request for:', investorName, 'amount:', amount);
      const withdrawalsRef = collection(db, 'withdrawalRequests');
      const docRef = await addDoc(withdrawalsRef, {
        investorId,
        investorName,
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        createdAt: new Date()
      });
      
      console.log('Interactive Brokers API: Withdrawal request added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Interactive Brokers API: Add withdrawal request error:', error);
      throw error;
    }
  }

  static async updateWithdrawalRequest(
    requestId: string, 
    status: 'Approved' | 'Rejected',
    processedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log('Interactive Brokers API: Updating withdrawal request:', requestId, 'status:', status);
      
      // Get the withdrawal request details first
      const withdrawalRef = doc(db, 'withdrawalRequests', requestId);
      const withdrawalSnap = await getDoc(withdrawalRef);
      
      if (!withdrawalSnap.exists()) {
        throw new Error('Withdrawal request not found');
      }
      
      const withdrawalData = withdrawalSnap.data();
      
      // Update the withdrawal request
      const updateData: any = {
        status,
        processedAt: new Date(),
        processedBy
      };
      
      if (reason) {
        updateData.reason = reason;
      }
      
      await updateDoc(withdrawalRef, updateData);
      
      // If approved, create commission record
      if (status === 'Approved') {
        await this.createCommissionRecord(
          withdrawalData.investorId,
          withdrawalData.investorName,
          withdrawalData.amount,
          requestId
        );
      }
      
      console.log('Interactive Brokers API: Withdrawal request updated successfully');
    } catch (error) {
      console.error('Interactive Brokers API: Update withdrawal request error:', error);
      throw error;
    }
  }

  // Commission Management
  static async createCommissionRecord(
    investorId: string,
    investorName: string,
    withdrawalAmount: number,
    withdrawalId?: string
  ): Promise<void> {
    try {
      console.log('Interactive Brokers API: Creating commission record for withdrawal:', withdrawalAmount);
      
      const commissionRate = 15; // 15% commission
      const commissionAmount = (withdrawalAmount * commissionRate) / 100;
      
      const commissionsRef = collection(db, 'commissions');
      await addDoc(commissionsRef, {
        investorId,
        investorName,
        withdrawalAmount,
        commissionRate,
        commissionAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'Earned',
        createdAt: new Date(),
        withdrawalId: withdrawalId || null
      });
      
      console.log('Interactive Brokers API: Commission record created:', commissionAmount);
    } catch (error) {
      console.error('Interactive Brokers API: Create commission record error:', error);
      throw error;
    }
  }

  static async getCommissions(): Promise<Commission[]> {
    try {
      console.log('Interactive Brokers API: Fetching commissions...');
      const commissionsRef = collection(db, 'commissions');
      const q = query(commissionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const commissions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Commission[];
      
      console.log('Interactive Brokers API: Retrieved', commissions.length, 'commission records');
      return commissions;
    } catch (error) {
      console.error('Interactive Brokers API: Get commissions error:', error);
      return [];
    }
  }

  // Commission Withdrawal Requests
  static async addCommissionWithdrawalRequest(requestData: {
    adminId: string;
    adminName: string;
    amount: number;
    accountDetails: any;
    requestDate: string;
    status: string;
  }): Promise<string> {
    try {
      console.log('Interactive Brokers API: Adding commission withdrawal request:', requestData);
      const withdrawalsRef = collection(db, 'commissionWithdrawals');
      const docRef = await addDoc(withdrawalsRef, {
        ...requestData,
        createdAt: new Date()
      });
      
      console.log('Interactive Brokers API: Commission withdrawal request added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Interactive Brokers API: Add commission withdrawal request error:', error);
      throw error;
    }
  }

  static async getCommissionWithdrawalRequests(): Promise<any[]> {
    try {
      console.log('Interactive Brokers API: Fetching commission withdrawal requests...');
      const withdrawalsRef = collection(db, 'commissionWithdrawals');
      const q = query(withdrawalsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const requests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          processedAt: data.processedAt?.toDate(),
        };
      });
      
      console.log('Interactive Brokers API: Retrieved', requests.length, 'commission withdrawal requests');
      return requests;
    } catch (error) {
      console.error('Interactive Brokers API: Get commission withdrawal requests error:', error);
      return [];
    }
  }

  // Performance Data
  static async getPerformanceData(period: 'daily' | 'weekly' | 'monthly') {
    try {
      console.log('Interactive Brokers API: Getting performance data for period:', period);
      // This would typically be calculated from transactions
      // For now, return empty array as we're transitioning from mock data
      return [];
    } catch (error) {
      console.error('Interactive Brokers API: Get performance data error:', error);
      return [];
    }
  }

  // Add credit to investor
  static async addCreditToInvestor(
    investorId: string, 
    amount: number, 
    adminId: string
  ): Promise<void> {
    try {
      console.log('Interactive Brokers API: Adding credit to investor:', investorId, 'amount:', amount);
      
      // Get current investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) throw new Error('Investor not found');

      // Update balance
      const newBalance = investor.currentBalance + amount;
      await this.updateInvestorBalance(investorId, newBalance);

      // Add transaction record
      await this.addTransaction({
        investorId,
        type: 'Deposit',
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        description: `Credit added by admin (${adminId})`
      });
      
      console.log('Interactive Brokers API: Credit added successfully');
    } catch (error) {
      console.error('Interactive Brokers API: Add credit to investor error:', error);
      throw error;
    }
  }
}