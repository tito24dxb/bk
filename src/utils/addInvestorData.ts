import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const investorData = [
  {
    name: "Omar Ehab",
    country: "Egypt",
    joinDate: "2025-03-15",
    deposit: 1000,
    totalEarnings: 20098.21,
    withdrawals: [], // No completed withdrawals yet
    pendingWithdrawal: {
      amount: 10000,
      method: "Custody wallet (third party custody wallet)",
      status: "pending"
    },
    currentBalance: 11098.21, // 21,098.21 - 10,000 pending withdrawal
    accountStatus: "Active",
    accountFlags: {
      kycPassed: true,
      kycMessage: "KYC verification completed successfully."
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Faissal Walid",
    country: "UAE",
    joinDate: "2024-06-18",
    deposit: 150000,
    totalEarnings: 3122490,
    withdrawals: [
      { amount: 100000, date: "2024-06-18", status: "approved" },
      { amount: 100000, date: "2024-07-18", status: "approved" },
      { amount: 100000, date: "2024-08-17", status: "approved" },
      { amount: 100000, date: "2024-09-16", status: "approved" },
      { amount: 100000, date: "2024-10-16", status: "approved" },
      { amount: 100000, date: "2024-11-30", status: "approved" }
    ],
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Omar Abdel Mustapha",
    country: "Switzerland",
    joinDate: "2024-07-25",
    deposit: 500000,
    totalEarnings: 5829000,
    withdrawals: [
      { amount: 10000, date: "2024-07-25", status: "approved" },
      { amount: 10000, date: "2024-09-08", status: "approved" },
      { amount: 10000, date: "2024-10-23", status: "approved" }
    ],
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Khaled Bin Salman Al Saud",
    country: "Saudi Arabia",
    joinDate: "2024-07-25",
    deposit: 10000,
    additionalDeposit: {
      amount: 1000000,
      date: "2024-10-25"
    },
    totalEarnings: 24198.102,
    withdrawals: [
      { amount: 100000, date: "2024-07-25", status: "approved" },
      { amount: 100000, date: "2024-08-24", status: "approved" },
      { amount: 100000, date: "2024-09-23", status: "approved" },
      { amount: 100000, date: "2024-11-07", status: "approved" },
      { amount: 100000, date: "2024-12-07", status: "approved" }
    ],
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Maxim Elian Debillier",
    country: "France",
    joinDate: "2024-11-15",
    deposit: 1500,
    currency: "EUR",
    totalEarnings: 25392,
    withdrawals: [
      { amount: 1000, date: "2024-11-15", status: "approved" },
      { amount: 1000, date: "2024-12-30", status: "approved" },
      { amount: 1000, date: "2025-02-13", status: "approved" },
      { amount: 1000, date: "2025-03-15", status: "approved" },
      { amount: 2500, date: "2025-04-14", status: "approved" },
      { amount: 5000, date: "2025-05-29", status: "approved" }
    ],
    accountFlags: {
      pendingKyc: true,
      kycMessage: "Please upload your identity documents to complete verification."
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Patricia Guadalupe Perea Mejia",
    country: "Mexico",
    joinDate: "2024-11-01",
    deposit: 3000,
    totalEarnings: 189101,
    withdrawals: [],
    accountStatus: "Restricted for withdrawals (policy violation)",
    accountFlags: {
      policyViolation: true,
      policyViolationMessage: "Account restricted due to suspicious trading patterns. Please contact support.",
      withdrawalDisabled: true,
      withdrawalMessage: "Withdrawals are disabled pending investigation."
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Pamela Medina",
    country: "Mexico",
    joinDate: "2024-10-02",
    deposit: 3000,
    totalEarnings: 149.302,
    withdrawals: [],
    accountStatus: "Restricted for withdrawals (policy violation)",
    accountFlags: {
      policyViolation: true,
      policyViolationMessage: "Account under review for policy compliance.",
      withdrawalDisabled: true
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Rodrigo Alfonso Giles Gomes",
    country: "Mexico",
    joinDate: "2024-10-03",
    deposit: 5000,
    totalEarnings: 118.29,
    withdrawals: [],
    accountStatus: "Restricted for withdrawals (policy violation)",
    accountFlags: {
      policyViolation: true,
      withdrawalDisabled: true
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Alvarez Perez Samantha Veronica",
    country: "Mexico",
    joinDate: "2024-12-10",
    deposit: 5000,
    totalEarnings: 168201,
    withdrawals: [],
    accountStatus: "Restricted for withdrawals (policy violation)",
    accountFlags: {
      policyViolation: true,
      policyViolationMessage: "Multiple policy violations detected. Account under review.",
      withdrawalDisabled: true
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Javier Francisco Perez Aguirre",
    country: "Mexico",
    joinDate: "2024-10-15",
    deposit: 3000,
    totalEarnings: 34650,
    withdrawals: [], // No actual withdrawals processed yet
    withdrawalsAttempts: 2,
    withdrawalsApproved: 0,
    reason: "Bank formalities",
    accountFlags: {
      withdrawalDisabled: true,
      withdrawalMessage: "Withdrawals temporarily disabled due to bank verification issues."
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Judith Aguirre",
    country: "Mexico",
    joinDate: "2024-11-17",
    deposit: 3000,
    totalEarnings: 0,
    withdrawals: [], // No withdrawals - account closed
    withdrawalAttempts: 1,
    withdrawalsApproved: 0,
    accountStatus: "Closed, deposit refunded",
    reason: "Missing documents",
    accountFlags: {
      pendingKyc: true,
      kycMessage: "Account closed due to missing KYC documents."
    },
    positionsPerDay: 0,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Haas Raphael Julien Herreman",
    country: "Mexico",
    joinDate: "2024-11-29",
    deposit: 3000,
    totalEarnings: 35689,
    withdrawals: [], // No actual withdrawals processed
    withdrawalAttempts: 2,
    withdrawalsApproved: 0,
    accountStatus: "Closed - refund in progress",
    reason: "Bank issues",
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Pablo Canales Flores",
    country: "Mexico",
    joinDate: "2025-01-18",
    deposit: 5000,
    totalEarnings: 24729,
    withdrawals: [], // No actual withdrawals processed
    withdrawalAttempts: 2,
    withdrawalsApproved: 0,
    reason: "Bank issues",
    accountFlags: {
      withdrawalDisabled: true,
      withdrawalMessage: "Withdrawals disabled due to ongoing bank verification."
    },
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  },
  {
    name: "Judith Lorena Velazquez Martinez",
    country: "Mexico",
    joinDate: "2025-03-05",
    deposit: 1000,
    totalEarnings: 19201,
    withdrawals: [], // No completed withdrawals yet
    withdrawalAttempts: 1,
    withdrawalsApproved: 0,
    withdrawalInProcess: {
      amount: 10000,
      method: "crypto",
      status: "processing"
    },
    accountStatus: "Active",
    reason: "Withdrawal processing via crypto",
    positionsPerDay: 5,
    pairs: ["XAUUSD", "BTC"],
    platform: "IBKR",
    leverage: 500
  }
];

// Helper function to generate email from name
const generateEmail = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    + '@investor.com';
};

// Helper function to generate password from name
const generatePassword = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '') + '123';
};

// Clear existing data
const clearExistingData = async () => {
  try {
    console.log('🧹 Clearing existing investor data...');
    
    // Clear commissions
    const commissionsSnapshot = await getDocs(collection(db, 'commissions'));
    const commissionDeletePromises = commissionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(commissionDeletePromises);
    console.log(`Deleted ${commissionsSnapshot.docs.length} commission records`);
    
    // Clear transactions
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const transactionDeletePromises = transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(transactionDeletePromises);
    console.log(`Deleted ${transactionsSnapshot.docs.length} transactions`);
    
    // Clear withdrawal requests
    const withdrawalsSnapshot = await getDocs(collection(db, 'withdrawalRequests'));
    const withdrawalDeletePromises = withdrawalsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(withdrawalDeletePromises);
    console.log(`Deleted ${withdrawalsSnapshot.docs.length} withdrawal requests`);
    
    // Clear investor users (keep admin)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const investorDeletePromises = usersSnapshot.docs
      .filter(doc => doc.data().role === 'investor')
      .map(doc => deleteDoc(doc.ref));
    await Promise.all(investorDeletePromises);
    console.log(`Deleted ${investorDeletePromises.length} investor profiles`);
    
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Create transactions for an investor
const createTransactionsForInvestor = async (investorId: string, investor: any) => {
  const transactions = [];
  
  // Initial deposit transaction
  transactions.push({
    investorId,
    type: 'Deposit',
    amount: investor.deposit,
    date: investor.joinDate,
    status: 'Completed',
    description: 'Initial deposit via in-app bank balance',
    createdAt: new Date(investor.joinDate)
  });
  
  // Additional deposit if exists
  if (investor.additionalDeposit) {
    transactions.push({
      investorId,
      type: 'Deposit',
      amount: investor.additionalDeposit.amount,
      date: investor.additionalDeposit.date,
      status: 'Completed',
      description: 'Additional deposit',
      createdAt: new Date(investor.additionalDeposit.date)
    });
  }
  
  // Earnings transaction
  if (investor.totalEarnings > 0) {
    transactions.push({
      investorId,
      type: 'Earnings',
      amount: investor.totalEarnings,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      description: 'Trading earnings',
      createdAt: new Date()
    });
  }
  
  // Withdrawal transactions - using the specific dates and amounts you provided
  if (investor.withdrawals && Array.isArray(investor.withdrawals) && investor.withdrawals.length > 0) {
    console.log(`Creating ${investor.withdrawals.length} withdrawal transactions for ${investor.name}:`);
    
    investor.withdrawals.forEach((withdrawal: any, index: number) => {
      console.log(`  ${index + 1}. ${withdrawal.date}: $${withdrawal.amount.toLocaleString()} (${withdrawal.status})`);
      
      transactions.push({
        investorId,
        type: 'Withdrawal',
        amount: -withdrawal.amount, // Negative for withdrawals
        date: withdrawal.date,
        status: 'Completed',
        description: `Approved withdrawal request #${index + 1} - ${withdrawal.date} - $${withdrawal.amount.toLocaleString()}`,
        createdAt: new Date(withdrawal.date)
      });
    });
  }
  
  // Save all transactions
  for (const transaction of transactions) {
    await addDoc(collection(db, 'transactions'), transaction);
  }
  
  console.log(`✅ Created ${transactions.length} transactions for ${investor.name}`);
  return transactions;
};

// Create commission records for completed withdrawals
const createCommissionRecords = async (investorId: string, investorName: string, investor: any) => {
  if (investor.withdrawals && Array.isArray(investor.withdrawals) && investor.withdrawals.length > 0) {
    console.log(`💰 Creating commission records for ${investorName}...`);
    
    for (const [index, withdrawal] of investor.withdrawals.entries()) {
      const commissionRate = 15; // 15% commission
      const commissionAmount = (withdrawal.amount * commissionRate) / 100;
      
      const commissionRecord = {
        investorId,
        investorName,
        withdrawalAmount: withdrawal.amount,
        commissionRate,
        commissionAmount,
        date: withdrawal.date,
        status: 'Earned',
        createdAt: new Date(withdrawal.date),
        withdrawalId: null, // We don't have withdrawal request IDs for historical data
        description: `Commission from withdrawal #${index + 1} - ${withdrawal.date}`
      };
      
      await addDoc(collection(db, 'commissions'), commissionRecord);
      
      console.log(`   ✅ Commission #${index + 1}: $${commissionAmount.toLocaleString()} from $${withdrawal.amount.toLocaleString()} withdrawal on ${withdrawal.date}`);
    }
    
    const totalCommissions = investor.withdrawals.reduce((sum: number, w: any) => sum + (w.amount * 0.15), 0);
    console.log(`   💰 Total commissions for ${investorName}: $${totalCommissions.toLocaleString()}`);
  }
};

// Create withdrawal requests for investors with attempts
const createWithdrawalRequests = async (investorId: string, investorName: string, investor: any) => {
  // Handle pending withdrawal (specifically for Omar Ehab)
  if (investor.pendingWithdrawal) {
    console.log(`Creating pending withdrawal request for ${investorName}: $${investor.pendingWithdrawal.amount} via ${investor.pendingWithdrawal.method}`);
    await addDoc(collection(db, 'withdrawalRequests'), {
      investorId,
      investorName,
      amount: investor.pendingWithdrawal.amount,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      createdAt: new Date(),
      reason: `Withdrawal via ${investor.pendingWithdrawal.method}`,
      method: investor.pendingWithdrawal.method
    });
  }

  // Handle withdrawal in process (specifically for Judith Lorena Velazquez Martinez)
  if (investor.withdrawalInProcess) {
    console.log(`Creating withdrawal request for ${investorName}: $${investor.withdrawalInProcess.amount} via ${investor.withdrawalInProcess.method}`);
    await addDoc(collection(db, 'withdrawalRequests'), {
      investorId,
      investorName,
      amount: investor.withdrawalInProcess.amount,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      createdAt: new Date(),
      reason: `Processing via ${investor.withdrawalInProcess.method}`,
      method: investor.withdrawalInProcess.method
    });
  }
  
  // Handle regular withdrawal attempts
  if (investor.withdrawalsAttempts || investor.withdrawalAttempts) {
    const attempts = investor.withdrawalsAttempts || investor.withdrawalAttempts || 0;
    
    for (let i = 0; i < attempts; i++) {
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - (attempts - i) * 3);
      
      await addDoc(collection(db, 'withdrawalRequests'), {
        investorId,
        investorName,
        amount: Math.floor(Math.random() * 50000) + 10000, // Random amount between 10k-60k
        date: requestDate.toISOString().split('T')[0],
        status: 'Pending',
        createdAt: requestDate,
        reason: investor.reason || 'Withdrawal request'
      });
    }
  }
};

export const addInvestorData = async () => {
  try {
    console.log('🚀 Starting investor data import...');
    console.log(`📊 Total investors to process: ${investorData.length}`);
    
    // Clear existing data first
    await clearExistingData();
    
    let successCount = 0;
    let errorCount = 0;
    let totalCommissions = 0;
    let totalWithdrawals = 0;
    
    for (let i = 0; i < investorData.length; i++) {
      const investor = investorData[i];
      
      try {
        const email = generateEmail(investor.name);
        const password = generatePassword(investor.name);
        
        console.log(`\n👤 Processing ${i + 1}/${investorData.length}: ${investor.name}`);
        console.log(`📧 Email: ${email}`);
        
        // Generate a unique ID for Firestore (avoid auth conflicts)
        const userId = 'investor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Calculate current balance - subtract actual completed withdrawals and pending withdrawals
        const totalDeposit = investor.deposit + (investor.additionalDeposit?.amount || 0);
        
        // Calculate total withdrawn from the specific withdrawal data
        let totalWithdrawn = 0;
        if (investor.withdrawals && Array.isArray(investor.withdrawals)) {
          totalWithdrawn = investor.withdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
          totalWithdrawals += totalWithdrawn;
          console.log(`💸 ${investor.name} withdrawals: ${investor.withdrawals.length} transactions totaling $${totalWithdrawn.toLocaleString()}`);
        }
        
        // Calculate current balance based on provided data
        let currentBalance;
        if (investor.currentBalance !== undefined) {
          // Use the provided current balance (like for Omar Ehab)
          currentBalance = investor.currentBalance;
          console.log(`💰 Using provided balance for ${investor.name}: $${currentBalance.toLocaleString()}`);
        } else {
          // Calculate balance for other investors
          currentBalance = totalDeposit + investor.totalEarnings - totalWithdrawn;
          
          // For Judith Lorena Velazquez Martinez, subtract the withdrawal in process from current balance
          if (investor.withdrawalInProcess) {
            currentBalance -= investor.withdrawalInProcess.amount;
            console.log(`💰 Balance calculation for ${investor.name}:`);
            console.log(`   Deposit: $${totalDeposit.toLocaleString()}`);
            console.log(`   Earnings: $${investor.totalEarnings.toLocaleString()}`);
            console.log(`   Withdrawn: $${totalWithdrawn.toLocaleString()}`);
            console.log(`   In Process: $${investor.withdrawalInProcess.amount.toLocaleString()}`);
            console.log(`   Final Balance: $${currentBalance.toLocaleString()}`);
          }
        }
        
        // Create investor profile in Firestore
        const investorProfile = {
          name: investor.name,
          email: email,
          country: investor.country,
          joinDate: investor.joinDate,
          initialDeposit: investor.deposit,
          currentBalance: Math.max(0, currentBalance), // Ensure non-negative
          role: 'investor',
          isActive: !investor.accountStatus?.includes('Closed'),
          accountStatus: investor.accountStatus || 'Active',
          accountFlags: investor.accountFlags || {},
          tradingData: {
            positionsPerDay: investor.positionsPerDay,
            pairs: investor.pairs,
            platform: investor.platform,
            leverage: investor.leverage,
            currency: investor.currency || 'USD'
          },
          createdAt: new Date(investor.joinDate),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', userId), investorProfile);
        console.log(`✅ Profile created in Firestore with ID: ${userId}`);
        
        // Create transactions
        await createTransactionsForInvestor(userId, investor);
        
        // Create commission records for completed withdrawals
        await createCommissionRecords(userId, investor.name, investor);
        
        // Calculate commissions for this investor
        if (investor.withdrawals && Array.isArray(investor.withdrawals)) {
          const investorCommissions = investor.withdrawals.reduce((sum: number, w: any) => sum + (w.amount * 0.15), 0);
          totalCommissions += investorCommissions;
        }
        
        // Create withdrawal requests if applicable
        await createWithdrawalRequests(userId, investor.name, investor);
        
        successCount++;
        console.log(`✅ ${investor.name} - Complete! (${successCount}/${investorData.length})`);
        
        // Add a small delay to avoid overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error(`❌ Error processing ${investor.name}:`, error.message);
        console.error('Full error:', error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total investors: ${investorData.length}`);
    console.log(`💰 Total commissions created: $${totalCommissions.toLocaleString()}`);
    console.log(`💸 Total withdrawals processed: $${totalWithdrawals.toLocaleString()}`);
    
    // Calculate and display summary statistics
    const totalDeposits = investorData.reduce((sum, inv) => sum + inv.deposit + (inv.additionalDeposit?.amount || 0), 0);
    const totalEarnings = investorData.reduce((sum, inv) => sum + inv.totalEarnings, 0);
    
    console.log(`\n📈 Summary Statistics:`);
    console.log(`💰 Total Deposits: $${totalDeposits.toLocaleString()}`);
    console.log(`📈 Total Earnings: $${totalEarnings.toLocaleString()}`);
    console.log(`💸 Total Completed Withdrawals: $${totalWithdrawals.toLocaleString()}`);
    console.log(`💼 Total Commissions (15%): $${totalCommissions.toLocaleString()}`);
    console.log(`🏦 Current AUM: $${(totalDeposits + totalEarnings - totalWithdrawals).toLocaleString()}`);
    
    // Display detailed withdrawal summary by investor
    console.log(`\n💸 Detailed Withdrawal Summary:`);
    investorData.forEach(inv => {
      if (inv.withdrawals && Array.isArray(inv.withdrawals) && inv.withdrawals.length > 0) {
        const totalWithdrawn = inv.withdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
        const commissions = totalWithdrawn * 0.15;
        console.log(`\n🏦 ${inv.name}:`);
        console.log(`   📊 ${inv.withdrawals.length} withdrawals totaling $${totalWithdrawn.toLocaleString()}`);
        console.log(`   💰 Commission earned: $${commissions.toLocaleString()}`);
        
        // Log individual withdrawals for verification
        inv.withdrawals.forEach((w: any, index: number) => {
          console.log(`     ${index + 1}. ${w.date}: $${w.amount.toLocaleString()} (${w.status})`);
        });
      }
      
      // Log pending withdrawals
      if (inv.pendingWithdrawal) {
        console.log(`\n⏳ ${inv.name} - Pending Withdrawal:`);
        console.log(`   💰 Amount: $${inv.pendingWithdrawal.amount.toLocaleString()}`);
        console.log(`   🔄 Method: ${inv.pendingWithdrawal.method}`);
        console.log(`   📊 Status: ${inv.pendingWithdrawal.status}`);
      }
    });
    
    // Force page reload to refresh data
    console.log('\n🔄 Refreshing page to display new data...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return {
      success: true,
      successCount,
      errorCount,
      totalProcessed: investorData.length,
      totalCommissions,
      totalWithdrawals
    };
    
  } catch (error: any) {
    console.error('❌ Fatal error during import:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Make function available globally for console access
(window as any).addInvestorData = addInvestorData;

// Auto-run on import (for development)
console.log('🔧 Investor data import utility loaded');
console.log('💡 Run addInvestorData() in console or click the button to import data');