"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";
import { apiGet, apiPostJson, type ApiListResponse } from "@/lib/api";

type ResearchCenter = {
  _id: string;
  name: string;
  code: string;
  status?: string;
  coordinator?: { name?: string; email?: string } | null;
  department?: { name?: string } | null;
};

type Department = {
  _id: string;
  name: string;
};

type Coordinator = {
  _id: string;
  name: string;
};

const columns = [
  { key: "name", label: "Research Center" },
  { key: "code", label: "Code" },
  { key: "coordinator", label: "Coordinator" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action", align: "right" as const },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-slate-700 shadow-sm";

export default function AdminResearchCentersPage() {
  const [centers, setCenters] = useState<ResearchCenter[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    code: "",
    departmentId: "",
    coordinatorId: "",
    status: "Active",
  });

  const loadCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet<ApiListResponse<ResearchCenter>>(
        "/research-centers"
      );
      setCenters(response.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [centersRes, departmentsRes, coordinatorsRes] =
          await Promise.all([
            apiGet<ApiListResponse<ResearchCenter>>("/research-centers"),
            apiGet<ApiListResponse<Department>>("/departments"),
            apiGet<ApiListResponse<Coordinator>>("/users?role=coordinator"),
          ]);
        if (!isMounted) return;
        setCenters(centersRes.items);
        setDepartments(departmentsRes.items);
        setCoordinators(coordinatorsRes.items);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load research centers";
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormChange = (
    field: keyof typeof formState,
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      if (!formState.name.trim() || !formState.code.trim()) {
        setSaveError("Name and code are required.");
        setSaving(false);
        return;
      }

      const payload = {
        name: formState.name.trim(),
        code: formState.code.trim(),
        departmentId: departments[0]?._id || "default-dept-id",
        coordinatorId: formState.coordinatorId || undefined,
        status: formState.status || undefined,
      };

      await apiPostJson("/research-centers", payload);
      setSaveSuccess("Research center created successfully.");
      setFormState({
        name: "",
        code: "",
        departmentId: "",
        coordinatorId: "",
        status: "Active",
      });
      await loadCenters();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create research center";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(
    () =>
      centers.map((center) => ({
        id: center._id,
        name: center.name,
        code: center.code,
        department: center.department?.name ?? "Unassigned",
        coordinator: center.coordinator?.name ?? "Unassigned",
        status: <StatusBadge status={center.status ?? "Active"} />,
        action: (
          <Link
            href={`/admin/research-centers/${center._id}`}
            className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
          >
            Manage
          </Link>
        ),
      })),
    [centers]
  );

  return (
    <PageLayout
      title="Research Centers"
      userName="Admin"
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Research Centers"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg text-[color:var(--maroon-900)]">
              Research Centers
            </h2>
            <p className="text-sm text-slate-500">
              Create and manage research center assignments and oversight.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close" : "Add Research Center"}
          </button>
        </div>
        {showForm ? (
          <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Create research center
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="center-name"
                >
                  Name
                </label>
                <input
                  id="center-name"
                  className={inputClass}
                  value={formState.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  placeholder="Research center name"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="center-code"
                >
                  Code
                </label>
                <input
                  id="center-code"
                  className={inputClass}
                  value={formState.code}
                  onChange={(event) => handleFormChange("code", event.target.value)}
                  placeholder="Center code"
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="center-coordinator"
                >
                  Coordinator
                </label>
                <select
                  id="center-coordinator"
                  className={inputClass}
                  value={formState.coordinatorId}
                  onChange={(event) =>
                    handleFormChange("coordinatorId", event.target.value)
                  }
                >
                  <option value="">Unassigned</option>
                  {coordinators.map((coordinator) => (
                    <option key={coordinator._id} value={coordinator._id}>
                      {coordinator.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="center-status"
                >
                  Status
                </label>
                <select
                  id="center-status"
                  className={inputClass}
                  value={formState.status}
                  onChange={(event) => handleFormChange("status", event.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create research center"}
              </button>
              {saveError ? (
                <span className="text-xs text-red-600">{saveError}</span>
              ) : null}
              {saveSuccess ? (
                <span className="text-xs text-emerald-600">{saveSuccess}</span>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs text-slate-500">
            <Search className="h-4 w-4" />
            <span>Search research centers...</span>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading research centers...</p>
          ) : error ? (
            <p className="text-sm text-red-600">
              Failed to load research centers: {error}
            </p>
          ) : (
            <DataTable columns={columns} rows={rows} />
          )}
        </div>
      </section>
    </PageLayout>
  );
}
