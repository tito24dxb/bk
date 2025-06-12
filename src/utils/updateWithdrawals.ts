import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Withdrawal data for specific investors
const withdrawalUpdates = [
  {
    name: "Rodrigo Alfonso Giles Gomes",
    depositDate: "2024-10-03",
    depositAmount: 5000,
    accountStatus: "Restricted for withdrawals (policy violation)",
    withdrawals: [
      {
        date: "2024-12-10",
        amount: 50000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      },
      {
        date: "2025-01-26",
        amount: 50000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      },
      {
        date: "2025-03-26",
        amount: 50000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      },
      {
        date: "2025-04-26",
        amount: 50000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      }
    ]
  },
  {
    name: "Haas Raphael Julien Herreman",
    depositDate: "2024-11-30",
    depositAmount: 3000,
    accountStatus: "Restricted for withdrawals (policy violation)",
    withdrawals: [
      {
        date: "2025-01-08",
        amount: 11016,
        reason: "MCP bank returned, exceed max deposit amount",
        status: "Rejected"
      },
      {
        date: "2025-02-26",
        amount: 11016,
        reason: "MCP bank returned, exceed max deposit amount",
        status: "Rejected"
      },
      {
        date: "2025-04-26",
        amount: 11016,
        reason: "MCP bank returned, exceed max deposit amount",
        status: "Rejected"
      }
    ]
  },
  {
    name: "Pamela Medina",
    depositDate: "2024-10-02",
    depositAmount: 3000,
    accountStatus: "Restricted for withdrawals (policy violation)",
    withdrawals: [
      {
        date: "2024-12-25",
        amount: 5000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      },
      {
        date: "2025-01-28",
        amount: 5000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      }
    ]
  },
  {
    name: "Patricia Guadalupe Perea Mejia",
    depositDate: "2024-09-30",
    depositAmount: 3000,
    accountStatus: "Restricted for withdrawals (policy violation)",
    withdrawals: [
      {
        date: "2024-12-25",
        amount: 5000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      },
      {
        date: "2025-01-28",
        amount: 5000,
        reason: "Third party account withdrawal violation",
        status: "Rejected"
      }
    ]
  },
  {
    name: "Javier Francisco Perez Aguirre",
    depositDate: "2024-10-15",
    depositAmount: 3000,
    accountStatus: "Closed - refund in progress",
    refundAmount: 28165.78,
    withdrawals: [
      {
        date: "2024-12-29",
        amount: 10000, // Estimated amount
        reason: "Rejected by bank",
        status: "Rejected"
      },
      {
        date: "2025-01-27",
        amount: 10000, // Estimated amount
        reason: "Rejected by bank",
        status: "Rejected"
      },
      {
        date: "2025-02-25",
        amount: 10000, // Estimated amount
        reason: "Rejected by bank",
        status: "Rejected"
      }
    ]
  },
  {
    name: "Pablo Canales Flores",
    depositDate: "2025-01-16",
    depositAmount: 5000,
    accountStatus: "Restricted for withdrawals (bank issues)",
    withdrawals: [
      {
        date: "2025-03-05",
        amount: 1000,
        reason: "Customer bank returned as unprecedented",
        status: "Rejected"
      },
      {
        date: "2025-04-03",
        amount: 1000,
        reason: "Customer bank returned as unprecedented",
        status: "Rejected"
      },
      {
        date: "2025-04-26",
        amount: 1000,
        reason: "Token timed out",
        status: "Rejected"
      }
    ]
  }
];

