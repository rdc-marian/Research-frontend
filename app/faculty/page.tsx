"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  NotebookText,
  Users,
  Plus,
  Settings,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { DashboardCards } from "@/components/DashboardCards";
import { PageLayout } from "@/components/PageLayout";
import { facultyNav } from "@/data/roleNav";
import { apiGet, apiPatchJson, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Submission = {
  _id: string;
  title: string;
  department: string;
  submittedAt?: string;
  status: string;
  scholar?: { name?: string };
};

type UserType = {
  _id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  department?: string;
};

// Initial faculty registry tabs
const DEFAULT_FACULTY_TABS = [
  { id: "qualifications", label: "Educational qualifications", isPredefined: true, columns: ["Sl.No.", "Qualification", "Area of Specialization", "Year of Passing", "Institution"] },
  { id: "publications", label: "Research Publications", isPredefined: true, columns: ["Sl.No.", "Publication Title", "Journal Name", "Year of Publication", "Impact Factor"] },
  { id: "scholars", label: "Guided Scholars", isPredefined: true, columns: ["Sl.No.", "Scholar Name", "Research Topic", "Registration Date", "Status"] },
  { id: "committees", label: "Expert Committees", isPredefined: true, columns: ["Sl.No.", "Committee / Organization", "Role", "Tenure / Year"] },
  { id: "projects", label: "Funded Projects", isPredefined: true, columns: ["Sl.No.", "Project Title", "Funding Agency", "Amount Sanctioned", "Status"] },
];

const DEFAULT_FACULTY_TABS_DATA = {
  qualifications: [
    { qualification: "Ph.D.", specialization: "Computer Science", year: "2012", institution: "CUSAT" },
    { qualification: "M.Tech", specialization: "Computer Science & Engineering", year: "2006", institution: "IIT Madras" },
    { qualification: "B.Tech", specialization: "Computer Science", year: "2004", institution: "NIT Calicut" }
  ],
  publications: [
    { "publication_title": "Machine Learning in Academic Registry Systems", "journal_name": "IEEE Transactions on Education", "year_of_publication": "2024", "impact_factor": "4.8" },
    { "publication_title": "Optimized Blockchain Architecture for Research Indexing", "journal_name": "Springer Journal of Grid Computing", "year_of_publication": "2023", "impact_factor": "3.5" }
  ],
  scholars: [
    { "scholar_name": "Albin Joseph", "research_topic": "AI-Driven Healthcare Diagnostics", "registration_date": "10/05/2024", status: "Ongoing" },
    { "scholar_name": "Binu Thomas", "research_topic": "Social Interventions in Rural Districts", "registration_date": "12/09/2023", status: "Ongoing" },
    { "scholar_name": "Chitra Nair", "research_topic": "Deep Learning for Automated Agriculture", "registration_date": "15/01/2024", status: "Ongoing" }
  ],
  committees: [
    { "committee___organization": "Board of Studies in Computer Applications, Marian College", role: "Expert Member", "tenure___year": "2023 - Present" },
    { "committee___organization": "IEEE Computer Society Kerala Chapter", role: "Executive Committee Member", "tenure___year": "2022 - 2025" }
  ],
  projects: [
    { "project_title": "Automatic Brain Lesion Detection using AI", "funding_agency": "KSCSTE Kerala", "amount_sanctioned": "₹2,50,000", status: "Ongoing" }
  ]
};

const defaultMetrics = [
  { label: "Total scholars", value: "0", icon: Users },
  { label: "Pending reviews", value: "0", icon: ClipboardCheck },
  { label: "Recent submissions", value: "0", icon: FileText },
  { label: "Approval requests", value: "0", icon: NotebookText },
];

export default function FacultyDashboard() {
  const { user, login } = useAuth();
  
  // Dashboard states
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab configurations
  const [tabsList, setTabsList] = useState<any[]>([]);
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [customTabsData, setCustomTabsData] = useState<Record<string, any[]>>({});

  // Modal triggers
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [showAddRowModal, setShowAddRowModal] = useState(false);

  // Custom delete confirmation modal state
  const [deleteConfirmType, setDeleteConfirmType] = useState<"tab" | "row" | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string>("");
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number>(-1);

  // Profile fields state
  const [profileName, setProfileName] = useState("");
  const [profileDesignation, setProfileDesignation] = useState("");
  const [profileUniqueId, setProfileUniqueId] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileDept, setProfileDept] = useState("");
  const [profileCenter, setProfileCenter] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  // New tab form
  const [newTabLabel, setNewTabLabel] = useState("");
  const [newTabColumns, setNewTabColumns] = useState("");

  // New row form
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});

  // Initialize and load dynamic database states
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [scholarsRes, submissionsRes, pendingRes, approvalsRes] = await Promise.all([
          apiGet<ApiListResponse<UserType>>("/users?role=scholar"),
          apiGet<ApiListResponse<Submission>>("/submissions"),
          apiGet<ApiListResponse<Submission>>("/submissions?status=Pending"),
          apiGet<ApiListResponse<Submission>>("/approvals?status=Pending"),
        ]);

        if (!isMounted) return;

        setMetrics([
          { label: "Total scholars", value: `${scholarsRes.items.length}`, icon: Users },
          { label: "Pending reviews", value: `${pendingRes.items.length}`, icon: ClipboardCheck },
          { label: "Recent submissions", value: `${submissionsRes.items.length}`, icon: FileText },
          { label: "Approval requests", value: `${approvalsRes.items.length}`, icon: NotebookText },
        ]);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load directory metrics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // Load active tab layout and records from localStorage
    if (typeof window !== "undefined") {
      // Load configuration lists
      const savedTabs = localStorage.getItem("faculty_tabs_config");
      const savedActive = localStorage.getItem("faculty_active_tabs");
      const savedData = localStorage.getItem("faculty_custom_tabs_data");

      if (savedTabs) {
        setTabsList(JSON.parse(savedTabs));
      } else {
        localStorage.setItem("faculty_tabs_config", JSON.stringify(DEFAULT_FACULTY_TABS));
        setTabsList(DEFAULT_FACULTY_TABS);
      }

      if (savedActive) {
        const parsedActive = JSON.parse(savedActive);
        setActiveTabs(parsedActive);
        if (parsedActive.length > 0) setSelectedTab(parsedActive[0]);
      } else {
        const defaultActive = DEFAULT_FACULTY_TABS.map(t => t.id);
        localStorage.setItem("faculty_active_tabs", JSON.stringify(defaultActive));
        setActiveTabs(defaultActive);
        setSelectedTab(defaultActive[0]);
      }

      if (savedData) {
        setCustomTabsData(JSON.parse(savedData));
      } else {
        localStorage.setItem("faculty_custom_tabs_data", JSON.stringify(DEFAULT_FACULTY_TABS_DATA));
        setCustomTabsData(DEFAULT_FACULTY_TABS_DATA);
      }

      // Load Profile fields
      setProfileName(localStorage.getItem("faculty_profile_name") || user?.name || "Dr. Elizabeth Paul");
      setProfileDesignation(localStorage.getItem("faculty_profile_designation") || "Professor & Research Director");
      setProfileUniqueId(localStorage.getItem("faculty_profile_unique_id") || "GUIDE-ELIZ-029");
      setProfileEmail(localStorage.getItem("faculty_profile_email") || user?.email || "elizabeth.paul@univ.edu");
      setProfileDept(localStorage.getItem("faculty_profile_dept") || user?.department || "MCA");
      setProfileCenter(localStorage.getItem("faculty_profile_center") || "MCA Research Center");
      setProfileAvatar(localStorage.getItem("faculty_profile_avatar") || "");
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save profile edits
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      alert("Name is required.");
      return;
    }
    
    // Write profile data to localStorage
    localStorage.setItem("faculty_profile_name", profileName);
    localStorage.setItem("faculty_profile_designation", profileDesignation);
    localStorage.setItem("faculty_profile_unique_id", profileUniqueId);
    localStorage.setItem("faculty_profile_email", profileEmail);
    localStorage.setItem("faculty_profile_dept", profileDept);
    localStorage.setItem("faculty_profile_center", profileCenter);
    localStorage.setItem("faculty_profile_avatar", profileAvatar);

    // Patch global user context
    if (user?._id) {
      try {
        const updatedUser = await apiPatchJson<UserType>(`/users/${user._id}`, {
          name: profileName,
          email: profileEmail,
          department: profileDept
        });
        login("", updatedUser);
      } catch (err) {
        console.error("Local context synchronization failed:", err);
      }
    }

    setShowEditProfileModal(false);
  };

  // Toggle active tab state
  const toggleTabCheckbox = (tabId: string) => {
    const nextActive = activeTabs.includes(tabId)
      ? activeTabs.filter(id => id !== tabId)
      : [...activeTabs, tabId];
      
    localStorage.setItem("faculty_active_tabs", JSON.stringify(nextActive));
    setActiveTabs(nextActive);

    if (selectedTab === tabId && nextActive.length > 0) {
      setSelectedTab(nextActive[0]);
    } else if (nextActive.length > 0 && !nextActive.includes(selectedTab)) {
      setSelectedTab(nextActive[0]);
    } else if (nextActive.length === 0) {
      setSelectedTab("");
    }
  };

  // Delete dynamic custom tab
  const handleDeleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmType("tab");
    setDeleteTargetId(tabId);
  };

  // Add brand new custom tab
  const handleCreateCustomTab = () => {
    if (!newTabLabel.trim() || !newTabColumns.trim()) {
      alert("Tab label and columns are required.");
      return;
    }

    const newId = "custom_" + Date.now();
    const colsArray = newTabColumns.split(",").map(c => c.trim()).filter(Boolean);
    
    // Ensure Sl.No. is the first header
    if (!colsArray.includes("Sl.No.")) {
      colsArray.unshift("Sl.No.");
    }

    const newTabConfig = {
      id: newId,
      label: newTabLabel,
      isPredefined: false,
      columns: colsArray
    };

    const nextList = [...tabsList, newTabConfig];
    const nextActive = [...activeTabs, newId];

    localStorage.setItem("faculty_tabs_config", JSON.stringify(nextList));
    localStorage.setItem("faculty_active_tabs", JSON.stringify(nextActive));

    setTabsList(nextList);
    setActiveTabs(nextActive);
    setSelectedTab(newId);

    // Init custom tab record rows
    const nextData = { ...customTabsData, [newId]: [] };
    localStorage.setItem("faculty_custom_tabs_data", JSON.stringify(nextData));
    setCustomTabsData(nextData);

    setNewTabLabel("");
    setNewTabColumns("");
    setShowAddTabModal(false);
  };

  // Add new row record
  const handleCreateRow = () => {
    if (!selectedTab) return;
    const currentTabRows = customTabsData[selectedTab] || [];
    const newEntry = { ...newRowValues };

    const nextRows = [...currentTabRows, newEntry];
    const nextData = { ...customTabsData, [selectedTab]: nextRows };

    localStorage.setItem("faculty_custom_tabs_data", JSON.stringify(nextData));
    setCustomTabsData(nextData);

    setNewRowValues({});
    setShowAddRowModal(false);
  };

  // Delete row record
  const handleDeleteRow = (rowIdx: number) => {
    if (!selectedTab) return;
    setDeleteConfirmType("row");
    setDeleteTargetIndex(rowIdx);
  };

  // Perform actual deletion of tab or row from custom state confirmation
  const executeDelete = () => {
    if (deleteConfirmType === "tab") {
      const tabId = deleteTargetId;
      const nextList = tabsList.filter(t => t.id !== tabId);
      const nextActive = activeTabs.filter(id => id !== tabId);

      localStorage.setItem("faculty_tabs_config", JSON.stringify(nextList));
      localStorage.setItem("faculty_active_tabs", JSON.stringify(nextActive));
      
      setTabsList(nextList);
      setActiveTabs(nextActive);

      if (selectedTab === tabId) {
        setSelectedTab(nextActive[0] || "");
      }

      const nextData = { ...customTabsData };
      delete nextData[tabId];
      localStorage.setItem("faculty_custom_tabs_data", JSON.stringify(nextData));
      setCustomTabsData(nextData);
    } else if (deleteConfirmType === "row") {
      const rowIdx = deleteTargetIndex;
      if (!selectedTab) return;

      const currentTabRows = customTabsData[selectedTab] || [];
      const nextRows = currentTabRows.filter((_, idx) => idx !== rowIdx);
      const nextData = { ...customTabsData, [selectedTab]: nextRows };

      localStorage.setItem("faculty_custom_tabs_data", JSON.stringify(nextData));
      setCustomTabsData(nextData);
    }

    setDeleteConfirmType(null);
    setDeleteTargetId("");
    setDeleteTargetIndex(-1);
  };

  // Active tab setup
  const activeTabConfig = tabsList.find(t => t.id === selectedTab);
  const activeTabRows = customTabsData[selectedTab] || [];

  return (
    <PageLayout
      title="Faculty Dashboard"
      userName={profileName}
      roleLabel="Faculty Member"
      navItems={facultyNav}
      activeItem="Dashboard"
    >
      <DashboardCards items={metrics} />

      {error ? (
        <p className="text-sm text-red-600 my-4">Failed to load dashboard: {error}</p>
      ) : null}

      {/* Profile details card integrated inside dashboard */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar frame */}
          <div className="w-32 h-32 md:w-36 md:h-36 relative rounded-lg overflow-hidden border border-[color:var(--border)] flex-shrink-0 bg-slate-50 flex items-center justify-center">
            {profileAvatar ? (
              <img
                src={profileAvatar}
                alt={profileName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-[#9B0302] bg-red-50">
                {profileName.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 space-y-1.5 w-full">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#9B0302]">
                  {profileName}
                </h2>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{profileDesignation}</p>
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
                <span className="font-semibold text-slate-500">Unique ID : </span>
                <span className="font-bold text-slate-800">{profileUniqueId}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Research Center : </span>
                <span className="font-bold text-slate-800">{profileDept} Research Center</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Email : </span>
                <span className="font-bold text-[#9B0302]">{profileEmail}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Supervision Center : </span>
                <span className="font-bold text-slate-800">{profileCenter}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registry tables with dynamic, non-predefined active tabs */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[color:var(--border)] pb-3 mb-6 gap-3">
          <h2 className="font-display text-lg font-bold text-[#9B0302]">
            Faculty Registry Portfolio
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

        {/* Dynamic active tabs list */}
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

        {/* Registry data table */}
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
                Edit Faculty Profile Details
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

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Designation</label>
                <input
                  type="text"
                  value={profileDesignation}
                  onChange={(e) => setProfileDesignation(e.target.value)}
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Supervision Center</label>
                <input
                  type="text"
                  value={profileCenter}
                  onChange={(e) => setProfileCenter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Photo URL</label>
                <input
                  type="text"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="Leave blank to use initials avatar"
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
                  placeholder="e.g. Guest Lectures"
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Table Columns (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Topic, Institution, Date"
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
