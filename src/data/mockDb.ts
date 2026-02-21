
import { Timestamp } from 'firebase/firestore';
import { User, UserRole, UserStatus, Customer, CustomerStatus, WorkStatus, ExecutionStage, PlanType, LeadStatus, LeadPriority, OrderStatus, PaymentStatus, PaymentMode, PlanStatus } from '../types';

export const PLAN_RATES: Record<PlanType, number> = {
  [PlanType.TRIAL]: 0,
  [PlanType.SILVER]: 2500,
  [PlanType.GOLD]: 4000,
  [PlanType.PLATINUM]: 6000
};

export const MOCK_DB = {
  users: [
    {
      uid: 'ADM-HEAD',
      name: 'Admin Head',
      displayName: 'System Administrator (HEAD)',
      email: 'admin@gmail.com',
      phone: '0000000000',
      role: UserRole.ADMIN,
      department: 'admin',
      isActive: true,
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      planType: PlanType.PLATINUM,
      planStatus: PlanStatus.ACTIVE,
      trialStartAt: null,
      trialEndAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false
    },
    {
      uid: 'SAL-HEAD',
      name: 'Sales Head',
      displayName: 'Sales Director (HEAD)',
      email: 'sales@gmail.com',
      phone: '0000000000',
      role: UserRole.SALES_MANAGER,
      department: 'sales',
      isActive: true,
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      planType: PlanType.PLATINUM,
      planStatus: PlanStatus.ACTIVE,
      trialStartAt: null,
      trialEndAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false
    },
    {
      uid: 'OPS-HEAD',
      name: 'Ops Head',
      displayName: 'Operations Chief (HEAD)',
      email: 'ops@gmail.com',
      phone: '0000000000',
      role: UserRole.OPS_MANAGER,
      department: 'ops',
      isActive: true,
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      planType: PlanType.PLATINUM,
      planStatus: PlanStatus.ACTIVE,
      trialStartAt: null,
      trialEndAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false
    }
  ] as User[],
  
  leads: [] as any[],
  customers: [] as Customer[],
  orders: [] as any[],
  payments: [] as any[],

  createUser: (data: Partial<User>, creator: User) => {
    const newUser: User = {
      uid: `EMP-${Math.floor(Math.random() * 10000)}`,
      name: data.name || data.displayName || 'Unnamed Employee',
      displayName: data.displayName || data.name || 'Unnamed Employee',
      email: data.email || '',
      phone: data.phone || '0000000000',
      role: data.role || UserRole.SALES_USER,
      department: data.department || (data.role?.includes('SALES') ? 'sales' : 'ops'),
      isActive: data.isActive || false,
      status: UserStatus.PENDING,
      planType: PlanType.TRIAL,
      planStatus: PlanStatus.ACTIVE,
      trialStartAt: Timestamp.now(),
      trialEndAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false,
      assignedArea: data.assignedArea || 'Global',
      isProfileComplete: false
    };
    MOCK_DB.users.push(newUser);
    return newUser;
  },

  createLead: (data: any) => {
    const lead = {
      id: `LEAD-${Math.floor(Math.random() * 10000)}`,
      ...data,
      status: LeadStatus.NEW,
      createdAt: Date.now(),
      potentialValue: data.potentialValue || 0,
      priority: data.priority || LeadPriority.MEDIUM,
      panelCount: data.panelCount || 0,
      city: data.city || '',
      lat: data.lat || 0,
      lng: data.lng || 0
    };
    MOCK_DB.leads.push(lead);
    return lead;
  },

  createCustomer: (form: any, creatorUid: string) => {
    const rate = PLAN_RATES[form.selectedPlan as PlanType] || 0;
    const basePrice = form.plantCapacity * rate;
    const finalPrice = basePrice - (form.discount || 0);

    const customer: Customer = {
      id: `CUST-${Math.floor(Math.random() * 10000)}`,
      leadId: form.leadId || '',
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address || '',
      plantCapacity: form.plantCapacity,
      selectedPlan: form.selectedPlan,
      finalPrice: finalPrice,
      createdBy: creatorUid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false,
      salesId: creatorUid,
      opsId: 'PENDING',
    };
    MOCK_DB.customers.push(customer);
    return customer;
  },

  forwardToAdmin: (customerId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.updatedAt = Timestamp.now();
    }
  },

  approveCustomer: (customerId: string, adminUser: User) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.updatedAt = Timestamp.now();
    }
  },

  rejectCustomer: (customerId: string, adminUser: User, reason: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.updatedAt = Timestamp.now();
    }
  },

  assignOps: (customerId: string, opsUserId: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    const opsUser = MOCK_DB.users.find(u => u.uid === opsUserId);
    if (customer && opsUser) {
      customer.opsId = opsUserId;
      customer.assignedOps = opsUserId;
      customer.updatedAt = Timestamp.now();
    }
  },

  updateWorkStatus: (customerId: string, status: WorkStatus, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.updatedAt = Timestamp.now();
    }
  },

  addPayment: (customerId: string, amount: number, mode: PaymentMode, reference: string, userName: string, proofUrl?: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      const payment = {
        id: `PAY-${Math.floor(Math.random() * 10000)}`,
        amount,
        mode,
        reference,
        proofUrl: proofUrl || 'LOCAL_SIMULATED_PROOF_REF',
        orderId: customer.id,
        status: PaymentStatus.PAID,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false
      };
      MOCK_DB.payments.push(payment);
      customer.updatedAt = Timestamp.now();
    }
  },

  updateCustomer: (customerId: string, data: Partial<Customer>, userId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      Object.assign(customer, data);
      customer.updatedAt = Timestamp.now();
    }
  },

  approveUser: (uid: string) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) user.status = UserStatus.APPROVED;
  },

  updateUser: (uid: string, data: Partial<User>) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) Object.assign(user, data);
  },

  checkDeadlines: () => {
    // No-op for now
  },

  // Fix: Adding missing methods for customerService
  completeTask: (customerId: string, taskId: string, proofs: string[], creator: User) => {
    return true;
  },

  // Fix: Adding missing convertLead method for customerService and LeadDetailsPage
  convertLead: (leadId: string, data: any) => {
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if (lead) {
      const customer = MOCK_DB.createCustomer({
        name: lead.name,
        companyName: lead.companyName,
        phone: lead.phone,
        email: lead.email,
        city: lead.city,
        plantCapacity: lead.panelCount / 2 || 1,
        selectedPlan: PlanType.SILVER,
        discount: 0,
      }, data.userId);
      
      customer.billingAmount = data.billingAmount;
      customer.finalPrice = data.billingAmount;
      customer.status = CustomerStatus.DRAFT;
      
      lead.status = LeadStatus.CONVERTED;
      return customer.id;
    }
    return null;
  },

  // Fix: Adding missing addActivityLog method for customerService
  addActivityLog: (customerId: string, activity: { action: string; note: string; userId: string; userName: string }) => {
    // No-op
  },

  // Fix: Adding missing convertLeadToOrder method for UniversalAddPage
  convertLeadToOrder: (leadId: string, panelCount: number, serviceDate: number, cleaner: string) => {
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if (lead) {
      const order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        clientName: lead.name,
        panelCount,
        status: OrderStatus.SCHEDULED,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false
      };
      MOCK_DB.orders.push(order);
      lead.status = LeadStatus.CONVERTED;
      return order;
    }
    return null;
  },

  // Fix: Adding missing updateOrderStatus method for OrdersPage
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const order = MOCK_DB.orders.find(o => o.id === orderId);
    if (order) order.status = status;
  },

  // Fix: Adding missing updatePaymentStatus method for PaymentsPage
  updatePaymentStatus: (paymentId: string, status: PaymentStatus) => {
    const payment = MOCK_DB.payments.find(p => p.id === paymentId);
    if (payment) payment.status = status;
  },

  recordPayment: (customerId: string, invoiceId: string, amount: number, mode: PaymentMode, reference: string, creator: User, proofUrl?: string) => {
    return MOCK_DB.addPayment(customerId, amount, mode, reference, creator.displayName, proofUrl);
  }
};
