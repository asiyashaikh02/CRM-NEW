
import { ENV } from '../config/env';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
// Corrected import from MOCK_DATA to MOCK_DB
import { MOCK_DB } from '../data/mockDb';

export const leadService = {
  getLeads: async (userId?: string) => {
    if (ENV.USE_FIREBASE) {
      const col = collection(db, "leads");
      const q = userId ? query(col, where("salesUserId", "==", userId)) : col;
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    // Fixed usage of MOCK_DB registry
    if (userId) return MOCK_DB.leads.filter(l => l.salesUserId === userId);
    return MOCK_DB.leads;
  }
};
