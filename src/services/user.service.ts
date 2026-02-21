
import { ENV } from '../config/env';
import { db } from '../config/firebase';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { MOCK_DB } from '../data/mockDb';
import { User, UserStatus } from '../types';

export const userService = {
  getUsers: async () => {
    if (ENV.USE_FIREBASE) {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(d => d.data());
    }
    return MOCK_DB.users;
  },

  approveUser: async (uid: string) => {
    if (ENV.USE_FIREBASE) {
      await updateDoc(doc(db, "users", uid), { status: UserStatus.APPROVED });
      return;
    }
    // Fix: removed second argument as MOCK_DB.approveUser only accepts uid
    MOCK_DB.approveUser(uid);
  },

  updateUser: async (uid: string, data: Partial<User>) => {
    if (ENV.USE_FIREBASE) {
      await updateDoc(doc(db, "users", uid), data as any);
      return;
    }
    MOCK_DB.updateUser(uid, data);
  }
};
