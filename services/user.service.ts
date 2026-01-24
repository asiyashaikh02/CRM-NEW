
import { ENV } from '../config/env';
import { db } from '../config/firebase';
import { doc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { MOCK_DATA, generateUID } from '../data/mockDb';
import { UserStatus } from '../types';

export const userService = {
  getUsers: async () => {
    if (ENV.USE_FIREBASE) {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(d => d.data());
    }
    return MOCK_DATA.users;
  },

  approveUser: async (uid: string) => {
    if (ENV.USE_FIREBASE) {
      await updateDoc(doc(db, "users", uid), { status: UserStatus.APPROVED });
      // Logic for profile creation would go here
      return;
    }
    
    const user = MOCK_DATA.users.find(u => u.uid === uid);
    if (user) {
      user.status = UserStatus.APPROVED;
      const profile = {
        uid: user.uid,
        uniqueId: generateUID(),
        name: user.displayName,
        email: user.email,
        contact: '',
        address: '',
        role: user.role,
        createdAt: Date.now()
      };
      MOCK_DATA.profiles.push(profile);
    }
  }
};
