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
} from "lucide-react";
import { apiGet, type ApiListResponse } from "@/lib/api";
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
  
  // Local active database values loaded from localStorage
  const [localScholarData, setLocalScholarData] = useState<any>(null);
  const [localFacultyData, setLocalFacultyData] = useState<any>(null);

  // Fetch users and load dynamic local registry data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await apiGet<ApiListResponse<User>>("/users");
        setUsers(res.items || []);
      } catch (err) {
        console.error("Failed to fetch user directory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

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

  // Handle Login action
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert("Please select a role to sign in.");
      return;
    }

    try {
      const res = await apiGet<{ items: User[] }>(`/users?role=${selectedRole}`);
      if (res.items && res.items.length > 0) {
        login("", res.items[0]);
      }
    } catch (err) {
      console.error("Failed to pre-set auth session:", err);
    }

    if (selectedRole === "scholar") router.push("/scholar");
    else if (selectedRole === "faculty") router.push("/faculty");
    else if (selectedRole === "research_guide") router.push("/research-guide");
    else if (selectedRole === "coordinator") router.push("/coordinator");
    else if (selectedRole === "admin") router.push("/admin");

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

  // Get dynamic unique ID for scholar cards
  const getScholarUniqueId = (userId: string) => {
    if (userId === "mock-scholar-id") {
      if (typeof window !== "undefined") {
        const savedId = localStorage.getItem("scholar_profile_unique_id");
        if (savedId) return savedId;
      }
      return "MCKA-TS029";
    }
    if (userId === "mock-scholar-2") return "MCKA-TS030";
    if (userId === "mock-scholar-3") return "MCKA-TS031";
    return "MCKA-USR" + userId.substring(userId.length - 3);
  };

  // Get dynamic avatar for scholar cards
  const getScholarAvatar = (userId: string) => {
    if (userId === "mock-scholar-id" && typeof window !== "undefined") {
      const savedAvatar = localStorage.getItem("scholar_profile_avatar");
      if (savedAvatar) return savedAvatar;
    }
    return "/scholar-avatar.png";
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

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col lg:flex-row">
      
      {/* Left Sidebar Panel */}
      <aside className="lg:w-[320px] bg-gradient-to-b from-[#9B0302] to-[#800201] text-white p-8 flex flex-col justify-between flex-shrink-0 shadow-lg border-r border-[#9B0302]">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 shadow-inner">
              <BookOpen className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">Marian Research</h1>
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest">Portal Gateway</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-display text-2xl font-bold leading-tight">
              Research Management System
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Explore profiles, academic achievements, and research registrations. Sign in below to access the administrative dashboards.
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-10 lg:pt-0">
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#9B0302] font-semibold text-xs hover:bg-slate-50 active:scale-[0.98] transition shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            <Lock className="h-3.5 w-3.5" />
            Sign In to Portal
          </button>
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-[10px] text-white/70 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-white/80 flex-shrink-0" />
            <span>Marian College Kuttikkanam (Autonomous) Research Directory.</span>
          </div>
        </div>
      </aside>

      {/* Right Main Content Directory */}
      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#9B0302]">
              Academic & Research Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an academic member to view their publications, qualifications, and funded studies.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search directory profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9B0302] transition"
            />
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          {[
            { id: "all", label: "All Directory" },
            { id: "scholar", label: "Scholars" },
            { id: "faculty", label: "Research Guides" },
            { id: "coordinator", label: "Coordinators" },
          ].map((badge) => {
            const isSelected = selectedRoleFilter === badge.id;
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedRoleFilter(badge.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition ${
                  isSelected
                    ? "bg-[#9B0302] border-[#9B0302] text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {badge.label}
              </button>
            );
          })}
        </div>

        {/* Users Card Grid */}
        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500">Loading directory profiles...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-xs text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl">
            No matching profiles found in the directory.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((item) => {
              const isScholar = item.role === "scholar";
              const isGuide = item.roles?.includes("research_guide") || item.role === "faculty";
              const isCoordinator = item.role === "coordinator";
              const isAdmin = item.role === "admin";
              
              const facultyMeta = isGuide ? getFacultyProfileDetails(item._id) : null;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      {isScholar ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                          <img
                            src={getScholarAvatar(item._id)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
                            }}
                          />
                        </div>
                      ) : isGuide && facultyMeta && facultyMeta.avatar ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                          <img
                            src={facultyMeta.avatar}
                            alt={facultyMeta.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center font-bold text-sm text-[#9B0302]">
                          {(isGuide && facultyMeta ? facultyMeta.name : item.name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 leading-tight">
                          {isGuide && facultyMeta ? facultyMeta.name : item.name}
                        </h3>
                        
                        <div>
                          {isScholar && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#9B0302] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                              Scholar
                            </span>
                          )}
                          {isGuide && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              Research Guide
                            </span>
                          )}
                          {isCoordinator && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                              Coordinator
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Display user tabs and counts */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Profile Summary</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-700">
                        {getUserActiveTabsAndCounts(item).map((tab) => (
                          <div key={tab.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                            <span className="text-slate-500 font-semibold truncate pr-1">{tab.label}</span>
                            <span className="bg-[#9B0302] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {tab.count}
                            </span>
                          </div>
                        ))}
                        {getUserActiveTabsAndCounts(item).length === 0 && (
                          <span className="col-span-2 text-slate-400 text-center italic py-2">No active profile stats.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details popup trigger (No Dashboard redirection) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleOpenDetails(item)}
                      className="px-4 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-[#9B0302] hover:bg-slate-100 active:scale-95 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Profile Details Modal Popup (Read-Only Viewer) */}
      {showDetailsModal && selectedProfileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start gap-5 border-b border-slate-100 pb-5 mb-5 flex-shrink-0">
              {selectedProfileUser.role === "scholar" ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                  <img
                    src={getScholarAvatar(selectedProfileUser._id)}
                    alt={selectedProfileUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
                    }}
                  />
                </div>
              ) : (selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") && getFacultyProfileDetails(selectedProfileUser._id).avatar ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                  <img
                    src={getFacultyProfileDetails(selectedProfileUser._id).avatar}
                    alt={getFacultyProfileDetails(selectedProfileUser._id).name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center font-bold text-lg text-[#9B0302]">
                  {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty" ? getFacultyProfileDetails(selectedProfileUser._id).name : selectedProfileUser.name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                  {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).name : selectedProfileUser.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#9B0302] bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                    {selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty" ? "RESEARCH GUIDE" : selectedProfileUser.role.toUpperCase()}
                  </span>
                  <span>•</span>
                  {(selectedProfileUser.department || (selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty")) && (
                    <>
                      <span>{(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).department : selectedProfileUser.department} Research Center</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).email : selectedProfileUser.email}</span>
                </div>
                
                {selectedProfileUser.role === "scholar" && (
                  <div className="text-[11px] text-slate-600 font-medium">
                    Unique Registry ID: <span className="text-slate-800 font-bold">{getScholarUniqueId(selectedProfileUser._id)}</span> | Research Guide: <span className="text-slate-800 font-bold">{selectedProfileUser.guide?.name || "Dr. Elizabeth Paul"}</span>
                  </div>
                )}

                {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") && (
                  <div className="text-[11px] text-slate-600 font-medium">
                    Designation: <span className="text-slate-800 font-bold">{getFacultyProfileDetails(selectedProfileUser._id).designation}</span> | Supervision Center: <span className="text-slate-800 font-bold">{getFacultyProfileDetails(selectedProfileUser._id).supervisionCenter}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-slate-200 gap-4 mb-4 flex-shrink-0 overflow-x-auto">
              {getUserTabsConfig(selectedProfileUser).map((tab: any) => {
                const isActive = activeDetailsTab === tab.id;
                const records = getUserTabRecords(selectedProfileUser, tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailsTab(tab.id)}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex-shrink-0 ${
                      isActive ? "border-[#9B0302] text-[#9B0302]" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.name} ({records.length})
                  </button>
                );
              })}
              {selectedProfileUser.role === "coordinator" && (
                <button
                  onClick={() => setActiveDetailsTab("administrative")}
                  className="pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 border-[#9B0302] text-[#9B0302]"
                >
                  Administrative Role Scope
                </button>
              )}
            </div>

            {/* Scrollable details list / tables */}
            <div className="flex-1 overflow-y-auto pr-1">
              {selectedProfileUser.role === "coordinator" && activeDetailsTab === "administrative" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <h4 className="font-bold text-slate-800">Oversight Areas</h4>
                  <p className="text-slate-600">Managing all scholars under the MCA Research Center.</p>
                  <p className="text-slate-600">Assisting guides with registrations and approvals.</p>
                </div>
              )}
              
              {/* Dynamic Table for Scholar / Guide */}
              {selectedProfileUser.role !== "coordinator" && (() => {
                const activeTab = getUserTabsConfig(selectedProfileUser).find((t: any) => t.id === activeDetailsTab);
                if (!activeTab) return null;
                const records = getUserTabRecords(selectedProfileUser, activeDetailsTab);
                return (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-[#9B0302] text-white">
                          <th className="p-3 font-bold uppercase tracking-wider w-12 text-center">Sl.No</th>
                          {activeTab.columns.map((col: string, idx: number) => (
                            <th key={idx} className="p-3 font-bold uppercase tracking-wider">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab.columns.length + 1} className="p-6 text-center text-slate-400">
                              No records registered.
                            </td>
                          </tr>
                        ) : (
                          records.map((row: any, idx: number) => (
                            <tr key={idx} className="odd:bg-white even:bg-slate-50/50">
                              <td className="p-3 font-medium text-slate-700 text-center">{idx + 1}</td>
                              {activeTab.fields.map((field: string, fIdx: number) => (
                                <td key={fIdx} className="p-3 text-slate-600">
                                  {getRowVal(row, field)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="mt-5 border-t border-slate-150 pt-4 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 rounded-full transition"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Login Card Popup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-[#9B0302]" />
                <h3 className="font-display text-sm font-bold text-slate-800">
                  Sign In to Portal
                </h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="Enter email e.g. user@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302] transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password (Optional)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302] transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#9B0302] uppercase tracking-wider block">Select Role (Required)</label>
                <select
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302] transition cursor-pointer"
                >
                  <option value="" disabled>-- Select a role to sign in --</option>
                  <option value="scholar">Scholar</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="research_guide">Research Guide</option>
                  <option value="coordinator">Research Center Coordinator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition active:scale-95 shadow-sm"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
