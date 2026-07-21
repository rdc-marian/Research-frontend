"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, X, Power, Building2, ChevronRight, Eye } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { adminNav } from "@/data/roleNav";
import { apiDelete, apiGet, apiPostJson, apiPatchJson, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

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
  researchCenter?: { _id: string; name: string } | string | null;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all";

export default function AdminResearchCentersPage() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<ResearchCenter[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ResearchCenter | null>(null);
  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [centerName, setCenterName] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [centersRes, usersRes] = await Promise.all([
        apiGet<ApiListResponse<ResearchCenter>>("/research-centers"),
        apiGet<ApiListResponse<User>>("/users"),
      ]);

      setCenters(centersRes.items || []);
      setAllUsers(usersRes.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!centerName.trim()) {
      setSaveError("Research Center Name is required.");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      await apiPostJson("/research-centers", {
        name: centerName.trim(),
        status: "Active",
      });

      setCenterName("");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create research center");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (center: ResearchCenter) => {
    setEditingCenter(center);
    setCenterName(center.name);
    setSaveError(null);
  };

  const handleUpdate = async () => {
    if (!editingCenter) return;
    if (!centerName.trim()) {
      setSaveError("Research Center Name is required.");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      await apiPatchJson(`/research-centers/${editingCenter._id}`, {
        name: centerName.trim(),
      });

      setEditingCenter(null);
      setCenterName("");
      await loadData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update research center");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (center: ResearchCenter) => {
    try {
      const nextStatus = center.status === "Active" ? "Inactive" : "Active";
      await apiPatchJson(`/research-centers/${center._id}/status`, { status: nextStatus });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDelete = async (center: ResearchCenter) => {
    if (!window.confirm(`Are you sure you want to delete research center "${center.name}"? This will unassign any associated users.`)) {
      return;
    }
    try {
      setLoading(true);
      await apiDelete(`/research-centers/${center._id}`);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete research center");
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = useMemo(() => {
    if (!search.trim()) return centers;
    const q = search.toLowerCase();
    return centers.filter((c) => c.name.toLowerCase().includes(q));
  }, [centers, search]);

  const columns = [
    { key: "name", label: "Research Center" },
    { key: "members", label: "Total Users" },
    { key: "status", label: "Status" },
    { key: "action", label: "Actions", align: "right" as const },
  ];

  const rows = useMemo(() => {
    return filteredCenters.map((center) => {
      const centerMembers = allUsers.filter((u) => {
        const rc = u.researchCenter;
        const userCenterId = rc && typeof rc === "object" ? rc._id : rc;
        return userCenterId === center._id;
      });

      return {
        id: center._id,
        name: (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[color:var(--maroon-800)] font-bold shrink-0 border border-red-100">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-xs block">{center.name}</span>
            </div>
          </div>
        ),
        members: (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {centerMembers.length} {centerMembers.length === 1 ? "user" : "users"}
          </span>
        ),
        status: (
          <button
            onClick={() => toggleStatus(center)}
            title="Click to toggle status"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
              center.status === "Active"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            }`}
          >
            <Power className="h-3 w-3" />
            {center.status}
          </button>
        ),
        action: (
          <div className="flex justify-end items-center gap-2">
            <Link
              href={`/admin/research-centers/${center._id}`}
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)] hover:bg-slate-50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View Users & Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => startEdit(center)}
              className="rounded-full border border-slate-200 p-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Edit Center Name"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleDelete(center)}
              className="rounded-full border border-red-200 p-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Research Center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      };
    });
  }, [filteredCenters, allUsers]);

  return (
    <PageLayout
      title="Research Centers"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Research Centers"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[color:var(--maroon-900)]">
              Research Centers Directory
            </h2>
            <p className="text-xs text-slate-500">
              Overview, viewing, and management of institutional research centers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setCenterName("");
              setEditingCenter(null);
              setSaveError(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--maroon-950)] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Research Center
          </button>
        </div>

        {/* Create / Edit Modal Overlay */}
        {(showForm || editingCenter) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold text-[color:var(--maroon-900)]">
                  {editingCenter ? "Edit Research Center" : "Add Research Center"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCenter(null);
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="rc-name">
                    Center Name
                  </label>
                  <input
                    id="rc-name"
                    className={inputClass}
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="e.g. Computer Science Research Center"
                  />
                </div>
              </div>

              {saveError && <p className="mt-3 text-xs text-red-600 font-medium">{saveError}</p>}

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCenter(null);
                  }}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingCenter ? handleUpdate : handleCreate}
                  disabled={saving}
                  className="rounded-full bg-[color:var(--maroon-800)] px-5 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-60 hover:bg-[color:var(--maroon-950)] transition-colors cursor-pointer"
                >
                  {saving ? "Saving..." : editingCenter ? "Save Changes" : "Create Center"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs text-slate-500">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search research centers by name..."
              className="w-full bg-transparent text-slate-700 outline-none"
            />
          </label>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading research centers...</p>
          ) : error ? (
            <p className="text-sm text-red-600">Failed to load research centers: {error}</p>
          ) : (
            <DataTable columns={columns} rows={rows} />
          )}
        </div>
      </section>
    </PageLayout>
  );
}
