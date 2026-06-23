import Cookies from "js-cookie";

export type ApiListResponse<T> = {
  items: T[];
};

export type ApiItemResponse<T> = {
  item: T;
};

export type ApiMessageResponse = {
  message: string;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const fallbackBaseUrl = "http://localhost:5000/api";
const resolvedBaseUrl = (rawBaseUrl || fallbackBaseUrl).replace(/\/$/, "");

export const API_BASE_URL = resolvedBaseUrl;

// Mock database structures and seed data
const DEFAULT_DB = {
  users: [
    {
      _id: "mock-scholar-id",
      name: "Albin Joseph",
      email: "albin@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      guide: { _id: "mock-guide-id", name: "Dr. Elizabeth Paul" }
    },
    {
      _id: "mock-scholar-2",
      name: "Binu Thomas",
      email: "binu@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      guide: { _id: "mock-guide-id", name: "Dr. Elizabeth Paul" }
    },
    {
      _id: "mock-scholar-3",
      name: "Chitra Nair",
      email: "chitra@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      guide: { _id: "mock-guide-id", name: "Dr. Elizabeth Paul" }
    },
    {
      _id: "mock-guide-id",
      name: "Dr. Elizabeth Paul",
      email: "elizabeth.paul@univ.edu",
      role: "faculty",
      roles: ["faculty", "research_guide"],
      department: "MCA",
      status: "Active"
    },
    {
      _id: "mock-coordinator-id",
      name: "Prof. Sijo Mon",
      email: "coordinator@univ.edu",
      role: "coordinator",
      roles: ["coordinator"],
      department: "MCA",
      status: "Active"
    },
    {
      _id: "mock-admin-id",
      name: "Dr. Anil Kumar",
      email: "admin@univ.edu",
      role: "admin",
      roles: ["admin"],
      status: "Active"
    },
    {
      _id: "mock-library-id",
      name: "Sijo Library",
      email: "library@univ.edu",
      role: "library",
      roles: ["library"],
      status: "Active"
    }
  ],
  departments: [
    {
      _id: "dept-mca",
      name: "MCA",
      email: "coordinator@univ.edu",
      totalScholars: 3,
      coordinator: { name: "Prof. Sijo Mon", email: "coordinator@univ.edu" }
    },
    {
      _id: "dept-cse",
      name: "Computer Science",
      email: "cse@univ.edu",
      totalScholars: 0,
      coordinator: { name: "Dr. Paulose V", email: "paulose@univ.edu" }
    }
  ],
  researchCenters: [
    {
      _id: "center-mca",
      name: "MCA Research Center",
      code: "MCA",
      status: "Active",
      coordinator: { name: "Prof. Sijo Mon", email: "coordinator@univ.edu" },
      department: { name: "MCA" }
    },
    {
      _id: "center-cse",
      name: "Computer Science Research Center",
      code: "CSE",
      status: "Active",
      coordinator: { name: "Dr. Paulose V", email: "paulose@univ.edu" },
      department: { name: "Computer Science" }
    }
  ],
  leaves: [
    {
      _id: "leave-1",
      scholarId: "mock-scholar-id",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph", email: "albin@univ.edu", department: "MCA" },
      leaveType: "Casual Leave",
      startDate: "2026-06-10",
      endDate: "2026-06-12",
      totalDays: 3,
      reason: "Attending sister's wedding",
      status: "ApprovedByCoordinator",
      guideNote: "Approved. Enjoy!",
      coordinatorNote: "Approved.",
      createdAt: "2026-06-01T10:00:00.000Z"
    },
    {
      _id: "leave-2",
      scholarId: "mock-scholar-id",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph", email: "albin@univ.edu", department: "MCA" },
      leaveType: "Duty Leave",
      startDate: "2026-06-20",
      endDate: "2026-06-22",
      totalDays: 3,
      reason: "Research workshop participation",
      status: "Pending",
      createdAt: "2026-06-05T12:00:00.000Z"
    }
  ],
  submissions: [
    {
      _id: "sub-1",
      title: "Research Progress Report - Semester 1",
      abstract: "This report outlines the research objectives, methodology, and progress made in the first semester regarding medical image segmentation using deep learning techniques.",
      department: "MCA",
      status: "Pending",
      submittedAt: "2026-05-15T09:00:00.000Z",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph" },
      file: { url: "#", originalName: "Progress_Report_Sem1.pdf" }
    },
    {
      _id: "sub-2",
      title: "Literature Review on Deep Learning",
      abstract: "A comprehensive literature review analyzing various convolutional neural network architectures for computer vision tasks.",
      department: "MCA",
      status: "Approved",
      submittedAt: "2026-04-10T14:30:00.000Z",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph" },
      file: { url: "#", originalName: "Literature_Review.pdf" }
    }
  ],
  qualifications: [
    {
      _id: "qual-1",
      scholarId: "mock-scholar-id",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph", email: "albin@univ.edu", department: "MCA" },
      degree: "Post Graduation (MCA)",
      subject: "Computer Applications",
      institution: "SJC College",
      university: "MG University",
      yearOfPassing: 2024,
      percentage: 88.5,
      status: "Completed",
      verificationStatus: "Approved",
      createdAt: "2026-05-01T08:00:00.000Z"
    }
  ],
  publications: [
    {
      _id: "pub-1",
      scholarId: "mock-scholar-id",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph", email: "albin@univ.edu", department: "MCA" },
      title: "A Survey on Deep Learning Techniques for Image Segmentation",
      authors: "Albin Joseph, Elizabeth Paul",
      journalName: "International Journal of Computer Science",
      volume: "12",
      issue: "3",
      pages: "100-115",
      issnIsbn: "1234-5678",
      publishDate: "2025-11-20",
      impactFactor: 2.5,
      publicationUrl: "https://example.com/pub1",
      indexing: ["Scopus", "UGC CARE"],
      verificationStatus: "Approved",
      createdAt: "2026-05-02T08:00:00.000Z"
    }
  ],
  conferences: [
    {
      _id: "conf-1",
      scholarId: "mock-scholar-id",
      scholar: { _id: "mock-scholar-id", name: "Albin Joseph", email: "albin@univ.edu", department: "MCA" },
      title: "IEEE International Conference on Advanced Computing",
      paperTitle: "Optimized CNN for Segmenting Brain Tumors",
      presentationType: "Oral",
      organizer: "IEEE Kerala Section",
      venue: "Kochi, India",
      startDate: "2025-12-05",
      endDate: "2025-12-07",
      proceedingsDetails: "DOI: 10.1109/ICAC.2025.12345",
      verificationStatus: "Approved",
      createdAt: "2026-05-03T08:00:00.000Z"
    }
  ],
  patents: [] as any[],
  workshops: [] as any[],
  memberships: [] as any[],
  scholarships: [] as any[]
};

const getDB = (): typeof DEFAULT_DB => {
  if (typeof window === "undefined") return DEFAULT_DB;
  const data = localStorage.getItem("research_mock_db");
  if (!data) {
    localStorage.setItem("research_mock_db", JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  try {
    const parsed = JSON.parse(data);
    let updated = false;
    if (!parsed.researchCenters) {
      parsed.researchCenters = DEFAULT_DB.researchCenters;
      updated = true;
    }
    if (parsed.users && !parsed.users.some((u: any) => u._id === "mock-library-id")) {
      parsed.users.push({
        _id: "mock-library-id",
        name: "Sijo Library",
        email: "library@univ.edu",
        role: "library",
        roles: ["library"],
        status: "Active"
      });
      updated = true;
    }
    if (updated) {
      localStorage.setItem("research_mock_db", JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_DB;
  }
};

const saveDB = (db: typeof DEFAULT_DB) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("research_mock_db", JSON.stringify(db));
};

const getPortfolioSummary = (scholarId: string) => {
  const db = getDB();
  const getStats = (items: any[]) => {
    const filtered = items.filter(
      (x) => x.scholarId === scholarId || x.scholar?._id === scholarId
    );
    const total = filtered.length;
    const Pending = filtered.filter(
      (x) =>
        x.verificationStatus === "Pending" ||
        x.status === "Pending"
    ).length;
    const Approved = filtered.filter(
      (x) =>
        x.verificationStatus === "Approved" ||
        x.status === "Approved" ||
        x.status === "ApprovedByGuide" ||
        x.status === "ApprovedByCoordinator"
    ).length;
    const Rejected = filtered.filter(
      (x) => x.verificationStatus === "Rejected" || x.status === "Rejected"
    ).length;
    return { total, Pending, Approved, Rejected };
  };

  return {
    summary: {
      qualifications: getStats(db.qualifications),
      publications: getStats(db.publications),
      conferences: getStats(db.conferences),
      patents: getStats(db.patents),
      workshops: getStats(db.workshops),
      memberships: getStats(db.memberships),
      scholarships: getStats(db.scholarships),
      leaves: getStats(db.leaves),
      projects: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
      guidance: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
      grants: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
      awards: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
      consultancy: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
      resourcePerson: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
    },
  };
};

const getPortfolioApprovals = (guideId: string) => {
  const db = getDB();
  const scholarsOfGuide = db.users.filter(
    (u) => u.role === "scholar" && u.guide?._id === guideId
  );
  const scholarIds = scholarsOfGuide.map((s) => s._id);

  const categories = [
    { name: "qualification", list: db.qualifications },
    { name: "publication", list: db.publications },
    { name: "conference", list: db.conferences },
    { name: "patent", list: db.patents },
    { name: "workshop", list: db.workshops },
    { name: "membership", list: db.memberships },
    { name: "scholarship", list: db.scholarships },
  ];

  const items: any[] = [];
  for (const cat of categories) {
    const pendingItems = cat.list.filter(
      (item) =>
        scholarIds.includes(item.scholarId) &&
        item.verificationStatus === "Pending"
    );
    for (const item of pendingItems) {
      const scholar = db.users.find((u) => u._id === item.scholarId);
      items.push({
        ...item,
        category: cat.name,
        scholar: scholar
          ? {
              _id: scholar._id,
              name: scholar.name,
              email: scholar.email,
              department: scholar.department,
            }
          : undefined,
      });
    }
  }
  return { items };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleMockRequest = async (
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: any
): Promise<any> => {
  await delay(150);

  // Clean prefix like resolvesBaseUrl or double /api/api/ if present
  let cleanPath = path;
  if (cleanPath.startsWith(resolvedBaseUrl)) {
    cleanPath = cleanPath.substring(resolvedBaseUrl.length);
  }
  // Strip any duplicate "/api" if it exists
  cleanPath = cleanPath.replace(/^\/api\/api\//, "/api/");
  if (cleanPath.startsWith("/api")) {
    cleanPath = cleanPath.substring(4);
  }
  if (!cleanPath.startsWith("/")) {
    cleanPath = "/" + cleanPath;
  }

  const parsedUrl = new URL(cleanPath, "http://localhost");
  const pathname = parsedUrl.pathname;
  const params = parsedUrl.searchParams;

  const db = getDB();

  // Route: GET /users
  if (method === "GET" && pathname === "/users") {
    const role = params.get("role");
    let items = db.users;
    if (role) {
      items = items.filter(u => u.role === role || u.roles?.includes(role));
    }
    return { items };
  }
  // Route: POST /users
  if (method === "POST" && pathname === "/users") {
    const newUser = {
      _id: "user-" + Date.now(),
      name: body.name,
      email: body.email,
      role: body.role || "scholar",
      roles: body.roles || [body.role || "scholar"],
      department: body.department || "MCA",
      status: body.status || "Active",
      guide: body.guideId ? { _id: body.guideId, name: db.users.find(u => u._id === body.guideId)?.name || "Unknown Guide" } : undefined
    };
    db.users.push(newUser);
    saveDB(db);
    return { item: newUser };
  }
  // Route: GET /users/:id
  if (method === "GET" && pathname.startsWith("/users/")) {
    const id = pathname.substring(7);
    const item = db.users.find(u => u._id === id);
    if (!item) throw new Error("User not found");
    return { item };
  }

  // Route: PATCH /users/:id
  if (method === "PATCH" && pathname.startsWith("/users/")) {
    const id = pathname.substring(7);
    const userIdx = db.users.findIndex(u => u._id === id);
    if (userIdx === -1) throw new Error("User not found");
    db.users[userIdx] = { ...db.users[userIdx], ...body };
    saveDB(db);
    return { item: db.users[userIdx] };
  }

  // Route: DELETE /users/:id
  if (method === "DELETE" && pathname.startsWith("/users/")) {
    const id = pathname.substring(7);
    db.users = db.users.filter(u => u._id !== id);
    saveDB(db);
    return { message: "Success" };
  }

  // Route: GET /departments
  if (method === "GET" && pathname === "/departments") {
    return { items: db.departments };
  }

  // Route: GET /research-centers
  if (method === "GET" && pathname === "/research-centers") {
    return { items: db.researchCenters || [] };
  }

  // Route: POST /research-centers
  if (method === "POST" && pathname === "/research-centers") {
    const newCenter = {
      _id: "center-" + Date.now(),
      name: body.name,
      code: body.code,
      status: body.status || "Active",
      coordinator: body.coordinatorId ? {
        _id: body.coordinatorId,
        name: db.users.find(u => u._id === body.coordinatorId)?.name || "Unknown"
      } : null,
      department: body.departmentId ? {
        _id: body.departmentId,
        name: db.departments.find(d => d._id === body.departmentId)?.name || "Unknown"
      } : null
    };
    if (!db.researchCenters) db.researchCenters = [];
    db.researchCenters.push(newCenter);
    saveDB(db);
    return { item: newCenter };
  }

  // Route: GET /research-centers/:id
  if (method === "GET" && pathname.startsWith("/research-centers/")) {
    const id = pathname.substring(18);
    const item = (db.researchCenters || []).find(c => c._id === id);
    if (!item) throw new Error("Research center not found");
    return { item };
  }

  // Route: PATCH /research-centers/:id
  if (method === "PATCH" && pathname.startsWith("/research-centers/")) {
    const id = pathname.substring(18);
    const idx = (db.researchCenters || []).findIndex(c => c._id === id);
    if (idx === -1) throw new Error("Research center not found");
    db.researchCenters[idx] = { ...db.researchCenters[idx], ...body };
    saveDB(db);
    return { item: db.researchCenters[idx] };
  }

  // Route: DELETE /research-centers/:id
  if (method === "DELETE" && pathname.startsWith("/research-centers/")) {
    const id = pathname.substring(18);
    db.researchCenters = (db.researchCenters || []).filter(c => c._id !== id);
    saveDB(db);
    return { message: "Success" };
  }

  // Route: GET /leaves
  if (method === "GET" && pathname === "/leaves") {
    const scholarId = params.get("scholarId");
    const guideId = params.get("guideId");
    const status = params.get("status");
    const department = params.get("department");

    let items = db.leaves;
    if (scholarId) {
      items = items.filter(l => l.scholarId === scholarId);
    }
    if (guideId) {
      const scholarIds = db.users.filter(u => u.guide?._id === guideId).map(u => u._id);
      items = items.filter(l => scholarIds.includes(l.scholarId));
    }
    if (status) {
      items = items.filter(l => l.status === status);
    }
    if (department) {
      items = items.filter(l => l.scholar?.department === department);
    }
    return { items };
  }

  // Route: POST /leaves
  if (method === "POST" && pathname === "/leaves") {
    let payload: any = {};
    if (body instanceof FormData) {
      payload.scholarId = body.get("scholarId");
      payload.leaveType = body.get("leaveType");
      payload.startDate = body.get("startDate");
      payload.endDate = body.get("endDate");
      payload.totalDays = Number(body.get("totalDays") || 1);
      payload.reason = body.get("reason");
      const file = body.get("file");
      if (file && typeof file === "object" && "name" in file) {
        payload.document = { url: "#", originalName: file.name };
      }
    } else {
      payload = body;
    }

    const scholar = db.users.find(u => u._id === payload.scholarId) || db.users[0];
    const newLeave = {
      _id: "leave-" + Date.now(),
      scholarId: payload.scholarId || scholar._id,
      scholar: {
        _id: scholar._id,
        name: scholar.name,
        email: scholar.email,
        department: scholar.department || "MCA"
      },
      leaveType: payload.leaveType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalDays: payload.totalDays,
      reason: payload.reason,
      status: "Pending",
      document: payload.document,
      createdAt: new Date().toISOString()
    };

    db.leaves.push(newLeave);
    saveDB(db);
    return newLeave;
  }

  // Route: DELETE /leaves/:id
  if (method === "DELETE" && pathname.startsWith("/leaves/")) {
    const id = pathname.substring(8);
    db.leaves = db.leaves.filter(l => l._id !== id);
    saveDB(db);
    return { message: "Success" };
  }

  // Route: PATCH /leaves/:id/status
  if (method === "PATCH" && pathname.startsWith("/leaves/") && pathname.endsWith("/status")) {
    const parts = pathname.split("/");
    const id = parts[2];
    const leaveIndex = db.leaves.findIndex(l => l._id === id);
    if (leaveIndex === -1) throw new Error("Leave not found");

    const statusVal = body.status;
    const noteVal = body.note;
    const reviewer = db.users.find(u => u._id === body.reviewerId);

    if (reviewer?.role === "coordinator" || reviewer?.role === "admin" || statusVal === "ApprovedByCoordinator") {
      db.leaves[leaveIndex].status = statusVal;
      db.leaves[leaveIndex].coordinatorNote = noteVal;
    } else {
      db.leaves[leaveIndex].status = statusVal;
      db.leaves[leaveIndex].guideNote = noteVal;
    }

    saveDB(db);
    return { item: db.leaves[leaveIndex] };
  }

  // Route: GET /portfolio/summary
  if (method === "GET" && pathname === "/portfolio/summary") {
    const scholarId = params.get("scholarId");
    if (!scholarId) throw new Error("Missing scholarId");
    return getPortfolioSummary(scholarId);
  }

  // Route: GET /portfolio/approvals
  if (method === "GET" && pathname === "/portfolio/approvals") {
    const guideId = params.get("guideId");
    if (!guideId) throw new Error("Missing guideId");
    return getPortfolioApprovals(guideId);
  }

  // Route: GET /reports/summary
  if (method === "GET" && pathname === "/reports/summary") {
    return {
      total: db.submissions.length,
      byStatus: {
        Pending: db.submissions.filter(s => s.status === "Pending").length,
        Approved: db.submissions.filter(s => s.status === "Approved").length,
        Rejected: db.submissions.filter(s => s.status === "Rejected").length,
        "In Review": db.submissions.filter(s => s.status === "In Review").length
      }
    };
  }

  // Route: GET /submissions
  if (method === "GET" && pathname === "/submissions") {
    const scholarId = params.get("scholarId");
    const status = params.get("status");
    let items = db.submissions;
    if (scholarId) {
      items = items.filter(s => s.scholar?._id === scholarId);
    }
    if (status) {
      items = items.filter(s => s.status === status);
    }
    return { items };
  }

  // Route: GET /submissions/:id
  if (method === "GET" && pathname.startsWith("/submissions/")) {
    const id = pathname.substring(13);
    const item = db.submissions.find(s => s._id === id);
    if (!item) throw new Error("Submission not found");
    return { item };
  }

  // Route: POST /submissions
  if (method === "POST" && pathname === "/submissions") {
    let payload: any = {};
    if (body instanceof FormData) {
      payload.title = body.get("title");
      payload.abstract = body.get("abstract");
      payload.department = body.get("department");
      payload.scholarId = body.get("scholarId");
      const file = body.get("file");
      if (file && typeof file === "object" && "name" in file) {
        payload.file = { url: "#", originalName: file.name };
      }
    } else {
      payload = body;
    }

    const scholar = db.users.find(u => u._id === payload.scholarId) || db.users[0];
    const newSubmission = {
      _id: "sub-" + Date.now(),
      title: payload.title,
      abstract: payload.abstract,
      department: payload.department || "MCA",
      status: "Pending",
      submittedAt: new Date().toISOString(),
      scholar: { _id: scholar._id, name: scholar.name },
      file: payload.file
    };

    db.submissions.push(newSubmission);
    saveDB(db);
    return newSubmission;
  }

  // Route: PATCH /submissions/:id/status
  if (method === "PATCH" && pathname.startsWith("/submissions/") && pathname.endsWith("/status")) {
    const parts = pathname.split("/");
    const id = parts[2];
    const subIndex = db.submissions.findIndex(s => s._id === id);
    if (subIndex === -1) throw new Error("Submission not found");

    db.submissions[subIndex].status = body.status;
    saveDB(db);
    return { item: db.submissions[subIndex] };
  }

  // Route: PATCH /submissions/:id
  if (method === "PATCH" && pathname.startsWith("/submissions/")) {
    const id = pathname.substring(13);
    const subIndex = db.submissions.findIndex(s => s._id === id);
    if (subIndex === -1) throw new Error("Submission not found");

    let payload: any = {};
    if (body instanceof FormData) {
      payload.title = body.get("title");
      payload.abstract = body.get("abstract");
      payload.department = body.get("department");
      const file = body.get("file");
      if (file && typeof file === "object" && "name" in file) {
        payload.file = { url: "#", originalName: file.name };
      }
    } else {
      payload = body;
    }

    db.submissions[subIndex] = {
      ...db.submissions[subIndex],
      ...payload,
      file: payload.file || db.submissions[subIndex].file
    };
    saveDB(db);
    return { item: db.submissions[subIndex] };
  }

  // Route: DELETE /submissions/:id
  if (method === "DELETE" && pathname.startsWith("/submissions/")) {
    const id = pathname.substring(13);
    db.submissions = db.submissions.filter(s => s._id !== id);
    saveDB(db);
    return { message: "Success" };
  }

  // Route: GET /approvals
  if (method === "GET" && pathname === "/approvals") {
    const status = params.get("status");
    let items = db.submissions;
    if (status) {
      items = items.filter(s => s.status === status);
    }
    return { items };
  }

  // Accomplishments router
  const accomplishmentsList = [
    "qualifications",
    "publications",
    "conferences",
    "patents",
    "workshops",
    "memberships",
    "scholarships"
  ];

  for (const key of accomplishmentsList) {
    // Route: GET /:accomplishment
    if (method === "GET" && pathname === `/${key}`) {
      const scholarId = params.get("scholarId");
      let items = db[key as keyof typeof DEFAULT_DB] as any[];
      if (scholarId) {
        items = items.filter(x => x.scholarId === scholarId);
      }
      return { items };
    }

    // Route: GET /:accomplishment/:id
    if (method === "GET" && pathname.startsWith(`/${key}/`) && !pathname.endsWith("/status")) {
      const id = pathname.substring(key.length + 2);
      const list = db[key as keyof typeof DEFAULT_DB] as any[];
      const item = list.find(x => x._id === id);
      if (!item) throw new Error("Accomplishment not found");
      return { item };
    }

    // Route: POST /:accomplishment
    if (method === "POST" && pathname === `/${key}`) {
      let payload: any = {};
      if (body instanceof FormData) {
        body.forEach((value, k) => {
          if (value instanceof File) {
            payload.document = { url: "#", originalName: value.name };
          } else {
            payload[k] = value;
          }
        });
      } else {
        payload = body;
      }

      const newAccomplishment = {
        ...payload,
        _id: `${key.substring(0, 3)}-${Date.now()}`,
        verificationStatus: "Pending",
        createdAt: new Date().toISOString()
      };

      const list = db[key as keyof typeof DEFAULT_DB] as any[];
      list.push(newAccomplishment);
      saveDB(db);
      return { item: newAccomplishment };
    }

    // Route: PATCH /:accomplishment/:id
    if (method === "PATCH" && pathname.startsWith(`/${key}/`) && !pathname.endsWith("/status")) {
      const id = pathname.split("/")[2];
      const list = db[key as keyof typeof DEFAULT_DB] as any[];
      const idx = list.findIndex(x => x._id === id);
      if (idx === -1) throw new Error("Accomplishment not found");

      let payload: any = {};
      if (body instanceof FormData) {
        body.forEach((value, k) => {
          if (value instanceof File) {
            payload.document = { url: "#", originalName: value.name };
          } else {
            payload[k] = value;
          }
        });
      } else {
        payload = body;
      }

      list[idx] = {
        ...list[idx],
        ...payload,
        document: payload.document || list[idx].document
      };
      saveDB(db);
      return { item: list[idx] };
    }

    // Route: PATCH /:accomplishment/:id/status
    if (method === "PATCH" && pathname.startsWith(`/${key}/`) && pathname.endsWith("/status")) {
      const parts = pathname.split("/");
      const id = parts[2];
      const list = db[key as keyof typeof DEFAULT_DB] as any[];
      const idx = list.findIndex(x => x._id === id);
      if (idx === -1) throw new Error("Accomplishment not found");

      list[idx].verificationStatus = body.status;
      list[idx].guideNote = body.note;
      saveDB(db);
      return { item: list[idx] };
    }

    // Route: DELETE /:accomplishment/:id
    if (method === "DELETE" && pathname.startsWith(`/${key}/`)) {
      const id = pathname.substring(key.length + 2);
      const list = db[key as keyof typeof DEFAULT_DB] as any[];
      const newList = list.filter(x => x._id !== id);
      (db as any)[key] = newList;
      saveDB(db);
      return { message: "Success" };
    }
  }

  console.warn(`[API Mock] Unhandled request: ${method} ${path}`);
  throw new Error(`Unhandled mock path: ${pathname}`);
};

export const apiGet = async <T>(path: string, _init?: RequestInit): Promise<T> => {
  return handleMockRequest("GET", path) as Promise<T>;
};

export const apiPostJson = async <
  TResponse,
  TBody extends Record<string, unknown> = Record<string, unknown>
>(
  path: string,
  body: TBody
): Promise<TResponse> => {
  return handleMockRequest("POST", path, body) as Promise<TResponse>;
};

export const apiPatchJson = async <
  TResponse,
  TBody extends Record<string, unknown> = Record<string, unknown>
>(
  path: string,
  body: TBody,
  _init?: RequestInit
): Promise<TResponse> => {
  return handleMockRequest("PATCH", path, body) as Promise<TResponse>;
};

export const apiPostForm = async <T>(path: string, body: FormData): Promise<T> => {
  return handleMockRequest("POST", path, body) as Promise<T>;
};

export const apiPatchForm = async <T>(path: string, body: FormData): Promise<T> => {
  return handleMockRequest("PATCH", path, body) as Promise<T>;
};

export const apiDelete = async <T>(path: string, _init?: RequestInit): Promise<T> => {
  return handleMockRequest("DELETE", path) as Promise<T>;
};
