
export enum UserRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  SALES = 'SALES',
  OPERATIONS = 'OPERATIONS',
  USER = 'USER'
}

export enum AuthStatus {
  UNVERIFIED = 'UNVERIFIED',
  ACTIVE = 'ACTIVE'
}

export enum ProfileStatus {
  NOT_STARTED = 'NOT_STARTED',
  INCOMPLETE = 'INCOMPLETE',
  COMPLETED = 'COMPLETED'
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
  MANUAL = 'MANUAL',
  NETWORK = 'NETWORK'
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

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export type PaymentMode = 'UPI' | 'CASH' | 'BANK' | 'BANK_TRANSFER';

export enum InvoiceType {
  ADVANCE = 'ADVANCE',
  MILESTONE = 'MILESTONE',
  FINAL = 'FINAL',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  authStatus: AuthStatus;
  profileStatus: ProfileStatus;
  displayName: string;
  mobile: string;
  profileCompleted: boolean;
  location?: Location;
  bankDetails?: BankDetails;
  aadhaar?: string;
  panNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  createdAt: number;
  approvedAt?: number;
  age?: number;
  status?: UserStatus; 
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

export interface Proof {
  url: string;
  uploadedAt: number;
}

export interface Task {
  id: string;
  name: string;
  status: 'PENDING' | 'COMPLETED';
  proofUrl?: string;
  completedAt?: number;
  customerId?: string;
  assignedTo?: string;
  assignedToName?: string;
  proofs: Proof[];
  milestoneLinked?: InvoiceType;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  status: InvoiceStatus;
  type: InvoiceType;
  createdAt: number;
  dueDate: number;
}

export interface Receipt {
  id: string;
  paymentId: string;
  customerId: string;
  customerName: string;
  customerUid: string;
  amount: number;
  mode: PaymentMode;
  date: number;
  authorizedBy: string;
}

export interface Payment {
  id: string;
  amount: number;
  type: InvoiceType;
  mode: PaymentMode;
  createdAt: number;
  customerId?: string;
  projectId?: string;
  status?: string;
  reference?: string;
  notes?: string;
  createdBy?: string;
  createdByName?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  location: Location;
  salesId: string;
  opsId: string;
  status: CustomerStatus;
  executionStage: ExecutionStage;
  billingAmount: number;
  advanceCollected: number;
  gstApplied: boolean;
  conversionAt: number;
  conversionDeadline: number;
  activityLogs: ActivityLog[];
  payments: Payment[];
  tasks: Task[];
  opsStatus?: OpsStatus;
  workStatus?: WorkStatus;
  internalCost?: number;
  createdFromLeadId?: string;
  receipts: Receipt[];
  invoices: Invoice[];
  gstNumber?: string;
  industry?: string;
  rejectionReason?: string;
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
  notes?: string;
  location?: Location | string;
}

export const maskAadhaar = (aadhaar?: string) => {
  if (!aadhaar) return 'NOT_SET';
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
};
