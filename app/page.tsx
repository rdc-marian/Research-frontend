"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Lock,
  X,
  User as UserIcon,
  Mail,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  FileText,
  Bookmark,
  Calendar,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { apiGet, apiPostJson, type ApiListResponse } from "@/lib/api";
import { useAuth, type User } from "@/components/AuthProvider";

// Default mock databases for other directory users' achievements
const DEFAULT_SCHOLAR_DETAILS: Record<string, {
  qualifications?: any[];
  publications?: any[];
  awards?: any[];
  projects?: any[];
  programmes?: any[];
}> = {
  "mock-scholar-id": {
    qualifications: [
      { qualification: "Ph.D.", specialization: "Social Work", year: "2016", institution: "Gandhigram Rural Institute" },
      { qualification: "MA", specialization: "Sociology", year: "2013", institution: "IGNOU, New Delhi" },
      { qualification: "MA", specialization: "Public Administration", year: "2011", institution: "IGNOU, New Delhi" },
      { qualification: "MSW", specialization: "Social Work", year: "2010", institution: "M G University Kottayam" },
      { qualification: "BA", specialization: "Sociology", year: "2008", institution: "M G University Kottayam" },
    ],
    publications: [
      { title: "Socio-Economic Challenges of Tribal Communities", journal: "International Journal of Social Sciences", year: "2024" },
      { title: "Empowerment of Women through Self-Help Groups", journal: "Journal of Rural Development", year: "2023" },
    ],
    awards: [
      { award_name: "Best Poster Presentation Award", awarding_body: "IEEE Kerala Section", category: "Conference Paper", year: "2025" }
    ],
    projects: [
      { project_title: "Automatic Brain Lesion Detection using AI", funding_agency: "KSCSTE Kerala", amount_sanctioned: "₹2,50,000", duration: "1 Year", status: "Ongoing" }
    ],
    programmes: [
      { programme_title: "Hands-on Workshop on Git and GitHub", sponsor: "ACM Student Chapter", role: "Organizer & Speaker", dates: "14/09/2025" }
    ]
  },
  "mock-scholar-2": {
    qualifications: [
      { qualification: "MSW", specialization: "Social Work", year: "2020", institution: "Loyola College of Social Sciences" },
      { qualification: "BA", specialization: "Sociology", year: "2017", institution: "St. Teresa's College" }
    ],
    publications: [
      { title: "Community Health Interventions in Rural Districts", journal: "Indian Journal of Public Health", year: "2023" }
    ],
    awards: [
      { award_name: "Young Scholar Research Fellowship", awarding_body: "ICSSR", category: "Fellowship", year: "2022" }
    ],
    projects: [],
    programmes: []
  },
  "mock-scholar-3": {
    qualifications: [
      { qualification: "Ph.D.", specialization: "Computer Science", year: "2022", institution: "CUSAT" },
      { qualification: "MCA", specialization: "Computer Applications", year: "2017", institution: "Marian College Kuttikkanam" }
    ],
    publications: [
      { title: "Deep Learning for Automated Agricultural Analysis", journal: "IEEE Transactions on Agriculture", year: "2024" },
      { title: "Convolutional Neural Networks in Crop Disease Detection", journal: "Springer Journal of AI", year: "2023" }
    ],
    awards: [],
    projects: [],
    programmes: []
  }
};

