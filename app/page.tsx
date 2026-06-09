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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9B0302] to-[#600201] text-white shadow-lg shadow-[#9B0302]/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-800">Marian<span className="text-[#9B0302]">Research</span></span>
        </div>
        <button onClick={() => setShowLoginModal(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95">
          <Lock className="w-3.5 h-3.5" /> Portal Login
        </button>
      </nav>

      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-32 lg:pb-40 flex flex-col items-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:w-[600px] bg-red-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#9B0302] text-[10px] font-bold uppercase tracking-widest mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Excellence in Research & Innovation</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mb-6">
            Pioneering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9B0302] to-[#e63946]">Discoveries</span> for a Better Tomorrow
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 sm:mb-10">
            Welcome to the MarianResearch portal. Explore the cutting-edge academic achievements, funded projects, and publications from our esteemed scholars and research guides.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#9B0302] text-white font-semibold text-sm hover:bg-[#800201] transition-all shadow-lg shadow-[#9B0302]/30 hover:-translate-y-0.5">
              Explore Directory
            </button>
            <button onClick={() => setShowLoginModal(true)} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5">
              Access Dashboard
            </button>
          </div>
        </section>

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

        {/* Directory Section */}
        <section id="directory" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Academic Directory</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Browse through our academic members, discover their latest publications, qualifications, and funded studies making a global impact.
              </p>
            </div>
            
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, department or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition shadow-sm"
              />
            </div>
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {[
              { id: "all", label: "All Members" },
              { id: "scholar", label: "Research Scholars" },
              { id: "faculty", label: "Research Guides" },
              { id: "coordinator", label: "Center Coordinators" },
            ].map((badge) => {
              const isSelected = selectedRoleFilter === badge.id;
              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedRoleFilter(badge.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {badge.label}
                </button>
              );
            })}
          </div>

          {/* Users Card Grid */}
          {loading ? (
            <div className="text-center py-20 text-sm text-slate-500">Loading directory profiles...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-sm text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl">
              No matching profiles found in the directory.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((item) => {
                const isScholar = item.role === "scholar";
                const isGuide = item.roles?.includes("research_guide") || item.role === "faculty";
                const isCoordinator = item.role === "coordinator";
                
                const facultyMeta = isGuide ? getFacultyProfileDetails(item._id) : null;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-[#9B0302]/20 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        {isScholar ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                            <img
                              src={getScholarAvatar(item._id)}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
                              }}
                            />
                          </div>
                        ) : isGuide && facultyMeta && facultyMeta.avatar ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                            <img
                              src={facultyMeta.avatar}
                              alt={facultyMeta.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center font-bold text-lg text-[#9B0302] shadow-sm">
                            {(isGuide && facultyMeta ? facultyMeta.name : item.name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                          </div>
                        )}
                        
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-slate-800 leading-tight">
                            {isGuide && facultyMeta ? facultyMeta.name : item.name}
                          </h3>
                          
                          <div>
                            {isScholar && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#9B0302] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                                Scholar
                              </span>
                            )}
                            {isGuide && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                Research Guide
                              </span>
                            )}
                            {isCoordinator && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                Coordinator
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display user tabs and counts */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Profile</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
                          {getUserActiveTabsAndCounts(item).map((tab) => (
                            <div key={tab.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 rounded-xl">
                              <span className="text-slate-600 font-semibold truncate pr-2">{tab.label}</span>
                              <span className="bg-white text-slate-800 shadow-sm border border-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
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

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="w-full sm:w-auto px-5 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#9B0302] hover:border-[#9B0302]/30 hover:bg-red-50 active:scale-95 transition-all shadow-sm group-hover:shadow-md"
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* Profile Details Modal Popup (Read-Only Viewer) */}
      {showDetailsModal && selectedProfileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-slate-100 pb-6 mb-6 flex-shrink-0 mt-2">
              {selectedProfileUser.role === "scholar" ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-50 flex-shrink-0">
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
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-50 flex-shrink-0">
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
                <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-lg bg-red-50 flex-shrink-0 flex items-center justify-center font-bold text-2xl text-[#9B0302]">
                  {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty" ? getFacultyProfileDetails(selectedProfileUser._id).name : selectedProfileUser.name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
              )}

              <div className="space-y-2 pt-1">
                <h3 className="text-2xl font-display font-bold text-slate-900 leading-tight">
                  {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).name : selectedProfileUser.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                  <span className="font-bold text-[#9B0302] bg-red-50 border border-red-100 px-2.5 py-1 rounded-md tracking-wide">
                    {selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty" ? "RESEARCH GUIDE" : selectedProfileUser.role.toUpperCase()}
                  </span>
                  <span>•</span>
                  {(selectedProfileUser.department || (selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty")) && (
                    <>
                      <span className="font-medium text-slate-700">{(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).department : selectedProfileUser.department} Research Center</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).email : selectedProfileUser.email}</span>
                </div>
                
                {selectedProfileUser.role === "scholar" && (
                  <div className="text-xs text-slate-600 font-medium pt-1">
                    Unique Registry ID: <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{getScholarUniqueId(selectedProfileUser._id)}</span> &nbsp;|&nbsp; Research Guide: <span className="text-slate-900 font-bold">{selectedProfileUser.guide?.name || "Dr. Elizabeth Paul"}</span>
                  </div>
                )}

                {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") && (
                  <div className="text-xs text-slate-600 font-medium pt-1">
                    Designation: <span className="text-slate-900 font-bold">{getFacultyProfileDetails(selectedProfileUser._id).designation}</span> &nbsp;|&nbsp; Supervision Center: <span className="text-slate-900 font-bold">{getFacultyProfileDetails(selectedProfileUser._id).supervisionCenter}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-slate-200 gap-6 mb-6 flex-shrink-0 overflow-x-auto hide-scrollbar">
              {getUserTabsConfig(selectedProfileUser).map((tab: any) => {
                const isActive = activeDetailsTab === tab.id;
                const records = getUserTabRecords(selectedProfileUser, tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailsTab(tab.id)}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
                      isActive ? "border-[#9B0302] text-[#9B0302]" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.name} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-red-50' : 'bg-slate-100'}`}>{records.length}</span>
                  </button>
                );
              })}
              {selectedProfileUser.role === "coordinator" && (
                <button
                  onClick={() => setActiveDetailsTab("administrative")}
                  className="pb-3 text-xs font-bold uppercase tracking-wider border-b-2 border-[#9B0302] text-[#9B0302]"
                >
                  Administrative Role Scope
                </button>
              )}
            </div>

            {/* Scrollable details list / tables */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {selectedProfileUser.role === "coordinator" && activeDetailsTab === "administrative" && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#9B0302]"/> Oversight Areas</h4>
                  <p className="text-slate-600 pl-6">Managing all scholars under the MCA Research Center.</p>
                  <p className="text-slate-600 pl-6">Assisting guides with registrations and approvals.</p>
                </div>
              )}
              
              {/* Dynamic Table for Scholar / Guide */}
              {selectedProfileUser.role !== "coordinator" && (() => {
                const activeTab = getUserTabsConfig(selectedProfileUser).find((t: any) => t.id === activeDetailsTab);
                if (!activeTab) return null;
                const records = getUserTabRecords(selectedProfileUser, activeDetailsTab);
                return (
                  <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full min-w-[600px] md:min-w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="p-4 font-bold uppercase tracking-wider text-xs w-14 text-center">#</th>
                          {activeTab.columns.map((col: string, idx: number) => (
                            <th key={idx} className="p-4 font-bold uppercase tracking-wider text-xs">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab.columns.length + 1} className="p-8 text-center text-slate-500 italic bg-slate-50/50">
                              No records registered for this section.
                            </td>
                          </tr>
                        ) : (
                          records.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-medium text-slate-400 text-center">{idx + 1}</td>
                              {activeTab.fields.map((field: string, fIdx: number) => (
                                <td key={fIdx} className="p-4 text-slate-700">
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
            <div className="mt-6 border-t border-slate-100 pt-5 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Login Card Popup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 relative max-h-[95vh] overflow-y-auto">
            
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#9B0302] rounded-2xl flex items-center justify-center shadow-lg shadow-[#9B0302]/30 rotate-12">
              <Lock className="w-6 h-6 text-white -rotate-12" />
            </div>

            <div className="mt-4 text-center mb-8">
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Welcome Back
              </h3>
              <p className="text-sm text-slate-500 mt-1">Sign in to your dashboard</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address <span className="text-slate-400 font-normal capitalize">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email e.g. user@univ.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password <span className="text-slate-400 font-normal capitalize">(Optional)</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-[#9B0302] uppercase tracking-wider block mb-1.5">Select Role <span className="text-[#9B0302] font-normal capitalize">(Required)</span></label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B0302]" />
                  <select
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-xl border border-[#9B0302]/30 bg-red-50/30 pl-10 pr-4 py-3 text-sm text-[#9B0302] font-medium focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>-- Select your role --</option>
                    <option value="scholar">Scholar</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="research_guide">Research Guide</option>
                    <option value="coordinator">Research Center Coordinator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#9B0302] hover:bg-[#800201] text-sm font-semibold text-white transition-all shadow-md shadow-[#9B0302]/30 hover:shadow-lg hover:shadow-[#9B0302]/40 active:scale-95"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
