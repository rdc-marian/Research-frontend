"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";
import { apiGet, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Coordinator = {
  _id: string;
  name?: string;
  email?: string;
  researchCenter?: { name?: string } | null;
  status?: string;
};

const columns = [
  { key: "name", label: "Coordinator" },
  { key: "email", label: "Email" },
  { key: "researchCenter", label: "Research Center" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action", align: "right" as const },
];

export default function AdminCoordinatorsPage() {
  const { user } = useAuth();
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set("role", "coordinator");
        if (statusFilter !== "All Status") params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());
        const response = await apiGet<ApiListResponse<Coordinator>>(`/users?${params.toString()}`);
        if (!isMounted) return;
        setCoordinators(response.items);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load coordinators");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [statusFilter, search]);

  const rows = useMemo(
    () =>
      coordinators.map((person) => ({
        id: person._id,
        name: person.name ?? "Unknown",
        email: person.email ?? "N/A",
        researchCenter: person.researchCenter?.name ?? "N/A",
        status: <StatusBadge status={person.status ?? "Active"} />,
        action: (
          <button
            type="button"
            className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
          >
            Manage
          </button>
        ),
      })),
    [coordinators]
  );

  return (
    <PageLayout
      title="Research Center Coordinators"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Coordinators"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg text-[color:var(--maroon-900)]">Coordinators</h2>
            <p className="text-sm text-slate-500">
              Add and manage research center coordinators.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Coordinator
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs text-slate-500">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coordinators..."
              className="w-full bg-transparent text-slate-700 outline-none"
            />
          </label>
          <select
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-slate-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="mt-4">
          {loading ? <p className="text-sm text-slate-500">Loading coordinators...</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">Failed to load coordinators: {error}</p> : null}
          {!loading && !error ? <DataTable columns={columns} rows={rows} /> : null}
        </div>
      </section>
    </PageLayout>
  );
}
