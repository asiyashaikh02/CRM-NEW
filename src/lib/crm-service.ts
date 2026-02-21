import { 
  collection, doc, addDoc, updateDoc, onSnapshot, query, where, 
  orderBy, serverTimestamp, Timestamp, getDoc, setDoc, writeBatch,
  limit, startAfter, getDocs, FieldValue
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  UserProfile, Lead, Order, Payment, Notification, 
  PlanType, PlanStatus, LeadStatus, OrderStatus, 
  PaymentStatus, ClearanceStatus, TimelineEntry, UserRole
} from '../types';

// --- User Service ---
export const userService = {
  async createUserProfile(uid: string, data: Partial<UserProfile>) {
    const trialDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now();
    
    const profile: UserProfile = {
      uid,
      name: data.name || '',
      displayName: data.displayName || data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || UserRole.SALES_USER,
      department: data.department || 'sales',
      isActive: true,
      status: data.status || 'PENDING' as any,
      planType: PlanType.TRIAL,
      planStatus: PlanStatus.ACTIVE,
      trialStartAt: Timestamp.fromMillis(now),
      trialEndAt: Timestamp.fromMillis(now + trialDuration),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
      isProfileComplete: false,
    };
    
    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  },

  subscribeToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Check for trial expiry
        if (data.planType === PlanType.TRIAL && data.planStatus === PlanStatus.ACTIVE) {
          const end = data.trialEndAt?.toMillis() || 0;
          if (Date.now() > end) {
            // In a real app, this would be a Cloud Function
            updateDoc(doc(db, 'users', uid), { 
              planStatus: PlanStatus.EXPIRED,
              updatedAt: serverTimestamp()
            });
          }
        }
        callback(data);
      } else {
        callback(null);
      }
    });
  }
};

// --- Lead Service ---
export const leadService = {
  async createLead(data: Partial<Lead>, userId: string, userName: string) {
    const leadRef = collection(db, 'leads');
    const newLead = {
      ...data,
      createdBy: userId,
      status: LeadStatus.DRAFT,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    };
    
    const docRef = await addDoc(leadRef, newLead);
    await this.addTimelineEntry(docRef.id, 'CREATED', 'Lead initialized in pipeline.', userId, userName);
    return docRef.id;
  },

  async addTimelineEntry(leadId: string, action: string, remarks: string, userId: string, userName: string) {
    const timelineRef = collection(db, 'leads', leadId, 'timeline');
    await addDoc(timelineRef, {
      action,
      remarks,
      userId,
      userName,
      createdAt: serverTimestamp(),
    });
  },

  subscribeToLeads(role: UserRole, userId: string, callback: (leads: Lead[]) => void) {
    let q;
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
      q = query(collection(db, 'leads'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    } else if (role === UserRole.SALES_ADMIN) {
      q = query(collection(db, 'leads'), where('salesAdminId', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'leads'), where('createdBy', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    }
    
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    });
  }
};

// --- Order Service ---
export const orderService = {
  subscribeToOrders(role: UserRole, userId: string, callback: (orders: Order[]) => void) {
    let q;
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.OPS_ADMIN) {
      q = query(collection(db, 'orders'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    } else if (role === UserRole.OPS_USER) {
      q = query(collection(db, 'orders'), where('opsUserId', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'orders'), where('salesUserId', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    }
    
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
  },

  async updateStatus(orderId: string, status: OrderStatus, userId: string, userName: string) {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
    await this.addTimelineEntry(orderId, 'STATUS_UPDATE', `Order transitioned to ${status}`, userId, userName);
  },

  async addTimelineEntry(orderId: string, action: string, remarks: string, userId: string, userName: string) {
    const timelineRef = collection(db, 'orders', orderId, 'timeline');
    await addDoc(timelineRef, {
      action,
      remarks,
      userId,
      userName,
      createdAt: serverTimestamp(),
    });
  },

  subscribeToTimeline(orderId: string, callback: (entries: any[]) => void) {
    const q = query(collection(db, 'orders', orderId, 'timeline'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async sendMessage(orderId: string, message: string, userId: string, userName: string, type: 'TEXT' | 'IMAGE' = 'TEXT', imageUrl?: string) {
    const chatRef = collection(db, 'orders', orderId, 'chat');
    await addDoc(chatRef, {
      orderId,
      senderId: userId,
      senderName: userName,
      message,
      type,
      imageUrl,
      createdAt: serverTimestamp(),
    });
  },

  subscribeToChat(orderId: string, callback: (messages: any[]) => void) {
    const q = query(collection(db, 'orders', orderId, 'chat'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }
};

// --- Payment Service ---
export const paymentService = {
  async createPayment(data: Partial<Payment>, userId: string) {
    const paymentRef = collection(db, 'payments');
    const newPayment = {
      ...data,
      status: PaymentStatus.PENDING,
      clearanceStatus: data.mode === 'CHEQUE' ? ClearanceStatus.PENDING : ClearanceStatus.CLEARED,
      uploadedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    };
    
    const docRef = await addDoc(paymentRef, newPayment);
    return docRef.id;
  },

  async verifyPayment(paymentId: string, status: PaymentStatus, clearance: ClearanceStatus, userId: string) {
    const batch = writeBatch(db);
    const paymentRef = doc(db, 'payments', paymentId);
    
    batch.update(paymentRef, {
      status,
      clearanceStatus: clearance,
      verifiedBy: userId,
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clearedAt: clearance === ClearanceStatus.CLEARED ? serverTimestamp() : null,
    });
    
    const snap = await getDoc(paymentRef);
    if (snap.exists() && clearance === ClearanceStatus.CLEARED) {
      const orderId = snap.data().orderId;
      batch.update(doc(db, 'orders', orderId), {
        status: OrderStatus.PAYMENT_RECEIVED,
        updatedAt: serverTimestamp(),
      });
    }
    
    await batch.commit();
  },

  subscribeToPayments(callback: (payments: Payment[]) => void) {
    const q = query(collection(db, 'payments'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
    });
  }
};

// --- Notification Service ---
export const notificationService = {
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'), 
      where('toUserId', '==', userId), 
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
  },

  async markAsRead(notificationId: string) {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  }
};
