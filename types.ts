
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SALES_ADMIN = 'SALES_ADMIN',
  OPS_ADMIN = 'OPS_ADMIN',
  SALES_USER = 'SALES_USER',
  OPS_USER = 'OPS_USER'
}

export enum LeadStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  FORWARDED = 'forwarded'
}

export enum OrderStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  WORKING = 'working',
  COMPLETED = 'completed',
  PAYMENT_RECEIVED = 'payment_received'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: 'sales' | 'ops' | 'admin';
  adminId?: string;
  isActive: boolean;
  createdAt: number;
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
  createdAt: number;
  approvedAt?: number;
  expiresAt: number;
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
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  proofUrl: string;
  uploadedBy: string;
  createdAt: number;
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

export type RoutePath = 'dashboard' | 'leads' | 'orders' | 'users' | 'profile';

export interface ViewState {
  path: RoutePath;
  id?: string;
}
