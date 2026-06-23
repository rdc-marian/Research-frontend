export type IncentiveCategory = "Publication" | "Patent" | "Registration Fee";

export type IncentiveStatus = "Pending Library" | "Pending Guide" | "Pending Admin" | "Pending Principal" | "Approved" | "Paid" | "Rejected";

export interface IncentiveApplication {
  id: string;
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

export const getMockIncentives = (): IncentiveApplication[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_incentives");
  if (stored) {
    return JSON.parse(stored);
  }
  // Initial seed data
  const seed: IncentiveApplication[] = [
    {
      id: "INC-001",
      facultyName: "Dr. Elizabeth Paul",
      facultyEmail: "elizabeth.paul@univ.edu",
      category: "Publication",
      amountRequested: 5000,
      dateApplied: new Date().toISOString(),
      status: "Pending Library",
      publicationTitle: "Machine Learning in Academic Registry Systems",
      journalName: "IEEE Transactions on Education",
      doiLink: "https://doi.org/10.1109/TE.2024.123",
      pubStatus: "Published"
    },
    {
      id: "INC-002",
      facultyName: "Dr. Elizabeth Paul",
      facultyEmail: "elizabeth.paul@univ.edu",
      category: "Patent",
      amountRequested: 15000,
      dateApplied: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "Approved",
      patentTitle: "Optimized Blockchain Architecture",
      patentNumber: "PAT-2023-112233",
      patentStatus: "Granted"
    }
  ];
  localStorage.setItem("mock_incentives", JSON.stringify(seed));
  return seed;
};

export const saveMockIncentives = (incentives: IncentiveApplication[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_incentives", JSON.stringify(incentives));
  }
};