// Helper function to add days to a date
const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Helper function to find investor by name
const findInvestorByName = async (name: string) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '==', name), where('role', '==', 'investor'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding investor ${name}:`, error);
    return null;
  }
};

// Main function to update withdrawal records
export const updateWithdrawalRecords = async () => {
  try {
    console.log('🚀 Starting withdrawal records update...');
    console.log(`📊 Processing ${withdrawalUpdates.length} investors`);
    
    let successCount = 0;
    let errorCount = 0;
    let totalWithdrawalsAdded = 0;
    
    for (const investorUpdate of withdrawalUpdates) {
      try {
        console.log(`\n👤 Processing: ${investorUpdate.name}`);
        
        // Find the investor in Firebase
        const investor = await findInvestorByName(investorUpdate.name);
        
        if (!investor) {
          console.error(`❌ Investor not found: ${investorUpdate.name}`);
          errorCount++;
          continue;
        }
        
        console.log(`✅ Found investor: ${investor.id}`);
        
        // Update account status if provided
        if (investorUpdate.accountStatus) {
          const userRef = doc(db, 'users', investor.id);
          await updateDoc(userRef, {
            accountStatus: investorUpdate.accountStatus,
            updatedAt: new Date()
          });
          console.log(`📝 Updated account status: ${investorUpdate.accountStatus}`);
        }
        
        // Add withdrawal requests
        for (const [index, withdrawal] of investorUpdate.withdrawals.entries()) {
          const requestDate = withdrawal.date;
          const processedDate = addDays(requestDate, 5); // Process 5 days after request
          
          // Create withdrawal request
          const withdrawalRequest = {
            investorId: investor.id,
            investorName: investorUpdate.name,
            amount: withdrawal.amount,
            date: requestDate,
            status: withdrawal.status,
            reason: withdrawal.reason,
            createdAt: new Date(requestDate),
            processedAt: new Date(processedDate),
            processedBy: 'system' // Automated rejection
          };
          
          await addDoc(collection(db, 'withdrawalRequests'), withdrawalRequest);
          
          console.log(`   💸 Added withdrawal #${index + 1}: ${requestDate} - $${withdrawal.amount.toLocaleString()} (${withdrawal.status})`);
          console.log(`      📅 Processed: ${processedDate}`);
          console.log(`      📝 Reason: ${withdrawal.reason}`);
          
          totalWithdrawalsAdded++;
        }
        
        // Special handling for Javier Francisco (account closure)
        if (investorUpdate.refundAmount) {
          console.log(`💰 Refund amount noted: $${investorUpdate.refundAmount.toLocaleString()}`);
          
          // Update investor record with refund information
          const userRef = doc(db, 'users', investor.id);
          await updateDoc(userRef, {
            accountStatus: investorUpdate.accountStatus,
            refundAmount: investorUpdate.refundAmount,
            refundDate: "2025-05-28",
            updatedAt: new Date()
          });
        }
        
        successCount++;
        console.log(`✅ ${investorUpdate.name} - Complete! (${successCount}/${withdrawalUpdates.length})`);
        
        // Small delay to avoid overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error: any) {
        console.error(`❌ Error processing ${investorUpdate.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Withdrawal records update completed!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total investors processed: ${withdrawalUpdates.length}`);
    console.log(`💸 Total withdrawal requests added: ${totalWithdrawalsAdded}`);
    
    // Summary by investor
    console.log(`\n📋 Summary by Investor:`);
    withdrawalUpdates.forEach(inv => {
      console.log(`\n🏦 ${inv.name}:`);
      console.log(`   📅 Deposit: ${inv.depositDate} - $${inv.depositAmount.toLocaleString()}`);
      console.log(`   📊 Status: ${inv.accountStatus}`);
      console.log(`   💸 Withdrawal attempts: ${inv.withdrawals.length}`);
      
      inv.withdrawals.forEach((w, index) => {
        console.log(`     ${index + 1}. ${w.date}: $${w.amount.toLocaleString()} - ${w.status}`);
        console.log(`        📝 ${w.reason}`);
      });
      
      if (inv.refundAmount) {
        console.log(`   💰 Refund: $${inv.refundAmount.toLocaleString()}`);
      }
    });
    
    // Force page reload to refresh data
    console.log('\n🔄 Refreshing page to display updated data...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return {
      success: true,
      successCount,
      errorCount,
      totalProcessed: withdrawalUpdates.length,
      totalWithdrawalsAdded
    };
    
  } catch (error: any) {
    console.error('❌ Fatal error during withdrawal records update:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Make function available globally for console access
(window as any).updateWithdrawalRecords = updateWithdrawalRecords;

// Auto-load message
console.log('🔧 Withdrawal records update utility loaded');
console.log('💡 Run updateWithdrawalRecords() in console to update withdrawal data');