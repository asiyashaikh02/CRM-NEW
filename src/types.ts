
import { Timestamp, FieldValue } from 'firebase/firestore';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SALES_ADMIN = 'SALES_ADMIN',
  OPS_ADMIN = 'OPS_ADMIN',
  SALES_USER = 'SALES_USER',
  OPS_USER = 'OPS_USER',
  // Legacy roles for compatibility
  SALES_MANAGER = 'SALES_MANAGER',
  OPS_MANAGER = 'OPS_MANAGER',
  SALES = 'SALES',
  OPS = 'OPS',
  SALES_EXEC = 'SALES_EXEC',
  OPERATIONS = 'OPERATIONS'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  BLOCKED = 'BLOCKED'
}

export enum PlanType {
  TRIAL = 'TRIAL',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  UPGRADED = 'UPGRADED'
}

export enum LeadStatus {
  NEW = 'NEW',
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  FORWARDED = 'FORWARDED',
  CONVERTED = 'CONVERTED'
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
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  // Legacy
  SCHEDULED = 'SCHEDULED'
}

export enum CustomerStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  TRANSFERRED_TO_OPS = 'TRANSFERRED_TO_OPS',
  COMPLETED = 'COMPLETED',
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED'
}

export enum WorkStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED'
}

export enum ExecutionStage {
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION',
  COMPLETED = 'COMPLETED'
}

export enum PaymentMode {
  UPI = 'UPI',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CHEQUE = 'CHEQUE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum ClearanceStatus {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED'
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
  role: UserRole;
  department: 'sales' | 'ops' | 'admin';
  isActive: boolean;
  status: UserStatus;
  
  // Plan Fields
  planType: PlanType;
  planStatus: PlanStatus;
  trialStartAt: Timestamp | null;
  trialEndAt: Timestamp | null;
  
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  isDeleted: boolean;
  isProfileComplete: boolean;
  assignedArea?: string;
}

export interface TimelineEntry {
  id: string;
  action: string;
  remarks: string;
  userId: string;
  userName: string;
  createdAt: Timestamp | FieldValue;
}

export interface Lead {
  id: string;
  createdBy: string;
  salesAdminId: string;
  clientName: string;
  clientPhone: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  basePrice: number;
  quantity: number;
  discount: number;
  finalPrice: number;
  status: LeadStatus;
  priority: LeadPriority;
  
  // Legacy fields for compatibility
  name?: string;
  phone?: string;
  companyName?: string;
  potentialValue?: number;
  panelCount?: number;
  salesUserId?: string;
  city?: string;
  
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  approvedAt?: Timestamp | null;
  expiresAt: Timestamp | null;
  isDeleted: boolean;
}

export interface Customer {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  plantCapacity: number;
  selectedPlan: PlanType;
  finalPrice: number;
  
  createdBy: string;
  salesId: string;
  opsId: string;
  
  // Legacy fields for compatibility
  status?: CustomerStatus;
  workStatus?: WorkStatus;
  executionStage?: ExecutionStage;
  billingAmount?: number;
  conversionDeadline?: number;
  rejectionReason?: string;
  assignedOps?: string;
  companyName?: string;
  customerId?: string;
  payments?: any[];
  timeline?: any[];
  
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  isDeleted: boolean;
}

export interface Order {
  id: string;
  leadId: string;
  customerId: string;
  salesUserId: string;
  opsUserId: string;
  status: OrderStatus;
  
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  isDeleted: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  proofUrl: string;
  
  // Cheque Fields
  chequeNumber?: string;
  chequeDate?: Timestamp | null;
  bankName?: string;
  clearanceStatus?: ClearanceStatus;
  clearedAt?: Timestamp | null;
  
  uploadedBy: string;
  verifiedBy?: string;
  verifiedAt?: Timestamp | null;
  
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  isDeleted: boolean;
}

export interface Notification {
  id: string;
  toUserId: string;
  fromUserId: string;
  role: UserRole;
  type: string;
  relatedId: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp | FieldValue;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'TEXT' | 'SYSTEM' | 'IMAGE';
  imageUrl?: string;
  createdAt: Timestamp | FieldValue;
}

export type RoutePath = 
  | 'dashboard' | 'leads' | 'orders' | 'users' | 'profile' | 'notifications'
  | 'lead-detail' | 'order-detail' | 'payment-detail' | 'customers' | 'payments'
  | 'admin' | 'sales' | 'operations';

export interface ViewState {
  path: RoutePath;
  id?: string;
}

export type User = UserProfile;
export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export const maskAadhaar = (val?: string) => {
  if (!val) return 'XXXX-XXXX-XXXX';
  return 'XXXX-XXXX-' + val.slice(-4);
};
