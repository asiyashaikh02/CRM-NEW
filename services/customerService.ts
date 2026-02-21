import { doc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Customer, CustomerStatus, ExecutionStage, Lead, WorkStatus, PlanType } from "../types";

export const convertLeadToCustomer = async (lead: Lead) => {
  const batch = writeBatch(db);
  const customerId = `cust_${lead.id}`;
  
  const customerData: any = {
    id: customerId,
    leadId: lead.id,
    name: lead.clientName,
    phone: lead.clientPhone,
    email: '',
    address: lead.location.address,
    plantCapacity: (lead.panelCount || 0) * 0.5,
    selectedPlan: PlanType.SILVER,
    finalPrice: lead.finalPrice,
    createdBy: lead.createdBy,
    salesId: lead.createdBy,
    opsId: 'PENDING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false
  };

  batch.set(doc(db, "customers", customerId), customerData);
  batch.update(doc(db, "leads", lead.id), { isDeleted: true, updatedAt: serverTimestamp() });
  
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