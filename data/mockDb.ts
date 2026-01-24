
import { User, Lead, Customer, UserRole, UserStatus, LeadStatus, CustomerStatus, ExecutionStage, Profile } from '../types';

// Helper to generate unique identifiers used across services
export const generateUID = () => `UID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Initial data state
const INITIAL_USERS: User[] = [
  {
    uid: 'admin-uid-1',
    email: 'admin@gmail.com',
    displayName: 'Master Admin',
    role: UserRole.MASTER_ADMIN,
    status: UserStatus.APPROVED,
    createdAt: Date.now() - 86400000 * 10
  },
  {
    uid: 'sales-uid-1',
    email: 'user1@gmail.com',
    displayName: 'John Sales',
    role: UserRole.SALES,
    status: UserStatus.PENDING,
    createdAt: Date.now() - 3600000
  },
  {
    uid: 'ops-uid-1',
    email: 'ops@gmail.com',
    displayName: 'Alice Ops',
    role: UserRole.OPERATIONS,
    status: UserStatus.APPROVED,
    createdAt: Date.now() - 86400000 * 5
  }
];

const INITIAL_PROFILES: Profile[] = INITIAL_USERS.map(u => ({
  uid: u.uid,
  uniqueId: generateUID(),
  name: u.displayName,
  email: u.email,
  contact: 'NOT_SET',
  address: 'HQ_DEFAULT',
  role: u.role,
  createdAt: u.createdAt
}));

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-101',
    name: 'Corporate Expansion',
    company: 'TechFlow Inc',
    email: 'contact@techflow.com',
    status: LeadStatus.NEW,
    salesUserId: 'sales-uid-1',
    potentialValue: 45000,
    createdAt: Date.now() - 43200000
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-201',
    name: 'Global Logistics',
    linkedLeadId: 'lead-000',
    salesUserId: 'admin-uid-1',
    status: CustomerStatus.ACTIVE,
    executionStage: ExecutionStage.EXECUTION,
    billingAmount: 120000,
    internalCost: 45000,
    createdAt: Date.now() - 86400000 * 2
  }
];

// Persistent Mock Database Object - renamed to MOCK_DATA as requested by service imports
export const MOCK_DATA = {
  users: [...INITIAL_USERS],
  leads: [...INITIAL_LEADS],
  customers: [...INITIAL_CUSTOMERS],
  profiles: [...INITIAL_PROFILES],
  
  // Helper methods for synchronous interaction
  addUser: (user: User) => {
    MOCK_DATA.users.push(user);
    // Initialize a profile for new users
    MOCK_DATA.profiles.push({
      uid: user.uid,
      uniqueId: generateUID(),
      name: user.displayName,
      email: user.email,
      contact: 'NOT_SET',
      address: 'HQ_DEFAULT',
      role: user.role,
      createdAt: user.createdAt
    });
  },
  
  approveUser: (uid: string) => {
    const user = MOCK_DATA.users.find(u => u.uid === uid);
    if (user) user.status = UserStatus.APPROVED;
  },
  
  addLead: (lead: Lead) => {
    MOCK_DATA.leads.push(lead);
  },
  
  convertToCustomer: (leadId: string) => {
    const idx = MOCK_DATA.leads.findIndex(l => l.id === leadId);
    if (idx > -1) {
      const lead = MOCK_DATA.leads[idx];
      const customer: Customer = {
        id: `cust-${Math.random().toString(36).substr(2, 9)}`,
        name: lead.company,
        linkedLeadId: lead.id,
        salesUserId: lead.salesUserId,
        status: CustomerStatus.INACTIVE,
        executionStage: ExecutionStage.PLANNING,
        billingAmount: lead.potentialValue,
        internalCost: 0,
        createdAt: Date.now()
      };
      MOCK_DATA.customers.push(customer);
      MOCK_DATA.leads.splice(idx, 1);
    }
  }
};

// Aliasing MOCK_DB to MOCK_DATA to support files using both naming conventions
export const MOCK_DB = MOCK_DATA;
