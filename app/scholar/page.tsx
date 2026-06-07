"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  Settings,
  X,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { DashboardCards } from "@/components/DashboardCards";
import { PageLayout } from "@/components/PageLayout";
import { scholarNav } from "@/data/roleNav";
import { apiGet, apiPatchJson, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Submission = {
  _id: string;
  title: string;
  department: string;
  submittedAt?: string;
  status: string;
};

const defaultMetrics = [
  { label: "Total submissions", value: "0", icon: FileText },
  { label: "Pending approvals", value: "0", icon: Clock },
  { label: "Approved papers", value: "0", icon: CheckCircle },
];

// Default configurations for predefined tabs
const DEFAULT_TABS_LIST = [
  { id: "qualifications", label: "Educational qualifications", columns: ["Sl.No.", "Qualification", "Area of Specialization", "Year of passing", "Institution"], isPredefined: true },
  { id: "thesis", label: "MPhil, PhD Thesis", columns: ["Sl.No.", "Degree", "Thesis Title", "Supervisor", "Year of Registration", "Status"], isPredefined: true },
  { id: "experience", label: "Experience", columns: ["Sl.No.", "Designation", "Institution/Organization", "From Date", "To Date", "Duration"], isPredefined: true },
  { id: "publications", label: "Publications", columns: ["Sl.No.", "Paper Title", "Authors", "Journal/Book Name", "Publish Date", "Indexing"], isPredefined: true },
  { id: "patents", label: "Patent", columns: ["Sl.No.", "Patent Title", "Application No.", "Filing Date", "Inventors", "Status"], isPredefined: true },
  { id: "consultancy", label: "Consultancy", columns: ["Sl.No.", "Project Title", "Client Organization", "Grant Received", "Year", "Status"], isPredefined: true },
  { id: "memberships", label: "Membership in Professional Bodies", columns: ["Sl.No.", "Professional Body", "Membership Number", "Membership Type", "Validity"], isPredefined: true },
  { id: "resource_person", label: "Resource person in Programmes", columns: ["Sl.No.", "Programme Title", "Host Institution", "Role / Topic", "Date"], isPredefined: true },
  { id: "workshops", label: "Workshop/FDP/Training programme Attended", columns: ["Sl.No.", "Programme Name", "Organized By", "Venue / Platform", "Dates"], isPredefined: true },
  { id: "awards", label: "Awards/Achievements/Others", columns: ["Sl.No.", "Award Name", "Awarding Body", "Category", "Year"], isPredefined: true },
  { id: "programmes_organized", label: "Programmes organized", columns: ["Sl.No.", "Programme Title", "Sponsor/Collaborator", "Role", "Dates"], isPredefined: true },
  { id: "funded_projects", label: "Funded Projects", columns: ["Sl.No.", "Project Title", "Funding Agency", "Amount Sanctioned", "Duration", "Status"], isPredefined: true },
  { id: "expert_committees", label: "Faculty as members of Expert committees", columns: ["Sl.No.", "Committee Detail", "Institution / Board", "Role Assigned", "Year"], isPredefined: true },
  { id: "editorial_boards", label: "Faculty as members of Editorial Boards", columns: ["Sl.No.", "Journal/Publication Name", "Publisher", "Role", "Period"], isPredefined: true }
];

const DEFAULT_TABS_DATA = {
  qualifications: [
    { qualification: "Ph.D.", area_of_specialization: "Social Work", year_of_passing: "2016", institution: "Gandhigram Rural Institute (Deemed University)" },
    { qualification: "MA", area_of_specialization: "Sociology", year_of_passing: "2013", institution: "IGNOU, New Delhi" },
    { qualification: "MA", area_of_specialization: "Public Administration", year_of_passing: "2011", institution: "IGNOU, New Delhi" },
    { qualification: "MSW", area_of_specialization: "Social Work", year_of_passing: "2010", institution: "M G University Kottayam" },
    { qualification: "BA", area_of_specialization: "Sociology", year_of_passing: "2008", institution: "M G University Kottayam" }
  ],
  thesis: [
    { degree: "Ph.D.", thesis_title: "AI-Driven Healthcare Diagnostics in Rural Contexts", supervisor: "Dr. Elizabeth Paul", year_of_registration: "2024", status: "Ongoing" },
    { degree: "M.Phil.", thesis_title: "Social Impact of Computer Literacy in Kerala", supervisor: "Dr. Thomas Mathew", year_of_registration: "2022", status: "Completed" }
  ],
  experience: [
    { designation: "Junior Research Fellow", "institution/organization": "Center for Computer Applications, SJC", from_date: "01/06/2024", to_date: "Present", duration: "1.5 Years" },
    { designation: "Guest Lecturer", "institution/organization": "SJC College", from_date: "01/08/2022", to_date: "30/03/2024", duration: "1 Year 8 Months" }
  ],
  publications: [
    { paper_title: "A Survey on Deep Learning Techniques for Image Segmentation", authors: "Albin Joseph, Elizabeth Paul", "journal/book_name": "International Journal of Computer Science", publish_date: "Nov 2025", indexing: "Scopus, UGC CARE" }
  ],
  patents: [
    { patent_title: "Real-time Medical Image Segmentation Device", "application_no.": "PAT-2026-9912", filing_date: "14/02/2026", inventors: "Albin Joseph, Elizabeth Paul", status: "Published" }
  ],
  consultancy: [
    { project_title: "AI Integration in Agriculture Analytics", client_organization: "AgroTech Solutions", grant_received: "₹1,20,000", year: "2025", status: "Completed" }
  ],
  memberships: [
    { professional_body: "Computer Society of India (CSI)", membership_number: "CSI-88271A", membership_type: "Life Member", validity: "2024 - Ongoing" }
  ],
  resource_person: [
    { programme_title: "Advanced Machine Learning Workshop", host_institution: "M G University Department of CS", "role_/_topic": "Keynote Speaker on PyTorch", date: "12/04/2025" }
  ],
  workshops: [
    { programme_name: "Deep Learning Foundations and Applications", organized_by: "IIT Madras", "venue_/_platform": "Online", dates: "10/06/2025 - 15/06/2025" }
  ],
  awards: [
    { award_name: "Best Poster Presentation Award", awarding_body: "IEEE Kerala Section", category: "Conference Paper", year: "2025" }
  ],
  programmes_organized: [
    { programme_title: "Hands-on Workshop on Git and GitHub", "sponsor/collaborator": "ACM Student Chapter", role: "Organizer & Speaker", dates: "14/09/2025" }
  ],
  funded_projects: [
    { project_title: "Automatic Brain Lesion Detection using AI", funding_agency: "KSCSTE Kerala", amount_sanctioned: "₹2,50,000", duration: "1 Year", status: "Ongoing" }
  ],
  expert_committees: [
    { committee_detail: "Curriculum Advisory Board for MCA", "institution_/_board": "SJC College Autonomous", role_assigned: "Student Representative Expert", year: "2025" }
  ],
  editorial_boards: [
    { "journal/publication_name": "International Journal of Student Research", publisher: "SJC Publications", role: "Student Editor", period: "2024 - Present" }
  ]
};

export default function ScholarDashboard() {
  const { user, login } = useAuth();
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs configurations and dynamic records
  const [tabsList, setTabsList] = useState<any[]>([]);
  const [tabsData, setTabsData] = useState<Record<string, any[]>>({});
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("qualifications");

  // Modals state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Custom delete confirmation modal state
  const [deleteConfirmType, setDeleteConfirmType] = useState<"tab" | "row" | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string>("");
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number>(-1);

  // Form states for creating custom tabs
  const [newTabLabel, setNewTabLabel] = useState("");
  const [newTabColumns, setNewTabColumns] = useState("");

  // Form states for adding dynamic rows
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});

  // Profile fields state
  const [profileName, setProfileName] = useState("");
  const [profileUniqueId, setProfileUniqueId] = useState("");
  const [profileDept, setProfileDept] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileGuide, setProfileGuide] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  // Scholar detail displays
  const [uniqueId, setUniqueId] = useState("MCKA-TS029");
  const [avatarUrl, setAvatarUrl] = useState("/scholar-avatar.png");

  // Initialize data and load config from LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Tabs list
    const savedTabsList = localStorage.getItem("scholar_custom_tabs_list");
    let list = DEFAULT_TABS_LIST;
    if (savedTabsList) {
      try {
        list = JSON.parse(savedTabsList);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("scholar_custom_tabs_list", JSON.stringify(DEFAULT_TABS_LIST));
    }
    setTabsList(list);

    // Tabs records
    const savedTabsData = localStorage.getItem("scholar_custom_tabs_data");
    let data = DEFAULT_TABS_DATA;
    if (savedTabsData) {
      try {
        data = JSON.parse(savedTabsData);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("scholar_custom_tabs_data", JSON.stringify(DEFAULT_TABS_DATA));
    }
    setTabsData(data);

    // Active tabs
    const savedActive = localStorage.getItem("scholar_active_tabs");
    let active = ["qualifications", "publications", "patents", "workshops"];
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (Array.isArray(parsed) && parsed.length > 0) {
          active = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("scholar_active_tabs", JSON.stringify(active));
    }
    setActiveTabs(active);

    if (active.length > 0) {
      setSelectedTab(active[0]);
    }
  }, []);

  // Initialize Scholar profile custom items from LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedId = localStorage.getItem("scholar_profile_unique_id");
    if (savedId) setUniqueId(savedId);

    const savedAvatar = localStorage.getItem("scholar_profile_avatar");
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, [user]);

  // Load metrics stats
  useEffect(() => {
    let isMounted = true;
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const [submissionsRes, pendingRes, approvedRes] = await Promise.all([
          apiGet<ApiListResponse<Submission>>("/submissions"),
          apiGet<ApiListResponse<Submission>>("/submissions?status=Pending"),
          apiGet<ApiListResponse<Submission>>("/submissions?status=Approved"),
        ]);

        if (!isMounted) return;

        setMetrics([
          {
            label: "Total submissions",
            value: `${submissionsRes.items.length}`,
            icon: FileText,
          },
          {
            label: "Pending approvals",
            value: `${pendingRes.items.length}`,
            icon: Clock,
          },
          {
            label: "Approved papers",
            value: `${approvedRes.items.length}`,
            icon: CheckCircle,
          },
        ]);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize Edit profile form values when modal opens
  useEffect(() => {
    if (user && showEditProfileModal) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfileDept(user.department || "MCA");
      setProfileGuide(user.guide?.name || "Dr. Elizabeth Paul");
      
      const savedId = localStorage.getItem("scholar_profile_unique_id");
      setProfileUniqueId(savedId || "MCKA-TS029");
      
      const savedAvatar = localStorage.getItem("scholar_profile_avatar");
      setProfileAvatar(savedAvatar || "/scholar-avatar.png");
    }
  }, [user, showEditProfileModal]);

  // Handle saving modified profile details
  const handleSaveProfile = async () => {
    if (!user?._id) return;
    try {
      const updatedUser = {
        ...user,
        name: profileName,
        email: profileEmail,
        department: profileDept,
        guide: { ...user.guide, name: profileGuide }
      };

      localStorage.setItem("scholar_profile_unique_id", profileUniqueId);
      localStorage.setItem("scholar_profile_avatar", profileAvatar);

      // Save changes to local database via API
      await apiPatchJson("/users/" + user._id, {
        name: profileName,
        email: profileEmail,
        department: profileDept,
        guide: { name: profileGuide }
      });

      // Update state in view
      setUniqueId(profileUniqueId);
      setAvatarUrl(profileAvatar);

      // Update context user immediately
      login("", updatedUser);
      setShowEditProfileModal(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  // Toggle predefined active tabs in config checklist
  const toggleTabCheckbox = (tabId: string) => {
    let newTabs = [...activeTabs];
    if (newTabs.includes(tabId)) {
      if (newTabs.length > 1) {
        newTabs = newTabs.filter(id => id !== tabId);
      }
    } else {
      newTabs.push(tabId);
    }
    setActiveTabs(newTabs);
    localStorage.setItem("scholar_active_tabs", JSON.stringify(newTabs));
    
    if (!newTabs.includes(selectedTab)) {
      setSelectedTab(newTabs[0]);
    }
  };

  // Add a brand new custom tab
  const handleCreateCustomTab = () => {
    if (!newTabLabel.trim()) return;
    
    const tabId = "custom_tab_" + Date.now();
    let cols = newTabColumns.split(",").map(c => c.trim()).filter(Boolean);
    
    if (cols.length === 0) {
      cols = ["Title", "Details", "Date"];
    }
    
    // Prefix Sl.No. if not present
    if (!cols.includes("Sl.No.")) {
      cols = ["Sl.No.", ...cols];
    }

    const newTab = {
      id: tabId,
      label: newTabLabel.trim(),
      columns: cols,
      isPredefined: false
    };

    const updatedList = [...tabsList, newTab];
    setTabsList(updatedList);
    localStorage.setItem("scholar_custom_tabs_list", JSON.stringify(updatedList));

    const updatedData = { ...tabsData, [tabId]: [] };
    setTabsData(updatedData);
    localStorage.setItem("scholar_custom_tabs_data", JSON.stringify(updatedData));

    const updatedActive = [...activeTabs, tabId];
    setActiveTabs(updatedActive);
    localStorage.setItem("scholar_active_tabs", JSON.stringify(updatedActive));

    setSelectedTab(tabId);
    setNewTabLabel("");
    setNewTabColumns("");
    setShowAddTabModal(false);
  };

  // Delete a custom tab
  const handleDeleteTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteConfirmType("tab");
    setDeleteTargetId(tabId);
  };

  // Add new row of data to the active tab
  const handleCreateRow = () => {
    const activeTabConfig = tabsList.find(t => t.id === selectedTab);
    if (!activeTabConfig) return;

    const rowObj: Record<string, string> = {};
    activeTabConfig.columns.forEach((col: string) => {
      if (col === "Sl.No.") return;
      const key = col.toLowerCase().replace(/\//g, "_").replace(/\s+/g, "_");
      rowObj[key] = newRowValues[col] || "";
    });

    const currentRows = tabsData[selectedTab] || [];
    const updatedRows = [...currentRows, rowObj];
    const updatedData = { ...tabsData, [selectedTab]: updatedRows };
    setTabsData(updatedData);
    localStorage.setItem("scholar_custom_tabs_data", JSON.stringify(updatedData));

    setNewRowValues({});
    setShowAddRowModal(false);
  };

  // Delete specific row from active tab
  const handleDeleteRow = (rowIdx: number) => {
    if (!selectedTab) return;
    setDeleteConfirmType("row");
    setDeleteTargetIndex(rowIdx);
  };

  // Perform actual deletion of tab or row from custom state confirmation
  const executeDelete = () => {
    if (deleteConfirmType === "tab") {
      const tabId = deleteTargetId;
      const updatedList = tabsList.filter(t => t.id !== tabId);
      setTabsList(updatedList);
      localStorage.setItem("scholar_custom_tabs_list", JSON.stringify(updatedList));

      const updatedData = { ...tabsData };
      delete updatedData[tabId];
      setTabsData(updatedData);
      localStorage.setItem("scholar_custom_tabs_data", JSON.stringify(updatedData));

      const updatedActive = activeTabs.filter(id => id !== tabId);
      setActiveTabs(updatedActive);
      localStorage.setItem("scholar_active_tabs", JSON.stringify(updatedActive));

      if (selectedTab === tabId && updatedActive.length > 0) {
        setSelectedTab(updatedActive[0]);
      }
    } else if (deleteConfirmType === "row") {
      const rowIdx = deleteTargetIndex;
      if (!selectedTab) return;

      const currentRows = tabsData[selectedTab] || [];
      const updatedRows = currentRows.filter((_, idx) => idx !== rowIdx);
      const updatedData = { ...tabsData, [selectedTab]: updatedRows };
      setTabsData(updatedData);
      localStorage.setItem("scholar_custom_tabs_data", JSON.stringify(updatedData));
    }

    setDeleteConfirmType(null);
    setDeleteTargetId("");
    setDeleteTargetIndex(-1);
  };

  const activeTabConfig = tabsList.find(t => t.id === selectedTab) || tabsList[0];
  const activeTabRows = tabsData[selectedTab] || [];

  return (
    <PageLayout
      title="Scholar Dashboard"
      userName={user?.name || "Scholar User"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="Dashboard"
    >
      {/* 3 Metric Cards */}
      <DashboardCards items={metrics} />
      
      {error ? (
        <p className="text-sm text-red-600 mb-6">Failed to load dashboard: {error}</p>
      ) : null}

      {/* Profile Card Section with solid colors matching website */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Photo */}
          <div className="w-32 h-32 md:w-36 md:h-36 relative rounded-lg overflow-hidden border border-[color:var(--border)] flex-shrink-0 bg-slate-50">
            <img
              src={avatarUrl}
              alt={user?.name || "Scholar User"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
              }}
            />
          </div>
          
          {/* Details */}
          <div className="flex-1 space-y-1.5 w-full">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#9B0302]">
                  {user?.name || "Albin Joseph"}
                </h2>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Scholar</p>
              </div>
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[color:var(--border)] bg-slate-50 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            </div>
            
            <div className="pt-2 text-xs space-y-1.5 text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>
                <span className="font-semibold text-slate-500">Unique Id : </span>
                <span className="font-bold text-slate-800">{uniqueId}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Research Center : </span>
                <span className="font-bold text-slate-800">{user?.department || "MCA"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Email : </span>
                <span className="font-bold text-[#9B0302]">{user?.email || "albin@univ.edu"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Research Guide : </span>
                <span className="font-bold text-slate-800">{user?.guide?.name || "Dr. Elizabeth Paul"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registry tables with dynamic, non-predefined active tabs */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[color:var(--border)] pb-3 mb-6 gap-3">
          <h2 className="font-display text-lg font-bold text-[#9B0302]">
            Scholar Registry Profile
          </h2>
          <div className="flex items-center gap-2">
            {activeTabConfig ? (
              <button
                onClick={() => setShowAddRowModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-[10px] font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-100 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Record
              </button>
            ) : null}
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[color:var(--border)] bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition"
            >
              <Settings className="h-3.5 w-3.5" />
              Configure Tabs
            </button>
          </div>
        </div>

        {/* Dynamic active tabs list with custom styles */}
        <div className="flex flex-wrap items-end border-b border-[color:var(--border)] gap-1 mb-6">
          {activeTabs.map((tabKey) => {
            const config = tabsList.find(t => t.id === tabKey);
            if (!config) return null;
            const isActive = selectedTab === tabKey;
            
            return (
              <div
                key={tabKey}
                className={`group flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition duration-150 -mb-[1px] relative rounded-t-lg ${
                  isActive
                    ? "border-t-2 border-t-[#9B0302] border-x border-x-[color:var(--border)] border-b-white bg-white text-[#9B0302] font-bold"
                    : "text-slate-600 hover:text-[#9B0302] bg-transparent border-transparent hover:border-b-[#9B0302]"
                }`}
                style={{
                  borderBottom: isActive ? "1px solid white" : "1px solid transparent"
                }}
              >
                <button
                  onClick={() => setSelectedTab(tabKey)}
                  className="outline-none focus:outline-none"
                >
                  {config.label}
                </button>
                
                {/* Delete custom tab */}
                {!config.isPredefined && (
                  <button
                    onClick={(e) => handleDeleteTab(tabKey, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#9B0302] transition ml-0.5"
                    title="Delete this custom tab"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Registry data table styled exactly like template image */}
        {activeTabConfig ? (
          <div className="mt-4 border border-[#e5a09a] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#9B0302] text-white">
                    {activeTabConfig.columns.map((col: string, idx: number) => (
                      <th
                        key={idx}
                        className="p-3 text-xs font-bold text-white border border-[#b81d1c] border-r-white/20 last:border-r-transparent uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="p-3 text-xs font-bold text-white border border-[#b81d1c] uppercase tracking-wider text-center w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5d0cc]">
                  {activeTabRows.length === 0 ? (
                    <tr>
                      <td colSpan={activeTabConfig.columns.length + 1} className="p-8 text-center text-xs text-slate-400 bg-white">
                        No records found. Click "Add Record" to insert a new entry.
                      </td>
                    </tr>
                  ) : (
                    activeTabRows.map((item, rowIdx) => {
                      return (
                        <tr
                          key={rowIdx}
                          className="odd:bg-white even:bg-[#fcfcfd] hover:bg-slate-50 transition duration-150"
                        >
                          {activeTabConfig.columns.map((col: string, cellIdx: number) => {
                            if (col === "Sl.No.") {
                              return (
                                <td key={cellIdx} className="p-3.5 text-xs text-slate-700 border border-[#f5d0cc] font-medium">
                                  {rowIdx + 1}
                                </td>
                              );
                            }
                            const key = col.toLowerCase().replace(/\//g, "_").replace(/\s+/g, "_");
                            const val = item[key] || item[col] || item[col.toLowerCase()] || "";
                            return (
                              <td
                                key={cellIdx}
                                className="p-3.5 text-xs text-slate-700 border border-[#f5d0cc]"
                              >
                                {val}
                              </td>
                            );
                          })}
                          <td className="p-3 text-xs text-slate-700 border border-[#f5d0cc] text-center">
                            <button
                              onClick={() => handleDeleteRow(rowIdx)}
                              className="text-slate-400 hover:text-[#9B0302] transition"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[color:var(--border)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
              <h3 className="font-display text-base font-bold text-[#9B0302]">
                Edit Scholar Profile Details
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Unique ID</label>
                  <input
                    type="text"
                    value={profileUniqueId}
                    onChange={(e) => setProfileUniqueId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Research Center</label>
                  <input
                    type="text"
                    value={profileDept}
                    onChange={(e) => setProfileDept(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Research Guide</label>
                <input
                  type="text"
                  value={profileGuide}
                  onChange={(e) => setProfileGuide(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Profile Photo URL</label>
                <input
                  type="text"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[color:var(--border)] pt-4">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-full bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Tabs Checklist Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[color:var(--border)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
              <h3 className="font-display text-base font-bold text-[#9B0302]">
                Configure Profile Tabs
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Select which sections to display on your dashboard.
            </p>
            
            <div className="mt-4 max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
              {tabsList.map((cfg) => {
                const isSelected = activeTabs.includes(cfg.id);
                return (
                  <label
                    key={cfg.id}
                    className={`flex items-center gap-3 p-2 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? "border-[#9B0302] bg-slate-50 text-[#9B0302] font-semibold"
                        : "border-transparent hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTabCheckbox(cfg.id)}
                      className="h-4 w-4 rounded border-slate-300 text-[#9B0302] focus:ring-[#9B0302]"
                    />
                    <span>{cfg.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 border-t border-[color:var(--border)] pt-4">
              <button
                onClick={() => setShowAddTabModal(true)}
                className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-[#9B0302]/40 text-xs font-semibold text-[#9B0302] hover:bg-slate-50 transition"
              >
                <Plus className="h-4 w-4" />
                Add Brand New Custom Tab
              </button>
            </div>
            
            <div className="mt-5 flex justify-end border-t border-[color:var(--border)] pt-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-full bg-[#9B0302] hover:bg-[#800201] px-5 py-2 text-xs font-semibold text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Tab Modal */}
      {showAddTabModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[color:var(--border)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
              <h3 className="font-display text-base font-bold text-[#9B0302]">
                Create Custom Tab
              </h3>
              <button
                onClick={() => setShowAddTabModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Tab Label / Title</label>
                <input
                  type="text"
                  placeholder="e.g. My Outreach Projects"
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Table Columns (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Project Title, Sponsor, Amount, Year"
                  value={newTabColumns}
                  onChange={(e) => setNewTabColumns(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Sl.No. and Action columns are added automatically.</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[color:var(--border)] pt-3">
              <button
                onClick={() => setShowAddTabModal(false)}
                className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomTab}
                className="px-5 py-2 rounded-full bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition"
              >
                Create Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {showAddRowModal && activeTabConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[color:var(--border)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
              <h3 className="font-display text-base font-bold text-[#9B0302]">
                Add {activeTabConfig.label} Record
              </h3>
              <button
                onClick={() => setShowAddRowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 max-h-[350px] overflow-y-auto space-y-3.5 pr-1 py-1">
              {activeTabConfig.columns.map((col: string, idx: number) => {
                if (col === "Sl.No.") return null;
                return (
                  <div key={idx}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{col}</label>
                    <input
                      type="text"
                      value={newRowValues[col] || ""}
                      onChange={(e) => setNewRowValues({ ...newRowValues, [col]: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[color:var(--border)] pt-4">
              <button
                onClick={() => setShowAddRowModal(false)}
                className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRow}
                className="px-5 py-2 rounded-full bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Confirmation Dialog Overlay */}
      {deleteConfirmType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {deleteConfirmType === "tab" ? "Delete Category Tab?" : "Delete Record Row?"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {deleteConfirmType === "tab" 
                  ? "Are you sure you want to permanently delete this tab category and all its records? This action cannot be undone."
                  : "Are you sure you want to permanently delete this record? This action cannot be undone."}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                id="cancel-delete-btn"
                onClick={() => {
                  setDeleteConfirmType(null);
                  setDeleteTargetId("");
                  setDeleteTargetIndex(-1);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={executeDelete}
                className="flex-1 py-2 bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
