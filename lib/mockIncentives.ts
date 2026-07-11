import { apiGet, apiPostJson, apiPatchJson } from "./api";

export type IncentiveCategory = "Publication" | "Patent" | "Registration Fee";

export type IncentiveStatus =
  | "Pending Library"
  | "Pending Guide"
  | "Pending Admin"
  | "Pending Principal"
  | "Approved"
  | "Paid"
  | "Rejected";

export interface IncentiveApplication {
  id: string; // Maps to _id in MongoDB
  facultyName: string;
  facultyEmail: string;
  category: IncentiveCategory;
  amountRequested: number;
  dateApplied: string;
  status: IncentiveStatus;
  
  // Publication fields
  publicationTitle?: string;
  journalName?: string;
  doiLink?: string;
  pubStatus?: string; // Accepted / Published
  
  // Patent fields
  patentTitle?: string;
  patentNumber?: string;
  patentStatus?: string; // Filed / Published / Granted
  
  // Registration fields
  eventName?: string;
  eventType?: string; // Conference, Workshop, etc.
  proofImage?: string; // Uploaded proof as base64 string
}

/**
 * Fetch all incentive applications from the database
 */
export const getIncentives = async (): Promise<IncentiveApplication[]> => {
  const res = await apiGet<{ items: any[] }>("/incentives");
  return (res.items || []).map((item) => ({
    id: item._id,
    facultyName: item.facultyName,
    facultyEmail: item.facultyEmail,
    category: item.category,
    amountRequested: item.amountRequested,
    dateApplied: item.dateApplied || item.createdAt || new Date().toISOString(),
    status: item.status,
    publicationTitle: item.publicationTitle,
    journalName: item.journalName,
    doiLink: item.doiLink,
    pubStatus: item.pubStatus,
    patentTitle: item.patentTitle,
    patentNumber: item.patentNumber,
    patentStatus: item.patentStatus,
    eventName: item.eventName,
    eventType: item.eventType,
    proofImage: item.proofImage,
  }));
};

/**
 * Update the status of a specific incentive application
 */
export const updateIncentiveStatus = async (
  id: string,
  status: IncentiveStatus,
  notes?: Record<string, string>
): Promise<any> => {
  return apiPatchJson(`/incentives/${id}/status`, { status, ...notes });
};

/**
 * Submit a new incentive application
 */
export const createIncentive = async (
  data: Partial<IncentiveApplication>
): Promise<any> => {
  return apiPostJson("/incentives", data);
};


