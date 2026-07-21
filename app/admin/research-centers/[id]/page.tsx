"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, User as UserIcon, FileText, Trash2, UserX, Eye } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";
import { useAuth } from "@/components/AuthProvider";
import { ProfileImageModal, type ProfileUser } from "@/components/ProfileImageModal";
import {
  apiGet,
  apiPatchJson,
  apiDelete,
  type ApiItemResponse,
  type ApiListResponse,
} from "@/lib/api";

type ResearchCenter = {
  _id: string;
  name: string;
  code: string;
  status: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  status?: string;
  avatar?: string;
  preferences?: any;
  department?: string;
  researchCenter?: { _id: string; name: string } | string | null;
  guide?: { _id?: string; name?: string } | null;
};

type Submission = {
  _id: string;
  title: string;
  status: string;
  submittedAt?: string;
  scholar?: { _id?: string; name?: string } | null;
};

const facultyColumns = [
  { key: "avatar", label: "Photo" },
  { key: "name", label: "Faculty Member" },
  { key: "email", label: "Email" },
  { key: "guideStatus", label: "Role Status" },
  { key: "action", label: "Actions", align: "right" as const },
];

const guideColumns = [
  { key: "avatar", label: "Photo" },
  { key: "name", label: "Research Guide" },
  { key: "email", label: "Email" },
  { key: "action", label: "Actions", align: "right" as const },
];

