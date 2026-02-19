import { BankAccount } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockBackend = {
  // Simulate banking validation and linking
  linkBankAccount: async (playerId: string, details: BankAccount): Promise<{ success: boolean; message: string }> => {
    await delay(1500); // Network delay
    
    // Basic validation mock
    if (details.routingNumber.length !== 9) return { success: false, message: 'Invalid Routing Number' };
    if (details.accountNumber.length < 8) return { success: false, message: 'Invalid Account Number' };
    
    return { success: true, message: 'Bank Account Linked Successfully' };
  },

  // Simulate High-Risk Payment Gateway Payout
  processPayout: async (playerId: string, amountTokens: number, amountUSD: number): Promise<{ success: boolean; transactionId?: string; message: string }> => {
    await delay(3000); // Simulate processing time with bank
    
    // In a real app, this would hit an API like Segpay or a Crypto bridge
    // Here we simulate success/fail probability
    const isSuccess = Math.random() > 0.05; // 95% success rate simulation

    if (isSuccess) {
        return { 
            success: true, 
            transactionId: `TX-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            message: `$${amountUSD.toFixed(2)} sent to linked bank account.`
        };
    } else {
        return { success: false, message: 'Transaction Declined by Bank: Risk Check Failed' };
    }
  }
};