
import { User, Lead, Customer, UserRole, UserStatus, LeadStatus, LeadSource, CustomerStatus, ExecutionStage, Location, OpsStatus, WorkStatus, ActivityLog, LeadPriority, Invoice, InvoiceType, InvoiceStatus, Receipt } from '../types';
import { APP_CONFIG } from '../config/appConfig';

export const generateUID = () => `UID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

const INITIAL_USERS: User[] = [
  {
    uid: 'admin-auth-1',
    email: 'admin@gmail.com',
    displayName: 'Master Administrator',
    role: UserRole.MASTER_ADMIN,
    status: UserStatus.APPROVED,
    mobile: '9999999999',
    createdAt: Date.now() - 86400000 * 60,
    approvedAt: Date.now() - 86400000 * 59,
    location: { address: 'Admin HQ', city: 'System City', state: 'Delhi', pincode: '110001' },
    age: 35,
    gender: 'Male',
    aadhaar: '123456789012'
  },
  {
    uid: 'sales-auth-1',
    email: 'sales@gmail.com',
    displayName: 'Senior Sales Agent',
    role: UserRole.SALES,
    status: UserStatus.APPROVED,
    mobile: '7777777777',
    createdAt: Date.now() - 86400000 * 30,
    approvedAt: Date.now() - 86400000 * 29,
    location: { address: 'West Wing Office', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    age: 28,
    gender: 'Female',
    aadhaar: '987654321098'
  },
  {
    uid: 'ops-auth-1',
    email: 'ops@gmail.com',
    displayName: 'Ops Manager Alpha',
    role: UserRole.OPERATIONS,
    status: UserStatus.APPROVED,
    mobile: '6666666666',
    createdAt: Date.now() - 86400000 * 30,
    approvedAt: Date.now() - 86400000 * 29,
    location: { address: 'Operational Hub', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    age: 32,
    gender: 'Male',
    aadhaar: '555544443333'
  }
];

export interface SystemNotification {
  id: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionable?: boolean;
}

export const MOCK_DB = {
  users: [...INITIAL_USERS] as User[],
  notifications: [] as SystemNotification[],
  leads: [
    { id: 'lead-101', name: 'Sarah Connor', companyName: 'Cyberdyne Systems', phone: '9876543210', email: 's.connor@cyberdyne.io', source: LeadSource.WEBSITE, status: LeadStatus.NEW, priority: LeadPriority.HIGH, salesUserId: 'sales-auth-1', potentialValue: 850000, createdAt: Date.now() - 43200000 },
    { id: 'lead-102', name: 'Tony Stark', companyName: 'Stark Industries', phone: '9000000001', email: 'tony@stark.com', source: LeadSource.INSTAGRAM, status: LeadStatus.QUALIFIED, priority: LeadPriority.HIGH, salesUserId: 'sales-auth-1', potentialValue: 1250000, createdAt: Date.now() - 86400000 },
    { id: 'lead-103', name: 'Peter Parker', companyName: 'Daily Bugle', phone: '9000000002', email: 'peter@spider.com', source: LeadSource.REFERRAL, status: LeadStatus.NEW, priority: LeadPriority.LOW, salesUserId: 'sales-auth-1', potentialValue: 45000, createdAt: Date.now() - 172800000 }
  ] as Lead[],
  customers: [
    {
      id: 'cust-201',
      name: 'Bruce Wayne',
      companyName: 'Wayne Enterprises',
      phone: '9988776655',
      email: 'bruce@wayne.com',
      location: { address: '1007 Mountain Drive', city: 'Gotham', state: 'Maharashtra', pincode: '400001', lat: 18.922, lng: 72.834 },
      salesId: 'sales-auth-1',
      opsId: 'ops-auth-1',
      status: CustomerStatus.ACTIVE,
      opsStatus: OpsStatus.ACCEPTED,
      workStatus: WorkStatus.IN_PROGRESS,
      executionStage: ExecutionStage.EXECUTION,
      billingAmount: 1500000,
      internalCost: 450000,
      conversionAt: Date.now() - 86400000 * 10,
      conversionDeadline: Date.now() - 86400000 * 7,
      createdFromLeadId: 'lead-000',
      activityLogs: [
        { id: 'log-1', action: 'WORK_STARTED', note: 'Project initialized and planning completed.', createdAt: Date.now() - 86400000 * 9, createdBy: 'ops-auth-1', createdByName: 'Ops Manager Alpha', customerId: 'cust-201' },
        { id: 'log-2', action: 'ADVANCE_RECEIVED', note: 'Initial 15% payment confirmed.', createdAt: Date.now() - 86400000 * 10, createdBy: 'sales-auth-1', createdByName: 'Senior Sales Agent', customerId: 'cust-201' }
      ],
      receipts: [],
      invoices: [
        {
          id: 'inv-001', customerId: 'cust-201', type: InvoiceType.ADVANCE, amount: 225000, taxAmount: 225000 * 0.18, totalAmount: 225000 * 1.18, totalOrderValue: 1500000, status: InvoiceStatus.PAID, createdAt: Date.now() - 86400000 * 11, paidAt: Date.now() - 86400000 * 10, dueDate: Date.now() - 86400000 * 10
        }
      ] as Invoice[]
    },
    {
      id: 'cust-202',
      name: 'Diana Prince',
      companyName: 'Themyscira Exports',
      phone: '9988776611',
      email: 'diana@wonder.com',
      location: { address: 'Ancient Grotto', city: 'Paris', state: 'France', pincode: '75001' },
      salesId: 'sales-auth-1',
      opsId: 'PENDING',
      status: CustomerStatus.CONVERTING,
      opsStatus: OpsStatus.PENDING,
      workStatus: WorkStatus.ASSIGNED,
      executionStage: ExecutionStage.PLANNING,
      billingAmount: 500000,
      internalCost: 0,
      conversionAt: Date.now() - 86400000 * 4, // 4 days ago - should trigger alert
      conversionDeadline: Date.now() - 86400000 * 1,
      createdFromLeadId: 'lead-001',
      activityLogs: [],
      receipts: [],
      invoices: [
        { id: 'inv-002', customerId: 'cust-202', type: InvoiceType.ADVANCE, amount: 75000, taxAmount: 13500, totalAmount: 88500, totalOrderValue: 500000, status: InvoiceStatus.UNPAID, createdAt: Date.now() - 86400000 * 3, dueDate: Date.now() - 86400000 * 1 }
      ]
    }
  ] as Customer[],
  profiles: INITIAL_USERS.map(u => ({ uid: u.uid, uniqueId: generateUID(), name: u.displayName, email: u.email, contact: u.mobile, address: u.location?.address || '', role: u.role, createdAt: u.createdAt })),
  
  addNotification: (notif: Partial<SystemNotification>) => {
    MOCK_DB.notifications.unshift({ id: `notif-${Date.now()}`, type: 'INFO', title: 'Notification', message: '', timestamp: Date.now(), read: false, ...notif });
  },

  addUser: (user: User) => {
    MOCK_DB.users.push(user);
    MOCK_DB.profiles.push({ uid: user.uid, uniqueId: generateUID(), name: user.displayName, email: user.email, contact: user.mobile, address: user.location?.address || '', role: user.role, createdAt: user.createdAt });
    MOCK_DB.addNotification({ type: 'INFO', title: 'New User Registry', message: `${user.displayName} has applied for network access.` });
  },
  
  approveUser: (uid: string, role: UserRole) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) {
      user.status = UserStatus.APPROVED;
      user.role = role;
      user.approvedAt = Date.now();
      const pIdx = MOCK_DB.profiles.findIndex(p => p.uid === uid);
      if (pIdx !== -1) MOCK_DB.profiles[pIdx].role = role;
      MOCK_DB.addNotification({ type: 'SUCCESS', title: 'Identity Authorized', message: `${user.displayName} is now active as ${role}.` });
    }
  },

  rejectUser: (uid: string) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) user.status = UserStatus.DELETED;
  },

  updateUser: (uid: string, data: Partial<User>) => {
    const idx = MOCK_DB.users.findIndex(u => u.uid === uid);
    if (idx !== -1) MOCK_DB.users[idx] = { ...MOCK_DB.users[idx], ...data };
    const pIdx = MOCK_DB.profiles.findIndex((p: any) => p.uid === uid);
    if (pIdx !== -1) MOCK_DB.profiles[pIdx] = { ...MOCK_DB.profiles[pIdx], ...data };
  },

  addLead: (lead: Lead) => {
    MOCK_DB.leads.push(lead);
    MOCK_DB.addNotification({ title: 'New Lead Signal', message: `${lead.companyName} added to pipeline.` });
  },
  
  updateLead: (id: string, data: Partial<Lead>) => {
    const idx = MOCK_DB.leads.findIndex(l => l.id === id);
    if (idx !== -1) {
      MOCK_DB.leads[idx] = { ...MOCK_DB.leads[idx], ...data };
      if (data.status === LeadStatus.QUALIFIED) {
        MOCK_DB.addNotification({ title: 'Lead Qualified', message: `${MOCK_DB.leads[idx].companyName} is ready for conversion.`, actionable: true });
      }
    }
  },

  updateCustomer: (customerId: string, data: Partial<Customer>, userId: string, userName: string) => {
    const idx = MOCK_DB.customers.findIndex(c => c.id === customerId);
    if (idx > -1) {
      const prev = MOCK_DB.customers[idx];
      MOCK_DB.customers[idx] = { ...prev, ...data };
      if (data.workStatus && data.workStatus !== prev.workStatus) {
        MOCK_DB.addActivityLog(customerId, { action: 'WORK_STATUS_CHANGED', note: `Status updated from ${prev.workStatus} to ${data.workStatus}`, userId, userName });
        if (data.workStatus === WorkStatus.COMPLETED) MOCK_DB.addNotification({ type: 'SUCCESS', title: 'Work Finalized', message: `Execution completed for ${prev.companyName}.` });
      }
      if (data.executionStage && data.executionStage !== prev.executionStage) {
        MOCK_DB.addActivityLog(customerId, { action: 'EXECUTION_STAGE_CHANGED', note: `Stage changed to ${data.executionStage}`, userId, userName });
        if (data.executionStage === ExecutionStage.CLOSED) {
          const hasFinal = prev.invoices.some(i => i.type === InvoiceType.FINAL);
          if (!hasFinal) {
            const alreadyBilledBase = prev.invoices.reduce((acc, inv) => acc + inv.amount, 0);
            const finalAmount = Math.max(0, prev.billingAmount - alreadyBilledBase);
            if (finalAmount > 0) MOCK_DB.createInvoice(customerId, { type: InvoiceType.FINAL, amount: finalAmount }, 'SYSTEM', 'Synckraft Billing');
          }
        }
      }
    }
  },

  createInvoice: (customerId: string, invoiceData: { type: InvoiceType, amount: number }, userId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      const taxAmount = invoiceData.amount * (APP_CONFIG.billing.gstRate / 100);
      const newInvoice: Invoice = { id: `INV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, customerId, type: invoiceData.type, amount: invoiceData.amount, taxAmount, totalAmount: invoiceData.amount + taxAmount, totalOrderValue: customer.billingAmount, status: InvoiceStatus.UNPAID, createdAt: Date.now(), dueDate: Date.now() + (86400000 * 7) };
      customer.invoices.push(newInvoice);
      MOCK_DB.addActivityLog(customerId, { action: 'INVOICE_GENERATED', note: `${newInvoice.type} Invoice generated for ${APP_CONFIG.currency.symbol}${newInvoice.totalAmount.toLocaleString()}.`, userId, userName });
      return newInvoice;
    }
  },

  markInvoicePaid: (customerId: string, invoiceId: string, userId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      const inv = customer.invoices.find(i => i.id === invoiceId);
      if (inv) {
        inv.status = InvoiceStatus.PAID;
        inv.paidAt = Date.now();
        const receipt: Receipt = { id: `REC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, invoiceId, customerId, amount: inv.totalAmount, collectedBy: userId, timestamp: Date.now() };
        customer.receipts.push(receipt);
        MOCK_DB.addActivityLog(customerId, { action: 'INVOICE_PAID', note: `${inv.type} Invoice payment recorded. Receipt ${receipt.id} generated.`, userId, userName });
        MOCK_DB.addNotification({ type: 'SUCCESS', title: 'Payment Secured', message: `Capital inflow of ${formatCurrency(inv.totalAmount)} verified from ${customer.companyName}.` });
      }
    }
  },

  addActivityLog: (customerId: string, logData: { action: string, note?: string, userId: string, userName: string }) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      const log: ActivityLog = { id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, customerId, action: logData.action, note: logData.note, createdAt: Date.now(), createdBy: logData.userId, createdByName: logData.userName };
      customer.activityLogs.unshift(log);
    }
  },

  convertLead: (leadId: string, conversionData: { location: Location, email: string, phone: string, userId: string, userName: string, gstNumber?: string, industry?: string }) => {
    const idx = MOCK_DB.leads.findIndex(l => l.id === leadId);
    if (idx > -1) {
      const lead = MOCK_DB.leads[idx];
      lead.status = LeadStatus.CONVERTED;
      const customerId = `cust-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const customer: Customer = { id: customerId, name: lead.name, companyName: lead.companyName, phone: conversionData.phone, email: conversionData.email, location: conversionData.location, salesId: lead.salesUserId, opsId: 'PENDING', status: CustomerStatus.CONVERTING, opsStatus: OpsStatus.PENDING, workStatus: WorkStatus.ASSIGNED, executionStage: ExecutionStage.PLANNING, billingAmount: lead.potentialValue, internalCost: 0, conversionAt: Date.now(), conversionDeadline: Date.now() + (72 * 60 * 60 * 1000), createdFromLeadId: lead.id, activityLogs: [], gstNumber: conversionData.gstNumber, industry: conversionData.industry || lead.industry, invoices: [], receipts: [] };
      MOCK_DB.customers.push(customer);
      MOCK_DB.addActivityLog(customerId, { action: 'CONVERSION_INITIATED', note: `Lead converted. Initializing billing workflow.`, userId: conversionData.userId, userName: conversionData.userName });
      MOCK_DB.addNotification({ title: 'Portfolio Expansion', message: `${lead.companyName} converted from Lead to Project.` });
      return customerId;
    }
  },

  checkDeadlines: () => {
    const now = Date.now();
    MOCK_DB.customers.forEach(c => {
      // 72h window for conversion finalization
      if (c.status === CustomerStatus.CONVERTING && now > c.conversionDeadline) {
        c.status = CustomerStatus.ACTIVE;
        MOCK_DB.addActivityLog(c.id, { action: 'AUTO_FINALIZED', note: 'The 72-hour window has expired. Customer finalized.', userId: 'SYSTEM', userName: 'Synckraft' });
      }
      
      // Check for overdue invoices
      c.invoices.forEach(inv => {
        // Fix: Removed redundant check for 'OVERDUE' since 'UNPAID' already implies it's not 'OVERDUE'
        if (inv.status === InvoiceStatus.UNPAID && now > inv.dueDate) {
          inv.status = InvoiceStatus.OVERDUE;
          MOCK_DB.addNotification({ type: 'ALERT', title: 'Payment Overdue', message: `Invoice ${inv.id} for ${c.companyName} is past due date. Action required.` });
        }
      });

      // AI Suggestion: Advance pending for too long
      const pendingAdvance = c.invoices.find(i => i.type === InvoiceType.ADVANCE && i.status !== InvoiceStatus.PAID);
      if (pendingAdvance && (now - pendingAdvance.createdAt) > (86400000 * 3)) {
         const alertExists = MOCK_DB.notifications.some(n => n.title === 'AI Reminder' && n.message.includes(c.companyName));
         if (!alertExists) {
            MOCK_DB.addNotification({ type: 'INFO', title: 'AI Reminder', message: `Advance pending for 3 days on ${c.companyName}. Follow up suggested.` });
         }
      }
    });
  }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