const scholarColumns = [
  { key: "avatar", label: "Photo" },
  { key: "name", label: "Scholar" },
  { key: "email", label: "Email" },
  { key: "guide", label: "Research Guide" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions", align: "right" as const },
];

const submissionColumns = [
  { key: "title", label: "Title" },
  { key: "scholar", label: "Scholar" },
  { key: "submitted", label: "Submitted On" },
  { key: "status", label: "Status", align: "right" as const },
];

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminResearchCenterDetailsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const centerId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const [center, setCenter] = useState<ResearchCenter | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "submissions">("members");
  const [memberRoleSubTab, setMemberRoleSubTab] = useState<"faculty" | "guides" | "scholars">("faculty");
  const [selectedProfileUser, setSelectedProfileUser] = useState<ProfileUser | null>(null);

  const loadData = useCallback(async () => {
    if (!centerId) return;
    setLoading(true);
    setError(null);

    try {
      const [centerRes, usersRes, submissionsRes] = await Promise.all([
        apiGet<ApiItemResponse<ResearchCenter>>(`/research-centers/${centerId}`),
        apiGet<ApiListResponse<User>>("/users"),
        apiGet<ApiListResponse<Submission>>("/submissions"),
      ]);

      setCenter(centerRes.item);
      setAllUsers(usersRes.items || []);
      setSubmissions(submissionsRes.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load center details");
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const faculty = useMemo(() => {
    return allUsers.filter((u) => {
      const rc = u.researchCenter;
      const userCenterId = (rc && typeof rc === "object") ? rc._id : rc;
      const isFacultyOrGuide =
        u.role === "faculty" ||
        u.role === "research_guide" ||
        u.roles?.includes("faculty") ||
        u.roles?.includes("research_guide");
      return userCenterId === centerId && isFacultyOrGuide;
    });
  }, [allUsers, centerId]);

  const guides = useMemo(() => {
    return allUsers.filter((u) => {
      const rc = u.researchCenter;
      const userCenterId = (rc && typeof rc === "object") ? rc._id : rc;
      const isGuide =
        u.permissions?.includes("research_guide") ||
        u.role === "research_guide" ||
        u.roles?.includes("research_guide");
      return userCenterId === centerId && isGuide;
    });
  }, [allUsers, centerId]);

  const scholars = useMemo(() => {
    return allUsers.filter((u) => {
      const rc = u.researchCenter;
      const userCenterId = (rc && typeof rc === "object") ? rc._id : rc;
      return userCenterId === centerId && u.role === "scholar";
    });
  }, [allUsers, centerId]);

  const filteredSubmissions = useMemo(() => {
    const userMap = new Map(allUsers.map((u) => [u._id, u]));
    return submissions.filter((sub) => {
      const scholarId = sub.scholar?._id || (sub.scholar as unknown as string);
      const scholarUser = userMap.get(scholarId);
      const rc = scholarUser?.researchCenter;
      const userCenterId = (rc && typeof rc === "object") ? rc._id : rc;
      return userCenterId === centerId;
    });
  }, [submissions, allUsers, centerId]);

  const handleRemoveFromCenter = async (targetUser: User) => {
    if (!window.confirm(`Remove ${targetUser.name} from ${center?.name || "this Research Center"}?`)) return;
    try {
      setActionLoading(true);
      await apiPatchJson(`/users/${targetUser._id}`, { researchCenterId: null });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove user from center");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.role === "library" || targetUser.roles?.includes("library")) {
      alert("Librarian accounts are protected and cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await apiDelete(`/users/${targetUser._id}`);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCenter = async () => {
    if (!center) return;
    if (!window.confirm(`Are you sure you want to permanently delete Research Center "${center.name}"?`)) {
      return;
    }
    try {
      setActionLoading(true);
      await apiDelete(`/research-centers/${center._id}`);
      router.push("/admin/research-centers");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete research center");
    } finally {
      setActionLoading(false);
    }
  };

  const renderAvatarCell = (u: User) => {
    const avatarUrl = u.avatar || u.preferences?.scholar_avatar || u.preferences?.faculty_avatar || u.preferences?.research_guide_avatar;
    return (
      <div
        onClick={() =>
          setSelectedProfileUser({
            name: u.name,
            email: u.email,
            role: u.role,
            roles: u.roles,
            avatar: avatarUrl,
            department: u.department,
            researchCenter: center?.name,
          })
        }
        className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-[color:var(--maroon-700)] hover:scale-105 transition-all shadow-sm"
        title="Click to view profile photo"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={u.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-slate-500">{u.name.substring(0, 2).toUpperCase()}</span>
        )}
      </div>
    );
  };

  const facultyRows = useMemo(
    () =>
      faculty.map((f) => {
        const isGuide = f.permissions?.includes("research_guide") || f.role === "research_guide" || f.roles?.includes("research_guide");
        return {
          id: f._id,
          avatar: renderAvatarCell(f),
          name: f.name,
          email: f.email,
          guideStatus: (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isGuide ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
              {isGuide ? "Research Guide" : "Standard Faculty"}
            </span>
          ),
          action: (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleRemoveFromCenter(f)}
                disabled={actionLoading}
                className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                title="Remove from this Research Center"
              >
                <UserX className="w-3 h-3" /> Unassign Center
              </button>
              <button
                onClick={() => handleDeleteUser(f)}
                disabled={actionLoading}
                className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                title="Delete User Permanently"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          ),
        };
      }),
    [faculty, center, actionLoading]
  );

  const guideRows = useMemo(
    () =>
      guides.map((g) => {
        return {
          id: g._id,
          avatar: renderAvatarCell(g),
          name: g.name,
          email: g.email,
          action: (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleRemoveFromCenter(g)}
                disabled={actionLoading}
                className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                title="Remove from this Research Center"
              >
                <UserX className="w-3 h-3" /> Unassign Center
              </button>
              <button
                onClick={() => handleDeleteUser(g)}
                disabled={actionLoading}
                className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                title="Delete User Permanently"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          ),
        };
      }),
    [guides, center, actionLoading]
  );

  const scholarRows = useMemo(
    () =>
      scholars.map((s) => ({
        id: s._id,
        avatar: renderAvatarCell(s),
        name: s.name,
        email: s.email,
        guide: s.guide?.name ?? "Unassigned",
        status: <StatusBadge status={s.status ?? "Active"} />,
        action: (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleRemoveFromCenter(s)}
              disabled={actionLoading}
              className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
              title="Remove from this Research Center"
            >
              <UserX className="w-3 h-3" /> Unassign Center
            </button>
            <button
              onClick={() => handleDeleteUser(s)}
              disabled={actionLoading}
              className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
              title="Delete User Permanently"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        ),
      })),
    [scholars, center, actionLoading]
  );

  const submissionRows = useMemo(
    () =>
      filteredSubmissions.map((sub) => {
        const scholarObj = allUsers.find((u) => u._id === (sub.scholar?._id || (sub.scholar as unknown as string)));
        return {
          id: sub._id,
          title: sub.title,
          scholar: scholarObj?.name ?? "Unknown",
          submitted: formatDate(sub.submittedAt),
          status: <StatusBadge status={sub.status} />,
        };
      }),
    [filteredSubmissions, allUsers]
  );

  return (
    <PageLayout
      title="Research Center Overview"
      userName={currentUser?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Research Centers"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href="/admin/research-centers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research Centers
        </Link>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500 animate-pulse">Loading center details...</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : center ? (
          <div className="mt-4 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[color:var(--maroon-800)] font-bold border border-red-100">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-[color:var(--maroon-900)]">
                    {center.name}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${center.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {center.status} Center
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeleteCenter}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                title="Delete this Research Center permanently"
              >
                <Trash2 className="w-4 h-4" /> Delete Research Center
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Faculty</span>
                <span className="text-2xl font-bold text-slate-800 mt-1 block">{faculty.length}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Guides</span>
                <span className="text-2xl font-bold text-slate-800 mt-1 block">{guides.length}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Scholars</span>
                <span className="text-2xl font-bold text-slate-800 mt-1 block">{scholars.length}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Submissions</span>
                <span className="text-2xl font-bold text-slate-800 mt-1 block">{filteredSubmissions.length}</span>
              </div>
            </div>

            {/* Main Section Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setActiveTab("members")}
                className={`pb-3 transition-colors border-b-2 ${activeTab === "members" ? "border-[color:var(--maroon-800)] text-[color:var(--maroon-900)] font-bold" : "border-transparent hover:text-slate-700"}`}
              >
                Members ({faculty.length + scholars.length})
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`pb-3 transition-colors border-b-2 ${activeTab === "submissions" ? "border-[color:var(--maroon-800)] text-[color:var(--maroon-900)] font-bold" : "border-transparent hover:text-slate-700"}`}
              >
                Submissions ({filteredSubmissions.length})
              </button>
            </div>

            {/* Tab 1: Members */}
            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMemberRoleSubTab("faculty")}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${memberRoleSubTab === "faculty" ? "bg-[color:var(--maroon-800)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Faculty ({faculty.length})
                  </button>
                  <button
                    onClick={() => setMemberRoleSubTab("guides")}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${memberRoleSubTab === "guides" ? "bg-[color:var(--maroon-800)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Guides ({guides.length})
                  </button>
                  <button
                    onClick={() => setMemberRoleSubTab("scholars")}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${memberRoleSubTab === "scholars" ? "bg-[color:var(--maroon-800)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Scholars ({scholars.length})
                  </button>
                </div>

                {memberRoleSubTab === "faculty" && <DataTable columns={facultyColumns} rows={facultyRows} />}
                {memberRoleSubTab === "guides" && <DataTable columns={guideColumns} rows={guideRows} />}
                {memberRoleSubTab === "scholars" && <DataTable columns={scholarColumns} rows={scholarRows} />}
              </div>
            )}

            {/* Tab 2: Submissions */}
            {activeTab === "submissions" && (
              <div>
                <DataTable columns={submissionColumns} rows={submissionRows} />
              </div>
            )}
          </div>
        ) : null}
      </section>
      <ProfileImageModal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        user={selectedProfileUser}
      />
    </PageLayout>
  );
}

