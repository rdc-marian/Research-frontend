"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  FolderOpen,
  GraduationCap,
  NotebookText,
  User as UserIcon,
  Users,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/Table";
import { DashboardCards } from "@/components/DashboardCards";
import { adminNav } from "@/data/roleNav";
import { apiGet, apiPatchJson, getUserAvatarUrl, type ApiItemResponse, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { ProfileImageModal, type ProfileUser } from "@/components/ProfileImageModal";

type User = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  status?: string;
  phone?: string;
  department?: string;
  uniqueId?: string;
  designation?: string;
  specialization?: string;
  experience?: string;
  preferences?: any;
  researchCenter?: { _id?: string; name?: string; code?: string } | string | null;
  guide?: { _id?: string; name?: string; email?: string } | string | null;
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  coordinator: "Research Center Coordinator",
  faculty: "Faculty",
  scholar: "Scholar",
  research_guide: "Research Guide",
  library: "Librarian",
};

const DEFAULT_FACULTY_TABS = [
  { id: "qualifications", label: "Educational qualifications", isPredefined: true, columns: ["Sl.No.", "Qualification", "Area of Specialization", "Year of Passing", "Institution"] },
  { id: "publications", label: "Research Publications", isPredefined: true, columns: ["Sl.No.", "Publication Title", "Journal Name", "Year of Publication", "Impact Factor"] },
  { id: "scholars", label: "Guided Scholars", isPredefined: true, columns: ["Sl.No.", "Scholar Name", "Research Topic", "Registration Date", "Status"] },
  { id: "committees", label: "Expert Committees", isPredefined: true, columns: ["Sl.No.", "Committee / Organization", "Role", "Tenure / Year"] },
  { id: "projects", label: "Funded Projects", isPredefined: true, columns: ["Sl.No.", "Project Title", "Funding Agency", "Amount Sanctioned", "Status"] },
];

function AdminUserDetailsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") ?? "";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<ProfileUser | null>(null);

  // User Dashboard Details State
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [userLeaves, setUserLeaves] = useState<any[]>([]);
  const [guidedScholars, setGuidedScholars] = useState<User[]>([]);
  const [researchCenters, setResearchCenters] = useState<any[]>([]);

  // Faculty Registry Portfolio State
  const [tabsList, setTabsList] = useState<any[]>(DEFAULT_FACULTY_TABS);
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [customTabsData, setCustomTabsData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!userId) {
      setError("Missing user id.");
      setLoading(false);
      return;
    }
    let isMounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGet<ApiItemResponse<User>>(`/users/${userId}`);
        if (!isMounted) return;
        const loadedUser = response.item;
        setUser(loadedUser);

        // Extract Faculty Registry Portfolio Preferences if present
        if (loadedUser?.preferences) {
          const prefTabs = loadedUser.preferences.faculty_tabs_config;
          const prefActive = loadedUser.preferences.faculty_active_tabs;
          const prefData = loadedUser.preferences.faculty_custom_tabs_data;

          const configuredTabs = prefTabs && prefTabs.length > 0 ? prefTabs : DEFAULT_FACULTY_TABS;
          setTabsList(configuredTabs);

          const enabledTabs = prefActive && prefActive.length > 0 ? prefActive : configuredTabs.map((t: any) => t.id);
          setActiveTabs(enabledTabs);
          if (enabledTabs.length > 0) setSelectedTab(enabledTabs[0]);

          if (prefData) setCustomTabsData(prefData);
        } else {
          setTabsList(DEFAULT_FACULTY_TABS);
          const defaultTabIds = DEFAULT_FACULTY_TABS.map((t) => t.id);
          setActiveTabs(defaultTabIds);
          setSelectedTab(defaultTabIds[0]);
          setCustomTabsData({});
        }

        // Fetch user dashboard details (Submissions, Leaves, Guided Scholars)
        const isScholar = loadedUser.role === "scholar" || loadedUser.roles?.includes("scholar");
        const isGuide = loadedUser.permissions?.includes("research_guide");

        const promises: Promise<any>[] = [
          apiGet<ApiListResponse<any>>("/research-centers").catch(() => ({ items: [] })),
        ];

        if (isScholar) {
          promises.push(apiGet<ApiListResponse<any>>(`/submissions?scholarId=${userId}`).catch(() => ({ items: [] })));
          promises.push(apiGet<ApiListResponse<any>>(`/leaves?scholarId=${userId}`).catch(() => ({ items: [] })));
        } else if (isGuide) {
          promises.push(apiGet<ApiListResponse<any>>(`/submissions?guideId=${userId}`).catch(() => ({ items: [] })));
          promises.push(apiGet<ApiListResponse<User>>("/users?role=scholar").catch(() => ({ items: [] })));
        } else {
          promises.push(apiGet<ApiListResponse<any>>(`/submissions?scholarId=${userId}`).catch(() => ({ items: [] })));
        }

        const results = await Promise.all(promises);
        if (!isMounted) return;

        setResearchCenters(results[0]?.items || []);

        if (isScholar) {
          setUserSubmissions(results[1]?.items || []);
          setUserLeaves(results[2]?.items || []);
        } else if (isGuide) {
          setUserSubmissions(results[1]?.items || []);
          const scholarsAll: User[] = results[2]?.items || [];
          const myScholars = scholarsAll.filter((s) => {
            const gId = s.guide && typeof s.guide === "object" ? s.guide._id : (typeof s.guide === "string" ? s.guide : null);
            return gId === userId;
          });
          setGuidedScholars(myScholars);
        } else {
          setUserSubmissions(results[1]?.items || []);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load user details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    researchCenterId: "",
    phone: "",
    status: "Active",
    password: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (user) {
      const derivedPerms = user.permissions || [];
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        researchCenterId:
          (user.researchCenter && typeof user.researchCenter === "object"
            ? (user.researchCenter as any)._id
            : user.researchCenter) || "",
        phone: user.phone || "",
        status: user.status || "Active",
        password: "",
        permissions: derivedPerms,
      });
    }
  }, [user, isEditing]);

  const isFacultyType = user?.role === "faculty" || user?.roles?.includes("faculty");
  const isScholarType = user?.role === "scholar" || user?.roles?.includes("scholar");

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
      };

      if (isFacultyType) {
        payload.researchCenterId = editForm.researchCenterId || null;
        payload.permissions = editForm.permissions;
      }

      if (editForm.password) {
        payload.password = editForm.password;
      }
      const response = await apiPatchJson<ApiItemResponse<User>>(`/users/${userId}`, payload);
      setUser(response.item);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const roles = (user?.roles ?? (user?.role ? [user.role] : []))
    .map((role) => roleLabels[role] ?? role)
    .join(", ");

  const researchCenterName =
    user?.researchCenter && typeof user.researchCenter === "object"
      ? user.researchCenter.name || "N/A"
      : typeof user?.researchCenter === "string"
      ? user.researchCenter
      : "N/A";

  const guideName =
    user?.guide && typeof user.guide === "object"
      ? user.guide.name || "N/A"
      : typeof user?.guide === "string"
      ? user.guide
      : "N/A";

  // Total records in Faculty Registry Portfolio
  const totalRegistryRecords = useMemo(() => {
    return Object.values(customTabsData).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  }, [customTabsData]);

  // Dashboard Overview Metrics Cards for User
  const dashboardMetrics = useMemo(() => {
    const items = [];
    if (isFacultyType) {
      if (user?.permissions?.includes("research_guide")) {
        items.push({ label: "Guided Scholars", value: `${guidedScholars.length}`, icon: Users });
      }
      items.push({ label: "Faculty Registry Records", value: `${totalRegistryRecords}`, icon: NotebookText });
      items.push({ label: "Total Submissions", value: `${userSubmissions.length}`, icon: FileText });
    } else if (isScholarType) {
      items.push({ label: "Submissions", value: `${userSubmissions.length}`, icon: FileText });
      items.push({ label: "Leave Requests", value: `${userLeaves.length}`, icon: Calendar });
    } else {
      items.push({ label: "Submissions", value: `${userSubmissions.length}`, icon: FileText });
    }
    return items;
  }, [isFacultyType, isScholarType, guidedScholars.length, totalRegistryRecords, userSubmissions.length, userLeaves.length, user?.permissions]);

  // Faculty Registry Selected Tab Config & Rows
  const activeTabConfig = useMemo(() => {
    return tabsList.find((t) => t.id === selectedTab);
  }, [tabsList, selectedTab]);

  const activeTabRows = useMemo(() => {
    return customTabsData[selectedTab] || [];
  }, [customTabsData, selectedTab]);

  return (
    <PageLayout
      title="User Details & Dashboard"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Users"
    >
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Management
          </Link>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading user profile & dashboard details...</p> : null}
        {!loading && !userId ? <p className="text-sm text-slate-500">Missing user id.</p> : null}
        {!loading && error ? <p className="text-sm text-red-600">Failed to load user details: {error}</p> : null}

        {!loading && !error && user ? (
          <>
            {/* User Profile Card */}
            <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
              {isEditing ? (
                <div className="grid gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4 text-sm text-slate-700 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] px-3 py-2 bg-white"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] px-3 py-2 bg-white"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  {isFacultyType ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Research Center</label>
                        <select
                          className="mt-1 w-full rounded-xl border border-[color:var(--border)] px-3 py-2 bg-white"
                          value={editForm.researchCenterId}
                          onChange={(e) => setEditForm({ ...editForm, researchCenterId: e.target.value })}
                        >
                          <option value="">Select Research Center</option>
                          {researchCenters.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Faculty Permissions
                        </label>
                        <div className="mt-2 flex flex-wrap gap-4 rounded-xl border border-[color:var(--border)] bg-white p-3 text-xs text-slate-600 shadow-sm">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.permissions.includes("research_guide")}
                              onChange={(e) => {
                                const nextPerms = e.target.checked
                                  ? Array.from(new Set([...editForm.permissions, "research_guide"]))
                                  : editForm.permissions.filter((p) => p !== "research_guide");
                                setEditForm({ ...editForm, permissions: nextPerms });
                              }}
                            />
                            <span>Research Guide</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.permissions.includes("coordinator")}
                              onChange={(e) => {
                                const nextPerms = e.target.checked
                                  ? Array.from(new Set([...editForm.permissions, "coordinator"]))
                                  : editForm.permissions.filter((p) => p !== "coordinator");
                                setEditForm({ ...editForm, permissions: nextPerms });
                              }}
                            />
                            <span>Research Center Coordinator</span>
                          </label>
                        </div>
                      </div>
                    </>
                  ) : null}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] px-3 py-2 bg-white"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                    <select
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] px-3 py-2 bg-white"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="PendingApproval">Pending Approval</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] px-3 py-2 bg-white"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1 flex items-end gap-2 md:col-span-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:bg-[color:var(--maroon-900)] transition"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const avatarUrl = getUserAvatarUrl(user);
                        return (
                          <div
                            onClick={() => {
                              setSelectedProfileUser({
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                roles: user.roles,
                                avatar: avatarUrl,
                                department: user.department,
                                researchCenter: user.researchCenter,
                              });
                            }}
                            className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-[color:var(--maroon-700)] shrink-0 cursor-pointer hover:scale-105 transition-all shadow-md"
                            title="Click to view profile photo"
                          >
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-base font-bold text-slate-500">
                                {user.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      <div>
                        <h2 className="font-display text-2xl font-bold text-[color:var(--maroon-900)]">{user.name}</h2>
                        <p className="text-xs text-[color:var(--maroon-700)] font-semibold mt-0.5">{roles}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-full border border-[color:var(--border)] px-4 py-1.5 text-xs font-semibold text-[color:var(--maroon-700)] hover:bg-slate-50 transition"
                    >
                      Edit Account Details
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4 text-xs text-slate-700 md:grid-cols-3">
                    <div>
                      <span className="font-semibold text-slate-500">Unique ID: </span>
                      <span className="font-bold text-slate-800">
                        {user.uniqueId || user.preferences?.profile_unique_id || "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Phone: </span>
                      <span className="font-bold text-slate-800">{user.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Status: </span>
                      <StatusBadge status={user.status ?? "Active"} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Research Center: </span>
                      <span className="font-bold text-slate-800">{researchCenterName}</span>
                    </div>
                    {isFacultyType && (
                      <div>
                        <span className="font-semibold text-slate-500">Department: </span>
                        <span className="font-bold text-slate-800">{user.department || user.preferences?.profile_department || "Not set"}</span>
                      </div>
                    )}
                    {isScholarType && (
                      <div>
                        <span className="font-semibold text-slate-500">Assigned Guide: </span>
                        <span className="font-bold text-slate-800">{guideName}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* Dashboard Overview Cards */}
            {dashboardMetrics.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  User Dashboard Overview
                </h3>
                <DashboardCards items={dashboardMetrics} />
              </div>
            )}

            {/* FACULTY REGISTRY PORTFOLIO SECTION (Faculty Users) */}
            {isFacultyType && (
              <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[color:var(--border)] pb-3 mb-6 gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#9B0302] flex items-center gap-2">
                      <NotebookText className="h-5 w-5 text-[#9B0302]" />
                      Faculty Registry Portfolio
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View full portfolio records and custom registry tabs created by this faculty member.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#9B0302]/10 px-3 py-1 text-xs font-bold text-[#9B0302]">
                    {totalRegistryRecords} Total Records
                  </span>
                </div>

                {/* Tabs bar */}
                <div className="flex flex-wrap items-end border-b border-[color:var(--border)] gap-1 mb-6">
                  {activeTabs.map((tabKey) => {
                    const config = tabsList.find((t) => t.id === tabKey);
                    if (!config) return null;
                    const isActive = selectedTab === tabKey;
                    const rowCount = (customTabsData[tabKey] || []).length;

                    return (
                      <button
                        key={tabKey}
                        onClick={() => setSelectedTab(tabKey)}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition duration-150 -mb-[1px] relative rounded-t-lg border ${
                          isActive
                            ? "border-t-2 border-t-[#9B0302] border-x border-x-[color:var(--border)] border-b-white bg-white text-[#9B0302] font-bold shadow-xs"
                            : "text-slate-600 hover:text-[#9B0302] bg-transparent border-transparent hover:border-b-[#9B0302]"
                        }`}
                      >
                        <span>{config.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? "bg-[#9B0302] text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {rowCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab data table */}
                {activeTabConfig ? (
                  <div className="border border-[#e5a09a] rounded-xl overflow-hidden shadow-sm">
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
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5d0cc]">
                          {activeTabRows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={activeTabConfig.columns.length}
                                className="p-8 text-center text-xs text-slate-400 bg-white"
                              >
                                No records found in "{activeTabConfig.label}".
                              </td>
                            </tr>
                          ) : (
                            activeTabRows.map((item, rowIdx) => (
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
                                    <td key={cellIdx} className="p-3.5 text-xs text-slate-700 border border-[#f5d0cc]">
                                      {val || "—"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* GUIDED SCHOLARS SECTION (Research Guides) */}
            {user?.permissions?.includes("research_guide") && (
              <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-[color:var(--maroon-900)] mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[color:var(--maroon-700)]" />
                  Assigned Scholars under {user.name}
                </h3>
                {guidedScholars.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No scholars are assigned to this research guide.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-[color:var(--maroon-900)] text-white font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Scholar Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[color:var(--border)]">
                        {guidedScholars.map((sch) => (
                          <tr key={sch._id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">{sch.name}</td>
                            <td className="p-3 text-slate-500">{sch.email}</td>
                            <td className="p-3 text-slate-500">{sch.department || "N/A"}</td>
                            <td className="p-3">
                              <StatusBadge status={sch.status || "Active"} />
                            </td>
                            <td className="p-3 text-right">
                              <Link
                                href={`/admin/users/details?id=${sch._id}`}
                                className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] font-semibold text-[color:var(--maroon-700)] hover:bg-slate-100"
                              >
                                View Scholar
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* SUBMISSIONS HISTORY SECTION */}
            {userSubmissions.length > 0 && (
              <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-[color:var(--maroon-900)] mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[color:var(--maroon-700)]" />
                  Submissions History ({userSubmissions.length})
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[color:var(--maroon-900)] text-white font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3">Scholar / Author</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Submitted Date</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]">
                      {userSubmissions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={sub.title}>
                            {sub.title}
                          </td>
                          <td className="p-3 text-slate-600">
                            {sub.scholar?.name || user.name}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={sub.status || "Pending"} />
                          </td>
                          <td className="p-3 text-slate-500">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("en-GB") : "N/A"}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/admin/submissions/details?id=${sub._id}`}
                              className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] font-semibold text-[color:var(--maroon-700)] hover:bg-slate-100"
                            >
                              View Paper
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* SCHOLAR LEAVE APPLICATIONS SECTION */}
            {isScholarType && userLeaves.length > 0 && (
              <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-[color:var(--maroon-900)] mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[color:var(--maroon-700)]" />
                  Leave Applications History ({userLeaves.length})
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[color:var(--maroon-900)] text-white font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Leave Type</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Days</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]">
                      {userLeaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{leave.leaveType}</td>
                          <td className="p-3 text-slate-600">
                            {leave.startDate ? new Date(leave.startDate).toLocaleDateString("en-GB") : "N/A"} -{" "}
                            {leave.endDate ? new Date(leave.endDate).toLocaleDateString("en-GB") : "N/A"}
                          </td>
                          <td className="p-3 font-medium">{leave.totalDays}</td>
                          <td className="p-3 text-slate-500 max-w-[200px] truncate" title={leave.reason}>
                            {leave.reason}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={leave.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>

      <ProfileImageModal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        user={selectedProfileUser}
      />
    </PageLayout>
  );
}

export default function AdminUserDetailsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading user details page...</p>}>
      <AdminUserDetailsContent />
    </Suspense>
  );
}

