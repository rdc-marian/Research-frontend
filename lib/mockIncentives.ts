import { apiGet, apiPostJson, apiPatchJson, apiDelete, getUserAvatarUrl } from "./api";

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
  facultyAvatar?: string;
  facultyObj?: any;
  department?: string;
  researchCenter?: string;
  category: IncentiveCategory;
  amountRequested: number;
  dateApplied: string;
  updatedAt?: string;
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
  proofImage?: string; // Uploaded proof as base64 string
  eventType?: string; // Conference, Workshop, etc.
  // Reviewer details & notes
  libraryNote?: string;
  guideNote?: string;
  adminNote?: string;
  principalNote?: string;
  reviewedBy?: any[];
}

/**
 * Fetch all incentive applications from the database
 */
export const getIncentives = async (): Promise<IncentiveApplication[]> => {
  const res = await apiGet<{ items: any[] }>("/incentives");
  return (res.items || []).map((item) => {
    const fac = item.faculty && typeof item.faculty === "object" ? item.faculty : null;
    const avatarUrl = fac ? getUserAvatarUrl(fac) : "";
    const centerName = fac?.researchCenter && typeof fac.researchCenter === "object"
      ? fac.researchCenter.name
      : fac?.researchCenter || "";

    return {
      id: item._id,
      facultyName: item.facultyName || fac?.name || "Faculty Member",
      facultyEmail: item.facultyEmail || fac?.email || "",
      facultyAvatar: avatarUrl || fac?.avatar || "",
      facultyObj: fac,
      department: fac?.department || "",
      researchCenter: centerName,
      category: item.category,
      amountRequested: item.amountRequested,
      dateApplied: item.dateApplied || item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.dateApplied || item.createdAt,
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
      libraryNote: item.libraryNote,
      guideNote: item.guideNote,
      adminNote: item.adminNote,
      principalNote: item.principalNote,
      reviewedBy: item.reviewedBy,
    };
  });
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

/**
 * Delete an incentive application by ID
 */
export const deleteIncentive = async (id: string): Promise<any> => {
  return apiDelete(`/incentives/${id}`);
};


