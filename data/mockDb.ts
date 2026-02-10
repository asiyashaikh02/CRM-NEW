
import { User, UserRole, UserStatus, Customer, CustomerStatus, WorkStatus, ExecutionStage, PlanType, LeadStatus, LeadPriority, OrderStatus, PaymentStatus, PaymentMode } from '../types';

export const PLAN_RATES: Record<PlanType, number> = {
  [PlanType.SILVER]: 2500,
  [PlanType.GOLD]: 4000,
  [PlanType.PLATINUM]: 6000
};

export const MOCK_DB = {
  users: [
    {
      uid: 'ADM-HEAD',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: UserRole.ADMIN,
      displayName: 'System Administrator (HEAD)',
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      createdAt: Date.now()
    },
    {
      uid: 'SAL-HEAD',
      email: 'sales@gmail.com',
      password: 'sales123',
      role: UserRole.SALES_MANAGER,
      displayName: 'Sales Director (HEAD)',
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      createdAt: Date.now()
    },
    {
      uid: 'OPS-HEAD',
      email: 'ops@gmail.com',
      password: 'ops123',
      role: UserRole.OPS_MANAGER,
      displayName: 'Operations Chief (HEAD)',
      status: UserStatus.APPROVED,
      isProfileComplete: true,
      createdAt: Date.now()
    }
  ] as User[],
  
  leads: [] as any[],
  customers: [] as Customer[],
  orders: [] as any[],
  payments: [] as any[],

  createUser: (data: Partial<User>, creator: User) => {
    const newUser: User = {
      uid: `EMP-${Math.floor(Math.random() * 10000)}`,
      email: data.email || '',
      password: data.password || 'emp123',
      displayName: data.displayName || 'Unnamed Employee',
      role: data.role || UserRole.SALES_USER,
      status: UserStatus.PENDING,
      createdAt: Date.now(),
      assignedArea: data.assignedArea || 'Global',
      managerId: creator.uid,
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
      customerId: `ID-${Math.floor(Math.random() * 10000)}`,
      name: form.name,
      companyName: form.companyName,
      phone: form.phone,
      email: form.email,
      address: form.address || '',
      city: form.city || '',
      lat: form.lat || 0,
      lng: form.lng || 0,
      plantCapacity: form.plantCapacity,
      selectedPlan: form.selectedPlan,
      discount: form.discount || 0,
      finalPrice: finalPrice,
      status: CustomerStatus.DRAFT,
      createdBy: creatorUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serviceDate: form.serviceDate ? new Date(form.serviceDate).getTime() : Date.now(), // Fixed for Phase 3
      timeline: [{
        action: 'CREATED',
        remarks: 'Sales Draft initialized. 72-hour conversion window activated.',
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

  forwardToAdmin: (customerId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer && customer.status === CustomerStatus.DRAFT) {
      customer.status = CustomerStatus.PENDING_APPROVAL;
      customer.updatedAt = Date.now();
      customer.timeline.push({
        action: 'FORWARDED',
        remarks: 'Draft finalized and forwarded for Admin/Manager approval. Edit access revoked.',
        userName,
        timestamp: Date.now()
      });
    }
  },

  approveCustomer: (customerId: string, adminUser: User) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.status = CustomerStatus.APPROVED;
      customer.updatedAt = Date.now();
      customer.timeline.push({
        action: 'APPROVED',
        remarks: 'Manager Authorization Granted. Node ready for Operations handoff.',
        userName: adminUser.displayName,
        timestamp: Date.now()
      });
    }
  },

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
      MOCK_DB.payments.push(payment);
      customer.timeline.push({
        action: 'PAYMENT_RECORDED',
        remarks: `Financial Settlement: ₹${amount.toLocaleString()} received via ${mode}.`,
        userName,
        timestamp: Date.now()
      });
    }
  },

  updateCustomer: (customerId: string, data: Partial<Customer>, userId: string, userName: string) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      if (customer.status === CustomerStatus.LOCKED) return;
      Object.assign(customer, data);
      customer.updatedAt = Date.now();
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
    const now = Date.now();
    MOCK_DB.customers.forEach(c => {
      if (c.status === CustomerStatus.DRAFT && now > c.conversionDeadline) {
        c.status = CustomerStatus.LOCKED;
        c.timeline.push({
          action: 'AUTO_LOCKED',
          remarks: '72-hour drafting window expired. Record locked automatically.',
          userName: 'System Protocol',
          timestamp: now
        });
      }
    });
  },

  recordPayment: (customerId: string, invoiceId: string, amount: number, mode: PaymentMode, reference: string, creator: User) => {
    return MOCK_DB.addPayment(customerId, amount, mode, reference, creator.displayName);
  },

  completeTask: (customerId: string, taskId: string, proofs: string[], creator: User) => {
    const customer = MOCK_DB.customers.find(c => c.id === customerId);
    if (customer) {
      customer.timeline.push({
        action: 'TASK_COMPLETED',
        remarks: `Verification Signal: Task ${taskId} processed with ${proofs.length} proof nodes.`,
        userName: creator.displayName,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  convertLead: (leadId: string, data: any) => {
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if (!lead) return null;

    const billingAmount = data.billingAmount || lead.potentialValue;
    
    const customer: Customer = {
      id: `CUST-${Math.floor(Math.random() * 10000)}`,
      customerId: `ID-${Math.floor(Math.random() * 10000)}`,
      name: lead.name,
      companyName: lead.companyName,
      phone: lead.phone,
      email: lead.email || '',
      address: lead.location || '',
      city: lead.city || '',
      lat: lead.lat || 0,
      lng: lead.lng || 0,
      plantCapacity: (lead.panelCount || 0) * 0.5,
      selectedPlan: PlanType.SILVER,
      discount: 0,
      finalPrice: billingAmount,
      status: CustomerStatus.DRAFT,
      createdBy: data.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serviceDate: Date.now(),
      timeline: [{
        action: 'CONVERTED',
        remarks: 'Lead conversion synchronized. Drafting node initialized.',
        userName: data.userName,
        timestamp: Date.now()
      }],
      salesId: data.userId,
      opsId: 'PENDING',
      workStatus: WorkStatus.ASSIGNED,
      executionStage: ExecutionStage.PLANNING,
      conversionDeadline: Date.now() + (72 * 60 * 60 * 1000),
      invoices: [],
      payments: [],
      panelCount: lead.panelCount || 0,
      billingAmount: billingAmount
    };

    lead.status = LeadStatus.CONVERTED;
    MOCK_DB.customers.push(customer);
    return customer.id;
  },

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

  convertLeadToOrder: (leadId: string, panelCount: number, serviceDate: number, assignedCleaner: string) => {
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = LeadStatus.CONVERTED;
      const order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        clientName: lead.companyName,
        panelCount,
        serviceDate,
        assignedCleaner,
        status: OrderStatus.SCHEDULED,
        createdAt: Date.now()
      };
      MOCK_DB.orders.push(order);
      return order;
    }
    return null;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const order = MOCK_DB.orders.find(o => o.id === orderId);
    if (order) order.status = status;
  },

  updatePaymentStatus: (paymentId: string, status: PaymentStatus) => {
    const payment = MOCK_DB.payments.find(p => p.id === paymentId);
    if (payment) payment.status = status;
  }
};
