
import { ENV } from '../config/env';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { MOCK_DATA } from '../data/mockDb';

export const leadService = {
  getLeads: async (userId?: string) => {
    if (ENV.USE_FIREBASE) {
      const col = collection(db, "leads");
      const q = userId ? query(col, where("salesUserId", "==", userId)) : col;
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    if (userId) return MOCK_DATA.leads.filter(l => l.salesUserId === userId);
    return MOCK_DATA.leads;
  }
};
