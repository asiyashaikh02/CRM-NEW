
export enum UserRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  SALES = 'SALES',
  OPERATIONS = 'OPERATIONS'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED'
}

export enum LeadStatus {
  NEW = 'NEW',
  NEGOTIATION = 'NEGOTIATION',
  APPROVED = 'APPROVED'
}

export enum CustomerStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE'
}

export enum ExecutionStage {
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION',
  DELIVERED = 'DELIVERED'
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  createdAt: number;
}

export interface Profile {
  uid: string;
  uniqueId: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  role: UserRole;
  createdAt: number;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: LeadStatus;
  salesUserId: string;
  potentialValue: number;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  linkedLeadId: string;
  salesUserId: string;
  status: CustomerStatus;
  executionStage: ExecutionStage;
  billingAmount: number;
  internalCost: number;
  createdAt: number;
  // Added properties used in business logic and activation flows
  isLocked?: boolean;
  activatedAt?: number;
}
