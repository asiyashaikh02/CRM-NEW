
export enum UserRole {
  ADMIN = 'ADMIN',
  SALES_MANAGER = 'SALES_MANAGER',
  OPS_MANAGER = 'OPS_MANAGER',
  SALES_USER = 'SALES_USER',
  OPS_USER = 'OPS_USER',
  SALES = 'SALES', 
  OPS = 'OPS',
  USER = 'USER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  BLOCKED = 'BLOCKED'
}

export enum PlanType {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum CustomerStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TRANSFERRED_TO_OPS = 'TRANSFERRED_TO_OPS',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED'
}

export enum WorkStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  WORKING = 'WORKING', // Added for Phase 4
  COMPLETED = 'COMPLETED'
}

export enum ExecutionStage {
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION',
  COMPLETED = 'COMPLETED'
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum LeadSource {
  OFFLINE = 'OFFLINE',
  ADS = 'ADS',
  REFERRAL = 'REFERRAL'
}

export enum OrderStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID'
}

export enum PaymentMode {
  UPI = 'UPI',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER'
}

export enum OpsStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID'
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  mobile?: string;
  aadhaar?: string;
  address?: string;
  assignedArea?: string;
  isProfileComplete?: boolean;
  bankDetails?: {
    account: string;
    ifsc: string;
  };
  govtId?: string;
  emergencyContact?: string;
  password?: string;
  managerId?: string;
}

export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  plantCapacity: number;
  selectedPlan: PlanType;
  discount: number;
  finalPrice: number;
  status: CustomerStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  timeline: any[];
  salesId: string;
  opsId: string;
  workStatus: WorkStatus;
  executionStage: ExecutionStage;
  conversionDeadline: number;
  serviceDate: number;
  invoices: any[];
  payments: any[];
  assignedOps?: string;
  panelCount: number;
  billingAmount: number;
  opsStatus?: OpsStatus;
  rejectionReason?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  location: string; 
  city: string;
  lat?: number;
  lng?: number;
  source: string;
  status: string;
  createdAt: number;
  companyName: string;
  panelCount: number;
  salesUserId: string;
  potentialValue: number;
  priority: string;
  email?: string;
  notes?: string;
}

export type RoutePath = 
  | 'dashboard' 
  | 'leads' 
  | 'lead-detail'
  | 'orders' 
  | 'order-detail'
  | 'payments' 
  | 'payment-detail'
  | 'users' 
  | 'user-detail'
  | 'customers'
  | 'project-detail'
  | 'add'
  | 'add-customer'
  | 'reports';

export interface ViewState {
  path: RoutePath;
  id?: string;
}

export const maskAadhaar = (val?: string) => {
  if (!val) return 'XXXX XXXX XXXX';
  return 'XXXX XXXX ' + val.slice(-4);
};
