import { doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Customer, CustomerStatus, ExecutionStage, Lead, WorkStatus, PlanType } from "../types";

// Fixed: Corrected Customer object mapping to match the interface in types.ts
export const convertLeadToCustomer = async (lead: Lead) => {
  const batch = writeBatch(db);
  const customerId = `cust_${lead.id}`;
  
  const customerData: Customer = {
    id: customerId,
    customerId: `CUST-${lead.id}`,
    name: lead.name,
    companyName: lead.companyName,
    phone: lead.phone || '',
    email: lead.email || '',
    address: '',
    // Fix: Added missing city property from lead to satisfy Customer interface requirements
    city: lead.city || '',
    panelCount: lead.panelCount,
    // Estimated capacity for new nodes
    plantCapacity: lead.panelCount * 0.5,
    selectedPlan: PlanType.SILVER,
    discount: 0,
    finalPrice: lead.potentialValue,
    createdBy: lead.salesUserId,
    status: CustomerStatus.ACTIVE,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // Fix: Added missing serviceDate property required by Customer interface
    serviceDate: Date.now(),
    timeline: [],
    salesId: lead.salesUserId,
    opsId: 'PENDING',
    workStatus: WorkStatus.ASSIGNED,
    executionStage: ExecutionStage.PLANNING,
    billingAmount: lead.potentialValue,
    conversionDeadline: Date.now() + (72 * 60 * 60 * 1000), // 72 hours
    invoices: [],
    payments: []
  };

  batch.set(doc(db, "customers", customerId), customerData);
  batch.delete(doc(db, "leads", lead.id));
  
  await batch.commit();
};

// Fixed: Removed 'currentStatus' as it is not defined in the Customer interface
export const activateCustomer = async (id: string) => {
  await updateDoc(doc(db, "customers", id), {
    status: CustomerStatus.ACTIVE
  });
};

export const deleteCustomer = async (id: string) => {
  await deleteDoc(doc(db, "customers", id));
};

// Fixed: Removed 'internalCost' update as it is not part of the standard Customer schema
export const updateOpsMetrics = async (id: string, stage: ExecutionStage, cost: number) => {
  await updateDoc(doc(db, "customers", id), {
    executionStage: stage
  });
};