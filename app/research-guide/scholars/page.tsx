"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { researchGuideNav } from "@/data/roleNav";
import { apiGet, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Scholar = {
  _id: string;
  name?: string;
  email?: string;
  department?: string;
  status?: string;
};

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action", align: "right" as const },
];

export default function ResearchGuideScholarsPage() {
  const { user } = useAuth();
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGet<ApiListResponse<Scholar>>("/users?role=scholar");
        if (!isMounted) return;
        setScholars(response.items);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load scholars");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(
    () =>
      scholars.map((scholar) => ({
        id: scholar._id,
        name: scholar.name ?? "Unknown",
        email: scholar.email ?? "N/A",
        department: scholar.department ?? "N/A",
        status: <StatusBadge status={scholar.status ?? "Active"} />,
        action: (
          <Link
            href={`/research-guide/scholars/details?id=${scholar._id}`}
            className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
          >
            View
          </Link>
        ),
      })),
    [scholars]
  );

  return (
    <PageLayout
      title="Scholars"
      userName={user?.name || "Research Guide"}
      roleLabel="Research Guide"
      navItems={researchGuideNav}
      activeItem="Scholars"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg text-[color:var(--maroon-900)]">Scholars</h2>
            <p className="text-sm text-slate-500">Manage scholars under your supervision.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Scholar
          </button>
        </div>
        <div className="mt-4">
          {loading ? <p className="text-sm text-slate-500">Loading scholars...</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">Failed to load scholars: {error}</p> : null}
          {!loading && !error ? <DataTable columns={columns} rows={rows} /> : null}
        </div>
      </section>
    </PageLayout>
  );
}
