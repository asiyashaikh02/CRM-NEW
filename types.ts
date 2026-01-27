
export enum UserRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  SALES = 'SALES',
  OPERATIONS = 'OPERATIONS',
  USER = 'USER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED'
}

export enum LeadStatus {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATION = 'NEGOTIATION',
  CONVERTED = 'CONVERTED'
}

export enum LeadSource {
  INSTAGRAM = 'INSTAGRAM',
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  MANUAL = 'MANUAL'
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum CustomerStatus {
  CONVERTING = 'CONVERTING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED'
}

export enum OpsStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum WorkStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED'
}

export enum ExecutionStage {
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION',
  DELIVERED = 'DELIVERED',
  CLOSED = 'CLOSED'
}

export enum InvoiceType {
  ADVANCE = 'ADVANCE',
  FINAL = 'FINAL'
}

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface Receipt {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  collectedBy: string; // userId
  timestamp: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  type: InvoiceType;
  amount: number; // Base amount
  taxAmount: number; // GST
  totalAmount: number; // amount + taxAmount
  totalOrderValue: number;
  status: InvoiceStatus;
  createdAt: number;
  paidAt?: number;
  dueDate: number;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  mobile: string;
  location?: Location;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  aadhaar?: string;
  profileImage?: string;
  createdAt: number;
  approvedAt?: number;
  internalNotes?: string;
  tags?: string[];
}

export interface ActivityLog {
  id: string;
  customerId: string;
  action: string;
  note?: string;
  createdAt: number;
  createdBy: string;
  createdByName: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  location: Location;
  salesId: string;
  opsId: string; // 'PENDING' initially
  status: CustomerStatus;
  opsStatus: OpsStatus;
  workStatus: WorkStatus;
  rejectionReason?: string;
  executionStage: ExecutionStage;
  billingAmount: number; // This is the Total Order Value
  internalCost: number;
  conversionAt: number;
  conversionDeadline: number;
  createdFromLeadId: string;
  activityLogs: ActivityLog[];
  gstNumber?: string;
  industry?: string;
  invoices: Invoice[];
  receipts: Receipt[];
}

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  source: LeadSource | string;
  status: LeadStatus;
  priority: LeadPriority;
  salesUserId: string;
  potentialValue: number;
  createdAt: number;
  location?: Location;
  industry?: string;
  notes?: string;
}

export const maskAadhaar = (aadhaar?: string) => {
  if (!aadhaar) return 'NOT_PROVIDED';
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
};
