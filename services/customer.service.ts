
import { ENV } from '../config/env';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { MOCK_DATA } from '../data/mockDb';

export const customerService = {
  getCustomers: async (userId?: string) => {
    if (ENV.USE_FIREBASE) {
      const col = collection(db, "customers");
      const q = userId ? query(col, where("salesUserId", "==", userId)) : col;
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    if (userId) return MOCK_DATA.customers.filter(c => c.salesUserId === userId);
    return MOCK_DATA.customers;
  }
};
