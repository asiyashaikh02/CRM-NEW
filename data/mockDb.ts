import { User, UserRole, UserStatus, Customer, CustomerStatus, WorkStatus, ExecutionStage, PlanType, LeadStatus, LeadPriority, OrderStatus, PaymentStatus, PaymentMode } from '../types';

export const PLAN_RATES: Record<PlanType, number> = {
  [PlanType.SILVER]: 2500,
  [PlanType.GOLD]: 4000,
  [PlanType.PLATINUM]: 6000
};

export const MOCK_DB = {
  users: [
    {
      uid: 'ADM-001',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: UserRole.ADMIN,
      displayName: 'System Admin',
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      createdAt: Date.now()
    },
    {
      uid: 'SAL-001',
      email: 'sales@gmail.com',
      password: 'sales123',
      role: UserRole.SALES,
      displayName: 'Sales Associate',
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      createdAt: Date.now()
    },
    {
      uid: 'OPS-001',
      email: 'ops@gmail.com',
      password: 'ops123',
      role: UserRole.OPS,
      displayName: 'Operations Lead',
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      createdAt: Date.now()
    }
  ] as any[],
  
  leads: [] as any[],
  customers: [] as Customer[],
  orders: [] as any[],
  payments: [] as any[],

  createLead: (data: any) => {
    const lead = {
      id: `LEAD-${Math.floor(Math.random() * 10000)}`,
      ...data,
      status: LeadStatus.NEW,
      createdAt: Date.now(),
      potentialValue: data.potentialValue || 0,
      priority: data.priority || LeadPriority.MEDIUM,
      panelCount: data.panelCount || 0
    };
    MOCK_DB.leads.push(lead);
    return lead;
  },

  // Added for services/customer.service.ts
  convertLead: (leadId: string, data: any) => {
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if (!lead) return null;
    
    lead.status = LeadStatus.CONVERTED;
    
    const customer = MOCK_DB.createCustomer({
      name: lead.name,
      companyName: lead.companyName,
      phone: lead.phone,
      email: lead.email,
      city: lead.location,
      plantCapacity: lead.panelCount * 0.5 || 5,
      selectedPlan: PlanType.SILVER,
      discount: 0
    }, data.userId);

    if (data.billingAmount) {
      customer.billingAmount = data.billingAmount;
      customer.finalPrice = data.billingAmount;
    }
    
    return customer.id;
  },

  // Added for pages/UniversalAddPage.tsx
  convertLeadToOrder: (leadId: string, panelCount: number, serviceDate: number, cleaner: string) => {
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = 'Converted';
      const order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        leadId,
        clientName: lead.name,
        panelCount,
        serviceDate,
        assignedCleaner: cleaner,
        status: OrderStatus.SCHEDULED,
        createdAt: Date.now()
      };
      MOCK_DB.orders.push(order);
      return order;
    }
  },

  recordPayment: (customerId: string, invoiceId: string, amount: number, mode: PaymentMode, reference: string, creator: User) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      const payment = {
        id: `PAY-${Math.floor(Math.random() * 10000)}`,
        amount,
        mode,
        reference,
        invoiceId,
        clientName: customer.name,
        orderId: customer.customerId,
        status: PaymentStatus.PAID,
        createdAt: Date.now()
      };
      customer.payments.push(payment);
      MOCK_DB.payments.push(payment); // Ensure global registry is updated
      customer.timeline.push({
        action: 'PAYMENT_RECORDED',
        remarks: `Payment of ₹${amount.toLocaleString()} recorded. Total Settled: ₹${customer.payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}`,
        userName: creator.displayName,
        timestamp: Date.now()
      });
      return payment;
    }
  },

  createCustomer: (form: any, creatorUid: string) => {
    const rate = PLAN_RATES[form.selectedPlan as PlanType] || 0;
    const basePrice = form.plantCapacity * rate;
    const finalPrice = basePrice - (form.discount || 0);

    const customer: Customer = {
      id: `CUST-${Math.floor(Math.random() * 10000)}`,
      customerId: `ID-${Math.floor(Math.random() * 10000)}`,
      name: form.name,
      companyName: form.companyName,
      phone: form.phone,
      email: form.email,
      address: form.city || '',
      plantCapacity: form.plantCapacity,
      selectedPlan: form.selectedPlan,
      discount: form.discount || 0,
      finalPrice: finalPrice,
      status: CustomerStatus.PENDING_APPROVAL,
      createdBy: creatorUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      timeline: [{
        action: 'CREATED',
        remarks: 'Sales Protocol Initiated. Customer node pending Admin authorization.',
        userName: 'Sales System',
        timestamp: Date.now()
      }],
      salesId: creatorUid,
      opsId: 'PENDING',
      workStatus: WorkStatus.ASSIGNED,
      executionStage: ExecutionStage.PLANNING,
      conversionDeadline: Date.now() + (72 * 60 * 60 * 1000),
      invoices: [],
      payments: [],
      panelCount: form.plantCapacity * 2,
      billingAmount: finalPrice
    };
    MOCK_DB.customers.push(customer);
    return customer;
  },

  approveCustomer: (customerId: string, adminUser: User) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.status = CustomerStatus.APPROVED;
      customer.updatedAt = Date.now();
      customer.timeline.push({
        action: 'APPROVED',
        remarks: 'Admin Authorization Granted. Project locked for Sales editing.',
        userName: adminUser.displayName,
        timestamp: Date.now()
      });
    }
  },

  // Added for pages/ProjectDetailsPage.tsx
  rejectCustomer: (customerId: string, adminUser: User, reason: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.status = CustomerStatus.REJECTED;
      customer.rejectionReason = reason;
      customer.timeline.push({
        action: 'REJECTED',
        remarks: `Node rejected: ${reason}`,
        userName: adminUser.displayName,
        timestamp: Date.now()
      });
    }
  },

  assignOps: (customerId: string, opsUserId: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    const opsUser = MOCK_DB.users.find(u => u.uid === opsUserId);
    if (customer && opsUser) {
      customer.opsId = opsUserId;
      customer.assignedOps = opsUserId;
      customer.status = CustomerStatus.TRANSFERRED_TO_OPS;
      customer.workStatus = WorkStatus.ACCEPTED;
      customer.timeline.push({
        action: 'TRANSFERRED',
        remarks: `Handoff Successful. Ownership transferred to Ops Specialist: ${opsUser.displayName}`,
        userName: 'Sales Handoff',
        timestamp: Date.now()
      });
    }
  },

  updateWorkStatus: (customerId: string, status: WorkStatus, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.workStatus = status;
      if (status === WorkStatus.COMPLETED) {
        customer.executionStage = ExecutionStage.COMPLETED;
        customer.status = CustomerStatus.COMPLETED;
      } else {
        customer.executionStage = ExecutionStage.EXECUTION;
      }
      customer.timeline.push({
        action: 'WORK_STATUS_UPDATE',
        remarks: `Project lifecycle updated to ${status} by assigned specialist.`,
        userName,
        timestamp: Date.now()
      });
    }
  },

  // Added for services/customer.service.ts
  completeTask: (customerId: string, taskId: string, proofs: string[], creator: User) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.timeline.push({
        action: 'TASK_COMPLETED',
        remarks: `Task ${taskId} verified with ${proofs.length} attachments.`,
        userName: creator.displayName,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  addPayment: (customerId: string, amount: number, mode: PaymentMode, reference: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      const payment = {
        id: `PAY-${Math.floor(Math.random() * 10000)}`,
        amount,
        mode,
        reference,
        clientName: customer.name,
        orderId: customer.customerId,
        status: PaymentStatus.PAID,
        createdAt: Date.now()
      };
      customer.payments.push(payment);
      MOCK_DB.payments.push(payment); // Update global registry
      customer.timeline.push({
        action: 'PAYMENT_RECORDED',
        remarks: `Financial Settlement: ₹${amount.toLocaleString()} received via ${mode}.`,
        userName,
        timestamp: Date.now()
      });
    }
  },

  // Added for services/customer.service.ts
  addActivityLog: (customerId: string, log: any) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.timeline.push({
        action: log.action,
        remarks: log.note,
        userName: log.userName,
        timestamp: Date.now()
      });
    }
  },

  updateCustomer: (customerId: string, data: Partial<Customer>, userId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      Object.assign(customer, data);
      customer.updatedAt = Date.now();
    }
  },

  // Added for pages/OrdersPage.tsx
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const order = MOCK_DB.orders.find(o => o.id === orderId);
    if (order) order.status = status;
  },

  // Added for pages/PaymentsPage.tsx
  updatePaymentStatus: (paymentId: string, status: PaymentStatus) => {
    const payment = MOCK_DB.payments.find(p => p.id === paymentId);
    if (payment) payment.status = status;
  },

  approveUser: (uid: string) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) user.status = UserStatus.APPROVED;
  },

  updateUser: (uid: string, data: Partial<User>) => {
    const user = MOCK_DB.users.find(u => u.uid === uid);
    if (user) Object.assign(user, data);
  },

  checkDeadlines: () => {}
};