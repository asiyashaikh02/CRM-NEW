
import { ENV } from '../config/env';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { MOCK_DB } from '../data/mockDb';
import { Customer, OpsStatus, WorkStatus, InvoiceStatus, Invoice, ExecutionStage, PaymentMode, User } from '../types';

export const customerService = {
  getCustomers: async (userId?: string, role?: string) => {
    if (ENV.USE_FIREBASE) {
      const col = collection(db, "customers");
      let q = query(col);
      if (userId) {
        if (role === 'SALES') q = query(col, where("salesId", "==", userId));
        else if (role === 'OPERATIONS') q = query(col, where("opsId", "==", userId));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    MOCK_DB.checkDeadlines();
    if (userId) {
      if (role === 'SALES') return MOCK_DB.customers.filter(c => c.salesId === userId);
      if (role === 'OPERATIONS') return MOCK_DB.customers.filter(c => c.opsId === userId);
    }
    return MOCK_DB.customers;
  },

  recordPayment: async (customerId: string, data: { amount: number, invoiceId: string, mode: PaymentMode, reference: string }, creator: User) => {
    if (ENV.USE_FIREBASE) return null;
    return MOCK_DB.recordPayment(customerId, data.invoiceId, data.amount, data.mode, data.reference, creator);
  },

  completeTask: async (customerId: string, taskId: string, proofs: string[], creator: User) => {
    if (ENV.USE_FIREBASE) return false;
    return MOCK_DB.completeTask(customerId, taskId, proofs, creator);
  },

  convertLead: async (leadId: string, data: { 
    userId: string; 
    userName: string;
    billingAmount?: number;
    gstApplied?: boolean;
    advanceRequired?: number;
  }) => {
    if (ENV.USE_FIREBASE) return null;
    return MOCK_DB.convertLead(leadId, data);
  },

  updateCustomer: async (customerId: string, data: Partial<Customer>, userId: string, userName: string) => {
    if (ENV.USE_FIREBASE) return;
    MOCK_DB.updateCustomer(customerId, data, userId, userName);
  },

  opsAction: async (customerId: string, action: 'ACCEPT' | 'REJECT', userId: string, userName: string, reason?: string) => {
    if (ENV.USE_FIREBASE) return;
    const update = action === 'ACCEPT' 
      ? { opsStatus: OpsStatus.ACCEPTED, workStatus: WorkStatus.ACCEPTED } 
      : { opsStatus: OpsStatus.REJECTED, rejectionReason: reason };
    
    MOCK_DB.updateCustomer(customerId, update as any, userId, userName);
    MOCK_DB.addActivityLog(customerId, {
      action: action === 'ACCEPT' ? 'OPS_ACCEPTED' : 'OPS_REJECTED',
      note: action === 'ACCEPT' ? `Task accepted by ${userName}` : `Task rejected by ${userName}. Reason: ${reason}`,
      userId,
      userName
    });
  }
};
