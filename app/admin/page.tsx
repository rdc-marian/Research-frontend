"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ClipboardCheck,
  FileText,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { DashboardCards } from "@/components/DashboardCards";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/Table";
import { adminNav } from "@/data/roleNav";
import { apiDelete, apiGet, apiPostJson, apiPatchJson, getUserAvatarUrl, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { ProfileImageModal, type ProfileUser } from "@/components/ProfileImageModal";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  status?: string;
  avatar?: string;
  preferences?: any;
  department?: string;
  researchCenter?: { _id?: string; name?: string; code?: string } | null;
  guide?: { _id?: string; name?: string; email?: string } | null;
};

type ResearchCenter = {
  _id: string;
  name: string;
  code?: string;
};

type Guide = {
  _id: string;
  name: string;
  email?: string;
  researchCenter?: { _id?: string; name?: string; code?: string } | null;
};

type Submission = {
  _id: string;
  status: string;
};

const defaultMetrics = [
  { label: "Total users", value: "0", icon: Users },
  { label: "Total submissions", value: "0", icon: FileText },
  { label: "Pending approvals", value: "0", icon: ClipboardCheck },
  { label: "Approved papers", value: "0", icon: CheckCircle },
];

const columns = [
  { key: "avatar", label: "Photo" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "roles", label: "Roles" },
  { key: "researchCenter", label: "Research Center" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action", align: "right" as const },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  coordinator: "Research Center Coordinator",
  faculty: "Faculty",
  scholar: "Scholar",
  research_guide: "Research Guide",
  library: "Librarian",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-slate-700 shadow-sm";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [users, setUsers] = useState<User[]>([]);
  const [researchCenters, setResearchCenters] = useState<ResearchCenter[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<ProfileUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    role: "scholar",
    permissions: [] as string[],
    researchCenterId: "",
    guideId: "",
    department: "",
  });

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, submissionsRes, approvalsRes, approvedRes, centersRes, guidesRes] =
        await Promise.all([
          apiGet<ApiListResponse<User>>("/users"),
          apiGet<ApiListResponse<Submission>>("/submissions"),
          apiGet<ApiListResponse<Submission>>("/approvals"),
          apiGet<ApiListResponse<Submission>>("/submissions?status=Approved"),
          apiGet<ApiListResponse<ResearchCenter>>("/research-centers"),
          apiGet<ApiListResponse<Guide>>("/users?role=research_guide"),
        ]);

      setUsers(usersRes.items || []);
      setResearchCenters(centersRes.items || []);
      setGuides(guidesRes.items || []);

      setMetrics([
        {
          label: "Total users",
          value: `${usersRes.items.length}`,
          icon: Users,
        },
        {
          label: "Total submissions",
          value: `${submissionsRes.items.length}`,
          icon: FileText,
        },
        {
          label: "Pending approvals",
          value: `${approvalsRes.items.length}`,
          icon: ClipboardCheck,
        },
        {
          label: "Approved papers",
          value: `${approvedRes.items.length}`,
          icon: CheckCircle,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      // Role filter
      if (roleFilter === "All") return true;
      if (roleFilter === "scholar") {
        return u.role === "scholar" || u.roles?.includes("scholar");
      }
      if (roleFilter === "faculty") {
        return u.role === "faculty" || u.roles?.includes("faculty");
      }
      if (roleFilter === "guide") {
        return u.permissions?.includes("research_guide");
      }
      if (roleFilter === "coordinator") {
        return u.permissions?.includes("coordinator");
      }
      if (roleFilter === "library") {
        return u.role === "library" || u.roles?.includes("library");
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const handleApproveUser = async (userToApprove: User) => {
    try {
      setApprovingUserId(userToApprove._id);
      await apiPatchJson(`/users/${userToApprove._id}`, { status: "Active" });
      await loadAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve user";
      alert(message);
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleFormChange = (field: keyof typeof formState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setFormState((prev) => {
      const nextPerms = checked
        ? Array.from(new Set([...prev.permissions, permission]))
        : prev.permissions.filter((item) => item !== permission);
      return {
        ...prev,
        permissions: nextPerms,
      };
    });
  };

  const requiresResearchCenter = formState.role === "faculty";
  const requiresGuide = formState.role === "scholar";

  const handleCreateUser = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const mainRole = formState.role;

      if (requiresResearchCenter && !formState.researchCenterId) {
        setSaveError("Research center is required for Faculty.");
        setSaving(false);
        return;
      }

      if (requiresGuide && !formState.guideId) {
        setSaveError("Research guide is required for Scholars.");
        setSaving(false);
        return;
      }

      let finalCenterId = formState.researchCenterId;

      if (mainRole === "scholar") {
        const selectedGuide = guides.find((g) => g._id === formState.guideId);
        if (selectedGuide) {
          finalCenterId = selectedGuide.researchCenter?._id || (selectedGuide.researchCenter as any) || "";
        }
      }

      const payload: any = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        role: mainRole,
        roles: [mainRole],
        permissions: mainRole === "faculty" ? formState.permissions : [],
        researchCenterId: finalCenterId || undefined,
        guideId: requiresGuide ? formState.guideId : undefined,
        department: mainRole === "faculty" ? formState.department.trim() : undefined,
      };

      await apiPostJson("/users", payload);
      setSaveSuccess("User created successfully.");
      setFormState({
        name: "",
        email: "",
        role: "scholar",
        permissions: [],
        researchCenterId: "",
        guideId: "",
        department: "",
      });
      await loadAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = useCallback(async (userToDelete: User) => {
    const isProtected = userToDelete.role === "admin" || userToDelete.roles?.includes("admin") || userToDelete.role === "library" || userToDelete.roles?.includes("library");
    if (isProtected) {
      alert("Admin and Library users cannot be deleted, only edited.");
      return;
    }

    const confirmed = window.confirm(`Delete user "${userToDelete.name}"?`);
    if (!confirmed) return;

    try {
      setDeletingUserId(userToDelete._id);
      setError(null);
      await apiDelete<{ message: string }>(`/users/${userToDelete._id}`);
      await loadAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
    } finally {
      setDeletingUserId(null);
    }
  }, [loadAllData]);

  const rows = useMemo(
    () =>
      filteredUsers.map((u) => {
        const avatarUrl = getUserAvatarUrl(u);
        const isProtectedUser = u.role === "admin" || u.roles?.includes("admin") || u.role === "library" || u.roles?.includes("library");
        return {
          id: u._id,
          avatar: (
            <div
              onClick={() =>
                setSelectedProfileUser({
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  roles: u.roles,
                  avatar: avatarUrl,
                  department: u.department,
                  researchCenter: u.researchCenter,
                })
              }
              className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-[color:var(--maroon-700)] hover:scale-105 transition-all shadow-sm"
              title="Click to view profile photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={u.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-slate-500">{u.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
          ),
          name: u.name,
          email: u.email,
          roles: (
            <div className="flex flex-col gap-0.5">
              {(u.roles ?? (u.role ? [u.role] : []))
                .map((r) => roleLabels[r] ?? r)
                .map((label, idx) => (
                  <span key={idx} className="block whitespace-nowrap text-xs text-slate-600">
                    {label}
                  </span>
                ))}
            </div>
          ),
          researchCenter: u.researchCenter?.name ?? "N/A",
          status: <StatusBadge status={u.status ?? "Active"} />,
          action: (
            <div className="flex justify-end gap-2">
              {u.status === "PendingApproval" && u.role !== "scholar" && (
                <button
                  type="button"
                  onClick={() => handleApproveUser(u)}
                  disabled={approvingUserId === u._id}
                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {approvingUserId === u._id ? "Approving..." : "Approve"}
                </button>
              )}
              <Link
                href={`/admin/users/details?id=${u._id}`}
                className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)] hover:bg-slate-50"
              >
                View
              </Link>
              {!isProtectedUser && (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u)}
                  disabled={deletingUserId === u._id}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingUserId === u._id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          )
        };
      }),
    [deletingUserId, approvingUserId, handleDeleteUser, filteredUsers]
  );

  return (
    <PageLayout
      title="Admin Dashboard & Users"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Dashboard"
    >
      <DashboardCards items={metrics} />

      {/* Combined Users Management Section */}
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[color:var(--maroon-900)]">
              User Management
            </h2>
            <p className="text-sm text-slate-500">
              Manage scholars, faculty, coordinators, and admin accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--maroon-900)] transition"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close Form" : "Add User"}
          </button>
        </div>

        {showForm ? (
          <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Create New User Account
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="user-name">
                  Full Name
                </label>
                <input
                  id="user-name"
                  className={inputClass}
                  value={formState.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="user-email">
                  Email Address
                </label>
                <input
                  id="user-email"
                  className={inputClass}
                  value={formState.email}
                  onChange={(event) => handleFormChange("email", event.target.value)}
                  placeholder="name@university.edu"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="user-role">
                  Primary Role
                </label>
                <select
                  id="user-role"
                  className={inputClass}
                  value={formState.role}
                  onChange={(event) => handleFormChange("role", event.target.value)}
                >
                  <option value="scholar">Scholar</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="admin">Administrator</option>
                  <option value="library">Librarian</option>
                </select>
              </div>

              {formState.role === "faculty" && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="user-department">
                      Department
                    </label>
                    <input
                      id="user-department"
                      className={inputClass}
                      value={formState.department}
                      onChange={(event) => handleFormChange("department", event.target.value)}
                      placeholder="e.g. Computer Science, Chemistry, Commerce"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Faculty Permissions (Optional)
                    </label>
                    <div className="mt-2 flex flex-wrap gap-4 rounded-xl border border-[color:var(--border)] bg-white p-3 text-xs text-slate-600 shadow-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.permissions.includes("research_guide")}
                          onChange={(event) => handlePermissionToggle("research_guide", event.target.checked)}
                        />
                        <span>Research Guide</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.permissions.includes("coordinator")}
                          onChange={(event) => handlePermissionToggle("coordinator", event.target.checked)}
                        />
                        <span>Research Center Coordinator</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {requiresResearchCenter ? (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="user-research-center">
                    Research Center
                  </label>
                  <select
                    id="user-research-center"
                    className={inputClass}
                    value={formState.researchCenterId}
                    onChange={(event) => handleFormChange("researchCenterId", event.target.value)}
                  >
                    <option value="">Select Research Center</option>
                    {researchCenters.map((center) => (
                      <option key={center._id} value={center._id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {requiresGuide ? (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="user-guide">
                      Research Guide
                    </label>
                    <select
                      id="user-guide"
                      className={inputClass}
                      value={formState.guideId}
                      onChange={(event) => handleFormChange("guideId", event.target.value)}
                    >
                      <option value="">Select Research Guide</option>
                      {guides.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.researchCenter?.name || "No Research Center"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Research Center (Auto-Assigned)
                    </label>
                    <div className="mt-2 rounded-xl border border-[color:var(--border)] bg-slate-100 px-3 py-2 text-xs text-slate-500 shadow-sm">
                      {(() => {
                        const selectedGuideObj = guides.find((g) => g._id === formState.guideId);
                        return selectedGuideObj?.researchCenter?.name || "Auto-assigned from Guide";
                      })()}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={saving}
                className="rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--maroon-900)] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create user"}
              </button>
              {saveError ? (
                <span className="text-xs text-red-600 font-medium">{saveError}</span>
              ) : null}
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 font-medium">{saveSuccess}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs text-slate-500">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-transparent text-slate-700 outline-none"
            />
          </label>
          <select
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="scholar">Scholar</option>
            <option value="faculty">Faculty Member</option>
            <option value="guide">Research Guide</option>
            <option value="coordinator">Research Center Coordinator</option>
            <option value="library">Librarian</option>
          </select>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading users...</p>
          ) : error ? (
            <p className="text-sm text-red-600">Failed to load users: {error}</p>
          ) : (
            <DataTable columns={columns} rows={rows} />
          )}
        </div>
      </section>
      <ProfileImageModal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        user={selectedProfileUser}
      />
    </PageLayout>
  );
}
