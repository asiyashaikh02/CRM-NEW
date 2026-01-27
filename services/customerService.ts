import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Customer, CustomerStatus, ExecutionStage, Lead, OpsStatus, WorkStatus } from "../types";

// Fixed: Added missing required fields (opsStatus, workStatus, activityLogs, invoices, receipts) to match Customer interface.
export const convertLeadToCustomer = async (lead: Lead) => {
  const batch = writeBatch(db);
  const customerId = `cust_${lead.id}`;
  
  const customerData: Customer = {
    id: customerId,
    name: lead.name,
    companyName: lead.companyName,
    phone: lead.phone,
    email: lead.email || '',
    location: { address: '', city: '', state: '', pincode: '' }, // Placeholder, logic for population elsewhere
    salesId: lead.salesUserId,
    opsId: 'PENDING',
    status: CustomerStatus.CONVERTING,
    opsStatus: OpsStatus.PENDING,
    workStatus: WorkStatus.ASSIGNED,
    executionStage: ExecutionStage.PLANNING,
    internalCost: 0,
    billingAmount: lead.potentialValue,
    conversionAt: Date.now(),
    conversionDeadline: Date.now() + (72 * 60 * 60 * 1000), // 72 hours
    createdFromLeadId: lead.id,
    activityLogs: [],
    // Added required invoices and receipts property to fix the interface error.
    invoices: [],
    receipts: []
  };

  batch.set(doc(db, "customers", customerId), customerData);
  batch.delete(doc(db, "leads", lead.id));
  
  await batch.commit();
};

// Fixed: Removed isLocked and activatedAt as they are not defined in the Customer interface.
export const activateCustomer = async (id: string) => {
  await updateDoc(doc(db, "customers", id), {
    status: CustomerStatus.ACTIVE
  });
};

export const deleteCustomer = async (id: string) => {
  await deleteDoc(doc(db, "customers", id));
};

export const updateOpsMetrics = async (id: string, stage: ExecutionStage, cost: number) => {
  await updateDoc(doc(db, "customers", id), {
    executionStage: stage,
    internalCost: cost
  });
};