const DEFAULT_GUIDE_DETAILS: Record<string, {
  qualifications?: any[];
  publications?: any[];
  scholars?: any[];
  committees?: any[];
  projects?: any[];
}> = {
  "mock-guide-id": {
    qualifications: [
      { qualification: "Ph.D.", specialization: "Computer Science", year: "2012", institution: "CUSAT" },
      { qualification: "M.Tech", specialization: "Computer Science & Engineering", year: "2006", institution: "IIT Madras" },
      { qualification: "B.Tech", specialization: "Computer Science", year: "2004", institution: "NIT Calicut" }
    ],
    publications: [
      { publication_title: "Machine Learning in Academic Registry Systems", journal_name: "IEEE Transactions on Education", year_of_publication: "2024", impact_factor: "4.8" },
      { publication_title: "Optimized Blockchain Architecture for Research Indexing", journal_name: "Springer Journal of Grid Computing", year_of_publication: "2023", impact_factor: "3.5" }
    ],
    scholars: [
      { scholar_name: "Albin Joseph", research_topic: "AI-Driven Healthcare Diagnostics", registration_date: "10/05/2024", status: "Ongoing" },
      { scholar_name: "Binu Thomas", research_topic: "Social Interventions in Rural Districts", registration_date: "12/09/2023", status: "Ongoing" },
      { scholar_name: "Chitra Nair", research_topic: "Deep Learning for Automated Agriculture", registration_date: "15/01/2024", status: "Ongoing" }
    ],
    committees: [
      { committee___organization: "Board of Studies in Computer Applications, Marian College", role: "Expert Member", tenure___year: "2023 - Present" },
      { committee___organization: "IEEE Computer Society Kerala Chapter", role: "Executive Committee Member", tenure___year: "2022 - 2025" }
    ],
    projects: [
      { project_title: "Automatic Brain Lesion Detection using AI", funding_agency: "KSCSTE Kerala", amount_sanctioned: "₹2,50,000", status: "Ongoing" }
    ]
  }
};

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  
  // App states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  
  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  
  // Details Modal Sub-tab state
  const [activeDetailsTab, setActiveDetailsTab] = useState("qualifications");
  
  // Login input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  
  // Modal mode: "login" or "register"
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [availableDepartments, setAvailableDepartments] = useState<{ _id: string; name: string }[]>([]);

  // Registration form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regDept, setRegDept] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);

  // Local active database values loaded from localStorage
  const [localScholarData, setLocalScholarData] = useState<any>(null);
  const [localFacultyData, setLocalFacultyData] = useState<any>(null);

  // Hero background carousel state
  const bgImages = ["/Hero images/1.jpg", "/Hero images/2.jpg"];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch users and load dynamic local registry data
  useEffect(() => {
    const fetchUsersAndDepts = async () => {
      try {
        setLoading(true);
        const [res, deptRes] = await Promise.all([
          apiGet<ApiListResponse<User>>("/users"),
          apiGet<ApiListResponse<{ _id: string; name: string }>>("/departments")
        ]);
        setUsers(res.items || []);
        setAvailableDepartments(deptRes.items || []);
      } catch (err) {
        console.error("Failed to fetch user directory or departments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndDepts();

    if (typeof window !== "undefined") {
      try {
        const savedScholar = localStorage.getItem("scholar_custom_tabs_data");
        if (savedScholar) setLocalScholarData(JSON.parse(savedScholar));

        const savedFaculty = localStorage.getItem("faculty_custom_tabs_data");
        if (savedFaculty) setLocalFacultyData(JSON.parse(savedFaculty));
      } catch (e) {
        console.error("Error loading registry data:", e);
      }
    }
  }, []);

  // Helper to resolve row field values case-insensitively with spacing/casing normalization
  const getRowVal = (row: any, key: string): string => {
    if (!row) return "";
    if (row[key] !== undefined) return String(row[key]);

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const targetNorm = normalize(key);

    for (const k of Object.keys(row)) {
      if (normalize(k) === targetNorm) {
        return String(row[k]);
      }
    }

    // Explicit specific fallbacks
    if (key === "specialization") {
      if (row["area_of_specialization"] !== undefined) return String(row["area_of_specialization"]);
      if (row["Area of Specialization"] !== undefined) return String(row["Area of Specialization"]);
    }
    if (key === "year") {
      if (row["year_of_passing"] !== undefined) return String(row["year_of_passing"]);
      if (row["Year of Passing"] !== undefined) return String(row["Year of Passing"]);
      if (row["year_of_publication"] !== undefined) return String(row["year_of_publication"]);
      if (row["Year of Publication"] !== undefined) return String(row["Year of Publication"]);
    }
    if (key === "title") {
      if (row["publication_title"] !== undefined) return String(row["publication_title"]);
      if (row["Publication Title"] !== undefined) return String(row["Publication Title"]);
      if (row["project_title"] !== undefined) return String(row["project_title"]);
      if (row["Project Title"] !== undefined) return String(row["Project Title"]);
      if (row["programme_title"] !== undefined) return String(row["programme_title"]);
      if (row["Programme Title"] !== undefined) return String(row["Programme Title"]);
    }
    if (key === "journal") {
      if (row["journal_name"] !== undefined) return String(row["journal_name"]);
      if (row["Journal Name"] !== undefined) return String(row["Journal Name"]);
    }
    if (key === "amount") {
      if (row["amount_sanctioned"] !== undefined) return String(row["amount_sanctioned"]);
      if (row["Amount Sanctioned"] !== undefined) return String(row["Amount Sanctioned"]);
    }

    return "";
  };

  // Retrieve exact details for a scholar
  const getScholarFullDetails = (userId: string) => {
    let base = DEFAULT_SCHOLAR_DETAILS[userId] || { qualifications: [], publications: [], awards: [], projects: [], programmes: [] };
    if (userId === "mock-scholar-id" && localScholarData) {
      return {
        qualifications: localScholarData.qualifications || base.qualifications,
        publications: localScholarData.publications || base.publications,
        awards: localScholarData.awards || base.awards,
        projects: localScholarData.funded_projects || base.projects,
        programmes: localScholarData.programmes_organized || base.programmes
      };
    }
    return base;
  };

  // Retrieve exact details for a guide/faculty
  const getFacultyFullDetails = (userId: string) => {
    let base = DEFAULT_GUIDE_DETAILS[userId] || { qualifications: [], publications: [], scholars: [], committees: [], projects: [] };
    if (userId === "mock-guide-id" && localFacultyData) {
      return {
        qualifications: localFacultyData.qualifications || base.qualifications,
        publications: localFacultyData.publications || base.publications,
        scholars: localFacultyData.scholars || base.scholars,
        committees: localFacultyData.committees || base.committees,
        projects: localFacultyData.projects || base.projects
      };
    }
    return base;
  };

  // Get dynamic faculty user details
  const getFacultyProfileDetails = (userId: string) => {
    if (userId === "mock-guide-id" && typeof window !== "undefined") {
      const savedName = localStorage.getItem("faculty_profile_name");
      const savedEmail = localStorage.getItem("faculty_profile_email");
      const savedDept = localStorage.getItem("faculty_profile_dept");
      const savedDesignation = localStorage.getItem("faculty_profile_designation");
      const savedCenter = localStorage.getItem("faculty_profile_center");
      const savedAvatar = localStorage.getItem("faculty_profile_avatar");

      return {
        name: savedName || "Dr. Elizabeth Paul",
        email: savedEmail || "elizabeth.paul@univ.edu",
        department: savedDept || "MCA",
        designation: savedDesignation || "Professor & Research Director",
        supervisionCenter: savedCenter || "MCA Research Center",
        avatar: savedAvatar || ""
      };
    }
    return {
      name: "Dr. Elizabeth Paul",
      email: "elizabeth.paul@univ.edu",
      department: "MCA",
      designation: "Professor & Research Director",
      supervisionCenter: "MCA Research Center",
      avatar: ""
    };
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setModalMode("login");
    setRegSuccess(false);
    setEmail("");
    setPassword("");
    setSelectedRole("");
    setRegName("");
    setRegEmail("");
    setRegRole("");
    setRegDept("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regRole || !regDept) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSubmittingReg(true);
      const res = await apiGet<{ items: User[] }>("/users");
      const exists = res.items.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
      if (exists) {
        alert("An account with this email already exists or is pending approval.");
        setSubmittingReg(false);
        return;
      }

      await apiPostJson("/users", {
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        roles: [regRole],
        department: regDept,
        status: "PendingApproval"
      });

      setRegSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmittingReg(false);
    }
  };

  // Handle Login action
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let role = selectedRole;
    let matchingUser: User | undefined = undefined;

    try {
      const res = await apiGet<{ items: User[] }>("/users");
      const allUsers = res.items || [];

      // 1. If email is provided, look up by email
      if (email.trim()) {
        matchingUser = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      }

      // 2. If no user by email, look up by selected role
      if (!matchingUser && role) {
        matchingUser = allUsers.find(u => (u.role === role || u.roles?.includes(role)) && u.status !== "PendingApproval");
      }

      // 3. Fallback: if no user is found, just use the first non-pending user
      if (!matchingUser) {
        matchingUser = allUsers.find(u => u.status !== "PendingApproval") || allUsers[0];
      }

      if (matchingUser) {
        if (matchingUser.status === "PendingApproval") {
          alert("Your account is pending administrator approval.");
          return;
        }
        role = matchingUser.role || (matchingUser.roles && matchingUser.roles[0]) || role || "scholar";
        login("", matchingUser);
      } else {
        alert("No users found in the database.");
        return;
      }
    } catch (err) {
      console.error("Failed to pre-set auth session:", err);
      if (!role) role = "scholar";
    }

    if (role === "scholar") router.push("/scholar");
    else if (role === "faculty") router.push("/faculty");
    else if (role === "research_guide") router.push("/research-guide");
    else if (role === "coordinator") router.push("/coordinator");
    else if (role === "admin") router.push("/admin");
    else if (role === "library") router.push("/library");

    setShowLoginModal(false);
  };

  // Quick dev login helper
  const handleQuickLogin = async (role: string) => {
    try {
      const res = await apiGet<{ items: User[] }>("/users");
      const allUsers = res.items || [];
      const matchingUser = allUsers.find(u => (u.role === role || u.roles?.includes(role)) && u.status !== "PendingApproval") 
        || allUsers.find(u => u.role === role || u.roles?.includes(role))
        || allUsers.find(u => u.status !== "PendingApproval")
        || allUsers[0];

      if (matchingUser) {
        login("", matchingUser);
      }
    } catch (err) {
      console.error("Quick login failed to resolve user:", err);
    }
    
    if (role === "scholar") router.push("/scholar");
    else if (role === "faculty") router.push("/faculty");
    else if (role === "research_guide") router.push("/research-guide");
    else if (role === "coordinator") router.push("/coordinator");
    else if (role === "admin") router.push("/admin");
    else if (role === "library") router.push("/library");

    setShowLoginModal(false);
  };

  // Filter users based on search query and role badges
  const filteredUsers = users.filter((u) => {
    if (u.role === "admin" || u.roles?.includes("admin")) return false;

    const isGuide = u.roles?.includes("research_guide") || u.role === "faculty";
    const facultyMeta = isGuide ? getFacultyProfileDetails(u._id) : null;

    if (selectedRoleFilter !== "all") {
      if (selectedRoleFilter === "scholar" && u.role !== "scholar") return false;
      if (selectedRoleFilter === "faculty" && !isGuide) return false;
      if (selectedRoleFilter === "coordinator" && u.role !== "coordinator") return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (isGuide && facultyMeta) {
        return (
          facultyMeta.name.toLowerCase().includes(q) ||
          facultyMeta.email.toLowerCase().includes(q) ||
          facultyMeta.department.toLowerCase().includes(q) ||
          facultyMeta.designation.toLowerCase().includes(q) ||
          facultyMeta.supervisionCenter.toLowerCase().includes(q)
        );
      }
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.guide?.name?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Get tabs and counts for a user
  const getUserActiveTabsAndCounts = (user: User) => {
    const isScholar = user.role === "scholar";
    const isGuide = user.roles?.includes("research_guide") || user.role === "faculty";
    const isCoordinator = user.role === "coordinator";
    
    if (isScholar) {
      let activeTabKeys = ["qualifications", "publications", "awards", "funded_projects", "programmes_organized"];
      let tabLabels: Record<string, string> = {
        qualifications: "Qualifications",
        publications: "Publications",
        awards: "Awards",
        funded_projects: "Funded Projects",
        programmes_organized: "Programmes Organized"
      };
      
      if (user._id === "mock-scholar-id") {
        if (typeof window !== "undefined") {
          try {
            const savedActive = localStorage.getItem("scholar_active_tabs");
            if (savedActive) activeTabKeys = JSON.parse(savedActive);
            const savedList = localStorage.getItem("scholar_custom_tabs_list");
            if (savedList) {
              const list = JSON.parse(savedList);
              list.forEach((t: any) => {
                tabLabels[t.id] = t.name;
              });
            }
          } catch (e) {}
        }
      }
      
      const details = getScholarFullDetails(user._id);
      return activeTabKeys.map((key) => {
        let count = 0;
        if (key === "qualifications") count = details.qualifications?.length || 0;
        else if (key === "publications") count = details.publications?.length || 0;
        else if (key === "awards") count = details.awards?.length || 0;
        else if (key === "funded_projects") count = details.projects?.length || 0;
        else if (key === "programmes_organized") count = details.programmes?.length || 0;
        else {
          if (user._id === "mock-scholar-id" && localScholarData) {
            count = localScholarData[key]?.length || 0;
          }
        }
        return {
          id: key,
          label: tabLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          count
        };
      });
    } else if (isGuide) {
      let activeTabKeys = ["qualifications", "publications", "scholars", "committees", "projects"];
      let tabLabels: Record<string, string> = {
        qualifications: "Qualifications",
        publications: "Publications",
        scholars: "Guided Scholars",
        committees: "Committees",
        projects: "Projects"
      };
      
      if (user._id === "mock-guide-id") {
        if (typeof window !== "undefined") {
          try {
            const savedActive = localStorage.getItem("faculty_active_tabs");
            if (savedActive) activeTabKeys = JSON.parse(savedActive);
            const savedList = localStorage.getItem("faculty_tabs_config");
            if (savedList) {
              const list = JSON.parse(savedList);
              list.forEach((t: any) => {
                tabLabels[t.id] = t.name;
              });
            }
          } catch (e) {}
        }
      }
      
      const details = getFacultyFullDetails(user._id);
      return activeTabKeys.map((key) => {
        let count = 0;
        if (key === "qualifications") count = details.qualifications?.length || 0;
        else if (key === "publications") count = details.publications?.length || 0;
        else if (key === "scholars") count = details.scholars?.length || 0;
        else if (key === "committees") count = details.committees?.length || 0;
        else if (key === "projects") count = details.projects?.length || 0;
        else {
          if (user._id === "mock-guide-id" && localFacultyData) {
            count = localFacultyData[key]?.length || 0;
          }
        }
        return {
          id: key,
          label: tabLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          count
        };
      });
    } else if (isCoordinator) {
      return [
        { id: "oversight", label: "Oversight Center", count: 1 },
        { id: "evaluations", label: "Evaluations Pending", count: 3 }
      ];
    }
    return [];
  };

  // Get dynamic unique ID for user cards
  const getUserUniqueId = (userId: string) => {
    if (userId === "mock-scholar-id") {
      if (typeof window !== "undefined") {
        const savedId = localStorage.getItem("scholar_profile_unique_id");
        if (savedId) return savedId;
      }
      return "MCKA-TS029";
    }
    if (userId === "mock-scholar-2") return "MCKA-TS030";
    if (userId === "mock-scholar-3") return "MCKA-TS031";
    if (userId === "mock-guide-id") return "MCKA-RG001";
    if (userId === "mock-coordinator-id") return "MCKA-CO001";
    const cleanSuffix = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-3).toUpperCase();
    return "MCKA-USR" + cleanSuffix;
  };

  // Get dynamic avatar for scholar cards
  const getScholarAvatar = (userId: string) => {
    if (userId === "mock-scholar-id" && typeof window !== "undefined") {
      const savedAvatar = localStorage.getItem("scholar_profile_avatar");
      if (savedAvatar) return savedAvatar;
    }
    return "/scholar-avatar.png";
  };

  // Helper to extract specialization chips dynamically for the card representation
  const getUserSpecializationChips = (user: User) => {
    const isScholar = user.role === "scholar";
    const isGuide = user.roles?.includes("research_guide") || user.role === "faculty";
    const chips: string[] = [];

    if (isScholar) {
      const details = getScholarFullDetails(user._id);
      details.qualifications?.forEach((q) => {
        const spec = getRowVal(q, "specialization");
        if (spec && !chips.includes(spec)) chips.push(spec);
      });
      details.publications?.forEach((p) => {
        const title = getRowVal(p, "title");
        if (title.toLowerCase().includes("ai") || title.toLowerCase().includes("deep learning")) {
          if (!chips.includes("Artificial Intelligence")) chips.push("Artificial Intelligence");
        }
      });
    } else if (isGuide) {
      const details = getFacultyFullDetails(user._id);
      details.qualifications?.forEach((q) => {
        const spec = getRowVal(q, "specialization");
        if (spec && !chips.includes(spec)) chips.push(spec);
      });
      details.publications?.forEach((p) => {
        const journal = getRowVal(p, "journal");
        if (journal.toLowerCase().includes("blockchain")) {
          if (!chips.includes("Blockchain")) chips.push("Blockchain");
        }
      });
    }

    // fallback if empty
    if (chips.length === 0) {
      if (user.department) {
        chips.push(user.department);
      }
      chips.push("Research");
      chips.push("Academic");
    }

    return chips.slice(0, 3);
  };

  const getUserTabsConfig = (user: User) => {
    const isScholar = user.role === "scholar";
    const isGuide = user.roles?.includes("research_guide") || user.role === "faculty";
    
    if (isScholar) {
      let list = [
        { id: "qualifications", name: "Qualifications", columns: ["Qualification", "Area of Specialization", "Year of Passing", "Institution"], fields: ["qualification", "specialization", "year", "institution"] },
        { id: "publications", name: "Publications", columns: ["Publication Title", "Journal Name", "Year of Publication"], fields: ["title", "journal", "year"] },
        { id: "awards", name: "Awards", columns: ["Award Name", "Awarding Body", "Category", "Year"], fields: ["award_name", "awarding_body", "category", "year"] },
        { id: "funded_projects", name: "Funded Projects", columns: ["Project Title", "Funding Agency", "Amount Sanctioned", "Duration", "Status"], fields: ["project_title", "funding_agency", "amount_sanctioned", "duration", "status"] },
        { id: "programmes_organized", name: "Programmes Organized", columns: ["Programme Title", "Sponsor", "Role", "Dates"], fields: ["programme_title", "sponsor", "role", "dates"] }
      ];
      if (user._id === "mock-scholar-id" && typeof window !== "undefined") {
        try {
          const savedList = localStorage.getItem("scholar_custom_tabs_list");
          if (savedList) {
            const parsed = JSON.parse(savedList);
            return parsed.map((item: any) => {
              if (item.id === "qualifications") return list[0];
              if (item.id === "publications") return list[1];
              if (item.id === "awards") return list[2];
              if (item.id === "funded_projects") return list[3];
              if (item.id === "programmes_organized") return list[4];
              
              return {
                id: item.id,
                name: item.name,
                columns: item.columns || item.fields?.map((f: any) => f.label) || [],
                fields: item.fields?.map((f: any) => f.name) || []
              };
            });
          }
        } catch (e) {}
      }
      return list;
    } else if (isGuide) {
      let list = [
        { id: "qualifications", name: "Qualifications", columns: ["Qualification", "Area of Specialization", "Year of Passing", "Institution"], fields: ["qualification", "specialization", "year", "institution"] },
        { id: "publications", name: "Publications", columns: ["Publication Title", "Journal Name", "Year of Publication", "Impact Factor"], fields: ["publication_title", "journal_name", "year_of_publication", "impact_factor"] },
        { id: "scholars", name: "Guided Scholars", columns: ["Scholar Name", "Research Topic", "Registration Date", "Status"], fields: ["scholar_name", "research_topic", "registration_date", "status"] },
        { id: "committees", name: "Expert Committees", columns: ["Committee / Organization", "Role", "Tenure / Year"], fields: ["committee___organization", "role", "tenure___year"] },
        { id: "projects", name: "Funded Projects", columns: ["Project Title", "Funding Agency", "Amount Sanctioned", "Status"], fields: ["project_title", "funding_agency", "amount_sanctioned", "status"] }
      ];
      if (user._id === "mock-guide-id" && typeof window !== "undefined") {
        try {
          const savedList = localStorage.getItem("faculty_tabs_config");
          if (savedList) {
            const parsed = JSON.parse(savedList);
            return parsed.map((item: any) => {
              if (item.id === "qualifications") return list[0];
              if (item.id === "publications") return list[1];
              if (item.id === "scholars") return list[2];
              if (item.id === "committees") return list[3];
              if (item.id === "projects") return list[4];
              
              return {
                id: item.id,
                name: item.name,
                columns: item.columns || item.fields?.map((f: any) => f.label) || [],
                fields: item.fields?.map((f: any) => f.name) || []
              };
            });
          }
        } catch (e) {}
      }
      return list;
    }
    return [];
  };

  const getUserTabRecords = (user: User, tabId: string) => {
    const isScholar = user.role === "scholar";
    const isGuide = user.roles?.includes("research_guide") || user.role === "faculty";
    
    if (isScholar) {
      const details = getScholarFullDetails(user._id);
      if (tabId === "qualifications") return details.qualifications || [];
      if (tabId === "publications") return details.publications || [];
      if (tabId === "awards") return details.awards || [];
      if (tabId === "funded_projects") return details.projects || [];
      if (tabId === "programmes_organized") return details.programmes || [];
      
      if (user._id === "mock-scholar-id" && localScholarData) {
        return localScholarData[tabId] || [];
      }
      return [];
    } else if (isGuide) {
      const details = getFacultyFullDetails(user._id);
      if (tabId === "qualifications") return details.qualifications || [];
      if (tabId === "publications") return details.publications || [];
      if (tabId === "scholars") return details.scholars || [];
      if (tabId === "committees") return details.committees || [];
      if (tabId === "projects") return details.projects || [];
      
      if (user._id === "mock-guide-id" && localFacultyData) {
        return localFacultyData[tabId] || [];
      }
      return [];
    }
    return [];
  };

  // Open Details Modal and reset active detail tab
  const handleOpenDetails = (user: User) => {
    setSelectedProfileUser(user);
    const tabs = getUserTabsConfig(user);
    if (tabs.length > 0) {
      setActiveDetailsTab(tabs[0].id);
    } else {
      setActiveDetailsTab("administrative");
    }
    setShowDetailsModal(true);
  };

  const totalScholars = users.filter((u) => u.role === "scholar").length;
  const totalGuides = users.filter((u) => u.roles?.includes("research_guide") || u.role === "faculty").length;
  const totalPublications = users.length > 0 ? (totalGuides * 14 + totalScholars * 3 + 120) : 340;
  const departments = new Set(users.map(u => u.department).filter(Boolean));
  const totalCenters = Math.max(departments.size, 8);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body selection:bg-[#9B0302]/20 selection:text-[#9B0302] overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto w-full z-10 sticky top-0 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MarianResearch" className="h-9 sm:h-12 w-auto object-contain" />
        </div>
        <button onClick={() => setShowLoginModal(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95">
          <Lock className="w-3.5 h-3.5" /> Portal Login
        </button>
      </nav>

      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section Wrapper (Full Viewport Width Background) */}
        <div className="relative w-full overflow-hidden">
          {/* Background Hero Image Carousel */}
          {bgImages.map((src, index) => (
            <div 
              key={src}
              className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out pointer-events-none ${
                index === bgIndex ? "opacity-[0.12]" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${src.replace(/ /g, "%20")}')` }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:w-[600px] bg-red-100/50 rounded-full blur-[120px] z-0 pointer-events-none"></div>
          
          {/* Hero Content Section (Centered and restricted max-w-7xl) */}
          <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 flex flex-col items-center justify-center text-center min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] z-10">
            <div className="relative flex flex-col items-center text-center w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50/90 backdrop-blur-sm border border-red-100 text-[#9B0302] text-[10px] font-bold uppercase tracking-widest mb-6 sm:mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Excellence in Research & Innovation</span>
              </div>
              
              <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mb-6">
                Pioneering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9B0302] to-[#e63946]">Discoveries</span> for a Better Tomorrow
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 sm:mb-10">
                Welcome to the MarianResearch portal. Explore the cutting-edge academic achievements, funded projects, and publications from our esteemed scholars and research guides.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center">
                <button onClick={() => { setShowLoginModal(true); setModalMode("register"); }} className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#9B0302] text-white font-semibold text-sm hover:bg-[#800201] transition-all shadow-lg shadow-[#9B0302]/30 hover:-translate-y-0.5">
                  Request Access
                </button>
                <button onClick={() => { setShowLoginModal(true); setModalMode("login"); }} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5">
                  Login
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Statistics Section */}
        <section className="w-full bg-white border-y border-slate-200/50 py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 lg:divide-x lg:divide-slate-100">
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#9B0302] flex items-center justify-center mb-4">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalCenters}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Centers</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalPublications}+</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publications</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalScholars}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Scholars</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalGuides}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Guides</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center border-t border-slate-800 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-white/50" />
          <span className="font-display font-bold text-lg tracking-tight text-white/80">MarianResearch</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Marian College Kuttikkanam (Autonomous). All rights reserved.</p>
        <p className="text-xs mt-2 text-slate-500">Excellence in Research & Innovation</p>
        <div className="mt-4 pt-4 border-t border-slate-800/60 max-w-xs mx-auto text-[11px] text-slate-500">
          Developed by{" "}
          <a
            href="https://sijomonps.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors underline decoration-slate-600"
          >
            Sijomon P S
          </a>
        </div>
      </footer>

      {/* Login / Register Card Popup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(155,3,2,0.12)] border border-slate-100 animate-in zoom-in-95 duration-200 relative max-h-[95vh] overflow-y-auto">
            
            <button
              onClick={() => handleCloseModal()}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo container with gradient border and backdrop blur */}
            <div className="flex flex-col items-center justify-center mb-5 mt-2">
              <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/60 shadow-sm max-w-[220px] transition-transform duration-300 hover:scale-[1.02]">
                <img src="/logo.png" alt="MarianResearch" className="h-10 sm:h-12 w-auto object-contain" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight">
                {modalMode === "login" ? "Portal Login" : "Request Access"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {modalMode === "login" ? "Sign in to access your research dashboard" : "Submit a request to the administrator"}
              </p>
            </div>
            
            {modalMode === "register" && regSuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Your access request has been successfully sent to the administrator. You will be able to sign in once your account is approved.
                </p>
                <button
                  type="button"
                  onClick={() => handleCloseModal()}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : modalMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Enter email e.g. user@univ.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Role</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all cursor-pointer appearance-none"
                    >
                      <option value="">-- Select your role --</option>
                      <option value="scholar">Scholar</option>
                      <option value="faculty">Faculty Member</option>
                      <option value="research_guide">Research Guide</option>
                      <option value="coordinator">Research Center Coordinator</option>
                      <option value="admin">Administrator</option>
                      <option value="library">Library</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleCloseModal()}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all active:scale-95 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition-all shadow-md shadow-[#9B0302]/20 hover:shadow-lg hover:shadow-[#9B0302]/30 active:scale-95 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>

                <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100/60">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode("register");
                      setRegSuccess(false);
                    }}
                    className="text-[#9B0302] hover:underline font-bold cursor-pointer"
                  >
                    Request Access
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@university.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Role</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all cursor-pointer appearance-none"
                    >
                      <option value="" disabled>-- Select role --</option>
                      <option value="scholar">Scholar</option>
                      <option value="faculty">Faculty Member</option>
                      <option value="research_guide">Research Guide</option>
                      <option value="coordinator">Research Center Coordinator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Research Center <span className="text-slate-400 font-normal capitalize">(Optional)</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all cursor-pointer appearance-none"
                    >
                      <option value="" disabled>-- Select center --</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept._id} value={dept.name}>{dept.name}</option>
                      ))}
                      {availableDepartments.length === 0 && (
                        <>
                          <option value="MCA">MCA</option>
                          <option value="Computer Science">Computer Science</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode("login");
                      setRegSuccess(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all active:scale-95 cursor-pointer"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReg}
                    className="flex-1 py-2.5 rounded-xl bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition-all shadow-md shadow-[#9B0302]/20 hover:shadow-lg hover:shadow-[#9B0302]/30 active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {submittingReg ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
