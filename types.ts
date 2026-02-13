
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SALES_ADMIN = 'SALES_ADMIN',
  OPS_ADMIN = 'OPS_ADMIN',
  SALES_MANAGER = 'SALES_MANAGER',
  OPS_MANAGER = 'OPS_MANAGER',
  SALES_USER = 'SALES_USER',
  OPS_USER = 'OPS_USER',
  SALES = 'SALES',
  OPS = 'OPS'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  BLOCKED = 'BLOCKED'
}

export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export enum LeadStatus {
  NEW = 'new',
  DRAFT = 'draft',
  APPROVED = 'approved',
  FORWARDED = 'forwarded',
  CONVERTED = 'converted'
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
  SCHEDULED = 'scheduled',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  WORKING = 'working',
  COMPLETED = 'completed',
  PAYMENT_RECEIVED = 'payment_received'
}

export enum CustomerStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  TRANSFERRED_TO_OPS = 'transferred_to_ops',
  COMPLETED = 'completed',
  LOCKED = 'locked',
  ACTIVE = 'active',
  DELETED = 'deleted'
}

export enum WorkStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  WORKING = 'working',
  COMPLETED = 'completed'
}

export enum ExecutionStage {
  PLANNING = 'planning',
  EXECUTION = 'execution',
  COMPLETED = 'completed'
}

export enum PlanType {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid'
}

export enum PaymentMode {
  UPI = 'UPI',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER'
}

export enum OpsStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface UserProfile {
  uid: string;
  name: string;
  displayName: string;
  email: string;
  phone: string;
  mobile?: string;
  aadhaar?: string;
  govtId?: string;
  address?: string;
  emergencyContact?: string;
  role: UserRole;
  department: 'sales' | 'ops' | 'admin';
  adminId?: string;
  isActive: boolean;
  status: UserStatus;
  createdAt: number;
  isProfileComplete?: boolean;
  assignedArea?: string;
  managerId?: string;
  bankDetails?: {
    account: string;
    ifsc: string;
  };
}

export type User = UserProfile;

export interface Lead {
  id: string;
  createdBy: string;
  salesAdminId: string;
  salesUserId?: string;
  clientName: string;
  name: string;
  clientPhone: string;
  phone: string;
  email?: string;
  companyName: string;
  // location is mixed as object or string in different views
  location: any;
  city?: string;
  lat?: number;
  lng?: number;
  basePrice: number;
  quantity: number;
  discount: number;
  finalPrice: number;
  potentialValue: number;
  panelCount: number;
  status: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  notes?: string;
  createdAt: number;
  approvedAt?: number;
  expiresAt: number;
}

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
  panelCount: number;
  plantCapacity: number;
  selectedPlan: PlanType;
  discount: number;
  finalPrice: number;
  createdBy: string;
  status: CustomerStatus;
  createdAt: number;
  updatedAt: number;
  serviceDate: number;
  timeline: {
    action: string;
    remarks: string;
    userName: string;
    timestamp: number;
  }[];
  salesId: string;
  opsId: string;
  assignedOps?: string;
  workStatus: WorkStatus;
  executionStage: ExecutionStage;
  billingAmount: number;
  conversionDeadline: number;
  invoices: any[];
  payments: any[];
  rejectionReason?: string;
}

export interface Order {
  id: string;
  leadId: string;
  salesUserId: string;
  opsUserId: string;
  assignedBy: string;
  status: OrderStatus;
  timeline: {
    acceptedAt?: number;
    startedAt?: number;
    completedAt?: number;
    paymentAt?: number;
  };
  createdAt: number;
  clientName?: string;
  panelCount?: number;
  serviceDate?: number;
  assignedCleaner?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  proofUrl: string;
  uploadedBy: string;
  createdAt: number;
  clientName?: string;
  status?: PaymentStatus;
  mode?: PaymentMode;
}

export interface Notification {
  id: string;
  toUserId: string;
  type: 'NEW_ASSIGNMENT' | 'STATUS_UPDATE' | 'PAYMENT_RECEIVED';
  message: string;
  relatedId: string;
  isRead: boolean;
  createdAt: number;
}

export type RoutePath = 
  'dashboard' | 'leads' | 'orders' | 'users' | 'profile' | 'notifications' |
  'project-detail' | 'lead-detail' | 'user-detail' | 'order-detail' | 'payment-detail' |
  'add' | 'add-customer' | 'customers';

export interface ViewState {
  path: RoutePath;
  id?: string;
}

// Added helper utility to mask sensitive data
export const maskAadhaar = (val?: string) => {
  if (!val) return 'XXXX-XXXX-XXXX';
  return 'XXXX-XXXX-' + val.slice(-4);
};
