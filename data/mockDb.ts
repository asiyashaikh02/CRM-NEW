
import { User, Lead, Customer, UserRole, UserStatus, LeadStatus, LeadSource, CustomerStatus, ExecutionStage, Location, OpsStatus, WorkStatus, ActivityLog, LeadPriority, Invoice, InvoiceType, InvoiceStatus, Receipt, Payment, PaymentMode, Task, Proof, AuthStatus, ProfileStatus } from '../types';

export const generateUniqueSystemID = () => `UID-${Math.floor(10000 + Math.random() * 90000)}`;
export const generatePaymentID = () => `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
export const generateReceiptID = () => `REC-${Math.floor(100000 + Math.random() * 900000)}`;

const INITIAL_USERS: User[] = [
  {
    uid: 'admin-uid',
    email: 'admin@gmail.com',
    displayName: 'Master Administrator',
    role: UserRole.MASTER_ADMIN,
    authStatus: AuthStatus.ACTIVE,
    profileStatus: ProfileStatus.COMPLETED,
    status: UserStatus.APPROVED,
    mobile: '9999999999',
    profileCompleted: true,
    createdAt: Date.now() - 86400000 * 30,
    location: { address: 'Main Hub', city: 'Mumbai', state: 'MH', pincode: '400001' }
  },
  {
    uid: 'sales-uid',
    email: 'sales@gmail.com',
    displayName: 'Sales Representative',
    role: UserRole.SALES,
    authStatus: AuthStatus.ACTIVE,
    profileStatus: ProfileStatus.COMPLETED,
    status: UserStatus.APPROVED,
    mobile: '8888888888',
    profileCompleted: true,
    createdAt: Date.now() - 86400000 * 20,
    location: { address: 'East Wing', city: 'Mumbai', state: 'MH', pincode: '400002' }
  },
  {
    uid: 'ops-uid',
    email: 'ops@gmail.com',
    displayName: 'Operations Manager',
    role: UserRole.OPERATIONS,
    authStatus: AuthStatus.ACTIVE,
    profileStatus: ProfileStatus.COMPLETED,
    status: UserStatus.APPROVED,
    mobile: '7777777777',
    profileCompleted: true,
    createdAt: Date.now() - 86400000 * 10,
    location: { address: 'West Wing', city: 'Pune', state: 'MH', pincode: '411001' }
  },
  {
    uid: 'pending-user-uid',
    email: 'user1@gmail.com',
    displayName: 'New Applicant',
    role: UserRole.SALES,
    authStatus: AuthStatus.UNVERIFIED,
    profileStatus: ProfileStatus.NOT_STARTED,
    status: UserStatus.PENDING,
    mobile: '6666666666',
    profileCompleted: false,
    createdAt: Date.now()
  }
];

export const MOCK_DB = {
  users: [...INITIAL_USERS] as User[],
  leads: [] as Lead[],
  customers: [] as Customer[],
  
  addUser: (user: User) => {
    MOCK_DB.users.push(user);
  },

  approveUser: (uid: string) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) {
      user.authStatus = AuthStatus.ACTIVE;
      user.status = UserStatus.APPROVED;
      user.approvedAt = Date.now();
    }
  },

  updateUser: (uid: string, data: Partial<User>) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) {
      Object.assign(user, data);
      if (data.profileStatus === ProfileStatus.COMPLETED) {
        user.profileCompleted = true;
      }
    }
  },

  // Added updateCustomer to fix missing property errors in customer service
  updateCustomer: (id: string, data: Partial<Customer>, userId?: string, userName?: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === id);
    if (customer) {
      Object.assign(customer, data);
    }
  },

  createEntity: (form: any, type: string, currentUser: User) => {
    const id = generateUniqueSystemID();
    if (type === 'LEAD') {
      const newLead: Lead = {
        id, name: form.name, companyName: form.companyName || 'Individual',
        phone: form.mobile, email: form.email, source: form.source || LeadSource.MANUAL,
        status: LeadStatus.NEW, priority: LeadPriority.MEDIUM, salesUserId: currentUser.uid,
        potentialValue: form.billingAmount || 0, createdAt: Date.now(),
        location: form.address, notes: form.notes
      };
      MOCK_DB.leads.push(newLead);
    } else if (type === 'USER') {
      const newUser: User = {
        uid: id, email: form.email, role: form.role || UserRole.USER,
        authStatus: AuthStatus.UNVERIFIED,
        profileStatus: ProfileStatus.NOT_STARTED,
        status: UserStatus.PENDING, displayName: form.name, mobile: form.mobile,
        profileCompleted: false, location: form.address, createdAt: Date.now()
      };
      MOCK_DB.addUser(newUser);
    }
    return id;
  },

  convertLead: (leadId: string, data: any) => {
    const leadIndex = MOCK_DB.leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) return null;
    const lead = MOCK_DB.leads[leadIndex];
    const customerId = `cust-${lead.id}`;
    
    const customerData: Customer = {
      id: customerId,
      name: lead.name,
      companyName: lead.companyName,
      phone: lead.phone,
      email: lead.email || '',
      location: typeof lead.location === 'object' ? lead.location : { address: lead.location || '', city: '', state: '', pincode: '' },
      salesId: data.userId,
      opsId: 'PENDING',
      status: CustomerStatus.CONVERTING,
      opsStatus: OpsStatus.PENDING,
      workStatus: WorkStatus.ASSIGNED,
      executionStage: ExecutionStage.PLANNING,
      billingAmount: data.billingAmount,
      advanceCollected: data.advanceRequired,
      gstApplied: data.gstApplied,
      conversionAt: Date.now(),
      conversionDeadline: Date.now() + (72 * 60 * 60 * 1000),
      createdFromLeadId: lead.id,
      activityLogs: [], receipts: [], invoices: [], payments: [], tasks: []
    };
    
    MOCK_DB.customers.push(customerData);
    MOCK_DB.leads[leadIndex].status = LeadStatus.CONVERTED;
    return customerId;
  },

  recordPayment: (customerId: string, data: any, creator: User) => {
    const cust = MOCK_DB.customers.find(c => c.id === customerId);
    if (cust) {
      const payment = { ...data, id: generatePaymentID(), createdAt: Date.now(), createdBy: creator.uid, createdByName: creator.displayName };
      cust.payments.push(payment);
      return payment;
    }
  },

  completeTask: (customerId: string, taskId: string, proofs: string[], creator: User) => {
    const cust = MOCK_DB.customers.find(c => c.id === customerId);
    if (cust) {
      const task = cust.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'COMPLETED';
        task.completedAt = Date.now();
        task.proofs = proofs.map(url => ({ url, uploadedAt: Date.now() }));
        return true;
      }
    }
    return false;
  },

  addActivityLog: (customerId: string, log: any) => {
    const cust = MOCK_DB.customers.find(c => c.id === customerId);
    if (cust) cust.activityLogs.unshift({ ...log, id: `log-${Date.now()}`, createdAt: Date.now() });
  },

  checkDeadlines: () => {
    const now = Date.now();
    MOCK_DB.customers.forEach(c => {
      if (c.status === CustomerStatus.CONVERTING && now > c.conversionDeadline) {
        c.status = CustomerStatus.EXPIRED;
      }
    });
  }
};
